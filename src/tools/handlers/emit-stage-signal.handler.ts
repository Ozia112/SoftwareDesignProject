import { Injectable } from '@nestjs/common';
import { CommercialStageService } from '../../commercial/commercial-stage.service';
import { ScoringService } from '../../commercial/scoring.service';
import type { IToolHandler, ToolContext } from '../tool-handler.interface';
import type {
  EmitStageSignalInput,
  EmitStageSignalOutput,
  ToolCallResult,
  StageSignal,
} from '../../dto/tool-calls.dto';
import { toolCallOk, toolCallErr } from '../../dto/tool-calls.dto';

@Injectable()
export class EmitStageSignalHandler
  implements IToolHandler<EmitStageSignalInput, EmitStageSignalOutput>
{
  readonly name = 'emit_stage_signal';

  readonly schema = {
    name: 'emit_stage_signal',
    description:
      'Emite una señal de transición comercial. El sistema ejecuta la transición según CU-COM-005.',
    input_schema: {
      type: 'object',
      properties: {
        signal: {
          type: 'string',
          enum: [
            'conversacion_iniciada',
            'datos_de_contacto_completados',
            'pregunta_de_inscripcion_detectada',
            'confirmacion_de_pago_pendiente',
            'evento_cambiado',
          ],
          description: 'Señal de transición comercial',
        },
        eventId: {
          type: 'string',
          description: 'ID del evento (requerido para señales relacionadas a evento)',
        },
      },
      required: ['signal'],
    },
  };

  constructor(
    private readonly stageService: CommercialStageService,
    private readonly scoringService: ScoringService,
  ) {}

  async execute(
    params: EmitStageSignalInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<EmitStageSignalOutput>> {
    try {
      const result = await this.stageService.processSignal(
        ctx.db,
        ctx.tenantId,
        ctx.leadId,
        ctx.conversationId,
        params.signal as StageSignal,
      );

      const score = await this.scoringService.getScore(ctx.db, ctx.tenantId, ctx.leadId);

      return toolCallOk<EmitStageSignalOutput>({
        previousStage: result.previousStage,
        currentStage: result.currentStage,
        score,
      });
    } catch (err) {
      return toolCallErr('INTERNAL_ERROR', (err as Error).message, true);
    }
  }
}
