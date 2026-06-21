import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { GetGeneralContextOutput, GetEventContextOutput } from '../dto/tool-calls.dto';
import { createRedis } from '../common/redis.factory';

const CONTEXT_CACHE_TTL = 300;

// ContextBankService — puerta única de lectura/escritura (CU-COM-003)
@Injectable()
export class ContextBankService {
  private readonly logger = new Logger(ContextBankService.name);
  private readonly redis = createRedis('ctx:');

  constructor() {}

  async getGeneralContext(
    db: PrismaClient,
    tenantId: string,
    fields?: string[],
  ): Promise<GetGeneralContextOutput> {
    const cacheKey = `general:${tenantId}`;
    const cached = await this.redis.get(cacheKey);

    let context: Record<string, unknown>;
    let updatedAt: string;

    if (cached) {
      const parsed = JSON.parse(cached);
      context = parsed.context;
      updatedAt = parsed.updatedAt;
    } else {
      // El contexto general del tenant se almacena en TenantConfig.systemPrompt + metadata
      const config = await db.tenantConfig?.findUnique?.({ where: { tenantId } }).catch(() => null);
      context = (config as any)?.contextData ?? {};
      updatedAt = (config as any)?.updatedAt?.toISOString() ?? new Date().toISOString();
      await this.redis.setex(cacheKey, CONTEXT_CACHE_TTL, JSON.stringify({ context, updatedAt }));
    }

    if (fields?.length) {
      const filtered = Object.fromEntries(
        Object.entries(context).filter(([k]) => fields.includes(k)),
      );
      return { context: filtered, updatedAt };
    }

    return { context, updatedAt };
  }

  async getEventContext(
    db: PrismaClient,
    tenantId: string,
    eventId: string,
    fields?: string[],
  ): Promise<GetEventContextOutput> {
    const cacheKey = `event:${tenantId}:${eventId}`;
    const cached = await this.redis.get(cacheKey);

    let context: Record<string, unknown>;
    let updatedAt: string;

    if (cached) {
      const parsed = JSON.parse(cached);
      context = parsed.context;
      updatedAt = parsed.updatedAt;
    } else {
      const event = await db.event.findFirst({ where: { id: eventId, tenantId } });
      if (!event) throw new NotFoundException(`Event ${eventId} not found`);
      context = (event.contextData as Record<string, unknown>) ?? {};
      updatedAt = event.updatedAt.toISOString();
      await this.redis.setex(cacheKey, CONTEXT_CACHE_TTL, JSON.stringify({ context, updatedAt }));
    }

    if (fields?.length) {
      const filtered = Object.fromEntries(
        Object.entries(context).filter(([k]) => fields.includes(k)),
      );
      return { eventId, context: filtered, updatedAt };
    }

    return { eventId, context, updatedAt };
  }

  async invalidateEventContext(tenantId: string, eventId: string): Promise<void> {
    await this.redis.del(`event:${tenantId}:${eventId}`);
  }

  async invalidateGeneralContext(tenantId: string): Promise<void> {
    await this.redis.del(`general:${tenantId}`);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
