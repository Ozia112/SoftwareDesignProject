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

Aplica al inicio de cualquier conversación gestionada por el sistema bot, previo a la captura de datos o avance en el proceso comercial.

## RF relacionados

- RF-COM-07

## Actores

### Actor principal

- Persona interesada

### Actores secundarios

- Bot
- Sistema

## Disparador

La Persona interesada inicia una conversación en un canal de comunicación.

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

1. La Persona interesada inicia la conversación.
2. El Sistema muestra el aviso de privacidad y términos.
3. El Bot solicita confirmación explícita de aceptación. [RF-COM-07]
4. La Persona interesada acepta el aviso.
5. El Sistema registra el consentimiento.
6. El Sistema habilita la continuidad de la interacción con el Bot.

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

## Trazabilidad

- RF: RF-COM-07
- BPMN: BPMN-COM-004
- DDR: DDR-01