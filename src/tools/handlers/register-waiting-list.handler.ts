import { Injectable } from '@nestjs/common';
import { WaitingListService } from '../../events/waiting-list.service';
import { CommercialStageService } from '../../commercial/commercial-stage.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  RegisterWaitingListInput,
  RegisterWaitingListOutput,
  ToolCallResult,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class RegisterWaitingListHandler
  implements IToolHandler<RegisterWaitingListInput, RegisterWaitingListOutput>
{
  readonly name = 'register_waiting_list';

  readonly schema = {
    name: 'register_waiting_list',
    description:
      'Registra al lead en la lista de espera. Precondición: etapa PROSPECTO y cupo no disponible.',
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
    private readonly waitingList: WaitingListService,
    private readonly stageService: CommercialStageService,
  ) {}

  async execute(
    params: RegisterWaitingListInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<RegisterWaitingListOutput>> {
    const stage = await this.stageService.getStage(ctx.db, ctx.tenantId, ctx.leadId);
    if (stage !== 'PROSPECTO') {
      return toolCallErr(
        'STAGE_PRECONDITION_FAILED',
        `register_waiting_list requiere etapa PROSPECTO, actual: ${stage}`,
        false,
      );
    }

    try {
      const result = await this.waitingList.registerEntry(
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
