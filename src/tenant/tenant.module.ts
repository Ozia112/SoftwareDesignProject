import { Module, Global } from '@nestjs/common';
import { TenantConfigService } from './tenant-config.service';
import { TenantCredentialService } from './tenant-credential.service';
import { TenantContextMiddleware } from './tenant-context.middleware';
import { TenantAdminController } from './tenant-admin.controller';
import { SeedEventsController } from './seed-events.controller';
import { PrismaSystemService } from './prisma-system.service';
import { ContextBankModule } from '../context-bank/context-bank.module';

@Global()
@Module({
  imports: [ContextBankModule],
  controllers: [TenantAdminController, SeedEventsController],
  providers: [PrismaSystemService, TenantConfigService, TenantCredentialService],
  exports: [TenantConfigService, TenantCredentialService, PrismaSystemService],
})
export class TenantModule {}

export { TenantContextMiddleware };
