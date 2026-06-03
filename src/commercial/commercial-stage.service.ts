import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Stage, ConvStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AuditLogService } from '../audit/audit-log.service';
import type { StageSignal, CommercialStage } from '../dto/tool-calls.dto';

export interface StageTransitionResult {
  changed: boolean;
  previousStage: CommercialStage;
  currentStage: CommercialStage;
  skippedReason?: string;
}

// Máquina de estados de etapa comercial (CU-COM-005)
// Calificación NO modifica etapa — DDR-01/DDR-02
const TRANSITIONS: Partial<Record<Stage, Partial<Record<StageSignal, Stage>>>> = {
  LEAD: {
    conversacion_iniciada: Stage.LEAD, // confirma Lead, sin avance
    nombre_capturado: Stage.MQL,
    correo_capturado: Stage.MQL,
    numero_capturado: Stage.MQL,
  },
  MQL: {
    nombre_capturado: Stage.MQL,
    correo_capturado: Stage.MQL,
    numero_capturado: Stage.MQL,
    pregunta_de_inscripcion_detectada: Stage.PROSPECTO,
    evento_cambiado: Stage.MQL,
  },
  PROSPECTO: {
    confirmacion_de_pago_pendiente: Stage.SQL,
    evento_cambiado: Stage.PROSPECTO,
  },
  SQL: {
    evento_cambiado: Stage.PROSPECTO, // permite retroceso por evento_cambiado
  },
  CIERRE: {
    // Terminal — sin transiciones automáticas; solo operador lo puede mover
  },
};

@Injectable()
export class CommercialStageService {
  private readonly logger = new Logger(CommercialStageService.name);

  constructor(private readonly auditLog: AuditLogService) {}

  async processSignal(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    signal: StageSignal,
  ): Promise<StageTransitionResult> {
    const lead = await db.lead.findFirstOrThrow({ where: { id: leadId, tenantId } });
    const currentStage = lead.currentStage;
    const targetStage = TRANSITIONS[currentStage]?.[signal];

    const transactionId = uuidv4();

    if (!targetStage || targetStage === currentStage) {
      if (targetStage !== currentStage) {
        // Señal no válida para la etapa actual — loguear para diagnóstico
        this.logger.warn(
          `Signal '${signal}' ignored: not valid from stage '${currentStage}' for lead ${leadId}`,
        );
      }
      return {
        changed: false,
        previousStage: currentStage as CommercialStage,
        currentStage: currentStage as CommercialStage,
        skippedReason: targetStage === undefined
          ? `Señal '${signal}' no es válida desde la etapa '${currentStage}'. Verifica que las señales previas se hayan emitido en el orden correcto.`
          : undefined,
      };
    }

    await db.$transaction(async (tx) => {
      await tx.lead.update({
        where: { id: leadId },
        data: { currentStage: targetStage, updatedAt: new Date() },
      });

      await tx.stageHistory.create({
        data: {
          leadId,
          tenantId,
          fromStage: currentStage,
          toStage: targetStage,
          signal,
          transactionId,
        },
      });

      // Al llegar a SQL el operador humano debe tomar el caso — marcar handoff automático
      if (targetStage === Stage.SQL) {
        await tx.conversation.update({
          where: { id: conversationId },
          data: { status: ConvStatus.HANDOFF_PENDING, updatedAt: new Date() },
        });
      }
    });

    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId,
      actor: 'SYSTEM',
      action: 'STAGE_TRANSITION',
      payload: { fromStage: currentStage, toStage: targetStage, signal },
    });

    this.logger.log(
      `Lead ${leadId} [tenant:${tenantId}]: ${currentStage} → ${targetStage} via ${signal}`,
    );

    return {
      changed: true,
      previousStage: currentStage as CommercialStage,
      currentStage: targetStage as CommercialStage,
    };
  }

  async getStage(db: PrismaClient, tenantId: string, leadId: string): Promise<CommercialStage> {
    const lead = await db.lead.findFirstOrThrow({ where: { id: leadId, tenantId } });
    return lead.currentStage as CommercialStage;
  }

  canOperateAt(stage: CommercialStage, requiredStage: CommercialStage): boolean {
    const order: CommercialStage[] = ['LEAD', 'MQL', 'PROSPECTO', 'SQL', 'CIERRE'];
    return order.indexOf(stage) >= order.indexOf(requiredStage);
  }
}
