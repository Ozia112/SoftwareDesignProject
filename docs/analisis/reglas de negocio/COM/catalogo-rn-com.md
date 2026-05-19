# Catalogo de reglas de negocio COM

## Criterio

Este catalogo concentra las reglas del dominio comercial extraidas de los casos de uso del area `COM`. Los CUs deben referenciar estos IDs y no duplicar aqui el texto en cada documento.

## Reglas

| ID                | Enunciado                                                                                                                                                                             | Fuente principal | RF relacionados                 |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------- |
| `RN-COM-ESC-01`   | La conversacion debe permanecer en estado trazable durante toda transicion bot-operador.                                                                                              | CU-COM-001       | RF-COM-01                       |
| `RN-COM-ESC-02`   | Solo operadores humanos disponibles pueden recibir conversaciones escaladas.                                                                                                          | CU-COM-001       | RF-COM-01                       |
| `RN-COM-ESC-03`   | Toda asignacion o reasignacion debe quedar registrada para auditoria.                                                                                                                 | CU-COM-001       | RF-COM-01                       |
| `RN-COM-CONV-01`  | Si la persona interesada no continua la conversacion despues de los avisos legales, el sistema no puede recopilar ni procesar datos personales.                                       | CU-COM-002       | RF-COM-07                       |
| `RN-COM-CONV-02`  | El Bot solo debe mostrar eventos disponibles provenientes de la fuente oficial de informacion del sistema.                                                                            | CU-COM-002       | RF-COM-04                       |
| `RN-COM-CONV-03`  | El Bot debe proporcionar informacion detallada del evento usando informacion oficial del contexto del evento.                                                                         | CU-COM-002       | RF-COM-05, RF-COM-06            |
| `RN-COM-CONV-04`  | Una persona interesada solo puede mantener una inscripcion o reserva activa por evento a la vez; si cambia de evento, debe liberarse la reserva previa.                               | CU-COM-002       | RF-COM-02, RF-EVT-02            |
| `RN-COM-CONT-01`  | Los bancos de contexto son la fuente unica de verdad para la informacion entregada al Bot.                                                                                            | CU-COM-003       | RF-COM-04, RF-COM-05, RF-COM-06 |
| `RN-COM-CONT-02`  | Solo los administradores autorizados del evento pueden configurar el banco de contexto del evento.                                                                                    | CU-COM-003       | RF-COM-04, RF-COM-05, RF-COM-06 |
| `RN-COM-CONT-03`  | La informacion del banco de contexto del evento debe estar marcada como activa para poder ser entregada al Bot.                                                                       | CU-COM-003       | RF-COM-04, RF-COM-05, RF-COM-06 |
| `RN-COM-CONT-04`  | Los bancos de contexto pueden entregarse completos o parciales segun la necesidad de negocio de la consulta.                                                                          | CU-COM-003       | RF-COM-04, RF-COM-05, RF-COM-06 |
| `RN-COM-CONT-05`  | El banco de contexto general solo puede entregar eventos compatibles con el estado solicitado del evento.                                                                             | CU-COM-003       | RF-COM-04                       |
| `RN-COM-CONT-06`  | Las operaciones de escritura sobre disponibilidad de cupo solo pueden ocurrir como consecuencia de procesos autorizados de venta o inscripcion, salvo intervencion manual autorizada. | CU-COM-003       | RF-EVT-02, RF-EVT-04            |
| `RN-COM-PRIV-01`  | No debe guardarse informacion de contacto antes de que la persona interesada haya interactuado validamente en el canal.                                                               | CU-COM-004       | RF-COM-07                       |
| `RN-COM-PRIV-02`  | El consentimiento debe quedar registrado para auditoria.                                                                                                                              | CU-COM-004       | RF-COM-07                       |
| `RN-COM-PRIV-03`  | Los avisos y terminos deben mostrarse antes de capturar cualquier dato personal.                                                                                                      | CU-COM-004       | RF-COM-07                       |
| `RN-COM-ETAPA-01` | La calificacion es independiente de la etapa comercial y no determina por si sola el avance de etapa.                                                                                 | CU-COM-005       | RF-COM-02                       |
| `RN-COM-ETAPA-02` | Solo puede existir una etapa comercial activa por persona interesada.                                                                                                                 | CU-COM-005       | RF-COM-02                       |
| `RN-COM-ETAPA-03` | El avance de etapa comercial se basa exclusivamente en criterios observables de la conversacion, no en la calificacion.                                                               | CU-COM-005       | RF-COM-02                       |
| `RN-COM-ETAPA-04` | La calificacion minima es 0 y la maxima es 20.                                                                                                                                        | CU-COM-005       | RF-COM-02                       |
| `RN-COM-ETAPA-05` | La calificacion debe recalcularse durante la conversacion conforme a las interacciones relevantes.                                                                                    | CU-COM-005       | RF-COM-02                       |
| `RN-COM-ETAPA-06` | La reduccion de etapa solo esta permitida ante cambio de evento cuando la persona interesada se encontraba en Prospecto.                                                              | CU-COM-005       | RF-COM-02                       |
| `RN-COM-ETAPA-07` | Una conversacion bloqueada por abuso reincidente no puede retomarse automaticamente; requiere intervencion humana autorizada.                                                         | CU-COM-005       | RF-COM-02                       |
| `RN-COM-REACT-01` | Solo pueden recibir notificaciones de reactivacion los clientes potenciales elegibles con consentimiento registrado.                                                                  | CU-COM-006       | RF-COM-08                       |
| `RN-COM-REACT-02` | No se puede enviar mas de una notificacion del mismo evento al mismo destinatario dentro del periodo anti-spam definido.                                                              | CU-COM-006       | RF-COM-08                       |
| `RN-COM-REACT-03` | El envio de notificaciones no inicia por si mismo un nuevo flujo comercial; el flujo inicia solo si la persona responde.                                                              | CU-COM-006       | RF-COM-08                       |
| `RN-COM-REACT-04` | Este proceso no modifica etapas comerciales ni calificaciones; solo puede registrar o revertir preferencias de desuscripcion autorizadas.                                             | CU-COM-006       | RF-COM-08                       |
| `RN-COM-REACT-05` | Los criterios para determinar un evento relacionado deben quedar definidos antes de activar la notificacion.                                                                          | CU-COM-006       | RF-COM-08                       |
| `RN-COM-REACT-06` | Un cliente potencial desuscrito no debe recibir nuevas notificaciones mientras su desuscripcion siga activa.                                                                          | CU-COM-006       | RF-COM-08                       |

## Nota de depuracion

Varias reglas del dominio COM tienen derivados de diseño. Por ejemplo:

- `RN-COM-ETAPA-04` y `RN-COM-ETAPA-05` requieren una especificacion de calculo en diseño.
- `RN-COM-CONT-06` requiere un contrato de operaciones o especificacion de servicio en diseño.
- `RN-COM-REACT-02` requiere una especificacion tecnica del mecanismo anti-spam en diseño.
