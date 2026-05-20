import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { TenantConfigService } from '../tenant/tenant-config.service';

interface OutboundJobData {
  tenantId: string;
  leadId: string;
  eventId: string;
  channel: string;
}

// OutboundNotificationProcessor — notificaciones de reactivación (CU-COM-006)
// Solo contacta leads con consentimiento registrado
@Processor('outbound-notification')
export class OutboundNotificationProcessor {
  private readonly logger = new Logger(OutboundNotificationProcessor.name);

  constructor(private readonly tenantConfigService: TenantConfigService) {}

  @Process('outbound')
  async handleOutbound(job: Job<OutboundJobData>): Promise<void> {
    const { tenantId, leadId, eventId, channel } = job.data;

    const tenantConfig = await this.tenantConfigService.getTenantConfig(tenantId);
    if (!tenantConfig.dbUrl) return;
    const db = this.tenantConfigService.getPrismaClient(tenantId, tenantConfig.dbUrl);

    // Verificar consentimiento (CU-COM-004 — solo contactar con consentimiento)
    const lead = await db.lead.findFirst({ where: { id: leadId, tenantId } });
    if (!lead?.consentAt) {
      this.logger.warn(`Outbound notification skipped for lead ${leadId}: no consent registered`);
      return;
    }

    // Anti-spam: máximo 1 notificación por semana por cliente
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentAudit = await db.auditLog.findFirst({
      where: {
        tenantId,
        action: 'OUTBOUND_NOTIFICATION_SENT',
        payload: { path: ['leadId'], equals: leadId },
        createdAt: { gte: oneWeekAgo },
      },
    });

    if (recentAudit) {
      this.logger.log(`Outbound notification rate-limited for lead ${leadId}`);
      return;
    }

    this.logger.log(`Sending outbound notification to lead ${leadId} via ${channel}`);

    // Registrar en auditoría
    await db.auditLog.create({
      data: {
        tenantId,
        conversationId: 'system',
        transactionId: `outbound-${leadId}-${eventId}`,
        actor: 'SYSTEM',
        action: 'OUTBOUND_NOTIFICATION_SENT',
        payload: { leadId, eventId, channel },
      },
    });
  }
}
