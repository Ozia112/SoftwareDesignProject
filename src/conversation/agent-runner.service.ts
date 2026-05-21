import { Injectable, Logger } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaClient } from '@prisma/client';
import { ConversationSessionStore } from './session-store.service';
import { ToolRegistry } from '../tools/tool-registry.service';
import { CommercialStageService } from '../commercial/commercial-stage.service';
import { AuditLogService } from '../audit/audit-log.service';
import { TenantConfigService } from '../tenant/tenant-config.service';
import type { TenantConfig } from '../dto/tenant.dto';
import type { SessionMessage } from '../dto/conversation.dto';
import { v4 as uuidv4 } from 'uuid';

const MAX_TURNS = 10;
const LLM_TIMEOUT_MS = 30_000; // 30 s — Anthropic rara vez tarda más
const MAX_HISTORY_MESSAGES = 20; // recorta historial largo para evitar tokens excesivos

export interface AgentRunInput {
  tenantId: string;
  leadId: string;
  conversationId: string;
  userMessage: string;
  db: PrismaClient;
  tenantConfig: TenantConfig;
}

export interface AgentRunOutput {
  response: string;
  toolCallsExecuted: number;
  stage?: string;
  previousStage?: string;
}

// AgentRunner — run loop del LLM con tool use (CU-COM-002)
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly sessionStore: ConversationSessionStore,
    private readonly toolRegistry: ToolRegistry,
    private readonly stageService: CommercialStageService,
    private readonly auditLog: AuditLogService,
  ) {}

  async run(input: AgentRunInput): Promise<AgentRunOutput> {
    const { tenantId, leadId, conversationId, userMessage, db, tenantConfig } = input;

    if (!tenantConfig.llmApiKey) {
      throw new Error(`No LLM API key configured for tenant ${tenantId}`);
    }

    const client = new Anthropic({ apiKey: tenantConfig.llmApiKey, timeout: LLM_TIMEOUT_MS });

    // Recuperar historial desde Redis
    const history = await this.sessionStore.getHistory(tenantId, conversationId);

    // Agregar mensaje del usuario al historial
    const userMsg: SessionMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };
    history.push(userMsg);

    // Obtener etapa actual para filtrar tools disponibles
    const stage = await this.stageService.getStage(db, tenantId, leadId);
    const tools = this.toolRegistry.getSchemasForStage(stage);

    // Recortar historial largo (últimos N mensajes) para evitar tokens excesivos
    const trimmed = history.slice(-MAX_HISTORY_MESSAGES);

    // Construir mensajes para Anthropic (sin timestamp, solo role/content)
    const messages: Anthropic.MessageParam[] = trimmed.map((m) => ({
      role: m.role,
      content: m.content as string,
    }));

    const systemPrompt = this.buildSystemPrompt(tenantConfig);
    let toolCallsExecuted = 0;
    let finalResponse = '';

    // Run loop con tool use
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      let response: Awaited<ReturnType<typeof client.messages.create>>;
      try {
        response = await client.messages.create({
        model: tenantConfig.llmModel,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            cache_control: { type: 'ephemeral' } as any,
          },
        ],
          messages,
          tools: tools as Anthropic.Tool[],
          max_tokens: 1024,
        });
      } catch (err: any) {
        const isTimeout = err?.message?.includes('timeout') || err?.status === 408;
        const isCredits = err?.message?.includes('credit balance');
        if (isCredits) throw err; // re-lanzar errores de billing
        this.logger.error(`LLM error turn ${turn}: ${err?.message}`);
        finalResponse = isTimeout
          ? 'Lo siento, tardé demasiado en responder. ¿Puedes intentarlo de nuevo?'
          : 'Tuve un problema técnico. Por favor intenta de nuevo en un momento.';
        break;
      }

      // Si no hay tool_use, es la respuesta final
      if (response.stop_reason === 'end_turn') {
        finalResponse = this.extractText(response.content);
        break;
      }

      // Procesar tool calls
      if (response.stop_reason === 'tool_use') {
        const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');

        // Agregar mensaje del asistente con las tool calls
        messages.push({ role: 'assistant', content: response.content });

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          if (block.type !== 'tool_use') continue;
          toolCallsExecuted++;

          const handler = this.toolRegistry.get(block.name);
          if (!handler) {
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: JSON.stringify({
                ok: false,
                error: { code: 'NOT_FOUND', message: `Tool ${block.name} not found` },
              }),
              is_error: true,
            });
            continue;
          }

          const result = await handler.execute(block.input as Record<string, unknown>, {
            tenantId,
            leadId,
            conversationId,
            db,
          });

          await this.auditLog.record(db, {
            tenantId,
            conversationId,
            transactionId: uuidv4(),
            actor: 'BOT',
            action: `TOOL_CALL:${block.name}`,
            payload: { input: block.input, result },
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: block.id,
            content: JSON.stringify(result),
            is_error: !result.ok,
          });
        }

        messages.push({ role: 'user', content: toolResults });
      }

      // Si llegó a max_turns sin end_turn, usar último texto disponible
      if (turn === MAX_TURNS - 1) {
        finalResponse = this.extractText(response.content) || 'Procesando tu solicitud...';
      }
    }

    // Persistir historial actualizado en Redis
    const assistantMsg: SessionMessage = {
      role: 'assistant',
      content: finalResponse,
      timestamp: new Date().toISOString(),
    };
    history.push(assistantMsg);
    await this.sessionStore.setHistory(tenantId, conversationId, history);

    const previousStage = stage;
    const currentStage = await this.stageService.getStage(db, tenantId, leadId);

    return { response: finalResponse, toolCallsExecuted, stage: currentStage, previousStage };
  }

  private buildSystemPrompt(config: TenantConfig): string {
    return (
      config.systemPrompt ??
      `Eres un asistente comercial de ${config.name}. Tu rol es ayudar a los clientes a informarse sobre eventos y gestionar su inscripción.
Eres amable, profesional y conciso.
Cuando detectes intención de inscripción, emite la señal correspondiente.
Cuando no puedas resolver algo, solicita escalamiento a un operador humano.`
    );
  }

  private extractText(content: Anthropic.ContentBlock[]): string {
    return content
      .filter((b) => b.type === 'text')
      .map((b) => (b as Anthropic.TextBlock).text)
      .join('\n');
  }
}
