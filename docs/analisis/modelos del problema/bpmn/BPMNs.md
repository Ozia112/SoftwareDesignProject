# BPMN (Business Process Model and Notation)

Los diagramas de BPMN son una herramienta visual utilizada para modelar y representar procesos de negocio.
En el caso de nuestro sistema, se implementaron diagramas de BPMN para representar los procesos clave del sistema de conversación entre clientes potenciales y bots.

## BPMN-001: Flujo de Conversación entre Cliente Potencial y Bot

Este diagrama representa el flujo principal de interacción descrito en el [CU-COM-002 Flujo de la conversación entre el Cliente potencial y el Bot](/docs/diseño/casos%20de%20uso/COM/CU-COM-002%20Flujo%20de%20la%20conversación%20entre%20el%20Cliente%20potencial%20y%20el%20Bot.md).

![BPMN-001](./BPMN-001.svg)

### Flujo Principal

El diagrama muestra el proceso completo desde que el Cliente potencial inicia la conversación hasta la finalización o escalamiento a un operador humano, incluyendo los siguientes componentes:

1. **Iniciación de Conversación**: El Cliente potencial se comunica con el Bot
2. **Avisos Legales**: Se activa [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito]
3. **Recopilación de Datos**: El Bot recopila información básica de contacto
4. **Gestión de Etapa Comercial**: Se activa [CU-COM-005 Gestión de etapa comercial] para identificar el tipo de prospecto
5. **Consulta de Eventos**: Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener información de eventos disponibles
6. **Evaluación de Disponibilidad**: Se verifica disponibilidad de cupo mediante [CU-COM-003 Gestión de bancos de contexto]
7. **Reserva de Cupo**: Si hay disponibilidad, se activa [CU-EVT-003 Gestión de cupos de eventos] para reservar temporalmente
8. **Información de Métodos de Pago**: Se consulta [CU-COM-003 Gestión de bancos de contexto] para obtener opciones de pago
9. **Escalamiento o Transferencia**: Se activa [CU-COM-001 Asignación de conversaciones de un bot a un operador humano]

### Flujos Alternativos

- **A1. Cambio de Evento**: Cliente potencial elige otro evento durante la conversación
- **A2. Inscripción Directa**: Cliente potencial indica intención inmediata de inscribirse

### Flujos de Excepción

- **E1. Sin Disponibilidad**: Evento no tiene cupo disponible
- **E1.2. Sin Disponibilidad (Prospecto)**: Se activa [CU-EVT-001 Registro en lista de espera]
- **E2. Error de Consulta**: No se puede obtener información del banco de contexto
- **E3. No Aceptación de Privacidad**: Cliente potencial no acepta términos y condiciones

### Casos de Uso Relacionados

Este diagrama integra los siguientes casos de uso:

- [CU-COM-001 Asignación de conversaciones de un bot a un operador humano]
- [CU-COM-003 Gestión de bancos de contexto]
- [CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito]
- [CU-COM-005 Gestión de etapa comercial]
- [CU-EVT-001 Registro en lista de espera]
- [CU-EVT-003 Gestión de cupos de eventos]

[CU-COM-001 Asignación de conversaciones de un bot a un operador humano]: /docs/diseño/casos%20de%20uso/COM/CU-COM-001%20Asignación%20de%20conversaciones%20de%20un%20bot%20a%20un%20operador%20humano.md
[CU-COM-003 Gestión de bancos de contexto]: /docs/diseño/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
[CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito]: /docs/diseño/casos%20de%20uso/COM/CU-COM-004%20Presentación%20de%20avisos%20legales%20y%20registro%20de%20consentimiento%20tácito.md
[CU-COM-005 Gestión de etapa comercial]: /docs/diseño/casos%20de%20uso/COM/CU-COM-005%20Calificación%20automática%20y%20gestión%20de%20etapa%20comercial.md
[CU-EVT-001 Registro en lista de espera]: /docs/diseño/casos%20de%20uso/EVT/CU-EVT-001%20Registro%20en%20lista%20de%20espera.md
[CU-EVT-003 Gestión de cupos de eventos]: /docs/diseño/casos%20de%20uso/EVT/CU-EVT-003%20Gestión%20de%20cupos%20de%20eventos.md
