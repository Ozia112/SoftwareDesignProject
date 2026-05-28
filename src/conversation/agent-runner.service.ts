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
  escalateToHuman?: boolean;
  debugLog: string[];
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

    let escalateToHuman = false;

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
    let tools = this.toolRegistry.getSchemasForStage(stage);

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
    const debugLog: string[] = [];

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
        const isAuthError = err?.status === 401;
        if (isCredits || isAuthError) throw err; // re-lanzar errores de config/billing
        this.logger.error(`LLM error turn ${turn}: ${err?.message}`);
        if (isTimeout) {
          debugLog.push(`❌ TIMEOUT: El LLM no respondió en ${LLM_TIMEOUT_MS / 1000}s`);
          finalResponse = 'Lo siento, tardé demasiado en responder. ¿Puedes intentarlo de nuevo?';
        } else {
          debugLog.push(`❌ ERROR LLM (turn ${turn}): ${err?.message}`);
          escalateToHuman = true;
          debugLog.push(`🚨 ESCALACIÓN AUTOMÁTICA: fallo_tecnico`);
          finalResponse = 'Te estoy conectando con un asesor que podrá ayudarte de inmediato.';
        }
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

          const inputPreview = JSON.stringify(block.input).slice(0, 120);
          debugLog.push(`🔧 TOOL: ${block.name}  ${inputPreview}`);

          const handler = this.toolRegistry.get(block.name);
          if (!handler) {
            debugLog.push(`   ✗ Tool no encontrada: ${block.name}`);
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

          if (result.ok) {
            const data = result.data as Record<string, unknown> | undefined;
            if (block.name === 'get_general_context' || block.name === 'get_event_context') {
              const raw = data?.['context'];
              const ctxStr = raw == null ? '' : typeof raw === 'string' ? raw : JSON.stringify(raw);
              const preview = ctxStr.length > 120 ? ctxStr.slice(0, 120) + '…' : ctxStr || '(vacío)';
              debugLog.push(`   📚 Banco de contexto → ${preview}`);
            } else if (block.name === 'emit_stage_signal') {
              const prev = data?.['previousStage'];
              const curr = data?.['currentStage'];
              if (prev !== curr) debugLog.push(`   🏷️  Etapa: ${prev} → ${curr}  (score: ${data?.['score'] ?? '?'})`);
              else debugLog.push(`   🏷️  Señal procesada, etapa sin cambio: ${curr}`);
              const sig = (block.input as Record<string, string>)['signal'];
              if (sig === 'confirmacion_de_pago_pendiente') {
                debugLog.push(`   🚨 ESCALACIÓN: pago_pendiente → operador humano`);
              }
            } else if (block.name === 'request_human_handoff') {
              debugLog.push(`   🚨 HANDOFF solicitado: ${(block.input as Record<string, string>)['reason']}`);
            } else if (block.name === 'reserve_quota') {
              debugLog.push(`   📋 Cupo reservado: ${JSON.stringify(data).slice(0, 80)}`);
            } else if (block.name === 'register_waiting_list') {
              debugLog.push(`   📝 Lista de espera: ${JSON.stringify(data).slice(0, 80)}`);
            } else {
              debugLog.push(`   ✓ ${JSON.stringify(data).slice(0, 100)}`);
            }
          } else {
            debugLog.push(`   ✗ Error: ${(result as any)?.error?.message ?? 'desconocido'}`);
          }

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

        // Refrescar tools disponibles en caso de que la etapa haya cambiado
        const stageNow = await this.stageService.getStage(db, tenantId, leadId);
        tools = this.toolRegistry.getSchemasForStage(stageNow);
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

    return { response: finalResponse, toolCallsExecuted, stage: currentStage, previousStage, escalateToHuman, debugLog };
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
