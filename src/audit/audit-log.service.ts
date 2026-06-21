import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, AuditActor } from '@prisma/client';
import type { CreateAuditLogDto } from '../dto/audit.dto';

// AuditLogService — append-only, transaccional, transversal (CU-COM-001)
@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  async record(db: PrismaClient, entry: CreateAuditLogDto): Promise<void> {
    try {
      await db.auditLog.create({
        data: {
          tenantId: entry.tenantId,
          conversationId: entry.conversationId,
          transactionId: entry.transactionId,
          actor: entry.actor as AuditActor,
          action: entry.action,
          payload: entry.payload ? (entry.payload as object) : undefined,
        },
      });
    } catch (err) {
      // Auditoría no bloquea el flujo; solo loguea el error
      this.logger.error(`Audit record failed: ${(err as Error).message}`, entry);
    }
  }

  async recordBatch(db: PrismaClient, entries: CreateAuditLogDto[]): Promise<void> {
    try {
      await db.auditLog.createMany({
        data: entries.map((e) => ({
          tenantId: e.tenantId,
          conversationId: e.conversationId,
          transactionId: e.transactionId,
          actor: e.actor as AuditActor,
          action: e.action,
          payload: e.payload ? (e.payload as object) : undefined,
        })),
      });
    } catch (err) {
      this.logger.error(`Audit batch failed: ${(err as Error).message}`);
    }
  }
}
