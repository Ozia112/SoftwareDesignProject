
## Descripción
El sistema presenta el aviso de privacidad y solicita el consentimiento del usuario antes de permitir la interacción con el agente conversacional.

## Flujo principal

1. La persona interesada inicia la conversación con el sistema.
2. El sistema muestra el aviso de privacidad y términos y condiciones.
3. El sistema solicita confirmación de aceptación.
4. La persona selecciona "Acepto".
5. El sistema registra el consentimiento.
6. El sistema permite continuar la interacción.

## Flujo alterno

### Rechazo del aviso

1. La persona selecciona "No acepto".
2. El sistema informa que no puede continuar sin consentimiento.
3. El sistema finaliza la interacción.

## Postcondiciones

- El consentimiento queda registrado en el sistema.