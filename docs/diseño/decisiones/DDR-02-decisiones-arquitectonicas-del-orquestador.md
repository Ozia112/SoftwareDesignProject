# DDR-02 Decisiones arquitectónicas del orquestador

## Metadatos

- ID: DDR-02
- Título: Decisiones arquitectónicas del orquestador
- Estado: Propuesto
- Fecha: 2026-05-19
- Responsable: Maximiliano Carrillo Alvarado
- Referencias: [DDR-01](/docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md), [Estrategia de implementación v2.0](/utils/estrategia%20de%20implementacion%20chat.md)

---

## Problemática

DDR-01 sentó las bases de la separación entre **etapa comercial**, **calificación** y **estado operativo**. Desde entonces se completó la **Estrategia de implementación v2.0**, que introduce el principio: **"El bot emite señales. El sistema ejecuta operaciones de dominio."**

DDR-01 sigue siendo vigente, pero incompleto desde la perspectiva del orquestador: aún falta consolidar (a) el principio central como contrato técnico, (b) el mapeo de servicios del orquestador a casos de uso, (c) la justificación de monorepo, y (d) el contrato oficial de tool calls.

---

## Objetivo

Documentar las decisiones arquitectónicas del orquestador, **validando DDR-01** y extendiéndolo con:

1. Principio arquitectónico central.
2. Mapeo de 14 servicios a casos de uso (trazabilidad 1:1 por servicio).
3. Justificación técnica de monorepo (docs + código accesibles para AI).
4. Contrato oficial de 8 tool calls con firmas TypeScript y semántica.
5. Decisiones de stack: TypeScript + NestJS + Prisma + Redis + BullMQ + Anthropic SDK.

---

## Alcance

- Este DDR define **contratos y límites** del orquestador y su interacción con el Bot.
- No redefine RF ni CU; los **usa como fuente de verdad** y fija consecuencias de implementación.

---

## Decisión 1 — Principio arquitectónico central

> **El bot emite señales. El sistema ejecuta operaciones de dominio.**

### Enunciado

- El Bot **no** accede a base de datos.
- El Bot **no** ejecuta transiciones comerciales ni operaciones operativas.
- El Bot **solo** emite señales y solicita operaciones **vía tool calls**.
- El Orquestador valida precondiciones (etapa, consentimiento, idempotencia, tenant) y ejecuta operaciones mediante servicios internos.

### Justificación

Este principio evita la raíz del problema descrito en DDR-01: mezclar responsabilidades del Bot con operaciones de dominio (etapas, cupos, lista de espera, escalamiento). También impone una frontera explícita de seguridad: el Bot no necesita credenciales de persistencia.

### Consecuencias

- Toda operación con efectos (persistencia, reserva de cupo, escalamiento) queda detrás de tool calls.
- Se vuelve obligatorio definir un contrato de tool calls estable y versionable.

---

## Decisión 2 — Validación de DDR-01 respecto a Estrategia v2.0

La estrategia v2.0 refuerza y operacionaliza el diagnóstico de DDR-01. La siguiente tabla valida o refuta sus puntos relevantes para el orquestador.

| Punto (DDR-01) | Resultado | Decisión en DDR-02 |
| --- | --- | --- |
| Separar estrictamente etapa comercial, calificación y estado operativo | **Validado** | Se modelan como concerns separados: `CommercialStageService` (etapa), `ScoringService` (calificación), `QuotaService`/`WaitingListService`/`CancellationService` (operativo). |
| RF-COM-02 como núcleo rector del sistema comercial | **Validado** | El orquestador considera CU-COM-005 como fuente de transiciones y precondiciones para operaciones EVT. |
| La calificación prioriza; no actualiza etapa | **Validado** | La tool call `emit_stage_signal` actualiza etapa; la calificación se recalcula como efecto separado y solo influye en priorización (por ejemplo, lista de espera). |
| Evitar que estados operativos (reserva/cupo/inscripción/cancelación) se modelen como etapas comerciales | **Validado** | Las operaciones EVT no escriben etapa; si un cambio comercial aplica, debe ocurrir por señal de etapa (CU-COM-005). |
| Lista de espera: orden por calificación, FIFO como desempate | **Validado** | `WaitingListService` aplica score DESC y FIFO para empates (coherente con CU-EVT-001 y estrategia v2.0). |
| Privacidad/consentimiento: ubicarlo de forma normativa y no bloquear indebidamente consultas | **Validado con precisión** | Se adopta CU-COM-004: el sistema muestra avisos legales y registra consentimiento tácito al primer mensaje. Antes de consentir, no se capturan datos ni se habilitan tool calls con escritura. |
| Cierre como etapa con resultado (Ganado/Perdido), no como etapas inventadas | **Validado con delimitación** | **CIERRE** existe como etapa comercial final con resultado **Ganado/Perdido**; sin embargo, se alcanza **manualmente** tras intervención humana (no es una transición automática del bot ni de CU-COM-005). |

