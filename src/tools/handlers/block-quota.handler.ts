import { Injectable } from '@nestjs/common';
import { QuotaService } from '../../events/quota.service';
import { CommercialStageService } from '../../commercial/commercial-stage.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type { BlockQuotaInput, BlockQuotaOutput, ToolCallResult } from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class BlockQuotaHandler implements IToolHandler<BlockQuotaInput, BlockQuotaOutput> {
  readonly name = 'block_quota';

  readonly schema = {
    name: 'block_quota',
    description:
      'Confirma definitivamente el cupo (post-pago). Precondición: etapa SQL. Requiere idempotencyKey.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'ID del evento' },
        idempotencyKey: { type: 'string', description: 'Clave de idempotencia' },
      },
      required: ['eventId', 'idempotencyKey'],
    },
  };

  constructor(
    private readonly quotaService: QuotaService,
    private readonly stageService: CommercialStageService,
  ) {}

  async execute(
    params: BlockQuotaInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<BlockQuotaOutput>> {
    const stage = await this.stageService.getStage(ctx.db, ctx.tenantId, ctx.leadId);
    if (stage !== 'SQL') {
      return toolCallErr(
        'STAGE_PRECONDITION_FAILED',
        `block_quota requiere etapa SQL, actual: ${stage}`,
        false,
      );
    }

    try {
      const result = await this.quotaService.blockQuota(
        ctx.db,
        ctx.tenantId,
        ctx.leadId,
        ctx.conversationId,
        params.eventId,
        params.idempotencyKey,
      );
      return toolCallOk(result);
    } catch (err: any) {
      return toolCallErr('CONFLICT', err.message, false);
    }
  }
}
