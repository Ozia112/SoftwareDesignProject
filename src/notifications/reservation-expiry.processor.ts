import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TenantConfigService } from '../tenant/tenant-config.service';
import { QuotaService } from '../events/quota.service';
import { WaitingListService } from '../events/waiting-list.service';
import { NotificationService } from './notification.service';

interface ExpiryJobData {
  reservationId: string;
  tenantId: string;
  eventId: string;
  leadId: string;
  conversationId: string;
}

// ReservationExpiryProcessor — libera cupo al vencer TTL (PSD-36)
@Processor('reservation-expiry')
export class ReservationExpiryProcessor {
  private readonly logger = new Logger(ReservationExpiryProcessor.name);

  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly quotaService: QuotaService,
    private readonly waitingListService: WaitingListService,
    private readonly notificationService: NotificationService,
  ) {}

  @Process('expire')
  async handleExpiry(job: Job<ExpiryJobData>): Promise<void> {
    const { reservationId, tenantId, eventId, leadId, conversationId } = job.data;

    this.logger.log(`Processing expiry for reservation ${reservationId}`);

    const tenantConfig = await this.tenantConfigService.getTenantConfig(tenantId);
    if (!tenantConfig.dbUrl) return;
    const db = this.tenantConfigService.getPrismaClient(tenantId, tenantConfig.dbUrl);

    await this.quotaService.expireReservation(db, reservationId);

    // Notificar a siguientes elegibles en la lista de espera
    const eligible = await this.waitingListService.getNextEligible(db, tenantId, eventId, 1);
    for (const nextLeadId of eligible) {
      await this.notificationService.sendWaitlistNotification(db, tenantId, eventId, nextLeadId);
    }
  }
}