---

## Decisión 3 — Mapeo de servicios (14) a casos de uso

Cada servicio del orquestador se ancla a **un caso de uso** (1:1 por servicio) para trazabilidad. Cuando un servicio es transversal, se ancla al CU donde su participación es obligatoria para iniciar el flujo (punto de integración más temprano).

| Servicio | CU (1:1) | Responsabilidad |
| --- | --- | --- |
| `MessageRouter` | CU-COM-001 | Recibe webhook del canal, crea conversación, resuelve tenant, asigna bot u operador. |
| `AgentRunner` | CU-COM-002 | Ejecuta el run loop del LLM: mensaje → tool calls → respuesta. |
| `HandoffManager` | CU-COM-001 | Gestiona transición bot↔operador y colas de atención humana. |
| `ConsentService` | CU-COM-004 | Muestra avisos legales vía banco de contexto y registra consentimiento tácito al primer mensaje. |
| `CommercialStageService` | CU-COM-005 | Máquina de estados de etapa comercial; procesa señales emitidas por el bot. |
| `ScoringService` | CU-COM-005 | Recalcula calificación (0–20), detecta exploits y alimenta priorización. |
| `ContextBankService` | CU-COM-003 | Puerta única de lectura/escritura controlada a bancos de contexto (general y evento). |
| `QuotaService` | CU-EVT-003 | Reserva temporal, liberación y bloqueo definitivo de cupos con bloqueo atómico. |
| `WaitingListService` | CU-EVT-001 | Alta y consulta de lista de espera; orden por calificación y FIFO como desempate. |
| `CancellationService` | CU-EVT-002 | Cancelación pre-inicio; libera cupo; dispara notificación al siguiente elegible cuando aplica. |
| `NotificationService` | CU-COM-006 | Notificaciones outbound de reactivación; reutiliza el canal y respeta anti-spam. |
| `AuditLogService` | CU-COM-001 | Log append-only de transacciones con `conversation_id` y `transaction_id`. |
| `TenantConfigService` | CU-COM-001 | Resuelve configuración y credenciales por `tenantId` antes de ejecutar cualquier flujo. |
| `ConversationSessionStore` | CU-COM-002 | Historial activo en Redis (TTL) y checkpoint a DB al cerrar conversación (RNF-04). |

Notas:

- La trazabilidad a RF (cuando aplica) se conserva en los CU; este DDR fija únicamente el ancla 1:1 de cada servicio.

---

## Decisión 4 — Monorepo (docs + código)

### Decisión

Se adopta **monorepo** como estrategia técnica para mantener, en el mismo repositorio:

- documentación de análisis y diseño (RF/CU/RN/DDR/BPMN), y
- implementación del orquestador.

### Justificación técnica

- **Contrato verificable**: el orquestador debe implementar literalmente contratos documentales (CU/RF/RN). Separar repositorios aumenta el riesgo de divergencia.
- **Trazabilidad por PR**: una PR puede actualizar un CU y el código que lo implementa en el mismo cambio.
- **Accesible para AI**: el asistente puede leer docs y código sin cambiar de repositorio; reduce errores de implementación por “context switching”.
- **CI unificado**: validaciones de Markdown, enlaces, y build/test del código viven en el mismo pipeline.

