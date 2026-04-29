# RF-EVT-01 El Bot/Sistema bot debe verificar automáticamente la disponibilidad de cupo del Evento

## Descripción

El sistema debe poder verificar en etapas especificas del proceso comercial (consulta de Evento inicial y transición a Prospecto) que el cupo del Evento sea mayor a 0 antes de permitir avanzar en el proceso comercial. Si el cupo es 0, El Sistema bot debe informar que el Evento está lleno y ofrecer alternativas como registrarse en lista de espera o consultar eventos similares.

## Historia de usuario

**Como** Cliente potencial interesado en inscribirme a un Evento,
**Quiero** que el sistema verifique automáticamente la disponibilidad de cupo del Evento en etapas clave del proceso comercial,
**Para** evitar avanzar en el proceso de inscripción si el Evento ya está lleno, y para recibir información clara sobre la disponibilidad y opciones alternativas sin tener que consultar manualmente.

## Criterios de aceptación

- [ ] Al consultar un Evento, El Sistema bot muestra el cupo disponible en tiempo real.
- [ ] La validación de cupo se ejecuta automáticamente en las siguientes etapas del proceso comercial:
  - **Consulta inicial del Evento** (cuando el Cliente potencial solicita información del Evento).
  - **Transición a Prospecto** (antes de permitir avanzar en el proceso comercial).
- [ ] Si el cupo es 0, El Sistema bot:
  - Informa que el Evento está lleno.
  - Ofrece lista de espera si está habilitada.
  - Puede sugerir Eventos similares.
- [ ] No es posible avanzar a inscripción si el cupo es 0.

**Dependencia:** RF-COM-02 (gestión de etapas).
