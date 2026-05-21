import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AuditModule } from '../audit/audit.module';
import { QuotaService } from './quota.service';
import { WaitingListService } from './waiting-list.service';
import { CancellationService } from './cancellation.service';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reservation-expiry' }),
    AuditModule,
  ],
  providers: [QuotaService, WaitingListService, CancellationService],
  exports: [QuotaService, WaitingListService, CancellationService],
})
export class EventsModule {}