### Costos / riesgos

- Repo más grande y con más permisos; requiere disciplina de carpetas.
- Requiere reglas claras de ownership (CODEOWNERS) para evitar que cambios de código rompan documentación y viceversa.

---

## Decisión 5 — Contrato oficial de tool calls (8) con TypeScript

### Propósito

Las tool calls son el **único** canal por el cual el Bot puede:

- leer bancos de contexto,
- emitir señales comerciales, y
- solicitar operaciones EVT u operativas (cupo, lista de espera, escalamiento).

### Principios del contrato

1. **Idempotencia obligatoria** para tool calls con efectos repetibles.
2. **Validación por etapa** (el orquestador rechaza operaciones fuera de etapa).
3. **Errores de dominio tipados** (para mensajes claros y trazables).
4. **Multi-tenant explícito**: el `tenantId` no viaja en la tool call; lo resuelve el orquestador por conversación.

### Tipos base

```ts
export type ToolCallOk<T> = { ok: true; data: T };

export type ToolCallErrorCode =
	| 'VALIDATION_ERROR'
	| 'CONSENT_REQUIRED'
	| 'STAGE_PRECONDITION_FAILED'
	| 'NOT_FOUND'
	| 'CONFLICT'
	| 'RATE_LIMITED'
	| 'TEMPORARY_UNAVAILABLE'
	| 'INTERNAL_ERROR';

export type ToolCallErr = {
	ok: false;
	error: {
		code: ToolCallErrorCode;
		message: string; // humano-legible; apto para mostrar al usuario final
		retryable: boolean;
		details?: Record<string, unknown>;
	};
};

export type ToolCallResult<T> = ToolCallOk<T> | ToolCallErr;

export type CommercialStage = 'LEAD' | 'MQL' | 'PROSPECTO' | 'SQL' | 'CIERRE';

export type StageSignal =
	| 'conversacion_iniciada'
	| 'datos_de_contacto_completados'
	| 'pregunta_de_inscripcion_detectada'
	| 'confirmacion_de_pago_pendiente'
	| 'evento_cambiado';

export type IdempotencyKey = string;
```

### Tool calls (8)

```ts
// 1) Banco de contexto general (CU-COM-003)
export type GetGeneralContextInput = { fields?: string[] };
export type GetGeneralContextOutput = {
	context: Record<string, unknown>;
	updatedAt: string; // ISO-8601
};
export function get_general_context(
	input: GetGeneralContextInput,
): Promise<ToolCallResult<GetGeneralContextOutput>>;

// 2) Banco de contexto de evento (CU-COM-003)
export type GetEventContextInput = { eventId: string; fields?: string[] };
export type GetEventContextOutput = {
	eventId: string;
	context: Record<string, unknown>;
	updatedAt: string; // ISO-8601
};
export function get_event_context(
	input: GetEventContextInput,
): Promise<ToolCallResult<GetEventContextOutput>>;

// 3) Señal de transición comercial (CU-COM-005)
export type EmitStageSignalInput = {
	signal: StageSignal;
	eventId?: string; // requerido cuando la señal depende de evento (p.ej., pregunta_de_inscripcion_detectada, evento_cambiado)
};
export type EmitStageSignalOutput = {
	previousStage: CommercialStage;
	currentStage: CommercialStage;
	score?: number; // 0-20 (si se recalcula en el mismo paso)
};
export function emit_stage_signal(
	input: EmitStageSignalInput,
): Promise<ToolCallResult<EmitStageSignalOutput>>;

// 4) Reservar cupo temporal (CU-EVT-003)
export type ReserveQuotaInput = { eventId: string; idempotencyKey: IdempotencyKey };
export type ReserveQuotaOutput = { reservationId: string; expiresAt: string };
export function reserve_quota(
	input: ReserveQuotaInput,
): Promise<ToolCallResult<ReserveQuotaOutput>>;

// 5) Liberar cupo reservado (CU-EVT-003)
export type ReleaseQuotaInput = { eventId: string };
export type ReleaseQuotaOutput = { released: boolean };
export function release_quota(
	input: ReleaseQuotaInput,
): Promise<ToolCallResult<ReleaseQuotaOutput>>;

// 6) Bloquear cupo definitivo post-pago (CU-EVT-003)
export type BlockQuotaInput = { eventId: string; idempotencyKey: IdempotencyKey };
export type BlockQuotaOutput = { blocked: boolean };
export function block_quota(
	input: BlockQuotaInput,
): Promise<ToolCallResult<BlockQuotaOutput>>;

// 7) Registro en lista de espera (CU-EVT-001)
export type RegisterWaitingListInput = { eventId: string; idempotencyKey: IdempotencyKey };
export type RegisterWaitingListOutput = { position: number };
export function register_waiting_list(
	input: RegisterWaitingListInput,
): Promise<ToolCallResult<RegisterWaitingListOutput>>;

// 8) Solicitar escalamiento a humano (CU-COM-001)
export type RequestHumanHandoffInput = {
	reason:
		| 'pago_pendiente'
		| 'no_resuelto'
		| 'peticion_del_usuario'
		| 'politica'
		| 'fallo_tecnico';
};
export type RequestHumanHandoffOutput = { handoffId: string; queued: boolean };
export function request_human_handoff(
	input: RequestHumanHandoffInput,
): Promise<ToolCallResult<RequestHumanHandoffOutput>>;
```

