# RF-COM-07: Informe de Privacidad al Usuario

## Descripción
El sistema debe mostrar a la persona interesada un aviso de privacidad y términos y condiciones antes de continuar la interacción con el sistema/agente, solicitando su aceptación explícita para garantizar el uso adecuado de datos personales y cumplir con normativas de protección de datos.

## Historia de Usuario
**Como** persona interesada que inicia interacción con el sistema  
**Quiero** recibir y aceptar el aviso de privacidad y términos y condiciones antes de continuar  
**Para** conocer el uso de mis datos personales y otorgar consentimiento informado conforme a normativas de protección de datos

## Criterios de Aceptación

- [ ] La persona recibe automáticamente un mensaje inicial con aviso de privacidad y términos al iniciar la conversación
- [ ] El sistema solicita confirmación explícita ("Acepto" / "No acepto")
- [ ] Si acepta: el sistema permite continuar la interacción con el agente
- [ ] Si rechaza: el sistema informa que no puede continuar sin consentimiento
- [ ] El consentimiento queda registrado en el sistema para auditoría
