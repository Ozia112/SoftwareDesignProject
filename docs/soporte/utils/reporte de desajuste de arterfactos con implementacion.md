# Reporte de desajuste de artefactos con implementación

---

## Análisis de alineación a la estrategia de implementación

Escala: ✅ Alineado · ⚠️ Ajuste menor · ❌ Desalineado

---

### RF de COM

| RF        | Estado | Problema concreto                                                                                                                                                                                                     |
| --------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-COM-01 | ⚠️     | "El Bot puede asignar a un agente humano" — le da autoridad de transición al bot. En la estrategia el **Sistema** ejecuta la asignación; el bot solo emite la señal. Cubierto parcialmente por PSD-23 vía CU-COM-001. |
| RF-COM-02 | ⚠️     | "La calificación puede influir en la actualización de la etapa comercial" — contradice el glosario que dice que calificación es independiente de etapa. Detectado en DDR-01, pendiente de corregir.                   |
| RF-COM-03 | ⚠️     | No menciona el consent gate de RF-COM-07 como prerrequisito para capturar datos. El sistema puede crear conversación y etapa Lead, pero no datos personales hasta consentimiento.                                     |
| RF-COM-04 | ⚠️     | Usa "usuario" genérico en lugar de "Cliente potencial". Criterio "El Bot obtiene información" debería decir que el bot la obtiene *a través del servicio de bancos de contexto*.                                      |
| RF-COM-05 | ⚠️     | Mismo problema: actor "usuario" genérico. Coherente en intención pero impreciso en quién consulta y cómo.                                                                                                             |
| RF-COM-06 | ⚠️     | Mismo problema. Además no explicita que la fuente es el banco de contexto de evento.                                                                                                                                  |
| RF-COM-07 | ✅     | Completamente alineado. Es la base del consent gate de la estrategia.                                                                                                                                                 |

---

### RF de EVT

| RF        | Estado | Problema concreto                                                                                                                                                                                                                 |
| --------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-EVT-01 | ⚠️     | Bien alineado en lógica. Usa "Sistema bot" en lugar de "Sistema" para la verificación de cupo, que es responsabilidad del dominio, no del bot.                                                                                    |
| RF-EVT-02 | ⚠️     | Dice que la reserva se activa cuando el cliente en etapa **MQL** manifiesta intención. El glosario y CU-COM-002 la colocan al transicionar a **Prospecto**. Discrepancia de momento de disparo.                                   |
| RF-EVT-03 | ✅     | Alineado. Notificación controlada por el sistema, N notificaciones por N vacantes, orden determinístico.                                                                                                                          |
| RF-EVT-04 | ✅     | Alineado. Bloqueo permanente solo por operador humano en SQL. Liberaciones excepcionales bien definidas.                                                                                                                          |
| RF-EVT-05 | ⚠️     | Describe que solo aplica a "Clientes potenciales elegibles en lista de espera", pero la inscripción extemporánea también puede venir de SQL activos (reserva vigente cuando inició el evento). Alcance potencialmente incompleto. |
| RF-EVT-06 | ✅     | Alineado. Lista de espera gestionada por el sistema, orden por calificación + FIFO desempate, verificación antes de notificar.                                                                                                    |

---

### CU de COM

