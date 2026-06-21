# 01 - Configuración, Prisma y demo

## Cómo arranca la aplicación

- El punto de entrada es `src/main.ts`. Ahí se crea la aplicación, se activan reglas de seguridad y validación, se configura CORS para permitir llamadas desde la GUI de demo y se monta la documentación de la API en `/api/docs`.
- El módulo raíz es `src/app.module.ts`. Ahí se registran los módulos principales (tenants, conversaciones, eventos, notificaciones, auditoría, canales) y también la integración con Redis (para colas) y la configuración global del proyecto.

## Qué guarda la base de datos

- Lead: un posible cliente, con teléfono, email y su estado comercial.
- Conversation: la sesión entre el lead y el bot o un operador.
- Reservation y WaitingListEntry: reservas y listas de espera para eventos/cursos.
- Event: la información de cursos o actividades (nombre, fechas, cupos, datos de contexto).
- AuditLog y StageHistory: registros de acciones y cambios de estado para trazabilidad.
- TenantConfig / TenantCredential: configuración y credenciales por cliente (guardadas de forma segura en la DB del sistema).

## Qué contratos y formatos usa el código

- La API espera mensajes con campos claros: `tenantId`, `channelType`, `channelId`, `messageId`, `text`, `timestamp`. Eso es lo que envían la GUI y el bridge de WhatsApp.
- Hay DTOs (definiciones tipo) que documentan estas formas de mensaje y los tool calls (reservas, señales de etapa, etc.).

## Qué hace la carpeta `demo/` (flujos principales)

- `demo/seed/seed.js`: crea un tenant de demo, guarda credenciales y carga eventos desde `demo/eventos/*.json`. Al final envía un mensaje de prueba al orquestador para verificar que todo responde.
- `demo/open-wa-bridge/index.js`: conecta WhatsApp con el orquestador. Recibe mensajes de WhatsApp y los reenvía al orquestador; también puede recibir respuestas desde el orquestador para enviarlas a usuarios.
- `demo/gui/*`: una interfaz estática que consume la API del orquestador y muestra estadísticas, logs y la conversación.
- `demo/docker-compose.yml` y `demo/start.sh`: scripts para levantar la demo completa (Postgres, Redis, orquestador, GUI y, opcionalmente, el bridge de WhatsApp). `start.sh` es interactivo: pide la key de Claude y ejecuta el seed dentro del contenedor.

## Riesgos y cosas a tener en cuenta

- La configuración está repartida: la GUI y el bridge usan valores codificados, por lo que es fácil desincronizarlos.
- `start.sh` pide datos por teclado y hace `docker exec` para el seed; eso complica ejecutarlo en un pipeline automatizado.
- `open-wa` necesita Chromium y que alguien escanee el QR para conectar WhatsApp, lo cual no es automático.

## Recomendaciones prácticas

- Centralizar la configuración del demo en un archivo `demo/config.json` que la GUI y el bridge puedan leer; así basta cambiar un sitio para apuntar a otro backend.
- Hacer el seed idempotente y ofrecerlo como un servicio o comando no interactivo (`npm run seed` o un servicio en `docker-compose`) para poder ejecutarlo en CI.
- Mantener HTTP como mecanismo por defecto, pero añadir una opción de mensajería (Redis Pub/Sub) para desacoplar componentes si se necesita más robustez.

## Qué migraciones hay

- En `prisma/migrations/` solo aparece una migración principal: `20260520000000_init/migration.sql`.
- Esa migración crea los enums (`Stage`, `CierreResult`, `ConvStatus`, `ReservationStatus`, `WaitingListStatus`, `AuditActor`, `ChannelType`) y las tablas base (`Lead`, `Conversation`, `Reservation`, `WaitingListEntry`, `StageHistory`, `AuditLog`, `Event`, `TenantConfig`, `TenantCredential`).
- También define los índices y las claves foráneas entre las tablas relacionadas, por ejemplo `Conversation -> Lead`, `Reservation -> Lead`, `WaitingListEntry -> Lead`, `StageHistory -> Lead`, `AuditLog -> Conversation` y `TenantCredential -> TenantConfig`.

## Archivos de configuración del proyecto

- `.env.example`: documenta las variables esperadas por la app. Ahí se ve el puerto del servidor, `DATABASE_URL`, Redis, clave maestra de cifrado, JWT, métricas y parámetros de rate limiting. También aclara que las credenciales reales del tenant no van en ese archivo.
- `tsconfig.json`: usa `commonjs`, `target` `ES2021`, `outDir` `./dist`, `baseUrl` `./` y el alias `@/* -> src/*`. Esto explica por qué el código puede importar con rutas cortas.
- `nest-cli.json`: define `sourceRoot: "src"` y `deleteOutDir: true`, por lo que el compilador de Nest toma `src/` como base y limpia `dist/` en cada build.
- `package.json`: concentra los scripts importantes (`build`, `start`, `start:dev`, `lint`, `test`, `prisma:*`) y las dependencias clave para el arranque del proyecto: NestJS, Prisma, Redis/Bull, validación, Swagger, OpenTelemetry y el SDK de Anthropic.

## Qué DTO corresponde a qué operación

- `src/dto/conversation.dto.ts`: define `IncomingMessageDto`, que es el contrato que realmente usa la API para recibir mensajes desde la GUI, WhatsApp o Telegram.
- `src/dto/audit.dto.ts`: define `CreateAuditLogDto`, que corresponde al registro de auditoría de operaciones del sistema.
- `src/dto/tenant.dto.ts`: define la configuración y las credenciales de tenant que el sistema resuelve en tiempo de ejecución.
- `src/dto/tool-calls.dto.ts`: agrupa los contratos de herramientas de negocio, como emitir señales de etapa, reservar cupo, liberar cupo, registrar lista de espera y pedir handoff humano.

## Qué importa de `src/` para que `demo/` funcione

- `src/main.ts`: expone la API con el prefijo `api/v1`, CORS y Swagger; la GUI y el bridge dependen de esa base para poder hablar con el orquestador.
- `src/app.module.ts`: registra la infraestructura general que necesita el demo, sobre todo Config, Throttler, Bull/Redis y los módulos de dominio.
- `src/channels/webhook.controller.ts`: define las rutas que reciben mensajes de Web, WhatsApp y Telegram. El bridge y la GUI se alinean con ese contrato.
- `src/common/health.controller.ts`: permite que `demo/start.sh` y la GUI verifiquen si el orquestador está vivo.
- `src/tenant/tenant-context.middleware.ts`: exige `X-Tenant-Id` o `tenantId` en la ruta, así que el demo debe enviar ese contexto para que la app identifique el tenant.
- `src/common/rate-limit.guard.ts`: aplica throttling por tenant y no por IP, lo que afecta cómo se comporta la demo cuando se repiten peticiones.

## Cómo encaja la demo con `src/`

- `demo/seed/seed.js` prepara tenant, credenciales y eventos llamando a endpoints de administración del orquestador antes de mandar un mensaje de prueba.
- `demo/open-wa-bridge/index.js` usa el endpoint de mensajes web del orquestador y el header `X-Tenant-Id` para encaminar los mensajes de WhatsApp.
- `demo/gui/*` consume el estado y los mensajes que devuelve la API y además consulta `/health` para pintar el estado de los servicios.

Fecha: 2026-06-17
