import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { WaitingListService } from '../events/waiting-list.service';
import { AuditLogService } from '../audit/audit-log.service';
import { TenantConfigService } from '../tenant/tenant-config.service';

const NOTIFICATION_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 horas
const MAX_NOTIFICATION_RETRIES = 3;
const RETRY_DELAY_MS = 10 * 60 * 1000; // 10 min

// NotificationService — N notificaciones por N vacantes (CU-COM-006 / RF-EVT-03)
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly waitingListService: WaitingListService,
    private readonly auditLog: AuditLogService,
    private readonly tenantConfigService: TenantConfigService,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
    @InjectQueue('outbound-notification') private readonly outboundQueue: Queue,
  ) {}

  // Notificar a N leads cuando se liberan N vacantes
  async notifyWaitlistBatch(
    db: PrismaClient,
    tenantId: string,
    eventId: string,
    vacanciesFreed: number,
  ): Promise<void> {
    const eligible = await this.waitingListService.getNextEligible(
      db,
      tenantId,
      eventId,
      vacanciesFreed,
    );

    for (const leadId of eligible) {
      await this.sendWaitlistNotification(db, tenantId, eventId, leadId);
    }
  }

  async sendWaitlistNotification(
    db: PrismaClient,
    tenantId: string,
    eventId: string,
    leadId: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + NOTIFICATION_TIMEOUT_MS);

    await this.waitingListService.markNotified(db, tenantId, leadId, eventId, expiresAt);

    // Encolar envío real al canal del lead
    await this.notificationQueue.add(
      'send',
      { tenantId, eventId, leadId, expiresAt: expiresAt.toISOString() },
      {
        attempts: MAX_NOTIFICATION_RETRIES,
        backoff: { type: 'fixed', delay: RETRY_DELAY_MS },
      },
    );

    const lead = await db.lead.findUnique({ where: { id: leadId } });
    await this.auditLog.record(db, {
      tenantId,
      conversationId: 'system',
      transactionId: uuidv4(),
      actor: 'SYSTEM',
      action: 'WAITLIST_NOTIFICATION_SENT',
      payload: { eventId, leadId, expiresAt: expiresAt.toISOString() },
    });

    this.logger.log(`Waitlist notification queued for lead ${leadId} event ${eventId}`);
  }

  // Notificaciones outbound de reactivación (CU-COM-006)
  async scheduleOutboundNotification(
    tenantId: string,
    leadId: string,
    eventId: string,
    channel: string,
  ): Promise<void> {
    await this.outboundQueue.add(
      'outbound',
      { tenantId, leadId, eventId, channel },
      {
        attempts: MAX_NOTIFICATION_RETRIES,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
  }
}
