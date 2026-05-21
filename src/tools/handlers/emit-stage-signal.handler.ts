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
export class EmitStageSignalHandler implements IToolHandler<
  EmitStageSignalInput,
  EmitStageSignalOutput
> {
  readonly name = 'emit_stage_signal';

  readonly schema = {
    name: 'emit_stage_signal',
    description:
      'Emite una señal de transición comercial. El sistema persiste la etapa y datos de contacto.',
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
        eventId: { type: 'string', description: 'ID del evento cuando aplique' },
        contactName:  { type: 'string', description: 'Nombre completo del lead' },
        contactEmail: { type: 'string', description: 'Correo del lead' },
        contactPhone: { type: 'string', description: 'Teléfono del lead' },
        interestedEvent: { type: 'string', description: 'Nombre del evento de interés' },
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
      // Persistir datos de contacto si vienen en la señal
      const contactUpdate: Record<string, string> = {};
      if (params.contactName)  contactUpdate['name']  = params.contactName;
      if (params.contactEmail) contactUpdate['email'] = params.contactEmail;
      if (params.contactPhone) contactUpdate['phone'] = params.contactPhone;

      if (Object.keys(contactUpdate).length > 0) {
        await ctx.db.lead.update({
          where: { id: ctx.leadId },
          data: contactUpdate,
        });
      }

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
