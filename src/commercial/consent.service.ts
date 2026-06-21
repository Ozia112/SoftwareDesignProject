import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuditLogService } from '../audit/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

// ConsentService — registra consentimiento tácito al primer mensaje (CU-COM-004)
@Injectable()
export class ConsentService {
  constructor(private readonly auditLog: AuditLogService) {}

  async hasConsent(db: PrismaClient, tenantId: string, leadId: string): Promise<boolean> {
    const lead = await db.lead.findFirst({ where: { id: leadId, tenantId } });
    return !!lead?.consentAt;
  }

  async recordConsent(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
  ): Promise<void> {
    const lead = await db.lead.findFirst({ where: { id: leadId, tenantId } });
    if (lead?.consentAt) return; // ya registrado

    await db.lead.update({
      where: { id: leadId },
      data: { consentAt: new Date() },
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: uuidv4(),
      actor: 'SYSTEM',
      action: 'CONSENT_RECORDED',
      payload: { method: 'tacit_first_message' },
    });
  }
}
