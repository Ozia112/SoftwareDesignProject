# Análisis de los RNFs existentes

## RNF-01 — Seguridad (Control de acceso y auditoría)

**Fortalezas:**

- El mapeo de privilegios por rol es detallado y concreto.
- Métricas binarias (100%) para acceso no autorizado son objetivas.
- Campos del log de auditoría bien especificados.

**Problemas y mejoras:**

| Problema                                                                                           | Mejora propuesta                                                                                                                                                           |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Datos cifrados en tránsito y en reposo" sin estándar específico → no es verificable objetivamente | Especificar: TLS 1.2+ en tránsito, AES-256 en reposo. Se verifica con escáner de cifrado o revisión de configuración de infraestructura.                                   |
| "Credenciales rotadas periódicamente" — *periódicamente* es vago                                   | Definir intervalo concreto: p. ej. tokens de servicio cada 90 días, secretos de API cada 180 días.                                                                         |
| "Log inmutable" no define qué significa técnicamente                                               | Precisar: logs append-only sin permiso de DELETE/UPDATE para ningún rol, con hash encadenado o firma por entrada.                                                          |
| Criterio "100% de intentos no autorizados son denegados" carece de metodología de prueba explícita | Agregar en criterios de aceptación: *"Prueba de penetración ejecutada contra el API del backend con intentos de acceso cross-rol; cero brechas detectadas en el informe."* |
| No se menciona protección ante fuerza bruta / abuso de API                                         | Agregar condición: el sistema bloquea o throttlea IPs/tokens con más de N intentos fallidos por minuto.                                                                    |

---

### RNF-02 — Rendimiento del bot

**Fortalezas:**

- P90/P99/máximo son métricas estadísticas sólidas y objetivas.
- El punto de medición (backend end-to-end) está bien delimitado.
- Comportamiento en fallo (respuesta < 10 s) está cubierto.

**Problemas y mejoras:**

| Problema                                                                                                                                    | Mejora propuesta                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "Carga representativa (concurrencia y datos similares a producción)" — sin valores concretos → el criterio de aceptación no es reproducible | Definir parámetros de la prueba de carga: p. ej. *"50 conversaciones concurrentes activas con un historial de al menos 10 mensajes cada una"*.                                 |
| No hay métrica de **throughput** (capacidad de mensaje por unidad de tiempo)                                                                | Agregar: *"El sistema debe procesar al menos X mensajes por minuto sin degradar por debajo de los umbrales P90/P99."*                                                          |
| No hay límite de degradación ante sobrecarga (¿qué pasa si llegan 500 conversaciones simultáneas?)                                          | Agregar condición de degradación graceful: el sistema debe rechazar nuevas solicitudes con mensaje de espera en lugar de silenciarse o caer.                                   |
| La herramienta/metodología de medición no se especifica                                                                                     | Agregar criterio: *"La instrumentación de telemetría (p. ej. traces en backend con timestamps de entrada y salida) permite calcular P90, P99 y máximo por ventana de 1 hora."* |

---

### RNF-03 — Claridad de mensajes (Usabilidad)

**Este es el más débil de los cuatro.**

**Problemas y mejoras:**

| Problema                                                                                                                   | Mejora propuesta                                                                                                                                                                                                                                                               |
| -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| *"La información proporcionada es la misma o **similar**"* — *similar* es subjetivo e imposible de verificar objetivamente | Eliminar "similar". Reemplazar con: *"Los valores de campos factuales (fechas, precios, horarios, cupos) deben coincidir exactamente con los registrados en la base de datos al momento de la consulta."*                                                                      |
| *"No debe llevar tecnicismos"* — quién define qué es tecnicismo → no es verificable sin criterio explícito                 | Definir una lista de términos prohibidos (o tipos: IDs internos, nombres de tablas, estados de sistema como `LEAD_HOT`, etc.) y agregar: *"Ningún mensaje al usuario contiene cadenas que coincidan con el patrón de identificadores internos del sistema."*                   |
| La restricción de "sin preguntas de confirmación explícita" es conductual y difícil de medir sistemáticamente              | Reformular como propiedad testeable: *"En una revisión de los N flujos de prueba documentados, ningún mensaje del bot contiene la estructura '¿Quieres [verbo] [objeto]?' en contextos informativos/comerciales."*                                                             |
| No hay especificación de idioma, registro (formal/informal) ni ortografía                                                  | Agregar condición: *"El idioma del bot es español neutro, con usted o tú según la configuración del tenant; los mensajes no deben contener faltas de ortografía."*                                                                                                             |
| Sin métrica de readability/comprensión                                                                                     | Para el estado actual del proyecto puede ser suficiente con la regla de 100 palabras, pero si se quiere escalar, agregar: *"Los mensajes comunes alcanzan al menos nivel B1 de comprensión según escala CEFR"* (verificable con herramientas de análisis de texto en español). |