### Semántica obligatoria (resumen)

- `emit_stage_signal`
	- El orquestador decide la transición según CU-COM-005.
	- Si `signal` implica operación EVT (por ejemplo, intención de inscripción), el orquestador puede encadenar la operación correspondiente (p. ej., reservar cupo) pero **solo** si la etapa resultante lo permite.
- `reserve_quota`
	- Precondición: etapa comercial resultante debe ser **PROSPECTO**.
	- Idempotencia: el mismo `idempotencyKey` debe producir el mismo resultado (dedupe).
- `block_quota`
	- Precondición: etapa comercial debe ser **SQL** (confirmación pendiente y control humano).
- `register_waiting_list`
	- Precondición: etapa comercial debe ser **PROSPECTO** y cupo no disponible.

---

## Decisión 6 — Stack tecnológico

Se adopta el stack recomendado en la estrategia v2.0 por su alineación directa con tool use y multi-tenant.

### Lenguaje: TypeScript (Node.js 20+)

- Facilita tool use con types completos.
- Simplifica el run loop del agente con async/await.

### Framework: NestJS

- DI y modularidad para reflejar bounded contexts (conversation/commercial/events/tenant).
- Pipes/guards/DTO validation para contratos seguros.

### Persistencia: Prisma

- Migraciones versionadas, schema como contrato.
- Type-safe queries y soporte natural a multi-tenant por conexión resuelta por `TenantConfigService`.

### Cache/cola: Redis + BullMQ

- Redis para `ConversationSessionStore` (RNF-04) e idempotencia.
- BullMQ para expiración de reservas, notificaciones y trabajos asíncronos.

### LLM: Anthropic SDK (`@anthropic-ai/sdk`)

- Tool use como contrato primario.
- Permite inyección de API key y modelo por tenant.

---

## Consecuencias y reglas de implementación (para el orquestador)

1. El orquestador debe procesar tool calls como una **máquina de estados**: validar → deduplicar → ejecutar → auditar.
2. Toda tool call con efectos debe generar `transaction_id` y registrar auditoría.
3. La política de “tool calls permitidas por etapa” debe ser explícita (por ejemplo: ocultar `block_quota` hasta SQL).

---

## Trazabilidad

- DDR relacionado: [DDR-01](/docs/diseño/decisiones/DDR-01-impacto-de-rf-com-02-en-los-casos-de-uso.md)
- Estrategia: [Estrategia de implementación v2.0](/utils/estrategia%20de%20implementacion%20chat.md)
- CU clave:
	- CU-COM-001, CU-COM-002, CU-COM-003, CU-COM-004, CU-COM-005, CU-COM-006
	- CU-EVT-001, CU-EVT-002, CU-EVT-003

