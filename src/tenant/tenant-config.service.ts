import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaSystemService } from './prisma-system.service';
import { TenantCredentialService } from './tenant-credential.service';
import type { TenantConfig } from '../dto/tenant.dto';
import { createRedis } from '../common/redis.factory';

const CACHE_TTL = 300;

@Injectable()
export class TenantConfigService {
  private readonly logger = new Logger(TenantConfigService.name);
  private readonly tenantPrismaPool = new Map<string, PrismaClient>();
  private readonly redis = createRedis('tenant:config:');

  constructor(
    private readonly prismaSystem: PrismaSystemService,
    private readonly credentialService: TenantCredentialService,
  ) {}

  async getTenantConfig(tenantId: string): Promise<TenantConfig> {
    const cacheKey = tenantId;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as TenantConfig;
    }

    const config = await this.prismaSystem.tenantConfig.findUnique({
      where: { tenantId },
    });

    if (!config || !config.isActive) {
      throw new NotFoundException(`Tenant ${tenantId} not found or inactive`);
    }

    const llmApiKey = await this.credentialService.getDecrypted(tenantId, 'llm_api_key');
    const dbUrl = await this.credentialService.getDecrypted(tenantId, 'db_url');
    const whatsappToken = await this.credentialService.getDecrypted(tenantId, 'whatsapp_token');
    const telegramToken = await this.credentialService.getDecrypted(tenantId, 'telegram_token');

    const result: TenantConfig = {
      tenantId: config.tenantId,
      name: config.name,
      llmModel: config.llmModel,
      systemPrompt: config.systemPrompt ?? undefined,
      isActive: config.isActive,
      planType: config.planType,
      maxRequestsMin: config.maxRequestsMin,
      llmApiKey: llmApiKey ?? undefined,
      dbUrl: dbUrl ?? undefined,
      whatsappToken: whatsappToken ?? undefined,
      telegramToken: telegramToken ?? undefined,
    };

    await this.redis.setex(cacheKey, CACHE_TTL, JSON.stringify(result));
    return result;
  }

  // Pool de clientes Prisma por tenant (usa DB del tenant)
  getPrismaClient(tenantId: string, dbUrl: string): PrismaClient {
    if (!this.tenantPrismaPool.has(tenantId)) {
      const client = new PrismaClient({ datasources: { db: { url: dbUrl } } });
      this.tenantPrismaPool.set(tenantId, client);
      this.logger.log(`Created Prisma client for tenant ${tenantId}`);
    }
    return this.tenantPrismaPool.get(tenantId)!;
  }

  async invalidateCache(tenantId: string): Promise<void> {
    await this.redis.del(tenantId);
  }

  async onModuleDestroy() {
    for (const [tenantId, client] of this.tenantPrismaPool) {
      await client.$disconnect();
      this.logger.log(`Disconnected Prisma client for tenant ${tenantId}`);
    }
    this.redis.disconnect();
  }
}
