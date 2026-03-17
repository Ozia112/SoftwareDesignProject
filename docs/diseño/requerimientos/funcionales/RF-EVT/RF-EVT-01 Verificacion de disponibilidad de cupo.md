# RF-EVT-01 El Bot/Sistema bot debe verificar automáticamente la disponibilidad de cupo del Evento

## Descripción

El Sistema bot debe validar el cupo disponible del Evento en tiempo real cada vez que una Persona interesada consulte un Evento o intente avanzar en el proceso comercial hacia inscripción/pago. Si no hay vacantes, El Sistema bot bloquea el avance y puede ofrecer alternativas (lista de espera / eventos similares).

## Historia de usuario

Como Persona interesada necesito que El Sistema bot valide automáticamente si hay cupo disponible para evitar avanzar a inscripción o pago cuando el Evento está lleno.

## Criterios de aceptación

- Al consultar un Evento, El Sistema bot muestra el cupo disponible en tiempo real.
- Antes de cambiar la etapa a SQL o presentar/generar opción de pago, El Sistema bot valida que existan vacantes.
- Si el cupo es 0, El Sistema bot:
  - Informa que el Evento está lleno.
  - Ofrece lista de espera si está habilitada.
  - Puede sugerir Eventos similares.
- No es posible avanzar a inscripción si el cupo es 0.

- La validación se ejecuta automáticamente antes de generar un enlace de pago.

**Dependencia:** RF-COM-02 (gestión de etapas).
