import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConversationSessionStore } from './session-store.service';
import { AgentRunnerService } from './agent-runner.service';
import { MessageRouterService } from './message-router.service';
import { HandoffManagerImpl } from './handoff-manager.service';
import { TenantContextMiddleware } from '../tenant/tenant-context.middleware';
import { CommercialModule } from '../commercial/commercial.module';
import { ToolsModule } from '../tools/tools.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [CommercialModule, ToolsModule, AuditModule],
  providers: [
    ConversationSessionStore,
    AgentRunnerService,
    MessageRouterService,
    HandoffManagerImpl,
  ],
  exports: [
    ConversationSessionStore,
    AgentRunnerService,
    MessageRouterService,
    HandoffManagerImpl,
  ],
})
export class ConversationModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .forRoutes({ path: 'api/v1/:tenantId/*', method: RequestMethod.ALL });
  }
}
