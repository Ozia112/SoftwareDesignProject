import { Injectable } from '@nestjs/common';
import { ContextBankService } from '../../context-bank/context-bank.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  GetEventContextInput,
  GetEventContextOutput,
  ToolCallResult,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class GetEventContextHandler implements IToolHandler<
  GetEventContextInput,
  GetEventContextOutput
> {
  readonly name = 'get_event_context';

  readonly schema = {
    name: 'get_event_context',
    description: 'Lee el banco de contexto de un evento específico.',
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'ID del evento' },
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Campos específicos a retornar.',
        },
      },
      required: ['eventId'],
    },
  };

  constructor(private readonly contextBank: ContextBankService) {}

  async execute(
    params: GetEventContextInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<GetEventContextOutput>> {
    try {
      const result = await this.contextBank.getEventContext(
        ctx.db,
        ctx.tenantId,
        params.eventId,
        params.fields,
      );
      return toolCallOk(result);
    } catch (err) {
      return toolCallErr('NOT_FOUND', (err as Error).message, false);
    }
  }
}
