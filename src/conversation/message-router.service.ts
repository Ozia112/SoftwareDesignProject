import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, ConvStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { ConsentService } from '../commercial/consent.service';
import { ScoringService } from '../commercial/scoring.service';
import { CommercialStageService } from '../commercial/commercial-stage.service';
import { AgentRunnerService } from './agent-runner.service';
import { HandoffManagerImpl } from './handoff-manager.service';
import { AuditLogService } from '../audit/audit-log.service';
import type { IncomingMessageDto, ConversationContextDto } from '../dto/conversation.dto';
import type { TenantConfig } from '../dto/tenant.dto';

const PAYMENT_KEYWORDS = [
  'ya pagué', 'ya pague', 'ya deposité', 'ya deposite', 'ya transferí', 'ya transferi',
  'ya realicé el pago', 'ya realize el pago', 'hice el pago', 'hice la transferencia',
  'hice el deposito', 'hice el depósito', 'realicé la transferencia', 'realize la transferencia',
  'ya hice', 'comprobante', 'ya envié', 'ya envie el comprobante',
];

export interface RoutingResult {
  conversationId: string;
  leadId: string;
  routedTo: 'bot' | 'operator';
  response?: string;
  stage?: string;
  score?: number;
  toolCallsExecuted?: number;
  handoffTriggered?: boolean;
  debugLog?: string[];
}

