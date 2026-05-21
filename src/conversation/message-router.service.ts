import { Injectable, Logger } from '@nestjs/common';
import { ChannelType, ConvStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { ConsentService } from '../commercial/consent.service';
import { ScoringService } from '../commercial/scoring.service';
import { AgentRunnerService } from './agent-runner.service';
import { AuditLogService } from '../audit/audit-log.service';
import type { IncomingMessageDto, ConversationContextDto } from '../dto/conversation.dto';
import type { TenantConfig } from '../dto/tenant.dto';

export interface RoutingResult {
  conversationId: string;
  leadId: string;
  routedTo: 'bot' | 'operator';
  response?: string;
  stage?: string;
  score?: number;
  toolCallsExecuted?: number;
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
    private readonly agentRunner: AgentRunnerService,
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

    // Ejecutar AgentRunner
    const agentResult = await this.agentRunner.run({
      tenantId: msg.tenantId,
      leadId: lead.id,
      conversationId: conversation.id,
      userMessage: msg.text,
      db,
      tenantConfig,
    });

    // Actualizar score según la etapa alcanzada
    const scoreEventMap: Record<string, Parameters<typeof this.scoringService.applyEvent>[4]['type']> = {
      MQL: 'contact_data_provided',
      PROSPECTO: 'inscription_intent',
      SQL: 'payment_confirmed',
    };
    const scoreEventType = agentResult.previousStage !== agentResult.stage
      ? scoreEventMap[agentResult.stage ?? '']
      : 'message_received';
    const scoreResult = await this.scoringService.applyEvent(
      db, msg.tenantId, lead.id, conversation.id,
      { type: scoreEventType ?? 'message_received' },
    );

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

    return {
      conversationId: conversation.id,
      leadId: lead.id,
      routedTo: 'bot',
      response: agentResult.response,
      stage: agentResult.stage,
      score: scoreResult.score,
      toolCallsExecuted: agentResult.toolCallsExecuted,
    };
  }
}
