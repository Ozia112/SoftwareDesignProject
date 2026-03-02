# RF-EVT-03. El Sistema bot puede notificar cuando una vacante reservada es liberada

**Descripción:**
Cuando una vacante reservada es liberada (por expiración o cancelación), El Sistema bot debe poder **identificar interesados elegibles** (lista de espera o interés registrado) y enviar notificaciones por el canal apropiado, con control anti-spam y trazabilidad en logs.

**Historia de usuario**
Como Persona interesada necesito recibir una notificación cuando se libere una vacante para poder intentar inscribirme en cuanto haya disponibilidad.

**Criterios de aceptación:**

* Cuando una vacante reservada se libera (por expiración o cancelación), El Sistema bot registra el evento de liberación con:
  * Evento, fecha/hora, causa y Persona interesada afectada (si aplica).
* El Sistema bot identifica automáticamente a Personas interesadas elegibles según reglas configuradas:
  * En lista de espera y/o con interés registrado.
  * En etapa **Prospecto** o **SQL** (si está configurado).
* La notificación se envía por:
  * El mismo canal donde se originó el interés, o
  * El canal preferido si existe.
* Si existen múltiples Personas elegibles, El Sistema bot aplica un orden determinístico:
  * FIFO cronológico (por defecto) o prioridad (si aplica).
* El Sistema bot evita spam:
  * No envía más de **N** notificaciones por liberación / por Persona interesada (N configurable).
* Toda notificación enviada queda registrada con IDs correlacionables (liberación ↔ 0..N notificaciones).
