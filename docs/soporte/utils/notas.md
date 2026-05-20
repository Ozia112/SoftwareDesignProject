# Hoja de ruta de implementación — Sprint de activación de código

> Generado: 2026-05-13
> Base: Estrategia de implementación v2.0 + Pipeline operativo + Análisis de PSDs 23-27 + DDR-01

---

## Issues por crear (PSD-28 a PSD-37)

### PSD 28 Crear DDR-02: Decisiones arquitectónicas del sistema orquestador

Titulo:

```md
PSD-28 [Docs] Crear DDR-02: Decisiones arquitectónicas del sistema orquestador
```

Contenido:

```md
## Problemática

DDR-01 sentó las bases de la separación entre etapa comercial, calificación y estado operativo. Desde entonces se han completado: estrategia v2.0 (introduce "Bot emite señales → Sistema ejecuta"), análisis de PSDs 23-27 (contrato multi-tenant), y mapeo de 14 servicios a CU. DDR-01 es vigente pero incompleto.

## Objetivo

Crear DDR-02 que documente las decisiones arquitectónicas, validando DDR-01 y añadiendo: principio central, mapeo de servicios, justificación de monorepo, contrato de tool calls.

## Alcance

- [ ] Validar que DDR-01 sigue siendo válido respecto a estrategia v2.0
- [ ] Documentar: "Bot emite señales → Sistema ejecuta operaciones de dominio"
- [ ] Tabla de mapeo: 14 servicios → CU documentados
- [ ] Justificación técnica: monorepo vs repositorio separado
- [ ] Contrato oficial de 8 tool calls con firmas TypeScript
- [ ] Stack decisiones: TypeScript + NestJS + Prisma + Redis + BullMQ + Anthropic SDK

## Criterios de aceptación

- [ ] DDR-02 valida o refuta cada punto de DDR-01
- [ ] No hay contradicciones entre DDR-01, DDR-02 y estrategia v2.0
- [ ] Principio arquitectónico es inequívoco
- [ ] Servicios mapeados 1:1 a CU
- [ ] Monorepo justificado: docs + código accesibles para AI
- [ ] Tool calls documentadas con firmas y semántica

## Entregable

- `docs/diseño/decisiones/DDR-02-decisiones-arquitectonicas-del-orquestador.md`
```

Relaciones:

- Bloqueantes
  - Cierre de PSDs 23, 24, 26 (autoridades conceptuales, contradictions)
- Bloqueados
  - PSD-29, PSD-30, PSD-32

---

### PSD-29 Documento: Estructura de código, stack tecnológico y justificación

Titulo:

```md
PSD-29 [Docs] Documento: Estructura de código, stack tecnológico y justificación
```

Contenido:

```md
## Problemática

Estrategia v2.0 define el stack pero no hay blueprint oficial: estructura de carpetas, mapeo de módulos NestJS a bounded contexts, justificación de tecnologías, decisión de monorepo.

## Objetivo

Crear documento `estructura-de-codigo.md` que sea la referencia única para la estructura del proyecto.

## Alcance

- [ ] Estructura: `src/`, `prisma/`, `docs/`, `utils/`, `.github/workflows/`
- [ ] Módulos NestJS por bounded context (commercial/, context-bank/, events/, etc.)
- [ ] Prisma schema inicial documentado
- [ ] Justificación técnica: stack choices vs alternativas descartadas
- [ ] Por qué monorepo: accesibilidad para AI + docs, trazabilidad, CI/CD simple
- [ ] Cómo ejecutar: npm install, seed DB, dev server
- [ ] Convenciones: naming, interfaces, clases, métodos
- [ ] Referencias a dónde viven las reglas de negocio (docs/)

## Criterios de aceptación

- [ ] Estructura replicable exactamente leyendo el documento
- [ ] Cada carpeta tiene razón de ser documentada
- [ ] Stack choices: 2-3 párrafos de justificación vs alternativas
- [ ] Monorepo decision: párrafo dedicado (Claude puede leer docs + código)
- [ ] Ejemplos de archivo en cada tipo de módulo
- [ ] Vincula a DDR-02

## Entregable

- `docs/diseño/modelos de diseño/estructura-de-codigo.md`
```

