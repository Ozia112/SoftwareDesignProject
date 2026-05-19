# RF-EVT-05. El Sistema bot debe permitir o bloquear inscripciones extemporáneas (Evento en curso)

## Descripción

El sistema debe permitir a los Clientes potenciales elegibles dentro de la lista de espera inscribirse a un Evento incluso despues de que este haya empezado, siempre y cuando el avance del Evento no haya superado un umbral configurable por el administrador (por ejemplo, 20% de sesiones completadas). Si el avance del Evento supera el umbral configurado, El Sistema bot bloquear cancelaciones extemporaneas, reembolsos y nuevas inscripciones para garantizar la politica del negocio establecida en el umbral configurado.

## Historia de usuario

**Como** Cliente potencial elegible en lista de espera de un Evento que ya ha iniciado,
**Quiero** que el Sistema bot me permita inscribirme mientras el avance del Evento no haya superado el umbral configurado, y que bloquee mi inscripción, cancelación o reembolso si dicho umbral ya fue superado,
**Para** poder unirme a un Evento en curso cuando aún es viable, y para que el negocio mantenga su política respecto a inscripciones extemporáneas.

## Criterios de aceptación

* [ ] El Sistema bot calcula automáticamente el porcentaje de avance del Evento:
  * `avance = sesiones realizadas / sesiones totales`.
* [ ] El umbral máximo de avance permitido es **configurable por el administrador** y puede variar **por Evento**.
* [ ] Si el avance **no supera** el umbral configurado:
  * El Sistema bot permite a los Clientes potenciales elegibles en lista de espera continuar el flujo de inscripción extemporánea (sujeto a disponibilidad de cupo).
* [ ] Si el avance **supera** el umbral configurado:
  * El Sistema bot **bloquea** nuevas inscripciones al Evento.
  * El Sistema bot **bloquea** cancelaciones extemporáneas al Evento.
  * El Sistema bot **bloquea** solicitudes de reembolso relacionadas con el Evento.
