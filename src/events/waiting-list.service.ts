import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaClient, WaitingListStatus } from '@prisma/client';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogService } from '../audit/audit-log.service';
import type { RegisterWaitingListOutput } from '../dto/tool-calls.dto';

// WaitingListService — lista de espera priorizada (CU-EVT-001)
// Orden: score DESC, joinedAt ASC (FIFO como desempate)
// Cache en Redis Sorted Set (replica el índice DB para baja latencia)
@Injectable()
export class WaitingListService {
  private readonly logger = new Logger(WaitingListService.name);
  private readonly redis: Redis;

  constructor(private readonly auditLog: AuditLogService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      keyPrefix: 'waitlist:',
    });
  }

  private redisKey(tenantId: string, eventId: string): string {
    return `${tenantId}:${eventId}`;
  }

  async registerEntry(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    eventId: string,
    idempotencyKey: string,
  ): Promise<RegisterWaitingListOutput> {
    // Verificar que el lead es PROSPECTO (precondición CU-EVT-001)
    const lead = await db.lead.findFirstOrThrow({ where: { id: leadId, tenantId } });
    if (lead.currentStage !== 'PROSPECTO') {
      throw new ConflictException('Lead must be in PROSPECTO stage to join waiting list');
    }

    // Idempotencia
    const existing = await db.waitingListEntry.findUnique({
      where: { leadId_eventId: { leadId, eventId } },
    });
    if (existing && existing.status === WaitingListStatus.WAITING) {
      const position = await this.getPosition(db, tenantId, eventId, leadId);
      return { position };
    }

    const entry = await db.waitingListEntry.upsert({
      where: { leadId_eventId: { leadId, eventId } },
      create: {
        leadId,
        eventId,
        tenantId,
        score: lead.score,
        status: WaitingListStatus.WAITING,
      },
      update: { score: lead.score, status: WaitingListStatus.WAITING, updatedAt: new Date() },
    });

    // Cache en Redis Sorted Set: score = (score * 1e10) - joinedAt.getTime() para orden combinado
    const sortedScore = lead.score * 1e10 - entry.joinedAt.getTime();
    await this.redis.zadd(
      this.redisKey(tenantId, eventId),
      sortedScore.toString(),
      leadId,
    );

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: uuidv4(),
      actor: 'SYSTEM',
      action: 'WAITLIST_REGISTERED',
      payload: { eventId, score: lead.score, entryId: entry.id },
    });

    const position = await this.getPosition(db, tenantId, eventId, leadId);
    this.logger.log(`Lead ${leadId} joined waiting list for event ${eventId} at position ${position}`);
    return { position };
  }

  async getPosition(
    db: PrismaClient,
    tenantId: string,
    eventId: string,
    leadId: string,
  ): Promise<number> {
    // Usar Redis para consulta rápida de posición (rank descendente = posición)
    const rank = await this.redis.zrevrank(this.redisKey(tenantId, eventId), leadId);
    if (rank !== null) return rank + 1;

    // Fallback a DB
    const entries = await db.waitingListEntry.findMany({
      where: { eventId, tenantId, status: WaitingListStatus.WAITING },
      orderBy: [{ score: 'desc' }, { joinedAt: 'asc' }],
    });
    const idx = entries.findIndex((e) => e.leadId === leadId);
    return idx === -1 ? 0 : idx + 1;
  }

  async getNextEligible(
    db: PrismaClient,
    tenantId: string,
    eventId: string,
    count = 1,
  ): Promise<string[]> {
    // Verificar que cada lead sigue siendo PROSPECTO antes de notificar
    const topLeadIds = await this.redis.zrevrange(this.redisKey(tenantId, eventId), 0, count * 2 - 1);

    const eligible: string[] = [];
    for (const leadId of topLeadIds) {
      if (eligible.length >= count) break;
      const lead = await db.lead.findFirst({ where: { id: leadId, tenantId } });
      const entry = await db.waitingListEntry.findUnique({
        where: { leadId_eventId: { leadId, eventId } },
      });
      if (lead?.currentStage === 'PROSPECTO' && entry?.status === WaitingListStatus.WAITING) {
        eligible.push(leadId);
      }
    }
    return eligible;
  }

  async markNotified(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    eventId: string,
    expiresAt: Date,
  ): Promise<void> {
    await db.waitingListEntry.update({
      where: { leadId_eventId: { leadId, eventId } },
      data: { status: WaitingListStatus.NOTIFIED, notifiedAt: new Date(), expiresAt },
    });
  }

  async markAccepted(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    eventId: string,
  ): Promise<void> {
    await db.waitingListEntry.update({
      where: { leadId_eventId: { leadId, eventId } },
      data: { status: WaitingListStatus.ACCEPTED, updatedAt: new Date() },
    });
    await this.redis.zrem(this.redisKey(tenantId, eventId), leadId);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