| CU         | Estado | Problema concreto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CU-COM-001 | ❌     | Objetivo describe asignación inicial a bot, no orquestación. Los flujos dicen "el bot levanta bandera" — en la estrategia el bot *emite señal*, el **sistema** ejecuta la asignación. Ya cubierto en PSD-23.                                                                                                                                                                                                                                                                                                        |
| CU-COM-002 | ⚠️     | Nombre y campos usan "Persona interesada" (PSD-23). El paso 12 delega reserva de cupo a CU-COM-003 directamente; debería delegar a **CU-EVT-003** con el nuevo alcance de gestión de cupos.                                                                                                                                                                                                                                                                                                                         |
| CU-COM-003 | ⚠️     | El flujo de actualización (paso 2 del flujo de escritura) dice que el Bot envía la instrucción al Sistema — correcto en intención. Sin embargo la RN-COM-03-06 limita las operaciones de escritura de cupo a CU-COM-002 como único origen, lo que entra en contradicción con el nuevo alcance de CU-EVT-003 (que también disparará liberaciones/bloqueos de cupo). La restricción debe ampliarse para incluir CU-EVT-003 como origen válido.                                                                        |
| CU-COM-004 | ✅     | Completamente alineado. Implementa correctamente el consent gate de RF-COM-07: el sistema no captura datos hasta que el usuario envía el primer mensaje. El Bot presenta los avisos y el Sistema registra.                                                                                                                                                                                                                                                                                                          |
| CU-COM-005 | ✅     | Bien alineado. Separa correctamente etapa comercial y calificación como flujos independientes. RN-COM-02-01 es explícita: "la calificación no determina por sí solo el avance de etapa". El Bot emite señales y el Sistema evalúa y persiste — patrón correcto. El único ajuste pendiente es que RF-COM-02 aún contiene la frase contradictoria "puede influir en la actualización de la etapa comercial" que este CU ya resuelve, pero el RF fuente no ha sido corregido.                                          |
| CU-COM-006 | ⚠️     | El CU reconoce explícitamente que no tiene RF específico asignado ("pendiente de definición"). Esta brecha rompe la trazabilidad: el CU existe y está operativo pero no tiene RF que lo respalde en el catálogo. Además el flujo de desuscripción delega escritura al Banco de contexto general vía CU-COM-003, lo cual no está incluido en los tipos de operación definidos en CU-COM-003 (reserva_temporal, liberacion_reserva, bloqueo_cupo). Falta un tipo de operación `registro_desuscripcion` en CU-COM-003. |

---

### CU de EVT

| CU         | Estado | Problema concreto                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CU-EVT-001 | ⚠️     | Objetivo usa "Persona interesada". El paso 2 dice "el Bot verifica la etapa" — es una consulta al **sistema**, no autoridad del bot. Flujo correcto en intención.                                                                                                                                                                                                                                                                     |
| CU-EVT-002 | ⚠️     | El paso 4 referencia RF-EVT-04 (causas excepcionales post-pago) para cancelaciones pre-inicio, que son casos distintos. Hay solapamiento de alcance entre CU-EVT-002 (cancelación pre-evento por operador) y RF-EVT-04 (liberación post-confirmación por causas excepcionales).                                                                                                                                                       |
| CU-EVT-003 | ❌     | Tres problemas estructurales: (1) El flujo inicia con "el operador humano inicia la inscripción" cuando la reserva temporal la dispara el sistema automáticamente al detectar intención MQL→Prospecto, antes de que intervenga el humano. (2) En E1 llama al cliente potencial "MQL" cuando solo los **Prospectos** pueden entrar a lista de espera. (3) No cubre los flujos de liberación de cupo de RF-EVT-04. Cubierto por PSD-23. |

---

### Resumen ejecutivo de brechas

**Ya cubiertas por PSD-23:**
CU-COM-001 (orquestación), CU-COM-002 (terminología), CU-EVT-003 (alcance de gestión de cupos).

**No cubiertas por ningún PSD abierto — requerirían un nuevo issue:**

1. **RF-COM-01**: texto da autoridad de transición al bot; debería decir que el bot emite señal y el sistema ejecuta.
2. **RF-COM-02**: contradicción calificación→etapa (pendiente de DDR-01, no tiene PSD de corrección abierto).
3. **RF-COM-03/04/05/06**: terminología "usuario" genérico y falta de consent gate explícito como prerrequisito.
4. **RF-EVT-02**: momento de disparo de reserva (MQL vs transición a Prospecto) inconsistente con glosario y CU-COM-002.
5. **CU-EVT-001**: usa terminología obsoleta y da consulta de etapa al bot.
6. **CU-EVT-002**: solapamiento de alcance con RF-EVT-04 en la gestión de liberaciones.

---

### RNF