- Bloqueantes
  - PSD-28 (define servicios y stack)
- Bloqueados
  - PSD-32 (código base se crea exactamente así)

---

### PSD-30 Crear CLAUDE.md para integración con Claude Code

Titulo:

```md
PSD-30 [Docs] Crear CLAUDE.md para integración con Claude Code
```

Contenido:

```md
## Problemática

Claude Code va a escribir código. Sin instrucciones, el AI no sabe: dónde viven reglas de negocio, cuál es la decisión arquitectónica central, convenciones, cómo acceder a docs.

## Objetivo

Crear `CLAUDE.md` que dé contexto arquitectónico para código alineado con diseño.

## Alcance

- [ ] Referencias a docs clave por ruta relativa (CU, RF, glosario, estrategia)
- [ ] Principio central: "Bot emite señales. Sistema ejecuta operaciones de dominio."
- [ ] Tabla de mapeo servicio → CU para búsqueda rápida
- [ ] SOLID: SRP, OCP, LSP, ISP, DIP aplicado al proyecto
- [ ] Antipatrones a evitar: God Services, todo en el bot, DB acceso directo
- [ ] Convención TypeScript: PascalCase clases, camelCase métodos, UPPER_CASE constantes
- [ ] DTO pattern: input/output types en `dto/` por servicio
- [ ] Tests: antes de merge, `npm test -- --coverage`
- [ ] Si en duda: leer el CU correspondiente

## Criterios de aceptación

- [ ] Claude Code recibe respuestas alineadas con diseño
- [ ] Rutas relativas a docs son correctas
- [ ] Principio se entiende en primera lectura
- [ ] Ejemplos de SOLID aplicado al proyecto
- [ ] Referencia a tabla de servicios de DDR-02

## Entregable

- `CLAUDE.md` en raíz del repo
```

- Bloqueantes
  - PSD-28, PSD-29
- Bloqueados
  - Ninguno (usable mientras PSD-32 en progreso)

---

### PSD-31 Configurar workflows CI: GitHub Actions para TypeScript y Markdown

Titulo:

```md
PSD-31 [Chore] Configurar workflows CI: GitHub Actions para TypeScript y Markdown
```

Contenido:

