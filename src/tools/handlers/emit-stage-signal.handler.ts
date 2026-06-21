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
      'Emite una señal de transición comercial. Persiste etapa y datos de contacto. ' +
      'Usa nombre_capturado, correo_capturado o numero_capturado en cuanto detectes cada dato — no esperes tener los tres.',
    input_schema: {
      type: 'object',
      properties: {
        signal: {
          type: 'string',
          enum: [
            'conversacion_iniciada',
            'nombre_capturado',
            'correo_capturado',
            'numero_capturado',
            'pregunta_de_inscripcion_detectada',
            'confirmacion_de_pago_pendiente',
            'evento_cambiado',
          ],
          description:
            'conversacion_iniciada: al inicio, una sola vez. ' +
            'nombre_capturado: cuando el usuario da su nombre (requiere contactName). ' +
            'correo_capturado: cuando da su correo (requiere contactEmail). ' +
            'numero_capturado: cuando da su teléfono (requiere contactPhone). ' +
            'pregunta_de_inscripcion_detectada: cuando expresa intención de inscribirse; ' +
            'el sistema la rechaza si faltan nombre, correo o teléfono. ' +
            'confirmacion_de_pago_pendiente: cuando confirma haber realizado el pago.',
        },
        eventId: { type: 'string', description: 'ID del evento cuando aplique' },
        contactName: { type: 'string', description: 'Nombre completo del lead' },
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

  private readonly EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  async execute(
    params: EmitStageSignalInput,
    ctx: ToolContext,
  ): Promise<ToolCallResult<EmitStageSignalOutput>> {
    try {
      // Validar formato de correo antes de persistir
      switch (params.signal) {
        case 'nombre_capturado':
          if (!params.contactName?.trim())
            return toolCallErr(
              'VALIDATION_ERROR',
              'nombre_capturado requiere contactName con el nombre del usuario.',
              false,
            );
          break;
        case 'correo_capturado':
          if (!params.contactEmail)
            return toolCallErr(
              'VALIDATION_ERROR',
              'correo_capturado requiere contactEmail.',
              false,
            );
          if (!this.EMAIL_RE.test(params.contactEmail))
            return toolCallErr(
              'VALIDATION_ERROR',
              `Correo inválido: "${params.contactEmail}". Formato esperado: usuario@dominio.ext. Pide al usuario que lo corrija.`,
              false,
            );
          break;
        case 'numero_capturado':
          if (!params.contactPhone?.trim())
            return toolCallErr(
              'VALIDATION_ERROR',
              'numero_capturado requiere contactPhone con el número de teléfono del usuario.',
              false,
            );
          break;
      }

      // Persistir datos de contacto si vienen en la señal
      const contactUpdate: Record<string, string> = {};
      if (params.contactName) contactUpdate['name']  = params.contactName;
      if (params.contactEmail) contactUpdate['email'] = params.contactEmail;
      if (params.contactPhone) contactUpdate['phone'] = params.contactPhone;

      if (Object.keys(contactUpdate).length > 0) {
        await ctx.db.lead.update({
          where: { id: ctx.leadId },
          data: contactUpdate,
        });
      }

      if (params.signal === 'pregunta_de_inscripcion_detectada') {
        const lead = await ctx.db.lead.findUnique({
          where: { id: ctx.leadId },
          select: { name: true, email: true, phone: true },
        });
        const missing: string[] = [];
        if (!lead?.name) missing.push('nombre');
        if (!lead?.email) missing.push('correo');
        if (!lead?.phone) missing.push('teléfono');
        if (missing.length > 0) {
          return toolCallErr(
            'STAGE_PRECONDITION_FAILED',
            `No es posible avanzar a etapa de inscripción: faltan datos de contacto: ${missing.join(', ')}. ` +
            `Solicita los datos faltantes al usuario antes de continuar.`,
            false,
          );
        }
      }

      const result = await this.stageService.processSignal(
        ctx.db,
        ctx.tenantId,
        ctx.leadId,
        ctx.conversationId,
        params.signal as StageSignal,
      );

      // Si la señal fue ignorada (no válida para la etapa actual), informar al LLM
      if (!result.changed && result.skippedReason) {
        return toolCallErr('STAGE_PRECONDITION_FAILED' as any, result.skippedReason, false);
      }

      const score = await this.scoringService.getScore(ctx.db, ctx.tenantId, ctx.leadId);

      // Cuando numero_capturado completa los 3 campos de contacto, instruir al LLM
      // a emitir inmediatamente pregunta_de_inscripcion_detectada (REGLA B3).
      // Esto previene que el bot salte directamente a dar datos de pago sin las señales requeridas.
      let nextAction: string | undefined;
      if (params.signal === 'numero_capturado') {
        const freshLead = await ctx.db.lead.findUnique({
          where: { id: ctx.leadId },
          select: { name: true, email: true, phone: true },
        });
        if (freshLead?.name && freshLead?.email && freshLead?.phone) {
          nextAction =
            'OBLIGATORIO (REGLA B3): Los tres datos de contacto están completos. ' +
            'Llama emit_stage_signal(signal="pregunta_de_inscripcion_detectada", interestedEvent=NOMBRE_CURSO) ' +
            'y luego reserve_quota ANTES de proporcionar cualquier dato de pago.';
        }
      }

      return toolCallOk<EmitStageSignalOutput>({
        previousStage: result.previousStage,
        currentStage: result.currentStage,
        score,
        ...(nextAction && { nextAction }),
      });
    } catch (err) {
      return toolCallErr('INTERNAL_ERROR', (err as Error).message, true);
    }
  }
}
