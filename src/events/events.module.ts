import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QuotaService } from './quota.service';
import { WaitingListService } from './waiting-list.service';
import { CancellationService } from './cancellation.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reservation-expiry',
    }),
  ],
  providers: [QuotaService, WaitingListService, CancellationService],
  exports: [QuotaService, WaitingListService, CancellationService],
})
export class EventsModule {}
