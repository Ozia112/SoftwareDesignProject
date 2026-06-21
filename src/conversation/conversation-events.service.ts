import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import type { MessageEvent } from '@nestjs/common';
import type { Observable } from 'rxjs';

export type ConvEventType =
  | 'tool_call'
  | 'stage_change'
  | 'escalation'
  | 'bot_message'
  | 'error'
  | 'api_call';

export interface ConvEvent {
  type: ConvEventType;
  data: Record<string, unknown>;
  ts: string;
}

// Bus de eventos por conversación — alimenta el stream SSE del frontend.
// Soporta múltiples suscriptores (varias pestañas) para la misma conversación.
@Injectable()
export class ConversationEventBusService {
  private readonly subjects = new Map<string, Subject<MessageEvent>>();

  getStream(convId: string): Observable<MessageEvent> {
    if (!this.subjects.has(convId)) {
      this.subjects.set(convId, new Subject<MessageEvent>());
    }
    return this.subjects.get(convId)!.asObservable();
  }

  emit(convId: string, event: ConvEvent): void {
    if (!this.subjects.has(convId)) {
      this.subjects.set(convId, new Subject<MessageEvent>());
    }
    this.subjects.get(convId)!.next({ data: JSON.stringify(event) });
  }
}
