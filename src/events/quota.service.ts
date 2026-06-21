import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { PrismaClient, ReservationStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogService } from '../audit/audit-log.service';
import type {
  ReserveQuotaOutput,
  ReleaseQuotaOutput,
  BlockQuotaOutput,
} from '../dto/tool-calls.dto';

const RESERVATION_TTL_MINUTES = 30;

// QuotaService — reserva, liberación y bloqueo atómico de cupos (CU-EVT-003)
// Previene sobreinscripción con SELECT...FOR UPDATE (Prisma: $queryRaw)
@Injectable()
export class QuotaService {
  private readonly logger = new Logger(QuotaService.name);

  constructor(
    private readonly auditLog: AuditLogService,
    @InjectQueue('reservation-expiry') private readonly expiryQueue: Queue,
  ) {}

  async reserveQuota(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    eventId: string,
    idempotencyKey: string,
  ): Promise<ReserveQuotaOutput> {
    // Idempotencia: retornar reserva existente si misma clave
    const existing = await db.reservation.findUnique({ where: { idempotencyKey } });
    if (existing && existing.status === ReservationStatus.TEMPORARY) {
      return {
        reservationId: existing.id,
        expiresAt: existing.expiresAt!.toISOString(),
      };
    }

    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
    const transactionId = uuidv4();

    // Bloqueo atómico con transacción Prisma
    const reservation = await db.$transaction(async (tx) => {
      // Verificar cupo disponible (SELECT FOR UPDATE simulado)
      const event = await (tx as any).$queryRaw`
        SELECT id, "totalQuota", "reservedQuota", "confirmedQuota"
        FROM "Event"
        WHERE id = ${eventId} AND "tenantId" = ${tenantId}
        FOR UPDATE
      `;

      const ev = (event as any[])[0];
      if (!ev) throw new ConflictException(`Event ${eventId} not found`);

      const available = ev.totalQuota - ev.reservedQuota - ev.confirmedQuota;
      if (available <= 0) throw new ConflictException('No quota available');

      // Incrementar reservedQuota
      await tx.event.update({
        where: { id: eventId },
        data: { reservedQuota: { increment: 1 } },
      });

      return tx.reservation.create({
        data: {
          leadId,
          eventId,
          tenantId,
          status: ReservationStatus.TEMPORARY,
          idempotencyKey,
          expiresAt,
        },
      });
    });

    // Encolar job de expiración
    await this.expiryQueue.add(
      'expire',
      { reservationId: reservation.id, tenantId, eventId, leadId, conversationId },
      {
        delay: RESERVATION_TTL_MINUTES * 60 * 1000,
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId,
      actor: 'SYSTEM',
      action: 'QUOTA_RESERVED',
      payload: { reservationId: reservation.id, eventId, expiresAt: expiresAt.toISOString() },
    });

    this.logger.log(`Quota reserved: ${reservation.id} for lead ${leadId} event ${eventId}`);
    return { reservationId: reservation.id, expiresAt: expiresAt.toISOString() };
  }

  async releaseQuota(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    eventId: string,
  ): Promise<ReleaseQuotaOutput> {
    const reservation = await db.reservation.findFirst({
      where: { leadId, eventId, tenantId, status: ReservationStatus.TEMPORARY },
    });

    if (!reservation) return { released: false };

    await db.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: ReservationStatus.RELEASED, releasedAt: new Date() },
      });
      await tx.event.update({
        where: { id: eventId },
        data: { reservedQuota: { decrement: 1 } },
      });
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: uuidv4(),
      actor: 'SYSTEM',
      action: 'QUOTA_RELEASED',
      payload: { reservationId: reservation.id, eventId },
    });

    return { released: true };
  }

  async blockQuota(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    eventId: string,
    idempotencyKey: string,
  ): Promise<BlockQuotaOutput> {
    // Idempotencia
    const existing = await db.reservation.findUnique({ where: { idempotencyKey } });
    if (existing?.status === ReservationStatus.CONFIRMED) return { blocked: true };

    const reservation = await db.reservation.findFirst({
      where: { leadId, eventId, tenantId, status: ReservationStatus.TEMPORARY },
    });

    if (!reservation) {
      throw new ConflictException('No active temporary reservation found to confirm');
    }

    await db.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservation.id },
        data: {
          status: ReservationStatus.CONFIRMED,
          confirmedAt: new Date(),
          expiresAt: null,
        },
      });
      await tx.event.update({
        where: { id: eventId },
        data: {
          reservedQuota: { decrement: 1 },
          confirmedQuota: { increment: 1 },
        },
      });
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId: uuidv4(),
      actor: 'SYSTEM',
      action: 'QUOTA_BLOCKED',
      payload: { reservationId: reservation.id, eventId },
    });

    this.logger.log(`Quota blocked (confirmed) for lead ${leadId} event ${eventId}`);
    return { blocked: true };
  }

  // Liberar cupo expirado (llamado por ReservationExpiryJob)
  async expireReservation(db: PrismaClient, reservationId: string): Promise<void> {
    const reservation = await db.reservation.findUnique({ where: { id: reservationId } });
    if (!reservation || reservation.status !== ReservationStatus.TEMPORARY) return;

    await db.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservationId },
        data: { status: ReservationStatus.EXPIRED, releasedAt: new Date() },
      });
      await tx.event.update({
        where: { id: reservation.eventId },
        data: { reservedQuota: { decrement: 1 } },
      });
    });

    this.logger.log(`Reservation ${reservationId} expired and quota released`);
  }
}