```md
## Problemática

Sin CI/CD automatizado: cambios sin linter/tests pueden mergearse, docs puede desactualizarse, TypeScript errores no se atrapan.

## Objetivo

Crear workflows GitHub Actions: `ci-code.yml` (TypeScript) y `ci-docs.yml` (Markdown).

## Alcance

- [ ] `ci-code.yml`:
  - [ ] ESLint + Prettier (lint + format check)
  - [ ] `tsc --noEmit` (type-check sin build)
  - [ ] `prisma validate` (validar schema)
  - [ ] PostgreSQL + Redis como servicios efímeros
  - [ ] `prisma migrate deploy` contra DB de prueba
  - [ ] `npm test -- --coverage` (Jest con coverage)
  - [ ] `npm run build` (NestJS build)
  - [ ] Solo si cambios en `src/**`, `prisma/**`, `package.json`, `tsconfig.json`
- [ ] `ci-docs.yml`:
  - [ ] markdownlint contra `docs/**/*.md`
  - [ ] Solo si cambios en `docs/**` o `utils/**`

## Criterios de aceptación

- [ ] PR que toca solo docs no ejecuta pipeline TypeScript
- [ ] PR que toca código falla si hay lint, types, migraciones o test errors
- [ ] PostgreSQL + Redis se levantan/descienden correctamente
- [ ] Pipeline completo < 5 min
- [ ] Logs claros si falla

## Entregables

- `.github/workflows/ci-code.yml`
- `.github/workflows/ci-docs.yml`
- `.prettierrc.json`, `.eslintrc.json`, `.markdownlintrc.json`
- Docs en `docs/workflow/` sobre correr CI localmente
```

- Bloqueantes
  - Ninguno (paralelo con PSD-32)
- Bloqueados
  - PSD-32 (código base debe pasar CI)

---

### PSD-32 Código base: Inicializar proyecto NestJS + Prisma

Titulo:

```md
PSD-32 [Feat] Código base: Inicializar proyecto NestJS + Prisma
```

Contenido:

```md
## Problemática

Antes de escribir servicios: necesitamos proyecto NestJS estructurado, Prisma schema, variables de entorno, deps instaladas, CI/CD pasando.

## Objetivo

Crear estructura completa del proyecto, lista para que PSDs 33-37 agreguen servicios.

## Alcance

- [ ] `npx @nestjs/cli new saas-bot-orchestrator`
- [ ] Instalar deps: @anthropic-ai/sdk, @prisma/client, ioredis, bullmq, @nestjs/config, @nestjs/swagger
- [ ] Estructura según PSD-29: src/ con módulos (tenant/, conversation/, commercial/, context-bank/, events/, notifications/, audit/, tools/, channels/)
- [ ] `prisma/schema.prisma` completo (Lead, Conversation, Reservation, WaitingListEntry, AuditLog, etc.)
- [ ] `prisma/migrations/001_init/`
- [ ] NestJS config: `AppModule` con submodules importados (vacíos)
- [ ] Prettier + ESLint configurado
- [ ] `package.json` scripts: start, test, build, lint
- [ ] `.env.example` documentado
- [ ] `.env.local` para dev (valores dummy)
- [ ] README con setup instructions

## Criterios de aceptación

- [ ] `npm start` inicia server sin errores
- [ ] `npx prisma validate` pasa
- [ ] `npx prisma migrate dev` crea tablas en DB local
- [ ] `npm run lint` sin errores
- [ ] `npm test` suite vacía sin errores
- [ ] `npm run build` compila sin errores
- [ ] CI verde: ambos workflows pasan
- [ ] Estructura = PSD-29 exactamente

## Entregable

- Rama: `32-psd-32-feat-codigo-base-nestjs-prisma`
- PR hacia develop con: package.json, tsconfig.json, Prisma schema, src/ con módulos vacíos
```

- Bloqueantes
  - PSD-28, PSD-29, PSD-31
- Bloqueados
  - PSD-33, 34, 35, 36

---

### PSD-33 Fase 1: Infraestructura base (TenantConfig, SessionStore, AuditLog)

Titulo:

```md
PSD-33 [Feat] Fase 1: Infraestructura base (TenantConfig, SessionStore, AuditLog)
```

Contenido:

```md
## Problemática

Sin infraestructura multi-tenant no se pueden implementar servicios de negocio.

## Objetivo

Implementar 4 servicios críticos que todos van a usar: resolución de tenant, cargas de credenciales, historial en Redis, auditoría.

## Alcance

- [ ] `TenantConfigModule`:
  - [ ] `TenantConfigService`: resuelve credenciales por tenantId
  - [ ] `TenantContextMiddleware`: inyecta tenantId desde header
  - [ ] Pool de conexiones Prisma dinámicas por tenant
  - [ ] Caching en Redis (TTL 5 min)
- [ ] `ConversationSessionStore` (Redis):
  - [ ] Historial activo con TTL 30 min
  - [ ] Serializa/deserializa array de mensajes
  - [ ] Checkpoint a DB al cerrar
- [ ] `AuditLogService`:
  - [ ] Append-only, transaccional
  - [ ] Campos: conversationId, transactionId, actor, action, payload, timestamp
  - [ ] Usado por todos: todo evento se audita
- [ ] Configuración Redis + BullMQ base

## Criterios de aceptación

- [ ] `getTenantConfig(tenantId)` resuelve credenciales
- [ ] Middleware inyecta `req.tenantId`
- [ ] SessionStore almacena/recupera con TTL 30 min
- [ ] AuditLogService persiste sin errores
- [ ] Pool: dos requests con distinto tenantId usan DBs diferentes
- [ ] Tests unitarios + integración
- [ ] Coverage > 80%

## Entregables

- `src/tenant/`: TenantConfigService, middleware
- `src/conversation/`: SessionStore
- `src/audit/`: AuditLogService
- Tests en `src/*/spec/`
```

