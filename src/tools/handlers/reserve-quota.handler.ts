import { Injectable } from '@nestjs/common';
import { QuotaService } from '../../events/quota.service';
import { CommercialStageService } from '../../commercial/commercial-stage.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  ReserveQuotaInput,
  ReserveQuotaOutput,
  ToolCallResult,
  ToolCallErrorCode,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class ReserveQuotaHandler implements IToolHandler<ReserveQuotaInput, ReserveQuotaOutput> {
  readonly name = 'reserve_quota';

  readonly schema = {
    name: 'reserve_quota',
    description:
      'Reserva un cupo temporal para el lead. Precondición: etapa PROSPECTO. Requiere idempotencyKey.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'ID del evento' },
        idempotencyKey: { type: 'string', description: 'Clave de idempotencia única por intento' },
      },
      required: ['eventId', 'idempotencyKey'],
    },
  };

  constructor(
    private readonly quotaService: QuotaService,
    private readonly stageService: CommercialStageService,
  ) {}

  async execute(
    params: ReserveQuotaInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<ReserveQuotaOutput>> {
    // Precondición: etapa PROSPECTO
    const stage = await this.stageService.getStage(ctx.db, ctx.tenantId, ctx.leadId);
    if (stage !== 'PROSPECTO') {
      return toolCallErr(
        'STAGE_PRECONDITION_FAILED',
        `reserve_quota requiere etapa PROSPECTO, actual: ${stage}`,
        false,
      );
    }

    try {
      const result = await this.quotaService.reserveQuota(
        ctx.db,
        ctx.tenantId,
        ctx.leadId,
        ctx.conversationId,
        params.eventId,
        params.idempotencyKey,
      );
      return toolCallOk(result);
    } catch (err: any) {
      const code: ToolCallErrorCode = err.status === 409 ? 'CONFLICT' : 'INTERNAL_ERROR';
      return toolCallErr(code, err.message, false);
    }
  }
}
