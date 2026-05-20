// Inicialización de OpenTelemetry — debe importarse ANTES de cualquier otro módulo
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const SERVICE_NAME_KEY = 'service.name';

const sdk = new NodeSDK({
  resource: new Resource({
    [SERVICE_NAME_KEY]: process.env.OTEL_SERVICE_NAME ?? 'saas-bot-orchestrator',
  }),
  spanProcessors: [
    new SimpleSpanProcessor(
      new OTLPTraceExporter({
        url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318'}/v1/traces`,
      }),
    ),
  ],
  instrumentations: [new HttpInstrumentation()],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