- Bloqueantes
  - PSD-32
- Bloqueados
  - PSD-34, 35, 36

---

### PSD-34 Fase 2: Servicios de dominio (Commercial, Scoring, ContextBank, Quota, WaitingList)

Titulo:

```md
PSD-34 [Feat] Fase 2: Servicios de dominio (Commercial, Scoring, ContextBank, Quota, WaitingList)
```

Contenido:

```md
## Problemática

Sin servicios de negocio el bot no tiene decisión alguna sobre etapas, scoring, cupos, lista de espera.

## Objetivo

Implementar 5 servicios de dominio que ejecutan la lógica que CU describen.

## Alcance

- [ ] `CommercialStageService` (CU-COM-005):
  - [ ] Máquina de estados: Lead → MQL → Prospecto → SQL → Cierre
  - [ ] No permite retroceso salvo por `evento_cambiado`
  - [ ] Registra en `stage_history` con timestamp
- [ ] `ScoringService` (CU-COM-005):
  - [ ] Cálculo continuo 0–20
  - [ ] Penalizaciones: spam, consultas repetidas, respuestas sin contenido
  - [ ] Exploit: manipulación, off-topic, inyección
  - [ ] Señal `exploit_reincidente` al segundo intento
  - [ ] Premio happy path: Lead → MQL → Prospecto → SQL sin desviaciones
- [ ] `ContextBankService` (CU-COM-003):
  - [ ] Lectura: `get_general_context()`, `get_event_context()`
  - [ ] Escritura: `reserve_quota()`, `release_quota()`, `block_quota()`, `register_unsubscribe()`
  - [ ] Validación de operación consistente
- [ ] `QuotaService` (CU-EVT-003):
  - [ ] Reserva temporal con idempotency_key
  - [ ] Liberación de reserva
  - [ ] Bloqueo definitivo post-pago
  - [ ] Bloqueo atómico: SELECT ... FOR UPDATE
  - [ ] Prevención de sobreinscripción
- [ ] `WaitingListService` (CU-EVT-001):
  - [ ] Alta: solo Prospecto
  - [ ] Orden: score DESC, joinedAt ASC
  - [ ] Verificación antes de notificar: ¿Prospecto todavía?
  - [ ] Caching en Redis Sorted Set
  - [ ] Índice en DB

## Criterios de aceptación

- [ ] Transiciones respetan máquina de estados
- [ ] Calificación no es alterada por etapa
- [ ] Exploit reincidente bloquea
- [ ] ContextBankService único acceso a lectura/escritura
- [ ] Idempotency_key evita duplicados
- [ ] Sobreinscripción imposible (test concurrencia)
- [ ] Lista de espera ordenada por score
- [ ] Coverage > 85%

## Entregables

- `src/commercial/`: CommercialStageService, ScoringService
- `src/context-bank/`: ContextBankService
- `src/events/`: QuotaService, WaitingListService
- Tests de concurrencia en QuotaService
```

- Bloqueantes
  - PSD-33
- Bloqueados
  - PSD-35, 36

---

### PSD-35 Fase 3: Orquestación del bot (MessageRouter, AgentRunner, HandoffManager, Canales)

Titulo:

```md
PSD-35 [Feat] Fase 3: Orquestación del bot (MessageRouter, AgentRunner, HandoffManager, Canales)
```

Contenido:

