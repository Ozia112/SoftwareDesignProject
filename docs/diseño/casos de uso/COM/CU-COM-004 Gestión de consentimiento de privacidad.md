# CU-COM-004 Gestión de consentimiento de privacidad

## Metadatos

- ID: CU-COM-004
- Dominio: COM
- Nombre: Gestión de consentimiento de privacidad
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-25
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Garantizar que la Persona interesada otorgue consentimiento explícito antes de continuar cualquier interacción con el Bot, cumpliendo con las políticas de privacidad y protección de datos.

## Alcance

Aplica en el momento en que el sistema va a capturar datos personales de la Persona interesada (por ejemplo, para seguimiento o inscripción) y específicamente durante la transición operativa de `Lead` a `MQL`.

## RF relacionados

- RF-COM-07

## Actores

### Actor principal

- Persona interesada

### Actores secundarios

- Bot
- Sistema

## Disparador

Se requiere capturar datos personales de la Persona interesada o la Persona ha manifestado interés en acciones que implican seguimiento (por ejemplo, inscripción), por lo que puede producirse la transición de `Lead` a `MQL`.

## Precondiciones

- Existe un Bot configurado y disponible.
- El sistema puede mostrar mensajes al usuario.
- El aviso de privacidad está configurado en el sistema.

## Postcondiciones

### En éxito

- El consentimiento de la Persona interesada queda registrado.
- Se habilita la interacción con el Bot.
- Se permite continuar con el flujo comercial.

### En fallo

- No se registra el consentimiento.
- Se bloquea la interacción con el Bot.

## Flujo principal

1. Se detecta la necesidad de capturar datos personales o de avanzar la Persona interesada de `Lead` a `MQL`.
2. El Sistema presenta el aviso de privacidad y los términos aplicables al tratamiento de datos que se pretende realizar.
3. El Bot solicita confirmación explícita de aceptación del aviso y del tratamiento de los datos relacionados. [RF-COM-07]
4. Si la Persona interesada acepta, el Sistema registra el consentimiento para auditoría.
5. Tras el registro del consentimiento, el Bot puede solicitar los datos mínimos necesarios y el Sistema persistirá la información en la base de datos. Cuando corresponda, la etapa comercial se actualizará a `MQL`.
6. Si la Persona interesada rechaza el aviso, el Sistema informa que no puede capturar datos y se detiene el flujo de captura.

## Flujos alternos

### A1. Rechazo del aviso de privacidad

1. En el paso 3, la Persona interesada rechaza el aviso.
2. El Sistema informa que no puede continuar sin consentimiento.
3. El flujo finaliza.

## Flujos de excepción

### E1. Error en el registro de consentimiento

1. En el paso 5, ocurre un error al registrar el consentimiento.
2. El Sistema informa al usuario sobre la falla.
3. El Sistema bloquea la continuidad de la interacción.
4. Se registra el error en logs.

## Reglas de negocio / restricciones

- RN-COM-07-01: No se puede continuar la interacción sin consentimiento explícito.
- RN-COM-07-02: El consentimiento debe quedar registrado para auditoría.
- RN-COM-07-03: El consentimiento debe solicitarse antes de capturar cualquier dato personal.
- RN-COM-07-04: El consentimiento registrado habilita la persistencia de datos en la base de datos y la posible actualización de etapa comercial (Lead→MQL).

## Datos relevantes

### Entradas

- Respuesta de aceptación o rechazo de la Persona interesada

### Salidas

- Estado de consentimiento (aceptado / rechazado)
- Registro en sistema

## Diagramas relacionados

- BPMN-COM-004

## Observaciones

- Este caso de uso es obligatorio antes de cualquier flujo de captura de datos o calificación.
- Debe ejecutarse una sola vez por sesión o conversación (según configuración).
- El aviso debe ser mostrado cada vez que se pretenda capturar datos personales que no hayan sido previamente consentidos, y en particular al pasar de `Lead` a `MQL`.

## Trazabilidad

- RF: RF-COM-07
- BPMN: BPMN-COM-004
- DDR: DDR-01

[RF-COM-07]: /docs/diseño/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md
