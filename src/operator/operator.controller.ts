import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConvStatus, Stage, CierreResult } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { AuditLogService } from '../audit/audit-log.service';
import { createRedis } from '../common/redis.factory';
import type { SessionMessage } from '../dto/conversation.dto';

@ApiTags('Operator')
@Controller(':tenantId/operator')
export class OperatorController {
  private readonly sessionRedis = createRedis('session:');

  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly auditLog: AuditLogService,
  ) {}

  private async getDb(tenantId: string) {
    const config = await this.tenantConfigService.getTenantConfig(tenantId);
    if (!config.dbUrl) throw new Error('No DB configured');
    return this.tenantConfigService.getPrismaClient(tenantId, config.dbUrl);
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

  @Get('events')
  @ApiOperation({ summary: 'Eventos del tenant con cupos y contadores' })
  async getEvents(@Param('tenantId') tenantId: string) {
    const db = await this.getDb(tenantId);

    const events = await db.event.findMany({
      where: { tenantId },
      orderBy: { startDate: 'asc' },
    });

    return events.map((e) => ({
      id: e.id,
      name: e.name,
      description: e.description,
      startDate: e.startDate,
      endDate: e.endDate,
      isActive: e.isActive,
      quota: {
        total: e.totalQuota,
        reserved: e.reservedQuota,
        confirmed: e.confirmedQuota,
        available: e.totalQuota - e.reservedQuota - e.confirmedQuota,
        occupancyPct: e.totalQuota > 0
          ? Math.round(((e.reservedQuota + e.confirmedQuota) / e.totalQuota) * 100)
          : 0,
      },
      contextData: e.contextData,
    }));
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
