// Contrato oficial de tool calls — DDR-02, Decisión 5
// Tipos base de resultado

export type ToolCallOk<T> = { ok: true; data: T };

export type ToolCallErrorCode =
  | 'VALIDATION_ERROR'
  | 'CONSENT_REQUIRED'
  | 'STAGE_PRECONDITION_FAILED'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'TEMPORARY_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export type ToolCallErr = {
  ok: false;
  error: {
    code: ToolCallErrorCode;
    message: string;
    retryable: boolean;
    details?: Record<string, unknown>;
  };
};

export type ToolCallResult<T> = ToolCallOk<T> | ToolCallErr;

export type CommercialStage = 'LEAD' | 'MQL' | 'PROSPECTO' | 'SQL' | 'CIERRE';

export type StageSignal =
  | 'conversacion_iniciada'
  | 'datos_de_contacto_completados'
  | 'pregunta_de_inscripcion_detectada'
  | 'confirmacion_de_pago_pendiente'
  | 'evento_cambiado';

export type IdempotencyKey = string;

// --- Tool call inputs / outputs ---

export type GetGeneralContextInput = { fields?: string[] };
export type GetGeneralContextOutput = {
  context: Record<string, unknown>;
  updatedAt: string;
};

export type GetEventContextInput = { eventId: string; fields?: string[] };
export type GetEventContextOutput = {
  eventId: string;
  context: Record<string, unknown>;
  updatedAt: string;
};

export type EmitStageSignalInput = {
  signal: StageSignal;
  eventId?: string;
};
export type EmitStageSignalOutput = {
  previousStage: CommercialStage;
  currentStage: CommercialStage;
  score?: number;
};

export type ReserveQuotaInput = { eventId: string; idempotencyKey: IdempotencyKey };
export type ReserveQuotaOutput = { reservationId: string; expiresAt: string };

export type ReleaseQuotaInput = { eventId: string };
export type ReleaseQuotaOutput = { released: boolean };

export type BlockQuotaInput = { eventId: string; idempotencyKey: IdempotencyKey };
export type BlockQuotaOutput = { blocked: boolean };

export type RegisterWaitingListInput = { eventId: string; idempotencyKey: IdempotencyKey };
export type RegisterWaitingListOutput = { position: number };

export type RequestHumanHandoffInput = {
  reason: 'pago_pendiente' | 'no_resuelto' | 'peticion_del_usuario' | 'politica' | 'fallo_tecnico';
};
export type RequestHumanHandoffOutput = { handoffId: string; queued: boolean };

// Helper para construir errores tipados
export function toolCallErr(
  code: ToolCallErrorCode,
  message: string,
  retryable = false,
  details?: Record<string, unknown>,
): ToolCallErr {
  return { ok: false, error: { code, message, retryable, details } };
}

export function toolCallOk<T>(data: T): ToolCallOk<T> {
  return { ok: true, data };
}
