export type AuditActor = 'BOT' | 'SYSTEM' | 'OPERATOR' | 'ADMIN';

export interface CreateAuditLogDto {
  tenantId: string;
  conversationId: string;
  transactionId: string;
  actor: AuditActor;
  action: string;
  payload?: Record<string, unknown>;
}
