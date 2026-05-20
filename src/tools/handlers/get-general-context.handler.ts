import { Injectable } from '@nestjs/common';
import { ContextBankService } from '../../context-bank/context-bank.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  GetGeneralContextInput,
  GetGeneralContextOutput,
  ToolCallResult,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class GetGeneralContextHandler
  implements IToolHandler<GetGeneralContextInput, GetGeneralContextOutput>
{
  readonly name = 'get_general_context';

  readonly schema = {
    name: 'get_general_context',
    description: 'Lee el banco de contexto general del tenant (catálogo, aviso legal, etc.).',
    input_schema: {
      type: 'object',
      properties: {
        fields: {
          type: 'array',
          items: { type: 'string' },
          description: 'Campos específicos a retornar. Si se omite, retorna todo.',
        },
      },
    },
  };

  constructor(private readonly contextBank: ContextBankService) {}

  async execute(
    params: GetGeneralContextInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<GetGeneralContextOutput>> {
    try {
      const result = await this.contextBank.getGeneralContext(ctx.db, ctx.tenantId, params.fields);
      return toolCallOk(result);
    } catch (err) {
      return toolCallErr('INTERNAL_ERROR', (err as Error).message, true);
    }
  }
}
