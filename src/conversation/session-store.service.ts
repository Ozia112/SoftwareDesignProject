import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import type { SessionMessage } from '../dto/conversation.dto';

const SESSION_TTL = 1800; // 30 minutos en segundos

// ConversationSessionStore — historial activo en Redis (RNF-04)
@Injectable()
export class ConversationSessionStore {
  private readonly logger = new Logger(ConversationSessionStore.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: parseInt(process.env.REDIS_PORT ?? '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      keyPrefix: 'session:',
    });
  }

  private key(tenantId: string, conversationId: string): string {
    return `${tenantId}:${conversationId}`;
  }

  async getHistory(tenantId: string, conversationId: string): Promise<SessionMessage[]> {
    const raw = await this.redis.get(this.key(tenantId, conversationId));
    if (!raw) return [];
    try {
      return JSON.parse(raw) as SessionMessage[];
    } catch {
      this.logger.warn(`Corrupt session for conversation ${conversationId}`);
      return [];
    }
  }

  async appendMessage(
    tenantId: string,
    conversationId: string,
    message: SessionMessage,
  ): Promise<void> {
    const key = this.key(tenantId, conversationId);
    const history = await this.getHistory(tenantId, conversationId);
    history.push(message);
    await this.redis.setex(key, SESSION_TTL, JSON.stringify(history));
  }

  async setHistory(
    tenantId: string,
    conversationId: string,
    messages: SessionMessage[],
  ): Promise<void> {
    const key = this.key(tenantId, conversationId);
    await this.redis.setex(key, SESSION_TTL, JSON.stringify(messages));
  }

  async deleteSession(tenantId: string, conversationId: string): Promise<void> {
    await this.redis.del(this.key(tenantId, conversationId));
  }

  async refreshTTL(tenantId: string, conversationId: string): Promise<void> {
    await this.redis.expire(this.key(tenantId, conversationId), SESSION_TTL);
  }

  onModuleDestroy() {
    this.redis.disconnect();
  }
}
