# RF-COM-07 Informe de privacidad al usuario

## Descripción

El sistema debe presentar a la persona interesada un aviso de privacidad y términos y condiciones antes de permitir cualquier interacción con el bot, solicitando su consentimiento explícito para el tratamiento de sus datos personales.

Este proceso es obligatorio para continuar dentro del flujo de atención y debe cumplirse antes de que la persona interesada avance dentro de las etapas del proceso comercial, conforme a lo definido en el glosario.

El sistema debe registrar el consentimiento o rechazo de la persona interesada para fines de auditoría y cumplimiento normativo.

## Historia de Usuario

**Como** persona interesada que inicia interacción con el sistema  
**Quiero** recibir y aceptar el aviso de privacidad y términos y condiciones antes de continuar  
**Para** conocer el uso de mis datos personales y otorgar consentimiento informado conforme a normativas de protección de datos  

## Criterios de Aceptación

- [ ] La persona interesada recibe automáticamente un mensaje inicial con el aviso de privacidad y términos al iniciar la conversación  
- [ ] El sistema solicita confirmación explícita de aceptación ("Acepto" / "No acepto")  
- [ ] Si la persona interesada acepta, el sistema permite continuar la interacción con el bot  
- [ ] Si la persona interesada rechaza, el sistema informa que no puede continuar sin consentimiento  
- [ ] El consentimiento o rechazo queda registrado en el sistema con fines de auditoría  
- [ ] El sistema no permite la recolección ni procesamiento de datos sin consentimiento previo