---

### RNF-04 — Continuidad de la conversación (Confiabilidad)

**Fortalezas:**

- 30 minutos de ventana es concreto.
- 90% sin re-solicitar datos y 100% en escalamientos son métricas claras.
- Los criterios de aceptación están bien articulados.

**Problemas y mejoras:**

| Problema                                                                                | Mejora propuesta                                                                                                                                                                                                    |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No se define qué ocurre **después** de los 30 minutos → comportamiento ambiguo          | Agregar: *"Pasados los 30 minutos de inactividad, el sistema notifica al usuario que el contexto expiró y reinicia el flujo desde el punto de selección de Evento, sin eliminar los datos ya capturados del lead."* |
| No hay RTO (Recovery Time Objective) definido para recuperarse de una falla del backend | Agregar métrica: *"Ante una caída del servicio de contexto, el sistema debe restaurar la capacidad de recuperar el estado de conversaciones activas en menos de X minutos."*                                        |
| *"Falla temporal"* no está cuantificada — ¿30 segundos? ¿5 minutos?                     | Definir: *"Se considera falla temporal una interrupción menor a 2 minutos. Fallos superiores a 2 minutos activan el flujo de indisponibilidad con cierre de conversación."*                                         |
| No se especifica la retención máxima del historial (intersecta con privacidad)          | Agregar condición: *"El historial completo de una conversación se retiene por un máximo de [N] días tras su cierre, conforme a lo acordado en el aviso de privacidad (RF-COM-07)."*                                 |

---

## Nuevos RNFs propuestos

Todos los siguientes son **realizables y verificables objetivamente**:

---

### RNF-05 — Disponibilidad del sistema (ISO 25010: Reliability > Availability)

**Descripción:** El sistema (bot + backend) debe estar disponible para procesar conversaciones entrantes durante la mayor parte del tiempo operativo.

**Métrica:**

- Disponibilidad mensual ≥ 99.5% (equivale a ≤ 3.6 horas de downtime/mes).
- Las ventanas de mantenimiento programadas (notificadas con ≥ 24 h de anticipación) no cuentan como downtime.

**Condiciones:**

- Se mide con un monitor externo de tipo health-check que llama al endpoint de salud del backend cada 60 segundos.
- Se excluyen fallos de la plataforma de mensajería (WhatsApp, etc.) fuera del control del sistema.

**Criterios de aceptación:**

- El dashboard de monitoreo muestra uptime ≥ 99.5% en el período de prueba de 30 días calendario.
- Cualquier degradación inesperada genera una alerta automática en menos de 5 minutos.

---

### RNF-06 — Privacidad y retención de datos (ISO 25010: Security > Privacy)

**Descripción:** El sistema debe gestionar los datos personales de acuerdo con lo consentido explícitamente en el aviso de privacidad (RF-COM-07) y permitir su eliminación a solicitud.

**Métrica:**

- 100% de los datos personales capturados están vinculados a un registro de consentimiento activo.
- Las solicitudes de eliminación de datos por parte de un usuario se ejecutan en un máximo de 72 horas.
- El sistema no retiene datos personales de leads que nunca otorgaron consentimiento más de 24 horas.

**Condiciones:**

- Se aplica a nombre, teléfono, correo y cualquier campo que identifique a la persona interesada.
- Los logs de auditoría generados bajo RNF-01 están excluidos del alcance de la eliminación (pueden anonimizarse en lugar de eliminarse).

**Criterios de aceptación:**

- En una auditoría, cada registro de dato personal tiene un `consent_id` referenciado válido y activo.
- Se puede demostrar la ejecución de una eliminación o anonimización en un caso de prueba dentro de las 72 horas.
- No existen registros de datos personales sin `consent_id` más allá de 24 horas en la base de datos.

