import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConvStatus, Stage, CierreResult } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { AuditLogService } from '../audit/audit-log.service';
import { HandoffManagerImpl } from '../conversation/handoff-manager.service';
import { AgentRunnerService } from '../conversation/agent-runner.service';
import { ConversationSessionStore } from '../conversation/session-store.service';
import { createRedis } from '../common/redis.factory';
import type { SessionMessage } from '../dto/conversation.dto';

@ApiTags('Operator')
@Controller(':tenantId/operator')
export class OperatorController {
  private readonly sessionRedis = createRedis('session:');

  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly auditLog: AuditLogService,
    private readonly handoffManager: HandoffManagerImpl,
    private readonly agentRunner: AgentRunnerService,
    private readonly sessionStore: ConversationSessionStore,
  ) {}

  private async getDb(tenantId: string) {
    const config = await this.tenantConfigService.getTenantConfig(tenantId);
    if (!config.dbUrl) throw new Error('No DB configured');
    return this.tenantConfigService.getPrismaClient(tenantId, config.dbUrl);
  }

  @Get('conversations/all')
  @ApiOperation({ summary: 'Todas las conversaciones activas agrupadas por evento con prioridad' })
  async getAllConversationsGrouped(@Param('tenantId') tenantId: string) {
    const db = await this.getDb(tenantId);

    const conversations = await db.conversation.findMany({
      where: {
        tenantId,
        status: { in: ['ACTIVE', 'HANDOFF_PENDING', 'WITH_OPERATOR', 'CLOSED'] },
      },
      include: {
        lead: {
          include: {
            reservations: {
              where: { status: { in: ['TEMPORARY', 'CONFIRMED'] } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            // Incluir entradas de lista de espera para detectar evento y marcar isWaitingList
            waitingEntries: {
              where: { tenantId, status: { in: ['WAITING', 'NOTIFIED'] } },
              orderBy: { joinedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      take: 300,
    });

    // Separar conversaciones con y sin reserva/waitingList para no cargar Redis innecesariamente
    const sinReserva = conversations.filter(
      c => !c.lead.reservations.length && !c.lead.waitingEntries.length,
    );

    // Para conversaciones sin reserva (LEAD/MQL): detectar evento por el primer mensaje
    // del historial Redis usando keywords del nombre y etiquetas del evento.
    // Esto permite mostrar sesiones LEAD/MQL bajo el evento correcto antes de la reserva.
    let eventKeywords: { id: string; words: string[] }[] = [];
    if (sinReserva.length > 0) {
      const activeEvents = await db.event.findMany({ where: { tenantId, isActive: true } });
      eventKeywords = activeEvents.map(ev => ({
        id: ev.id,
        words: [
          // Palabras del nombre con más de 3 chars (evita artículos/preposiciones)
          ...ev.name.toLowerCase().split(/[\s\W]+/).filter(w => w.length > 3),
          // Etiquetas del contextData (más específicas)
          ...((ev.contextData as any)?.etiquetas ?? []).map((t: string) => t.toLowerCase()),
        ],
      }));
    }

    // Mapa convId → eventId detectado (reserva o historial)
    const detectedEventMap = new Map<string, string | null>();

    for (const c of conversations) {
      if (c.lead.reservations.length > 0) {
        // Fuente de verdad: FK de reserva (TEMPORARY o CONFIRMED)
        detectedEventMap.set(c.id, c.lead.reservations[0].eventId);
        continue;
      }
      if (c.lead.waitingEntries.length > 0) {
        // Lead en lista de espera: asociar al evento de la entrada de waitlist
        detectedEventMap.set(c.id, c.lead.waitingEntries[0].eventId);
        continue;
      }

      // Sin reserva (LEAD/MQL): escanear TODOS los mensajes del usuario en Redis.
      // El usuario puede no mencionar el evento en el primer mensaje, o cambiar de idea.
      // Se usa el ÚLTIMO evento detectado (el más reciente expresa la intención actual).
      // Esta búsqueda se ejecuta en cada refresh hasta que haya una reserva (PROSPECTO+).
      let detected: string | null = null;
      if (eventKeywords.length > 0) {
        try {
          const history = await this.sessionStore.getHistory(tenantId, c.id);
          const userMessages = history.filter(m => m.role === 'user');
          for (const msg of userMessages) {
            const text = String(msg.content).toLowerCase();
            for (const ev of eventKeywords) {
              if (ev.words.some(w => text.includes(w))) {
                detected = ev.id; // actualizar: última mención de evento gana
                break;            // un evento por mensaje es suficiente
              }
            }
          }
        } catch { /* historial no disponible — cae a sinEvento */ }
      }
      detectedEventMap.set(c.id, detected);
    }

    // Ordenamiento por prioridad dentro de cada grupo:
    // 1. Escaladas activas primero, 2. Etapa desc, 3. Score desc, 4. Más antigua, 5. Cerradas al final
    const STAGE_ORDER: Record<string, number> = { LEAD: 1, MQL: 2, PROSPECTO: 3, SQL: 4, CIERRE: 5 };
    const escalado = (c: any) => ['HANDOFF_PENDING', 'WITH_OPERATOR'].includes(c.status) ? 1 : 0;
    const cerrada  = (c: any) => c.status === 'CLOSED' ? 1 : 0;

    const sortConvs = (a: any, b: any) => {
      // Cerradas van al final del grupo
      const cl = cerrada(a) - cerrada(b);
      if (cl !== 0) return cl;
      const e = escalado(b) - escalado(a);
      if (e !== 0) return e;
      const s = (STAGE_ORDER[b.lead.currentStage] ?? 0) - (STAGE_ORDER[a.lead.currentStage] ?? 0);
      if (s !== 0) return s;
      const sc = (b.lead.score ?? 0) - (a.lead.score ?? 0);
      if (sc !== 0) return sc;
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
    };

    const mapConv = (c: any) => ({
      id: c.id,
      status: c.status,
      channel: c.channel,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      closedAt: c.closedAt ?? null,
      needsHuman: ['HANDOFF_PENDING', 'WITH_OPERATOR'].includes(c.status),
      eventDetectedFrom: c.lead.reservations.length > 0 ? 'reserva'
        : c.lead.waitingEntries.length > 0 ? 'waitlist' : 'historial',
      // isWaitingList: true cuando el lead NO tiene reserva activa Y:
      //   a) tiene WaitingListEntry explícita (register_waiting_list fue llamado), O
      //   b) está en PROSPECTO sin reserva (reserve_quota falló pero register_waiting_list
      //      no se llamó por el bug de tools=0 — se detecta implícitamente por etapa)
      isWaitingList: c.lead.reservations.length === 0
        && (c.lead.waitingEntries.length > 0 || c.lead.currentStage === 'PROSPECTO'),
      lead: {
        id: c.lead.id,
        name: c.lead.name,
        email: c.lead.email,
        phone: c.lead.phone,
        stage: c.lead.currentStage,
        score: c.lead.score,
        cierreResult: c.lead.cierreResult ?? null,
      },
    });

    // Agrupar usando el eventId detectado (reserva o historial)
    const groups = new Map<string | null, any[]>();
    for (const c of conversations) {
      const eventId = detectedEventMap.get(c.id) ?? null;
      if (!groups.has(eventId)) groups.set(eventId, []);
      groups.get(eventId)!.push(c);
    }
    for (const [, convs] of groups) convs.sort(sortConvs);

    return {
      sinEvento: (groups.get(null) ?? []).map(mapConv),
      porEvento: [...groups.entries()]
        .filter(([k]) => k !== null)
        .map(([eventId, convs]) => ({ eventId, conversations: convs.map(mapConv) })),
    };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Conversaciones escaladas agrupadas por evento' })
  async getConversations(@Param('tenantId') tenantId: string) {
    const db = await this.getDb(tenantId);

    const conversations = await db.conversation.findMany({
      where: { tenantId, status: { in: ['HANDOFF_PENDING', 'WITH_OPERATOR'] } },
      include: {
        lead: {
          include: {
            reservations: {
              where: { status: { in: ['TEMPORARY', 'CONFIRMED'] } },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 100,
    });

    // Look up event names for all referenced events
    const eventIds = [...new Set(
      conversations.map((c) => c.lead.reservations[0]?.eventId).filter(Boolean) as string[]
    )];
    const events = eventIds.length
      ? await db.event.findMany({ where: { id: { in: eventIds } } })
      : [];
    const eventMap = new Map(events.map((e) => [e.id, e.name]));

    // Group by event
    const groups = new Map<string | null, { eventId: string | null; eventName: string; conversations: unknown[] }>();

    for (const c of conversations) {
      const eventId = c.lead.reservations[0]?.eventId ?? null;
      const key = eventId ?? '__none__';
      if (!groups.has(key)) {
        groups.set(key, {
          eventId,
          eventName: eventId ? (eventMap.get(eventId) ?? eventId) : 'Sin evento detectado',
          conversations: [],
        });
      }
      groups.get(key)!.conversations.push({
        id: c.id,
        status: c.status,
        channel: c.channel,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        lead: {
          id: c.lead.id,
          name: c.lead.name,
          email: c.lead.email,
          phone: c.lead.phone,
          stage: c.lead.currentStage,
          score: c.lead.score,
        },
        needsHuman: true,
      });
    }

    // Events with reservations first, "sin evento" last
    return [...groups.values()].sort((a, b) =>
      a.eventId === null ? 1 : b.eventId === null ? -1 : 0
    );
  }

  @Get('conversations/:convId/messages')
  @ApiOperation({ summary: 'Historial de mensajes de una conversación (Redis)' })
  async getMessages(
    @Param('tenantId') tenantId: string,
    @Param('convId') convId: string,
  ) {
    const raw = await this.sessionRedis.get(`${tenantId}:${convId}`);
    if (!raw) return [];
    try {
      const messages: SessionMessage[] = JSON.parse(raw);
      return messages.map((m) => ({
        role: m.role,
        sender: m.sender ?? (m.role === 'user' ? 'user' : 'bot'),
        content: typeof m.content === 'string' ? m.content : '[tool_call]',
        timestamp: m.timestamp,
      }));
    } catch {
      return [];
    }
  }

  @Post('conversations/:convId/message')
  @ApiOperation({ summary: 'Operador envía mensaje al lead' })
  async sendOperatorMessage(
    @Param('tenantId') tenantId: string,
    @Param('convId') convId: string,
    @Body() body: { text: string; operatorId?: string },
  ) {
    const db = await this.getDb(tenantId);

    const conv = await db.conversation.findUnique({ where: { id: convId } });
    if (!conv) throw new Error('Conversation not found');

    // Marcar como WITH_OPERATOR si aún no lo está
    if (conv.status === ConvStatus.HANDOFF_PENDING) {
      await db.conversation.update({
        where: { id: convId },
        data: { status: ConvStatus.WITH_OPERATOR, assignedTo: body.operatorId ?? 'operator', updatedAt: new Date() },
      });
    }

    // Persistir en historial de Redis
    const key = `${tenantId}:${convId}`;
    const raw = await this.sessionRedis.get(key);
    const history: SessionMessage[] = raw ? JSON.parse(raw) : [];
    const msg: SessionMessage = {
      role: 'assistant',
      content: body.text,
      timestamp: new Date().toISOString(),
      sender: 'operator',
    };
    history.push(msg);
    await this.sessionRedis.setex(key, 1800, JSON.stringify(history));

    await this.auditLog.record(db, {
      tenantId,
      conversationId: convId,
      transactionId: uuidv4(),
      actor: 'OPERATOR',
      action: 'OPERATOR_MESSAGE_SENT',
      payload: { text: body.text, operatorId: body.operatorId },
    });

    return { ok: true, timestamp: msg.timestamp };
  }

  @Post('conversations/:convId/close')
  @ApiOperation({ summary: 'Operador cierra conversación como GANADO o PERDIDO' })
  async closeConversation(
    @Param('tenantId') tenantId: string,
    @Param('convId') convId: string,
    @Body() body: { outcome: 'GANADO' | 'PERDIDO'; operatorId?: string },
  ) {
    const db = await this.getDb(tenantId);

    const conv = await db.conversation.findUnique({
      where: { id: convId },
      include: { lead: true },
    });
    if (!conv) throw new Error('Conversation not found');

    await db.$transaction(async (tx) => {
      await tx.conversation.update({
        where: { id: convId },
        data: { status: ConvStatus.CLOSED, closedAt: new Date(), updatedAt: new Date() },
      });
      await tx.lead.update({
        where: { id: conv.leadId },
        data: {
          currentStage: Stage.CIERRE,
          cierreResult: body.outcome as CierreResult,
          updatedAt: new Date(),
        },
      });

      // Al cerrar como GANADO: confirmar la reserva TEMPORARY → CONFIRMED
      // Esto actualiza los contadores de cupo para reflejar el participante inscrito
      if (body.outcome === 'GANADO') {
        const reservation = await tx.reservation.findFirst({
          where: { leadId: conv.leadId, status: 'TEMPORARY' },
        });
        if (reservation) {
          await tx.reservation.update({
            where: { id: reservation.id },
            data: { status: 'CONFIRMED', confirmedAt: new Date(), expiresAt: null },
          });
          await tx.event.update({
            where: { id: reservation.eventId },
            data: { reservedQuota: { decrement: 1 }, confirmedQuota: { increment: 1 } },
          });
        }
      }
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId: convId,
      transactionId: uuidv4(),
      actor: 'OPERATOR',
      action: 'CONVERSATION_CLOSED',
      payload: { outcome: body.outcome, operatorId: body.operatorId },
    });

    return { ok: true, outcome: body.outcome };
  }

  @Post('conversations/:convId/reactivate')
  @ApiOperation({ summary: 'Operador devuelve conversación al bot con revisión de contexto' })
  async reactivateBot(
    @Param('tenantId') tenantId: string,
    @Param('convId') convId: string,
    @Body() body: { operatorId?: string },
  ) {
    const db = await this.getDb(tenantId);
    const returned = await this.handoffManager.returnToBot(
      db, tenantId, convId, body.operatorId ?? 'operator',
    );
    if (!returned) {
      throw new Error('No es posible reactivar: lead en SQL o conversación no encontrada');
    }

    // Cargar la conversación para obtener el leadId y hacer la revisión de contexto
    const conv = await db.conversation.findUnique({
      where: { id: convId },
      select: { leadId: true },
    });
    if (!conv) return { ok: true };

    // Obtener la configuración del tenant (necesaria para el AgentRunner)
    const tenantConfig = await this.tenantConfigService.getTenantConfig(tenantId);
    if (!tenantConfig.llmApiKey) return { ok: true };

    // Mensaje sintético de revisión de contexto.
    // NO se persiste en Redis como mensaje del usuario — solo la respuesta del bot queda.
    const REVIEW_MSG =
      '[SISTEMA - REACTIVACIÓN DE BOT] El operador ha devuelto esta conversación al asistente automático. ' +
      'Revisa el historial completo, incluyendo los mensajes del operador. ' +
      'Analiza el estado del lead: ¿qué datos tiene registrados? ¿en qué etapa está? ¿qué quedó pendiente? ' +
      'Emite las señales que correspondan al estado actual del lead si es necesario. ' +
      'Luego envía un mensaje al cliente retomando la conversación desde donde quedó.';

    try {
      const result = await this.agentRunner.run({
        tenantId,
        leadId: conv.leadId,
        conversationId: convId,
        userMessage: REVIEW_MSG,
        db,
        tenantConfig,
        isContextReview: true,
      });

      await this.auditLog.record(db, {
        tenantId,
        conversationId: convId,
        transactionId: uuidv4(),
        actor: 'SYSTEM',
        action: 'BOT_CONTEXT_REVIEW',
        payload: { stage: result.stage, toolCalls: result.toolCallsExecuted },
      });

      return {
        ok: true,
        botResponse: result.response || null,
        stage: result.stage,
        toolCallsExecuted: result.toolCallsExecuted,
      };
    } catch (err) {
      // Si la revisión falla, la conversación ya fue reactivada — no es crítico
      return { ok: true, reviewError: (err as Error).message };
    }
  }

  @Get('events')
  @ApiOperation({ summary: 'Eventos del tenant con cupos calculados desde reservaciones reales' })
  async getEvents(@Param('tenantId') tenantId: string) {
    const db = await this.getDb(tenantId);

    const events = await db.event.findMany({
      where: { tenantId },
      orderBy: { startDate: 'asc' },
    });

    const eventIds = events.map((e) => e.id);

    // Cupos calculados desde registros reales (no contadores denormalizados)
    // Esto elimina la posibilidad de deriva entre DB y contadores tras reset/updates
    const [tempCounts, confCounts] = await Promise.all([
      db.reservation.groupBy({
        by: ['eventId'],
        where: { tenantId, eventId: { in: eventIds }, status: 'TEMPORARY' },
        _count: { id: true },
      }),
      db.reservation.groupBy({
        by: ['eventId'],
        where: { tenantId, eventId: { in: eventIds }, status: 'CONFIRMED' },
        _count: { id: true },
      }),
    ]);

    const tempMap  = new Map(tempCounts.map(r => [r.eventId, r._count.id]));
    const confMap  = new Map(confCounts.map(r => [r.eventId, r._count.id]));

    return events.map((e) => {
      const reserved  = tempMap.get(e.id)  ?? 0;
      const confirmed = confMap.get(e.id)  ?? 0;
      const available = Math.max(0, e.totalQuota - reserved - confirmed);
      const pct = e.totalQuota > 0
        ? Math.round(((reserved + confirmed) / e.totalQuota) * 100)
        : 0;

      return {
        id:          e.id,
        name:        e.name,
        description: e.description,
        startDate:   e.startDate,
        endDate:     e.endDate,
        isActive:    e.isActive,
        quota: {
          total:        e.totalQuota,
          reserved,
          confirmed,
          available,
          occupancyPct: pct,
        },
        contextData: e.contextData,
      };
    });
  }

  @Get('events/:eventId/waitlist')
  @ApiOperation({ summary: 'Lista de espera de un evento ordenada por score' })
  async getWaitlist(
    @Param('tenantId') tenantId: string,
    @Param('eventId') eventId: string,
  ) {
    const db = await this.getDb(tenantId);

    const entries = await db.waitingListEntry.findMany({
      where: { tenantId, eventId },
      include: { lead: true },
      orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
    });

    return entries.map((e, i) => ({
      position: i + 1,
      leadId: e.leadId,
      leadName: e.lead.name,
      leadEmail: e.lead.email,
      score: e.score,
      stage: e.lead.currentStage,
      status: e.status,
      joinedAt: e.joinedAt,
      notifiedAt: e.notifiedAt,
    }));
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas globales del tenant' })
  async getStats(@Param('tenantId') tenantId: string) {
    const db = await this.getDb(tenantId);

    const [totalLeads, byStage, activeConvs, pendingHandoff] = await Promise.all([
      db.lead.count({ where: { tenantId } }),
      db.lead.groupBy({ by: ['currentStage'], where: { tenantId }, _count: true }),
      db.conversation.count({ where: { tenantId, status: 'ACTIVE' } }),
      db.conversation.count({ where: { tenantId, status: { in: ['HANDOFF_PENDING', 'WITH_OPERATOR'] } } }),
    ]);

    return {
      totalLeads,
      activeConversations: activeConvs,
      pendingHandoff,
      byStage: Object.fromEntries(byStage.map((s) => [s.currentStage, s._count])),
    };
  }
}
