# Guion de Presentación — Demo Sistema de Atención Comercial

## Convenciones

| Marcador | Significado |
| --- | --- |
| `> **EN PANTALLA:**` | Lo que debe verse en la interfaz o proyección en ese momento |
| `> **ACOTACIÓN:**` | Nota explicativa o referencia al sistema para el presentador |
| `**PRESENTADOR:**` | Diálogo textual a leer o parafrasear |

---

## Escena 1 — Apertura

> **EN PANTALLA:** Título de la demo — *Sistema de atención a clientes mediante bot conversacional multicanal*

**PRESENTADOR:**

En este video vamos a presentar una demostración del sistema de inscripción y atención para eventos. La idea central es simple: el cliente potencial conversa con el Bot, el Bot entiende el contexto y emite señales, y el sistema ejecuta las operaciones de dominio necesarias para avanzar la conversación, reservar cupo o escalar la atención a una persona.

Este enfoque nos permite automatizar la primera parte del proceso sin perder control sobre las acciones sensibles. El Bot responde preguntas frecuentes, consulta el banco de contexto y actualiza la etapa comercial. Cuando hace falta, el Orquestador valida las condiciones y deriva la acción al servicio correspondiente o al operador humano.

> **ACOTACIÓN:** El principio central de todo el sistema es: "El bot emite señales; el sistema ejecuta operaciones de dominio." Este principio separa la inteligencia conversacional de las decisiones de negocio.

---

## Escena 2 — Roles del sistema

> **EN PANTALLA:** Lista o diagrama de los tres roles principales

**PRESENTADOR:**

En la demo participan tres roles:

- **Cliente potencial** — la persona que inicia la conversación con interés en inscribirse a un evento.
- **Bot** — atiende al cliente, responde preguntas básicas sobre los eventos y dispara señales para avanzar la etapa comercial.
- **Operador humano** — completa inscripciones, confirma pagos y resuelve las dudas que el Bot no puede atender por sí solo.

> **ACOTACIÓN:** El Bot no accede directamente a la base de datos ni toma decisiones de dominio. Toda acción sensible pasa por el Orquestador antes de ejecutarse.

---

## Escena 3 — Etapas comerciales

> **EN PANTALLA:** Diagrama de etapas — Lead → MQL → Prospecto → SQL → Cierre

**PRESENTADOR:**

Antes de mostrar el flujo es necesario entender las etapas comerciales. Estas etapas clasifican el estado de un cliente potencial dentro del proceso de venta. En total son cinco:

- **Lead** — la persona inicia la conversación y muestra interés. Se solicita la aceptación tácita del aviso de privacidad y el nombre para continuar.
- **MQL** — el cliente ya proporcionó su nombre y consulta información básica del evento: horarios, días y modalidad. El Bot tiene la tarea expresa de recopilar correo electrónico y teléfono.
- **Prospecto** — el cliente ya compartió número y correo. El sistema verifica que exista cupo; si no lo hay, puede entrar a lista de espera.
- **SQL** — el cliente ya confirmó su pago y pasa a atención del operador humano para cerrar el proceso.
- **Cierre** — el resultado puede ser *cierre ganado* —pago confirmado e inscripción registrada— o *cierre perdido* —no se logró continuar con el proceso.

> **ACOTACIÓN:** El Orquestador, no el Bot, valida y ejecuta las transiciones. El Bot solo emite la señal correspondiente mediante `emit_stage_signal`.

---

## Escena 4 — Qué muestra el MVP

> **EN PANTALLA:** Interfaz principal de la demo — pestañas Vista del cliente y Vista del operador

**PRESENTADOR:**

La versión mínima presenta un módulo donde el cliente conversa con el Bot mientras el sistema actualiza la etapa comercial con base en la información recolectada: nombre, correo, número telefónico y confirmación de pago.

El Bot también tiene acceso al banco de contexto del evento. Cada evento tiene un banco de contexto individual donde se puede consultar descripción breve, horarios, días y modalidad —presencial, virtual o mixta. Con esa información puede responder de forma útil y mantener la conversación orientada a la inscripción.

Lo importante es observar tres cosas:

1. El cliente conversa con el Bot.
2. El Bot no modifica directamente la base de datos ni decide solo el avance comercial.
3. El sistema recibe señales, valida la etapa, consulta el banco de contexto y ejecuta operaciones como reserva, lista de espera o escalamiento humano.

> **ACOTACIÓN:** El banco de contexto es una puerta controlada. En producción, esa puerta limitaría campos según tenant, canal, etapa comercial o permisos. El Bot accede a él mediante `get_general_context` o `get_event_context`.

---

## Escena 5 — Recorrido de la demo

El recorrido usa tres conversaciones en secuencia sobre el mismo evento para mostrar el flujo completo, la paralelidad y la lista de espera en un solo arco narrativo.

### 5.1 — Diplomado de Contabilidad: flujo Lead → SQL y escalamiento

> **EN PANTALLA:** Abrir el escenario predefinido — *Diplomado de Contabilidad*

**PRESENTADOR:**

