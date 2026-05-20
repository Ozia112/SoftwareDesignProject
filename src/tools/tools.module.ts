import { Module, OnModuleInit } from '@nestjs/common';
import { CommercialModule } from '../commercial/commercial.module';
import { ContextBankModule } from '../context-bank/context-bank.module';
import { EventsModule } from '../events/events.module';
import { ToolRegistry } from './tool-registry.service';
import { EmitStageSignalHandler } from './handlers/emit-stage-signal.handler';
import { GetGeneralContextHandler } from './handlers/get-general-context.handler';
import { GetEventContextHandler } from './handlers/get-event-context.handler';
import { ReserveQuotaHandler } from './handlers/reserve-quota.handler';
import { ReleaseQuotaHandler } from './handlers/release-quota.handler';
import { BlockQuotaHandler } from './handlers/block-quota.handler';
import { RegisterWaitingListHandler } from './handlers/register-waiting-list.handler';
import { RequestHumanHandoffHandler } from './handlers/request-human-handoff.handler';
import { HandoffManager } from './handoff-manager.interface';
import { HandoffManagerImpl } from '../conversation/handoff-manager.service';

const HANDLERS = [
  EmitStageSignalHandler,
  GetGeneralContextHandler,
  GetEventContextHandler,
  ReserveQuotaHandler,
  ReleaseQuotaHandler,
  BlockQuotaHandler,
  RegisterWaitingListHandler,
  RequestHumanHandoffHandler,
];

@Module({
  imports: [CommercialModule, ContextBankModule, EventsModule],
  providers: [
    ToolRegistry,
    ...HANDLERS,
    { provide: HandoffManager, useClass: HandoffManagerImpl },
  ],
  exports: [ToolRegistry],
})
export class ToolsModule implements OnModuleInit {
  constructor(
    private readonly registry: ToolRegistry,
    private readonly emitStage: EmitStageSignalHandler,
    private readonly getGeneral: GetGeneralContextHandler,
    private readonly getEvent: GetEventContextHandler,
    private readonly reserveQuota: ReserveQuotaHandler,
    private readonly releaseQuota: ReleaseQuotaHandler,
    private readonly blockQuota: BlockQuotaHandler,
    private readonly registerWaiting: RegisterWaitingListHandler,
    private readonly requestHandoff: RequestHumanHandoffHandler,
  ) {}

  onModuleInit() {
    this.registry.register(this.emitStage);
    this.registry.register(this.getGeneral);
    this.registry.register(this.getEvent);
    this.registry.register(this.reserveQuota);
    this.registry.register(this.releaseQuota);
    this.registry.register(this.blockQuota);
    this.registry.register(this.registerWaiting);
    this.registry.register(this.requestHandoff);
  }
}
