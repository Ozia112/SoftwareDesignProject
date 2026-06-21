import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { TenantModule } from './tenant/tenant.module';
import { ConversationModule } from './conversation/conversation.module';
import { CommercialModule } from './commercial/commercial.module';
import { ContextBankModule } from './context-bank/context-bank.module';
import { EventsModule } from './events/events.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { ToolsModule } from './tools/tools.module';
import { ChannelsModule } from './channels/channels.module';
import { ObservabilityModule } from './observability/observability.module';
import { OperatorModule } from './operator/operator.module';
import { HealthController } from './common/health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.THROTTLE_TTL ?? '60') * 1000,
        limit: parseInt(process.env.THROTTLE_LIMIT ?? '100'),
      },
    ]),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    TenantModule,
    ConversationModule,
    CommercialModule,
    ContextBankModule,
    EventsModule,
    NotificationsModule,
    AuditModule,
    ToolsModule,
    ChannelsModule,
    ObservabilityModule,
    OperatorModule,
  ],
})
export class AppModule {}