Abrimos el Diplomado de Contabilidad, que tiene configurado un solo cupo disponible. El cliente envía el primer mensaje anunciando que vio el anuncio y que le gustaría inscribirse. En este momento su etapa comercial es Lead y el Bot responde solicitando algunos datos para continuar.

> **ACOTACIÓN:** El primer mensaje del escenario ya incluye intención de inscripción implícita. El Bot consulta el banco de contexto del evento mediante `get_event_context` antes de responder. No accede directamente a la base de datos.

---

> **EN PANTALLA:** El cliente escribe su nombre completo y lo envía

**PRESENTADOR:**

Una vez que el cliente agrega su nombre, el sistema sube la etapa de Lead a MQL.

> **ACOTACIÓN:** El Bot emite `nombre_capturado` mediante `emit_stage_signal`. El `CommercialStageService` valida la transición y actualiza el estado en base de datos.

---

> **EN PANTALLA:** El cliente escribe su correo electrónico y número telefónico

**PRESENTADOR:**

Una vez que el cliente agrega su correo y número, el sistema sube la etapa a Prospecto y reserva el cupo disponible. En cualquier momento el cliente puede hacer preguntas sobre el evento; el Bot las responde usando el banco de contexto sin interrumpir el flujo.

El sistema le presenta los detalles del precio y los métodos de pago, esperando confirmación.

> **ACOTACIÓN:** Con todos los datos de contacto capturados y la intención establecida desde el primer mensaje, el Bot emite `pregunta_de_inscripcion_detectada` y el sistema avanza a PROSPECTO. La reserva temporal se ejecuta mediante `reserve_quota`, disponible solo en etapa PROSPECTO. Este primer cliente consume el único cupo del Diplomado.

---

> **EN PANTALLA:** El cliente envía un mensaje confirmando su pago

**PRESENTADOR:**

Una vez que el cliente confirma su pago, el sistema sube la etapa de Prospecto a SQL y escala automáticamente la conversación al operador.

> **ACOTACIÓN:** La señal `confirmacion_de_pago_pendiente` dispara la transición PROSPECTO→SQL. Al llegar a SQL, el `CommercialStageService` marca la conversación como `HANDOFF_PENDING` en la misma transacción, sin necesidad de un tool call adicional.

---

> **EN PANTALLA:** Señalar la notificación entrante en la Vista Operador

**PRESENTADOR:**

En la Vista Operador aparece la notificación. El operador puede enviar mensajes para resolver dudas o cerrar la venta cambiando la etapa de SQL a Cierre ganado o Cierre perdido.

> **ACOTACIÓN:** El escalamiento automático al llegar a SQL es parte del diseño, no un fallo del Bot. En producción, la cola podría priorizar por calificación, SLA o urgencia del evento.

---

### 5.2 — Conversación en paralelo con otro curso

> **EN PANTALLA:** Abrir una segunda conversación con cualquier otro escenario disponible, dejando visible la del Diplomado

**PRESENTADOR:**

Mientras la primera conversación está activa, abrimos una segunda con otro curso. El sistema atiende ambas al mismo tiempo sin mezclar información entre chats. Cada conversación tiene su propia ID de sesión y su propio historial aislado.

> **ACOTACIÓN:** Las conversaciones son independientes a nivel de Lead y de sesión Redis. El sistema no bloquea ni serializa entre ellas; cada webhook call se procesa de forma asíncrona.

---

### 5.3 — Diplomado de Contabilidad: lista de espera

> **EN PANTALLA:** Abrir una tercera conversación nuevamente con el *Diplomado de Contabilidad*

**PRESENTADOR:**

Abrimos otra conversación del Diplomado. El cliente recorre el mismo flujo hasta Prospecto, pero el cupo ya está tomado. En lugar de fallar, el sistema registra al cliente en la lista de espera y le confirma su posición.

> **ACOTACIÓN:** Cuando `reserve_quota` detecta que no hay cupo disponible, el flujo activa `register_waiting_list`. La lista de espera usa un conjunto ordenado en Redis con score por prioridad y timestamp de entrada como desempate (FIFO). La idempotencia evita que el mismo cliente quede registrado dos veces.

---

### 5.4 — Terminal y APIs: tool calls en acción

> **EN PANTALLA:** Mostrar la terminal o el log de requests del sistema mientras se ejecuta un escenario

**PRESENTADOR:**

Aquí podemos observar las llamadas al sistema desde adentro. Cada vez que el Bot necesita información o quiere ejecutar una operación, lo hace mediante un tool call explícito. El Orquestador recibe la llamada, valida las condiciones y responde.

> **ACOTACIÓN:** Las tools disponibles en el MVP son:
>
> - `get_general_context` — consulta información general del sistema
> - `get_event_context` — consulta datos del evento activo
> - **`emit_stage_signal`** — emite una señal de avance de etapa comercial
> - **`reserve_quota`** — reserva un cupo en el evento
> - `release_quota` — libera una reserva previa
> - `block_quota` — bloquea un cupo para operaciones de confirmación
> - `register_waiting_list` — registra al cliente en lista de espera
> - `request_human_handoff` — solicita escalamiento al operador humano
>
> Ninguna de estas tools permite al Bot acceder directamente a la base de datos.

