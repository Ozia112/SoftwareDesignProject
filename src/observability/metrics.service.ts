import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Gauge, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

// MetricsService — métricas Prometheus (PSD-37)
@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry = new Registry();

  // Contadores
  readonly conversationsStarted: Counter;
  readonly conversationsTransferred: Counter;
  readonly conversationsClosed: Counter;
  readonly exploitDetected: Counter;
  readonly reservationsExpired: Counter;
  readonly tokenCost: Counter;

  // Gauges
  readonly activeConversations: Gauge;

  // Histogramas
  readonly messageLatency: Histogram;
  readonly toolCallLatency: Histogram;
  readonly llmLatency: Histogram;

  constructor() {
    collectDefaultMetrics({ register: this.registry });

    this.conversationsStarted = new Counter({
      name: 'bot_conversations_started_total',
      help: 'Total de conversaciones iniciadas',
      labelNames: ['tenantId'],
      registers: [this.registry],
    });

    this.conversationsTransferred = new Counter({
      name: 'bot_conversations_transferred_total',
      help: 'Total de conversaciones transferidas a operador',
      labelNames: ['tenantId', 'reason'],
      registers: [this.registry],
    });

    this.conversationsClosed = new Counter({
      name: 'bot_conversations_closed_total',
      help: 'Total de conversaciones cerradas',
      labelNames: ['tenantId'],
      registers: [this.registry],
    });

    this.exploitDetected = new Counter({
      name: 'bot_exploit_detected_total',
      help: 'Total de exploits detectados',
      labelNames: ['tenantId'],
      registers: [this.registry],
    });

    this.reservationsExpired = new Counter({
      name: 'quota_reservations_expired_total',
      help: 'Total de reservas expiradas',
      labelNames: ['tenantId', 'eventId'],
      registers: [this.registry],
    });

    this.tokenCost = new Counter({
      name: 'bot_token_cost_total',
      help: 'Costo acumulado en tokens',
      labelNames: ['tenantId', 'model'],
      registers: [this.registry],
    });

    this.activeConversations = new Gauge({
      name: 'bot_conversations_active',
      help: 'Conversaciones activas concurrentes',
      labelNames: ['tenantId'],
      registers: [this.registry],
    });

    this.messageLatency = new Histogram({
      name: 'bot_message_latency_ms',
      help: 'Latencia de procesamiento de mensaje end-to-end',
      labelNames: ['tenantId'],
      buckets: [100, 250, 500, 1000, 2000, 5000],
      registers: [this.registry],
    });

    this.toolCallLatency = new Histogram({
      name: 'bot_tool_call_latency_ms',
      help: 'Latencia por tool call',
      labelNames: ['tenantId', 'toolName'],
      buckets: [10, 50, 100, 250, 500, 1000],
      registers: [this.registry],
    });

    this.llmLatency = new Histogram({
      name: 'bot_llm_latency_ms',
      help: 'Latencia de llamada al LLM',
      labelNames: ['tenantId', 'model'],
      buckets: [200, 500, 1000, 2000, 5000, 10000],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // métricas inicializadas en constructor
  }
}