```md
## Problemática

Sin orquestación los servicios de dominio no tienen forma de ser invocados.

## Objetivo

Implementar capa de orquestación que conecta bot con servicios de dominio.

## Alcance

- [ ] `MessageRouter` (CU-COM-001 entrada):
  - [ ] Webhook handlers: `POST /api/v1/{tenantId}/webhook/whatsapp`, `/webhook/telegram`
  - [ ] Crea conversación inicial si no existe
  - [ ] Resuelve tenantId, leadId, canalId
  - [ ] Ruta a bot o bandeja humana según estado
- [ ] `AgentRunner` (CU-COM-002):
  - [ ] Anthropic SDK: `client.messages.create()` con tool use
  - [ ] Run loop: mensaje → tool calls → respuesta → envío al canal
  - [ ] Recupera historial desde ConversationSessionStore
  - [ ] Almacena nuevo historial después de turno
  - [ ] Límite de turnos configurable
  - [ ] Caching de system prompt y context bank
- [ ] `HandoffManager` (CU-COM-001 escalamiento):
  - [ ] Recibe `request_human_handoff`
  - [ ] Crea entrada en cola de operadores
  - [ ] Prioriza por score + SLA
  - [ ] Devolución al bot: reasignar si no es SQL
- [ ] 8 Tool handlers:
  - [ ] `emit_stage_signal`, `get_general_context`, `get_event_context`, `reserve_quota`, `release_quota`, `block_quota`, `register_waiting_list`, `request_human_handoff`
- [ ] Adaptadores de canal:
  - [ ] `WhatsAppAdapter`: Meta Business API
  - [ ] `TelegramAdapter`: Telegram Bot API
  - [ ] `WebAdapter`: WebSocket/SSE
- [ ] Idempotencia: deduplicación por `idempotency_key` en Redis

## Criterios de aceptación

- [ ] Bot recibe mensaje WhatsApp, ejecuta transición, responde
- [ ] Historial entre turnos (Redis)
- [ ] Escalamiento a operador funciona
- [ ] Operador devuelve a bot
- [ ] Tool calls idempotentes
- [ ] System prompt cacheado
- [ ] Tests: flujo completo Lead → MQL → Prospecto → SQL → operador
- [ ] Coverage > 80%

## Entregables

- `src/conversation/`: MessageRouter, AgentRunner, HandoffManager
- `src/tools/`: 8 Tool handlers
- `src/channels/`: WhatsApp, Telegram, Web adapters
- Tests de integración: flujo completo
```

- Bloqueantes
  - PSD-34
- Bloqueados
  - PSD-36

---

### PSD-36 Fase 4: Automatización operativa (Jobs, Notifications, Cancellations)

Titulo:

```md
PSD-36 [Feat] Fase 4: Automatización operativa (Jobs, Notifications, Cancellations)
```

Contenido:

```md
## Problemática

Ciertos eventos requieren procesamiento asíncrono: expiración de reserva, liberación de vacante, cancelación de inscripción.

## Objetivo

Implementar servicios asincronos con BullMQ para eventos no-síncronos.

## Alcance

- [ ] `ReservationExpiryJob` (BullMQ delayed):
  - [ ] Trigger: reserva temporal creada con expiración en X minutos
  - [ ] Delay job: `queue.add()` con delay = ttl_ms
  - [ ] Al vencer: verificar vigencia, liberar cupo, notificar lista
  - [ ] Retry: 3 intentos con backoff exponencial
- [ ] `NotificationService` (CU-COM-006 / RF-EVT-03):
  - [ ] Trigger: cupo liberado en evento X
  - [ ] Verificación: para cada lead en waiting_list, si Prospecto, enviar notificación
  - [ ] Límite: máximo N notificaciones por N vacantes
  - [ ] Timeout: 2 horas para aceptar, luego siguiente
  - [ ] Retry: cada 10 min si no responde, máximo 3 veces
- [ ] `CancellationService` (CU-EVT-002):
  - [ ] Trigger: operador anula inscripción
  - [ ] Acción: liberar cupo, cambiar estado a CANCELLED
  - [ ] Notificación: encolar jobs a waiting_list
- [ ] `OutboundNotificationJob` (CU-COM-006):
  - [ ] Trigger: evento reabre o evento relacionado abre
  - [ ] Criterio: leads en cartera del evento original
  - [ ] Consentimiento: solo contactar si registrado en CU-COM-004
  - [ ] Canal: mismo que conversación original
  - [ ] Frecuencia: máximo 1 por semana por cliente

## Criterios de aceptación

- [ ] ReservationExpiryJob dispara correctamente después de TTL
- [ ] NotificationService envía N por N vacantes
- [ ] Leads en waiting_list reciben en orden de score
- [ ] Si acepta: WaitingList → Prospecto → SQL
- [ ] Cancellación libera cupo y notifica
- [ ] OutboundNotification solo contacta con consentimiento
- [ ] Retries con backoff exponencial
- [ ] Tests con jest.useFakeTimers()

##  Entregables

- `src/events/`: CancellationService
- `src/notifications/`: NotificationService, OutboundNotificationJob, ReservationExpiryJob
- Configuración BullMQ: colas, delays, retries
- Tests con fake timers
```

