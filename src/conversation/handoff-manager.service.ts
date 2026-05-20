import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, ConvStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogService } from '../audit/audit-log.service';
import { HandoffManager } from '../tools/handoff-manager.interface';
import type { RequestHumanHandoffOutput } from '../dto/tool-calls.dto';

// HandoffManagerImpl — gestión bot→operador (CU-COM-001)
@Injectable()
export class HandoffManagerImpl extends HandoffManager {
  private readonly logger = new Logger(HandoffManagerImpl.name);

  constructor(private readonly auditLog: AuditLogService) {
    super();
  }

  async requestHandoff(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    reason: string,
  ): Promise<RequestHumanHandoffOutput> {
    const handoffId = uuidv4();

    // Actualizar estado de la conversación a HANDOFF_PENDING
    await db.conversation.update({
      where: { id: conversationId },
      data: { status: ConvStatus.HANDOFF_PENDING, updatedAt: new Date() },
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: handoffId,
      actor: 'BOT',
      action: 'HANDOFF_REQUESTED',
      payload: { reason, handoffId },
    });

    this.logger.log(`Handoff requested for conversation ${conversationId}: ${reason}`);

    return { handoffId, queued: true };
  }

  async returnToBot(
    db: PrismaClient,
    tenantId: string,
    conversationId: string,
    operatorId: string,
  ): Promise<boolean> {
    const conv = await db.conversation.findUnique({ where: { id: conversationId } });
    if (!conv) return false;

    // No permitir devolver al bot si está en SQL (precondición CU-COM-001 A2)
    const lead = await db.lead.findFirst({ where: { id: conv.leadId, tenantId } });
    if (lead?.currentStage === 'SQL') {
      this.logger.warn(
        `returnToBot blocked: lead ${lead.id} is in SQL stage`,
      );
      return false;
    }

    await db.conversation.update({
      where: { id: conversationId },
      data: { status: ConvStatus.ACTIVE, assignedTo: null, updatedAt: new Date() },
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: uuidv4(),
      actor: 'OPERATOR',
      action: 'HANDOFF_RETURNED_TO_BOT',
      payload: { operatorId },
    });

    return true;
  }
}
