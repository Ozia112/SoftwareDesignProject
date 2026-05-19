# Catalogo de reglas de negocio EVT

## Criterio

Este catalogo concentra las reglas del dominio de eventos extraidas de los casos de uso del area `EVT`. Los CUs deben referenciar estos IDs y no repetir el texto completo de la regla.

## Reglas

| ID               | Enunciado                                                                                                      | Fuente principal | RF relacionados      |
| ---------------- | -------------------------------------------------------------------------------------------------------------- | ---------------- | -------------------- |
| `RN-EVT-LE-01`   | Una persona interesada no puede registrarse mas de una vez en la lista de espera del mismo evento.             | CU-EVT-001       | RF-EVT-06            |
| `RN-EVT-LE-02`   | La lista de espera se ordena por calificacion y usa FIFO solo como desempate.                                  | CU-EVT-001       | RF-COM-02, RF-EVT-06 |
| `RN-EVT-LE-03`   | El registro en lista de espera requiere datos minimos de contacto definidos por el negocio.                    | CU-EVT-001       | RF-EVT-06            |
| `RN-EVT-CAN-01`  | Solo se permiten cancelaciones antes del inicio del evento.                                                    | CU-EVT-002       | RF-EVT-04            |
| `RN-EVT-CAN-02`  | La cancelacion valida libera inmediatamente la vacante asociada.                                               | CU-EVT-002       | RF-EVT-04            |
| `RN-EVT-CAN-03`  | Toda actualizacion de cupo tras cancelacion debe preservar la consistencia del aforo y evitar sobreventa.      | CU-EVT-002       | RF-EVT-04            |
| `RN-EVT-CAN-04`  | Las notificaciones disparadas por cancelacion deben respetar las reglas anti-spam vigentes.                    | CU-EVT-002       | RF-EVT-03            |
| `RN-EVT-CUPO-01` | No se permite sobreinscripcion cuando el cupo del evento esta lleno.                                           | CU-EVT-003       | RF-EVT-01, RF-EVT-02 |
| `RN-EVT-CUPO-02` | La vacante temporal debe liberarse si no se confirma el pago dentro del periodo definido por el negocio.       | CU-EVT-003       | RF-EVT-02            |
| `RN-EVT-CUPO-03` | Las inscripciones extemporaneas deben bloquearse segun la politica vigente del evento.                         | CU-EVT-003       | RF-EVT-05            |
| `RN-EVT-CUPO-04` | Si la persona elegible acepta, debe quedar registrada en la lista de espera conforme a la politica del evento. | CU-EVT-003       | RF-EVT-06            |

## Nota de depuracion

Varias reglas EVT necesitan artefactos derivados en diseño:

- `RN-EVT-LE-02` requiere una especificacion de priorizacion y desempate si se implementa con algoritmo o cola.
- `RN-EVT-CUPO-02` requiere una especificacion tecnica de expiracion de reserva.
- `RN-EVT-CAN-03` y `RN-EVT-CUPO-01` requieren un modelo tecnico consistente de estados operativos y cupos.