---

### 5.5 — Concatenación de mensajes

> **EN PANTALLA:** Enviar tres o cuatro mensajes cortos seguidos antes de que el Bot responda

**PRESENTADOR:**

En canales de mensajería los usuarios suelen enviar varias ideas en mensajes cortos y separados en vez de un solo texto largo. El problema es que algunas APIs de nube, como WhatsApp Cloud API, no exponen un evento de "usuario escribiendo", por lo que no hay forma nativa de saber cuándo el usuario terminó de escribir.

El sistema está preparado para funcionar en ambos casos: si el canal expone ese evento, puede usarlo para disparar el envío al Bot; si no lo expone, un debounce por tiempo cumple la misma función agrupando los fragmentos antes de procesarlos.

> **ACOTACIÓN:** La agrupación ocurre en el cliente JavaScript de la demo (`chat.js`): un temporizador de 4 segundos acumula los fragmentos y los une antes de enviarlos al backend. El core del sistema recibe un único mensaje ya concatenado. El debounce por tiempo es el mecanismo de fallback para canales como WhatsApp Cloud API que no exponen el evento de escritura; la arquitectura no depende de ese evento para funcionar.

---

## Escena 6 — Mensaje arquitectónico

> **EN PANTALLA:** Diagrama de la separación Bot — Orquestador — Servicios de dominio

**PRESENTADOR:**

Una parte importante de la demo es dejar claro el criterio de arquitectura: el Bot no accede directamente a la base de datos ni ejecuta por sí mismo las operaciones del negocio. En lugar de eso, emite señales y solicita acciones mediante el Orquestador.

Esto permite mantener separadas la etapa comercial, la calificación y el estado operativo. El sistema decide cuándo reservar cupo, cuándo liberar una espera, cuándo escalar una conversación y cuándo registrar el cierre.

Con eso evitamos que el prompt sea la fuente de verdad del negocio. El prompt ayuda a conversar; el Orquestador protege las reglas.

> **ACOTACIÓN:** Este diseño reduce errores críticos como doble reserva, reserva fuera de etapa o acceso directo del Bot a datos sensibles. El Bot interpreta la conversación; el sistema conserva la autoridad sobre las transiciones.

---

## Escena 7 — Extensiones y escalabilidad

> **EN PANTALLA:** Lista de extensiones posibles en orden de prioridad

**PRESENTADOR:**

La arquitectura está pensada para crecer. Desde el núcleo demostrado, las extensiones son progresivas:

1. **Prompts condicionados por estado** — en vez de que el Bot tenga todas las reglas al mismo tiempo, el `AgentRunner` inyectaría solo las instrucciones que aplican al momento actual: en Lead, saludar y pedir nombre; en MQL, pedir correo y teléfono; en Prospecto, validar cupo y datos de pago; en SQL, evitar que el Bot siga cerrando por su cuenta.

2. **Árbol de estados jerárquico** — modelar subestados dentro de cada etapa comercial. Cada nodo declararía subprompt permitido, tools disponibles, señales aceptadas y condiciones de transición. El flujo dejaría de vivir en reglas de lenguaje natural y pasaría a un artefacto versionable y testeable.

3. **LangGraph o XState como motor futuro** — expresar el flujo como grafo de nodos con aristas condicionales o como Statechart en TypeScript. `CommercialStageService`, `QuotaService`, `WaitingListService` y `HandoffManager` seguirían siendo los servicios que ejecutan el negocio.

4. **Tool calls versionables y auditables** — DTOs explícitos por herramienta, validación por etapa, idempotencia y auditoría con `transactionId`.

5. **SaaS multi-tenant** — cada tenant aportaría su base PostgreSQL, credenciales del canal, credenciales del proveedor LLM y configuración de eventos. El sistema resolvería el tenant antes de ejecutar cualquier flujo.

6. **Redis y BullMQ** — Redis para sesión efímera de historial activo e idempotencia de cupos; BullMQ para reservas con vencimiento, reintentos de notificación y tareas outbound.

> **ACOTACIÓN:** El módulo de calificaciones debe mantenerse desacoplado para poder ajustar métricas sin afectar el resto del sistema. La dirección propuesta: endpoints independientes, calificación por efectividad de mensajes y velocidad de avance entre etapas, con parámetros configurables.

---

## Escena 8 — Cierre

> **EN PANTALLA:** Diagrama del contrato base del sistema

**PRESENTADOR:**

Con esto cerramos la demo. Mostramos cómo el Bot atiende la primera conversación, cómo el sistema controla el avance comercial y cómo el operador humano entra solo cuando es necesario. El resultado es un flujo más claro para el usuario y una arquitectura más segura, controlable y escalable para el equipo.

La demo no es el producto final; es la prueba del contrato arquitectónico:

- El canal entrega mensajes al sistema.
- El sistema ejecuta el ciclo del agente.
- El Bot emite tool calls.
- El Orquestador valida.
- Los servicios de dominio ejecutan.
- El operador humano puede entrar cuando corresponde.

Ese contrato es el núcleo que permite escalar sin que el prompt se convierta en el centro frágil del sistema.