---

### RNF-07 — Tasa de error en flujos críticos (ISO 25010: Reliability > Fault Tolerance)

**Descripción:** Los flujos críticos del sistema (inscripción, bloqueo de vacante, calificación de lead) no deben fallar por errores del sistema con una tasa superior a un umbral definido.

**Métrica:**

- Tasa de error del sistema (fallas no atribuibles al usuario) en flujos críticos ≤ 1% medida mensualmente.
- Un "error de flujo crítico" es cualquier transacción que queda en estado inconsistente (vacante bloqueada sin inscripción confirmada, lead sin etapa asignada tras calificación, etc.).

**Condiciones:**

- Se miden únicamente errores originados en el backend; los errores de conectividad del canal de mensajería no cuentan.
- Un flujo crítico se considera fallido si no completa su transacción en el tiempo definido por RNF-02 sin notificar al usuario.

**Criterios de aceptación:**

- Los logs del sistema permiten calcular la tasa de error por flujo (inscripción, bloqueo, calificación) en cualquier ventana de 30 días.
- En pruebas de integración ejecutadas antes de cada despliegue, los flujos críticos tienen 0% de tasa de error bajo condiciones normales.

---

### RNF-08 — Latencia de notificaciones a usuarios en lista de espera (ISO 25010: Performance Efficiency)

**Descripción:** Cuando se libera un cupo de un evento (RF-EVT-03), el sistema debe notificar a los usuarios en lista de espera dentro de un tiempo máximo definido.

**Métrica:**

- El 95% de las notificaciones de liberación de cupo deben enviarse al canal del usuario en menos de 60 segundos desde que el cupo queda disponible en el sistema.
- Ninguna notificación debe tardar más de 5 minutos.

**Condiciones:**

- El tiempo se mide desde el registro del evento de liberación en el backend hasta la confirmación de entrega al canal de mensajería.
- Si el canal no confirma entrega en 5 minutos, el sistema registra el intento fallido y reintenta una vez.

**Criterios de aceptación:**

- La instrumentación registra `cupo_liberado_at` y `notificacion_enviada_at` por cada entrada en lista de espera.
- En un escenario de prueba con N usuarios en lista de espera y liberación de cupo, el 95% recibe la notificación en < 60 s.

---

## Resumen de brechas de cobertura según ISO 25010 / SWEBOK v4

| Característica ISO 25010               | Cubierto               | Gaps                                                         |
| -------------------------------------- | ---------------------- | ------------------------------------------------------------ |
| **Security**                           | RNF-01 (parcial)       | Falta: estándar de cifrado explícito, brute-force protection |
| **Performance Efficiency**             | RNF-02, RNF-08 (nuevo) | Falta: throughput, degradation graceful                      |
| **Interaction Capability (Usability)** | RNF-03 (débil)         | Falta: idioma/registro, readability, mensajes de error       |
| **Reliability**                        | RNF-04, RNF-07 (nuevo) | Falta: RTO explícito, retención post-inactividad             |
| **Availability**                       | RNF-05 (nuevo)         | No cubierto en versión original                              |
| **Privacy**                            | RNF-06 (nuevo)         | No cubierto a pesar de RF-COM-07 (consentimiento)            |
| **Maintainability**                    | ❌                      | Fuera de alcance razonable para este sprint                  |
| **Compatibility**                      | ❌                      | Podría añadirse si hay múltiples canales (WhatsApp + web)    |

Completed: *Analizar y proponer mejoras* (3/3)

**Prioridad de acción recomendada:**

1. **RNF-03** — Corregir urgentemente el término "similar" (es el único RNF que tiene una métrica subjetiva que haría fallar cualquier auditoría).
2. **RNF-01** — Agregar estándar de cifrado y definir el intervalo de rotación de credenciales.
3. **RNF-06** — Es necesario dado que RF-COM-07 ya captura consentimiento pero no hay RNF que lo respalde.
4. **RNF-02** — Parametrizar la prueba de carga con valores concretos.You've used 66% of your session rate limit. Your session rate limit will reset on April 23 at 5:08 AM. [Learn More](https://aka.ms/github-copilot-rate-limit-error)
