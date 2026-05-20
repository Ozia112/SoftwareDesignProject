import { Injectable } from '@nestjs/common';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  RequestHumanHandoffInput,
  RequestHumanHandoffOutput,
  ToolCallResult,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';
import { HandoffManager } from '../handoff-manager.interface';

@Injectable()
export class RequestHumanHandoffHandler implements IToolHandler<
  RequestHumanHandoffInput,
  RequestHumanHandoffOutput
> {
  readonly name = 'request_human_handoff';

  readonly schema = {
    name: 'request_human_handoff',
    description:
      'Solicita escalamiento a operador humano. El sistema ejecuta la asignación a la cola.',
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          enum: [
            'pago_pendiente',
            'no_resuelto',
            'peticion_del_usuario',
            'politica',
            'fallo_tecnico',
          ],
          description: 'Razón del escalamiento',
        },
      },
      required: ['reason'],
    },
  };

  constructor(private readonly handoffManager: HandoffManager) {}

  async execute(
    params: RequestHumanHandoffInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<RequestHumanHandoffOutput>> {
    try {
      const result = await this.handoffManager.requestHandoff(
        ctx.db,
        ctx.tenantId,
        ctx.leadId,
        ctx.conversationId,
        params.reason,
      );
      return toolCallOk(result);
    } catch (err) {
      return toolCallErr('INTERNAL_ERROR', (err as Error).message, true);
    }
  }
}
