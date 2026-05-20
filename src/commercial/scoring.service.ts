import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { AuditLogService } from '../audit/audit-log.service';
import { v4 as uuidv4 } from 'uuid';

export interface ScoreEvent {
  type:
    | 'message_received'
    | 'contact_data_provided'
    | 'inscription_intent'
    | 'payment_confirmed'
    | 'spam_detected'
    | 'repeated_query'
    | 'empty_response'
    | 'exploit_attempt'
    | 'offtopic'
    | 'happy_path_bonus';
  details?: string;
}

export interface ScoreResult {
  score: number;
  delta: number;
  exploitDetected: boolean;
  exploitReincidente: boolean;
}

const SCORE_RULES: Record<ScoreEvent['type'], number> = {
  message_received: 0,
  contact_data_provided: 3,
  inscription_intent: 2,
  payment_confirmed: 5,
  spam_detected: -4,
  repeated_query: -1,
  empty_response: -1,
  exploit_attempt: -5,
  offtopic: -2,
  happy_path_bonus: 3,
};

const MAX_SCORE = 20;
const MIN_SCORE = 0;

// ScoringService — calificación continua 0-20 (CU-COM-005)
// Calificación no modifica etapa; solo influye en priorización
@Injectable()
export class ScoringService {
  private readonly logger = new Logger(ScoringService.name);
  // Contador de exploits por lead en memoria (complementa DB)
  private readonly exploitCount = new Map<string, number>();

  constructor(private readonly auditLog: AuditLogService) {}

  async applyEvent(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    event: ScoreEvent,
  ): Promise<ScoreResult> {
    const lead = await db.lead.findFirstOrThrow({ where: { id: leadId, tenantId } });
    const delta = SCORE_RULES[event.type] ?? 0;
    const newScore = Math.min(MAX_SCORE, Math.max(MIN_SCORE, lead.score + delta));

    const isExploit = event.type === 'exploit_attempt';
    const key = `${tenantId}:${leadId}`;
    let exploitCount = this.exploitCount.get(key) ?? 0;
    let exploitReincidente = false;

    if (isExploit) {
      exploitCount += 1;
      this.exploitCount.set(key, exploitCount);
      exploitReincidente = exploitCount >= 2;
    }

    await db.lead.update({
      where: { id: leadId },
      data: { score: newScore, updatedAt: new Date() },
    });

    const transactionId = uuidv4();
    await this.auditLog.record(db, {
      tenantId,
      conversationId,
      transactionId,
      actor: 'SYSTEM',
      action: 'SCORE_UPDATE',
      payload: {
        event: event.type,
        delta,
        previousScore: lead.score,
        newScore,
        exploitReincidente,
      },
    });

    if (exploitReincidente) {
      this.logger.warn(`Exploit reincidente detectado para lead ${leadId} [tenant:${tenantId}]`);
    }

    return {
      score: newScore,
      delta,
      exploitDetected: isExploit,
      exploitReincidente,
    };
  }

  async getScore(db: PrismaClient, tenantId: string, leadId: string): Promise<number> {
    const lead = await db.lead.findFirstOrThrow({ where: { id: leadId, tenantId } });
    return lead.score;
  }
}
