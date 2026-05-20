import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogService } from '../audit/audit-log.service';
import { QuotaService } from './quota.service';

// CancellationService — cancelación pre-inicio (CU-EVT-002)
// Libera cupo y dispara notificación a la lista de espera
@Injectable()
export class CancellationService {
  private readonly logger = new Logger(CancellationService.name);

  constructor(
    private readonly auditLog: AuditLogService,
    private readonly quotaService: QuotaService,
  ) {}

  async cancelInscription(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    eventId: string,
    conversationId: string,
    operatorId: string,
  ): Promise<{ cancelled: boolean; quotaReleased: boolean }> {
    const reservation = await db.reservation.findFirst({
      where: {
        leadId,
        eventId,
        tenantId,
        status: { in: [ReservationStatus.TEMPORARY, ReservationStatus.CONFIRMED] },
      },
    });

    if (!reservation) {
      this.logger.warn(`No active reservation found for lead ${leadId} event ${eventId}`);
      return { cancelled: false, quotaReleased: false };
    }

    let quotaReleased = false;

    await db.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
      });

      const decrement = reservation.status === ReservationStatus.CONFIRMED
        ? { confirmedQuota: { decrement: 1 } }
        : { reservedQuota: { decrement: 1 } };

      await tx.event.update({ where: { id: eventId }, data: decrement });
      quotaReleased = true;
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: uuidv4(),
      actor: 'OPERATOR',
      action: 'INSCRIPTION_CANCELLED',
      payload: {
        reservationId: reservation.id,
        eventId,
        operatorId,
        previousStatus: reservation.status,
      },
    });

    this.logger.log(
      `Inscription cancelled for lead ${leadId} event ${eventId} by operator ${operatorId}`,
    );

    return { cancelled: true, quotaReleased };
  }
}
