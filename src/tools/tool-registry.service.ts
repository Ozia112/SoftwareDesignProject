import { Injectable, Logger } from '@nestjs/common';
import type { IToolHandler } from './tool-handler.interface';

// ToolRegistry — registro central de IToolHandler por nombre
// OCP: agregar nueva tool call = registrar nuevo handler
@Injectable()
export class ToolRegistry {
  private readonly logger = new Logger(ToolRegistry.name);
  private readonly handlers = new Map<string, IToolHandler>();

  register(handler: IToolHandler): void {
    this.handlers.set(handler.name, handler);
    this.logger.log(`Tool registered: ${handler.name}`);
  }

  get(name: string): IToolHandler | undefined {
    return this.handlers.get(name);
  }

  getSchemas(): object[] {
    return Array.from(this.handlers.values()).map((h) => h.schema);
  }

  getSchemasForStage(stage: string): object[] {
    // Tool calls disponibles por etapa — DDR-02 regla 3
    const restricted: Record<string, string[]> = {
      LEAD: ['get_general_context', 'emit_stage_signal', 'request_human_handoff'],
      MQL: ['get_general_context', 'get_event_context', 'emit_stage_signal', 'request_human_handoff'],
      PROSPECTO: [
        'get_general_context',
        'get_event_context',
        'emit_stage_signal',
        'reserve_quota',
        'release_quota',
        'register_waiting_list',
        'request_human_handoff',
      ],
      SQL: [
        'get_general_context',
        'get_event_context',
        'emit_stage_signal',
        'block_quota',
        'release_quota',
        'request_human_handoff',
      ],
      CIERRE: ['get_general_context', 'request_human_handoff'],
    };

    const allowed = restricted[stage] ?? [];
    return Array.from(this.handlers.values())
      .filter((h) => allowed.includes(h.name))
      .map((h) => h.schema);
  }
}