| RNF    | Estado | Problema concreto                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RNF-01 | ✅     | Alineado con la estrategia. Define RBAC explícito para Bot, Operador humano y Operador administrativo. El Bot solo puede leer datos públicos y escribir registros de conversación/calificaciones — consistente con el patrón "bot como ejecutor sin autoridad de negocio crítica". Los logs append-only con `conversation_id` y `transaction_id` son el soporte de trazabilidad que la estrategia requiere.                                                                                                         |
| RNF-02 | ⚠️     | El umbral de P90 < 2s es correcto para el módulo conversacional. Sin embargo el RNF solo aplica a "respuestas automáticas del bot" y excluye explícitamente conversaciones asignadas a operador humano. La estrategia necesita SLA también para las transiciones bot→humano y humano→bot (CU-COM-001): no hay umbral definido para el tiempo de entrega de una conversación al operador ni para la devolución al bot. Brecha de cobertura.                                                                          |
| RNF-03 | ⚠️     | Correcto en usabilidad. El RNF prohíbe exponer identificadores y etiquetas internas (como `LEAD_HOT`) — consistente con la estrategia de separar estado interno del sistema del canal visible al usuario. Sin embargo no menciona el comportamiento del bot cuando una operación de dominio falla (error en reserva de cupo, error en transición de etapa): el RNF debería incluir el patrón de mensaje de indisponibilidad que el bot debe usar en esos casos.                                                     |
| RNF-04 | ✅     | Bien alineado. El estado de conversación se persiste en backend (no solo en memoria), los escalamientos conservan historial al 100% y la ventana de 30 minutos de inactividad cubre el ciclo comercial típico. Es el soporte de confiabilidad del patrón de orquestación de CU-COM-001.                                                                                                                                                                                                                             |
| RNF-05 | ⚠️     | La disponibilidad del 99.5% mensual es coherente con el sistema como orquestador central. El problema es que el health-check incluye "servicio de mensajería" como subsistema crítico, pero el sistema no controla los canales externos (WhatsApp, etc.) — ambos se excluyen del SLA y se incluyen en el health-check al mismo tiempo. Hay una contradicción que debe aclararse: o el health-check mide solo subsistemas propios, o el SLA debe diferenciar disponibilidad del backend vs disponibilidad del canal. |

---

### Mapa de cobertura por PSD

| Brecha                                                                      | Severidad | PSD asignado | Tipo         |
| --------------------------------------------------------------------------- | --------- | ------------ | ------------ |
| CU-COM-001: objetivo/alcance de orquestación                                | Alta      | PSD-23       | [Fix]        |
| CU-COM-002: terminología + paso 12 → CU-EVT-003                             | Alta      | PSD-23       | [Docs]       |
| CU-EVT-003: nombre, objetivo, alcance gestión de cupos                      | Alta      | PSD-23       | [Docs]       |
| RF-COM-01: bot dado autoridad de asignación                                 | Alta      | PSD-24       | [Fix]        |
| RF-EVT-01: "Sistema bot" como responsable de dominio                        | Alta      | PSD-24       | [Fix]        |
| RF-COM-02: calificación puede actualizar etapa                              | Alta      | PSD-26       | [Fix]        |
| RF-EVT-02: disparo de reserva en MQL vs Prospecto                           | Alta      | PSD-26       | [Fix]        |
| CU-EVT-002: referencia incorrecta a RF-EVT-04 pre-pago                      | Media     | PSD-26       | [Fix]        |
| CU-COM-003: RN-COM-03-06 excluye CU-EVT-003; falta `registro_desuscripcion` | Media     | PSD-26       | [Fix]        |
| CU-COM-006: sin RF asignado en catálogo                                     | Media     | PSD-26       | [Fix]+[Docs] |
| RF-COM-03/04/05/06: "usuario" genérico, sin consent gate                    | Baja      | PSD-25       | [Docs]       |
| CU-EVT-001: "Persona interesada", Bot verifica en lugar de Sistema          | Baja      | PSD-25       | [Docs]       |
| RNF-02: sin SLA para transiciones bot↔operador                              | Baja      | PSD-27       | [Fix]        |
| RNF-03: sin patrón de mensaje de indisponibilidad de dominio                | Baja      | PSD-27       | [Fix]        |
| RNF-05: contradicción health-check vs SLA de canales externos               | Baja      | PSD-27       | [Fix]        |

[Docs]:
[Fix]:
