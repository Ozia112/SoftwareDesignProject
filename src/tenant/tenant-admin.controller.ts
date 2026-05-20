import { Controller, Post, Body, Param, Delete, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantConfigService } from './tenant-config.service';
import { TenantCredentialService } from './tenant-credential.service';
import { PrismaSystemService } from './prisma-system.service';
import type { TenantCredentialDto } from '../dto/tenant.dto';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

class SetCredentialDto implements TenantCredentialDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['llm_api_key', 'whatsapp_token', 'telegram_token', 'db_url'])
  credentialType: 'llm_api_key' | 'whatsapp_token' | 'telegram_token' | 'db_url';

  @IsString()
  @IsNotEmpty()
  plainValue: string;
}

class CreateTenantDto {
  @IsString() @IsNotEmpty() tenantId: string;
  @IsString() @IsNotEmpty() name: string;
  llmModel?: string;
  systemPrompt?: string;
}

@ApiTags('Tenant Admin')
@Controller('admin/tenants')
export class TenantAdminController {
  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly credentialService: TenantCredentialService,
    private readonly prismaSystem: PrismaSystemService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create or update tenant configuration' })
  async createTenant(@Body() dto: CreateTenantDto) {
    const tenant = await this.prismaSystem.tenantConfig.upsert({
      where: { tenantId: dto.tenantId },
      create: {
        tenantId: dto.tenantId,
        name: dto.name,
        llmModel: dto.llmModel ?? 'claude-haiku-4-5-20251001',
        systemPrompt: dto.systemPrompt,
      },
      update: {
        name: dto.name,
        llmModel: dto.llmModel,
        systemPrompt: dto.systemPrompt,
      },
    });
    return { tenantId: tenant.tenantId, name: tenant.name };
  }

  @Post(':tenantId/credentials')
  @ApiOperation({ summary: 'Set encrypted credential for tenant' })
  async setCredential(@Param('tenantId') tenantId: string, @Body() dto: SetCredentialDto) {
    await this.credentialService.setCredential(tenantId, dto.credentialType, dto.plainValue);
    await this.tenantConfigService.invalidateCache(tenantId);
    return { ok: true, credentialType: dto.credentialType };
  }

  @Delete(':tenantId')
  @ApiOperation({ summary: 'Revoke all tenant credentials (deactivate)' })
  async revokeTenant(@Param('tenantId') tenantId: string) {
    await this.credentialService.revokeAll(tenantId);
    await this.prismaSystem.tenantConfig.updateMany({
      where: { tenantId },
      data: { isActive: false },
    });
    await this.tenantConfigService.invalidateCache(tenantId);
    return { ok: true, tenantId, deactivated: true };
  }

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant configuration (no credentials)' })
  async getTenant(@Param('tenantId') tenantId: string) {
    const config = await this.tenantConfigService.getTenantConfig(tenantId);
    // Nunca exponer credenciales en la respuesta
    return {
      tenantId: config.tenantId,
      name: config.name,
      llmModel: config.llmModel,
      isActive: config.isActive,
      planType: config.planType,
    };
  }
}