- Bloqueantes
  - PSD-34, PSD-35
- Bloqueados
  - Ninguno (independiente de PSD-37)

---

### PSD-37 Fase 5: Observabilidad, hardening y multi-tenant credentials

Titulo:

```md
PSD-37 [Feat] Fase 5: Observabilidad, hardening y multi-tenant credentials
```

Contenido:

```md
## Problemática

Sin observabilidad no se sabe si sistema funciona bien. Sin hardening no es seguro. Sin credenciales no es SaaS.

## Objetivo

Implementar tracing distribuido, métricas, rotación de credenciales, load testing.

## Alcance

- [ ] OpenTelemetry tracing (por conversación):
  - [ ] Span por turno del bot
  - [ ] Span por tool call
  - [ ] Latencia por paso: mensaje → LLM → tool calls → respuesta
  - [ ] Exportar a Jaeger o Grafana
- [ ] Métricas (Prometheus):
  - [ ] Contador: conversaciones iniciadas, transferred, closed
  - [ ] Gauge: conversaciones activas concurrentes
  - [ ] Histograma: latencia P90, P99 por paso
  - [ ] Contador: costo en tokens por conversación
  - [ ] Tasa de exploit detectado
  - [ ] Tasa de expiración de reservas
- [ ] `TenantCredentialService`:
  - [ ] Almacenar cifradas en tabla `tenant_credentials` (DB del sistema)
  - [ ] Rotación: nuevo secret, old vigente 24 h más, luego invalidado
  - [ ] Revocación: al cancelar tenant, invalidar inmediatamente
  - [ ] Auditar: quién rotó qué y cuándo
- [ ] Rate limiting por tenant:
  - [ ] Redis counter: máximo N req/min por tenant
  - [ ] Respuesta 429 con `Retry-After` header
  - [ ] Umbral configurable por plan
- [ ] Load testing (RNF-02):
  - [ ] Scenario: 50 conversaciones concurrentes, 10 mensajes de historial cada una
  - [ ] Validar: P90 < 2s, P99 < 5s, throughput ≥ 600 msg/min
  - [ ] Graceful degradation: rechazar 503 al saturarse

## Criterios de aceptación

- [ ] OpenTelemetry emite spans correctamente
- [ ] Dashboard Grafana muestra latencia P90/P99 en tiempo real
- [ ] Rotación de credenciales sin downtime
- [ ] Revocación inmediata
- [ ] Rate limiting bloquea requests por encima del umbral
- [ ] Load test: 50 clientes concurrentes mantienen P90 < 2s
- [ ] Coverage > 80%

## Entregables

- `src/observability/`: tracing, metrics
- `src/tenant/`: TenantCredentialService, migración
- `src/common/`: rate-limit.guard.ts
- Script de load test: `scripts/load-test.js`
- `docs/operativo/observability.md`, `credential-rotation.md`
```

- Bloqueantes
  - PSD-35, PSD-36
