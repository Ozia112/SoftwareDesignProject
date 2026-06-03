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
import { ConversationSessionStore} from './session-store.service';
import type { SessionMessage } from '../dto/conversation.dto';
import type { IncomingMessageDto, ConversationContextDto } from '../dto/conversation.dto';
import type { TenantConfig } from '../dto/tenant.dto';

const PAYMENT_KEYWORDS = [
  // Confirmación explícita de envío
  'ya pagué', 'ya pague', 'ya deposité', 'ya deposite', 'ya transferí', 'ya transferi',
  'ya realicé el pago', 'ya realize el pago', 'hice el pago', 'hice la transferencia',
  'hice el deposito', 'hice el depósito', 'realicé la transferencia', 'realize la transferencia',
  'ya hice', 'comprobante', 'ya envié', 'ya envie el comprobante',
  // Solicitudes de verificación que implican pago ya realizado
  'llegó el pago', 'llego el pago',
  'llegó la transferencia', 'llego la transferencia',
  'llegó el depósito', 'llego el deposito',
  'confirmar que llegó', 'confirmar que llego',
  'revisar si llegó', 'revisar si llego',
  'revisar el pago', 'verificar el pago', 'verificar mi pago',
  'verificar pago', 'confirmar pago', 'confirmar mi pago',
  'recibiste el pago', 'recibieron el pago', 'recibiste mi pago',
  'ya está pagado', 'ya esta pagado', 'ya realicé la transferencia',
  'puedes confirmar', 'pueden confirmar',
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
    private readonly sessionStore: ConversationSessionStore,
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

    // Si está con operador o esperando asignación, no procesar con bot
    if (conversation.status === ConvStatus.WITH_OPERATOR ||
        conversation.status === ConvStatus.HANDOFF_PENDING) {
      // Persistir el mensaje del cliente para que el operador lo vea en tiempo real
      await this.sessionStore.appendMessage(msg.tenantId, conversation.id, {
        role: 'user',
        content: msg.text,
        timestamp: new Date().toISOString(),
      } as SessionMessage);

      await this.auditLog.record(db, {
        tenantId: msg.tenantId,
        conversationId: conversation.id,
        transactionId: uuidv4(),
        actor: 'SYSTEM',
        action: 'MESSAGE_ROUTED_TO_OPERATOR',
        payload: { messageId: msg.messageId },
      });

      return {
        conversationId: conversation.id,
        leadId: lead.id,
        routedTo: 'operator',
        // Sin response: el cliente ya sabe que está con operador (no debe mostrar burbuja del bot)
      };
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

    // Fallback MQL extendido: el LLM respondió sin tools en MQL.
    // Problema: el bot a veces no emite correo_capturado/numero_capturado → datos no quedan en DB
    // → el check de "datos completos" falla → nunca se verifica cupo → bot da pago sin checar disponibilidad.
    //
    // Solución en 3 pasos:
    //   1. Detectar email/teléfono del texto del mensaje y persistirlos si no estaban en DB
    //   2. Si ahora hay los 3 campos → forzar pregunta_de_inscripcion_detectada → PROSPECTO
    //   3. Detectar evento desde historial → verificar cupo inline
    if (
      agentResult.stage === 'MQL' &&
      agentResult.toolCallsExecuted === 0 &&
      conversation.status === ConvStatus.ACTIVE
    ) {
      let freshLead = await db.lead.findUnique({
        where: { id: lead.id },
        select: { name: true, email: true, phone: true },
      });

      // Paso 1: capturar datos de contacto del texto si faltan en DB
      const rawText  = msg.text.trim();
      const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const cleanedDigits = rawText.replace(/[\s\-\(\)\+]/g, '');
      const PHONE_RE = /^\d{7,15}$/;

      const captured: Record<string, string> = {};
      if (!freshLead?.email) {
        const m = EMAIL_RE.exec(rawText);
        if (m) captured['email'] = m[0];
      }
      if (!freshLead?.phone && PHONE_RE.test(cleanedDigits)) {
        captured['phone'] = cleanedDigits;
      }

      if (Object.keys(captured).length > 0) {
        await db.lead.update({ where: { id: lead.id }, data: captured });
        freshLead = { ...freshLead, ...captured } as typeof freshLead;
        agentResult.debugLog.push(
          `🚨 FALLBACK MQL: ${Object.keys(captured).join('+')} detectados en texto sin tool call → persistidos en DB`,
        );
      }

      // Paso 2: si ya tenemos los 3 campos → forzar avance de etapa
      if (freshLead?.name && freshLead?.email && freshLead?.phone) {
        this.logger.warn(`MQL fallback: complete contact data for lead ${lead.id} — forcing pregunta_de_inscripcion_detectada`);
        await this.stageService.processSignal(
          db, msg.tenantId, lead.id, conversation.id, 'pregunta_de_inscripcion_detectada',
        );
        agentResult.stage = 'PROSPECTO';
        agentResult.debugLog.push('🚨 FALLBACK MQL: datos completos → forzado pregunta_de_inscripcion_detectada');

        // Paso 3: detectar evento del historial y verificar cupo
        const eventId = await this.detectEventFromHistory(db, msg.tenantId, conversation.id);
        if (eventId) {
          const ev = await db.event.findUnique({ where: { id: eventId } });
          const available = ev ? ev.totalQuota - ev.reservedQuota - ev.confirmedQuota : 0;

          if (ev && available > 0) {
            // Hay cupo: crear reserva inline para reflejar la disponibilidad real
            const idemKey = `res-fallback-${lead.id}-${eventId}`;
            const exists  = await db.reservation.findUnique({ where: { idempotencyKey: idemKey } });
            if (!exists) {
              await db.$transaction(async (tx) => {
                await tx.event.update({ where: { id: eventId }, data: { reservedQuota: { increment: 1 } } });
                await tx.reservation.create({
                  data: {
                    leadId: lead.id, eventId, tenantId: msg.tenantId,
                    status: 'TEMPORARY' as any,
                    idempotencyKey: idemKey,
                    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
                  },
                });
              });
              agentResult.debugLog.push(`🚨 FALLBACK MQL: reserva creada para ${eventId} (cupo disponible)`);
              // La respuesta del bot con datos de pago es correcta — no sobrescribir
            }
          } else if (ev && available <= 0) {
            // Sin cupo: sobrescribir respuesta del bot (evitar que informe datos de pago incorrectamente)
            agentResult.response =
              `Lo siento, el ${ev.name} no tiene cupos disponibles en este momento. ` +
              `¿Te gustaría que te registre en la lista de espera para ser notificado cuando haya disponibilidad?`;
            agentResult.debugLog.push(`🚨 FALLBACK MQL: sin cupo en ${eventId} → respuesta sobrescrita`);
          }
        }
      }
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
    const STAGE_SCORE_EVENT: Record<string, string> = {
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
            db, msg.tenantId, lead.id, conversation.id, { type: evType as any },
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

    // Garantizar mensaje de escalación al llegar a SQL — independiente del canal y del LLM.
    // SIEMPRE se usa el mensaje estándar cuando el stage alcanza SQL, ya sea que el LLM
    // haya respondido algo o no. Esto asegura consistencia entre canales (WhatsApp, Web, etc.)
    // y evita que un mensaje genérico de fallback reemplace la notificación de escalación.
    const SQL_HANDOFF_MSG =
      'Hemos recibido tu confirmación. Un asesor revisará tu comprobante y confirmará tu inscripción pronto.';
    if (agentResult.stage === 'SQL') {
      if (!agentResult.response?.trim()) {
        // LLM no respondió — inyectar mensaje y persistir en historial
        agentResult.response = SQL_HANDOFF_MSG;
        await this.sessionStore.appendMessage(msg.tenantId, conversation.id, {
          role: 'assistant',
          content: SQL_HANDOFF_MSG,
          timestamp: new Date().toISOString(),
        } as SessionMessage);
      } else if (agentResult.response !== SQL_HANDOFF_MSG) {
        // LLM respondió algo diferente — forzar el mensaje estándar de todas formas
        agentResult.response = SQL_HANDOFF_MSG;
      }
    }

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

  // Detecta el evento de interés de un lead leyendo su historial de Redis.
  // Compara el texto de los mensajes del usuario contra keywords del nombre y etiquetas
  // de los eventos activos del tenant. Devuelve el último evento mencionado.
  private async detectEventFromHistory(
    db: any,
    tenantId: string,
    conversationId: string,
  ): Promise<string | null> {
    try {
      const history = await this.sessionStore.getHistory(tenantId, conversationId);
      const activeEvents = await db.event.findMany({ where: { tenantId, isActive: true } });

      const eventKeywords: { id: string; words: string[] }[] = activeEvents.map((ev: any) => ({
        id: ev.id,
        words: [
          ...ev.name.toLowerCase().split(/[\s\W]+/).filter((w: string) => w.length > 3),
          ...((ev.contextData as any)?.etiquetas ?? []).map((t: string) => t.toLowerCase()),
        ],
      }));

      let lastDetected: string | null = null;
      for (const msg of history.filter((m: any) => m.role === 'user')) {
        const text = String(msg.content).toLowerCase();
        for (const ev of eventKeywords) {
          if (ev.words.some((w) => text.includes(w))) {
            lastDetected = ev.id;
            break;
          }
        }
      }
      return lastDetected;
    } catch {
      return null;
    }
  }
}
