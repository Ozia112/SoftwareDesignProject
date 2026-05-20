import { Injectable } from '@nestjs/common';
import { QuotaService } from '../../events/quota.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  ReleaseQuotaInput,
  ReleaseQuotaOutput,
  ToolCallResult,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class ReleaseQuotaHandler implements IToolHandler<ReleaseQuotaInput, ReleaseQuotaOutput> {
  readonly name = 'release_quota';

  readonly schema = {
    name: 'release_quota',
    description: 'Libera la reserva temporal activa del lead para un evento.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'ID del evento' },
      },
      required: ['eventId'],
    },
  };

  constructor(private readonly quotaService: QuotaService) {}

  async execute(
    params: ReleaseQuotaInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<ReleaseQuotaOutput>> {
    try {
      const result = await this.quotaService.releaseQuota(
        ctx.db,
        ctx.tenantId,
        ctx.leadId,
        ctx.conversationId,
        params.eventId,
      );
      return toolCallOk(result);
    } catch (err) {
      return toolCallErr('INTERNAL_ERROR', (err as Error).message, true);
    }
  }
}