- Bloqueados
  - Ninguno (último PSD)

---

## Resumen ejecutivo: Hoja de ruta

| PSD    | Tipo    | Titulo                               | Severidad | Bloqueantes | Bloqueados     | Artefactos                                                         |
| ------ | ------- | ------------------------------------ | --------- | ----------- | -------------- | ------------------------------------------------------------------ |
| PSD-28 | [Docs]  | DDR-02: Decisiones arquitectónicas   | 🔴 Alta   | PSDs 23-27  | 29, 30, 32     | DDR-02.md, tabla servicios, tool calls                             |
| PSD-29 | [Docs]  | Estructura de código, stack tech     | 🔴 Alta   | PSD-28      | PSD-32         | estructura-de-codigo.md, árbol carpetas                            |
| PSD-30 | [Docs]  | Crear CLAUDE.md                      | 🟡 Media  | PSD-28, 29  | —              | CLAUDE.md, tabla servicio→CU                                       |
| PSD-31 | [Chore] | Workflows CI (TypeScript + Markdown) | 🔴 Alta   | —           | PSD-32         | ci-code.yml, ci-docs.yml, configs                                  |
| PSD-32 | [Feat]  | Código base: NestJS + Prisma         | 🔴 Alta   | 28, 29, 31  | 33, 34, 35, 36 | package.json, schema, src/ vacío                                   |
| PSD-33 | [Feat]  | Fase 1: Infraestructura base         | 🔴 Alta   | PSD-32      | 34, 35, 36     | TenantConfig, SessionStore, AuditLog                               |
| PSD-34 | [Feat]  | Fase 2: Servicios de dominio         | 🔴 Alta   | PSD-33      | 35, 36         | Commercial, Scoring, ContextBank, Quota, WaitingList               |
| PSD-35 | [Feat]  | Fase 3: Orquestación del bot         | 🔴 Alta   | PSD-34      | PSD-36         | MessageRouter, AgentRunner, HandoffManager, Tool handlers, Canales |
| PSD-36 | [Feat]  | Fase 4: Automatización operativa     | 🔴 Alta   | 34, 35      | —              | ReservationExpiry, Notifications, Cancellations                    |
| PSD-37 | [Feat]  | Fase 5: Observabilidad y hardening   | 🔴 Alta   | 35, 36      | —              | OpenTelemetry, TenantCredentialService, Load tests                 |

### Camino crítico

```text
PSDs 23-27 (correcciones doc)
       ↓
    PSD-28 (DDR-02)
    ↙    ↓    ↘
  PSD-29  PSD-30  (estructura + CLAUDE)
    ↓     
  PSD-31 (CI/CD) ← paralelo con PSD-32
    ↓
  PSD-32 (código base)
    ↓
  PSD-33 (infraestructura)
    ↓
  PSD-34 (servicios)
   ↙    ↘
PSD-35  PSD-36 (orquestación + automatización, paralelo)
   ↓ ↓
  PSD-37 (observabilidad)
```

**Duración estimada (equipo de 3 personas):**

- Docs (PSDs 28-30): 1–2 semanas
- Setup CI + código base (PSDs 31-32): 1 semana
- Infraestructura (PSD-33): 1 semana
- Servicios de dominio (PSD-34): 2 semanas
- Orquestación + automatización (PSDs 35-36 paralelo): 2–3 semanas
- Observabilidad (PSD-37): 1 semana
- **Total: 8–10 semanas**

**Próximos pasos inmediatos (esta semana):**

1. ✅ Cerrar PSDs 23, 24, 26 en GitHub (correcciones documentales)
2. ✅ Crear issue PSD-28 con esta especificación
3. ✅ Asignar responsable a PSD-28 para cerrar en 3–5 días
4. ✅ Una vez PSD-28 listo, crear PSDs 29, 30, 31 en paralelo
5. ✅ Comenzar PSD-32 mientras PSDs 29, 30 en progreso

[Docs]: /docs/
[Feat]: /docs/
[Chore]: /docs/