// MessageRouter — recibe webhook, crea conversación, asigna bot u operador (CU-COM-001)
@Injectable()
export class MessageRouterService {
  private readonly logger = new Logger(MessageRouterService.name);
  // Deduplicación de mensajes por messageId en memoria (en prod: Redis)
  private readonly processedMessages = new Set<string>();

  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly consentService: ConsentService,
    private readonly scoringService: ScoringService,
    private readonly stageService: CommercialStageService,
    private readonly agentRunner: AgentRunnerService,
    private readonly handoffManager: HandoffManagerImpl,
    private readonly auditLog: AuditLogService,
  ) {}

  async route(msg: IncomingMessageDto): Promise<RoutingResult> {
    // Deduplicación por messageId
    if (this.processedMessages.has(msg.messageId)) {
      this.logger.warn(`Duplicate message: ${msg.messageId}`);
      return { conversationId: '', leadId: '', routedTo: 'bot' };
    }
    this.processedMessages.add(msg.messageId);

    const tenantConfig = await this.tenantConfigService.getTenantConfig(msg.tenantId);
    if (!tenantConfig.dbUrl) throw new Error(`No DB URL for tenant ${msg.tenantId}`);

    const db = this.tenantConfigService.getPrismaClient(msg.tenantId, tenantConfig.dbUrl);

    // Resolver o crear Lead
    let lead = await db.lead.findFirst({
      where: { tenantId: msg.tenantId, channelId: msg.channelId, channelType: msg.channelType },
    });

    if (!lead) {
      lead = await db.lead.create({
        data: {
          tenantId: msg.tenantId,
          channelId: msg.channelId,
          channelType: msg.channelType,
        },
      });
      this.logger.log(`New lead created: ${lead.id} [tenant:${msg.tenantId}]`);
    }

    // Resolver o crear Conversation activa
    let conversation = await db.conversation.findFirst({
      where: {
        leadId: lead.id,
        tenantId: msg.tenantId,
        status: { in: [ConvStatus.ACTIVE, ConvStatus.HANDOFF_PENDING, ConvStatus.WITH_OPERATOR] },
      },
    });

    if (!conversation) {
      conversation = await db.conversation.create({
        data: {
          leadId: lead.id,
          tenantId: msg.tenantId,
          status: ConvStatus.ACTIVE,
          channel: msg.channelType,
        },
      });
    }

    const ctx: ConversationContextDto = {
      tenantId: msg.tenantId,
      leadId: lead.id,
      conversationId: conversation.id,
      channelType: msg.channelType,
      channelId: msg.channelId,
    };

    // Registrar consentimiento tácito al primer mensaje (CU-COM-004)
    await this.consentService.recordConsent(db, msg.tenantId, lead.id, conversation.id);

    // Si está con operador, no procesar con bot
    if (conversation.status === ConvStatus.WITH_OPERATOR) {
      await this.auditLog.record(db, {
        tenantId: msg.tenantId,
        conversationId: conversation.id,
        transactionId: uuidv4(),
        actor: 'SYSTEM',
        action: 'MESSAGE_ROUTED_TO_OPERATOR',
        payload: { messageId: msg.messageId },
      });
      return { conversationId: conversation.id, leadId: lead.id, routedTo: 'operator' };
    }

    // Ejecutar AgentRunner — capturar cualquier error inesperado y escalar
    let agentResult: Awaited<ReturnType<typeof this.agentRunner.run>>;
    try {
      agentResult = await this.agentRunner.run({
        tenantId: msg.tenantId,
        leadId: lead.id,
        conversationId: conversation.id,
        userMessage: msg.text,
        db,
        tenantConfig,
      });
    } catch (err: any) {
      this.logger.error(`AgentRunner crashed: ${err?.message}\n${err?.stack}`);
      await this.handoffManager.requestHandoff(
        db, msg.tenantId, lead.id, conversation.id, 'fallo_tecnico',
      );
      return {
        conversationId: conversation.id,
        leadId: lead.id,
        routedTo: 'bot',
        response: 'Te estoy conectando con un asesor que podrá ayudarte de inmediato.',
        handoffTriggered: true,
        debugLog: [`❌ ERROR INTERNO: ${err?.message}`],
      };
    }

    // Si el agente detectó un error técnico, escalar a operador humano
    if (agentResult.escalateToHuman) {
      await this.handoffManager.requestHandoff(
        db, msg.tenantId, lead.id, conversation.id, 'fallo_tecnico',
      );
    }

    // Fallback: si el LLM no emitió la señal de pago pero el usuario claramente confirmó pago
    // y el lead está en PROSPECTO (debería pasar a SQL)
    if (
      agentResult.stage === 'PROSPECTO' &&
      agentResult.toolCallsExecuted === 0 &&
      conversation.status === ConvStatus.ACTIVE
    ) {
      const msgLower = msg.text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const isPaymentConfirmation = PAYMENT_KEYWORDS.some((kw) =>
        msgLower.includes(kw.normalize('NFD').replace(/[̀-ͯ]/g, ''))
      );
      if (isPaymentConfirmation) {
        this.logger.warn(`Payment keyword detected but LLM missed signal — forcing SQL transition for lead ${lead.id}`);
        await this.stageService.processSignal(db, msg.tenantId, lead.id, conversation.id, 'confirmacion_de_pago_pendiente');
        await this.handoffManager.requestHandoff(db, msg.tenantId, lead.id, conversation.id, 'pago_pendiente');
        agentResult.stage = 'SQL';
        agentResult.escalateToHuman = true;
        agentResult.debugLog.push('🚨 FALLBACK SISTEMA: pago detectado por palabras clave → SQL + handoff');
      }
    }

    // Actualizar score para TODAS las etapas intermedias alcanzadas en este turno
    // (el lead puede saltar LEAD→MQL→PROSPECTO en un solo turno con múltiples tool calls)
    const STAGE_ORDER = ['LEAD', 'MQL', 'PROSPECTO', 'SQL', 'CIERRE'];
    const STAGE_SCORE_EVENT: Record<string, Parameters<typeof this.scoringService.applyEvent>[4]['type']> = {
      MQL: 'contact_data_provided',
      PROSPECTO: 'inscription_intent',
      SQL: 'payment_confirmed',
    };

    const prevIdx = STAGE_ORDER.indexOf(agentResult.previousStage ?? 'LEAD');
    const currIdx = STAGE_ORDER.indexOf(agentResult.stage ?? 'LEAD');

    let scoreResult = { score: 0, exploitReincidente: false };
    if (currIdx > prevIdx) {
      // Aplicar score event por cada etapa nueva alcanzada
      for (let i = prevIdx + 1; i <= currIdx; i++) {
        const evType = STAGE_SCORE_EVENT[STAGE_ORDER[i]];
        if (evType) {
          scoreResult = await this.scoringService.applyEvent(
            db, msg.tenantId, lead.id, conversation.id, { type: evType },
          );
        }
      }
    } else {
      scoreResult = await this.scoringService.applyEvent(
        db, msg.tenantId, lead.id, conversation.id, { type: 'message_received' },
      );
    }

    if (scoreResult.exploitReincidente) {
      await db.lead.update({ where: { id: lead.id }, data: { blockedAt: new Date() } });
      await db.conversation.update({
        where: { id: conversation.id },
        data: { status: ConvStatus.BLOCKED },
      });
    }

    await this.auditLog.record(db, {
      tenantId: msg.tenantId,
      conversationId: conversation.id,
      transactionId: uuidv4(),
      actor: 'BOT',
      action: 'MESSAGE_PROCESSED',
      payload: {
        messageId: msg.messageId,
        toolCalls: agentResult.toolCallsExecuted,
        stage: agentResult.stage,
        score: scoreResult.score,
      },
    });

    const handoffTriggered = agentResult.escalateToHuman || agentResult.stage === 'SQL';

    return {
      conversationId: conversation.id,
      leadId: lead.id,
      routedTo: 'bot',
      response: agentResult.response,
      stage: agentResult.stage,
      score: scoreResult.score,
      toolCallsExecuted: agentResult.toolCallsExecuted,
      handoffTriggered,
      debugLog: agentResult.debugLog,
    };
  }
}
