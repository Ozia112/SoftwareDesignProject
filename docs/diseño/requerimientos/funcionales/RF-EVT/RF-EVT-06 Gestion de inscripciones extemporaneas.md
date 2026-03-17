# RF-EVT-06. El Sistema bot debe permitir o bloquear inscripciones extemporáneas (Evento en curso)

## Descripción

El Sistema bot debe permitir o bloquear inscripciones cuando el Evento ya inició, aplicando un umbral configurable de avance (porcentaje de sesiones completadas). Si se supera el umbral, se bloquea la inscripción.

## Historia de usuario

Como operador necesito que El Sistema bot bloquee inscripciones cuando el Evento ya va avanzado más del umbral permitido para cumplir la política del negocio.

## Criterios de aceptación

* El Sistema bot calcula automáticamente el porcentaje de avance:
  * avance = sesiones realizadas / sesiones totales.
* El porcentaje máximo permitido es **configurable por Evento**.
* Si el avance supera el umbral configurado:
  * El Sistema bot **bloquea** nuevas inscripciones.
* Si el avance no supera el umbral:
  * El Sistema bot permite continuar el flujo normal de inscripción (sujeto a cupo).
