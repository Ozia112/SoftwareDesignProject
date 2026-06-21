import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationService } from './notification.service';
import { ReservationExpiryProcessor } from './reservation-expiry.processor';
import { OutboundNotificationProcessor } from './outbound-notification.processor';
import { EventsModule } from '../events/events.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'reservation-expiry' },
      { name: 'notification' },
      { name: 'outbound-notification' },
    ),
    EventsModule,
    AuditModule,
  ],
  providers: [NotificationService, ReservationExpiryProcessor, OutboundNotificationProcessor],
  exports: [NotificationService],
})
export class NotificationsModule {}
