# RF-COM-03. Captura y gestión de datos de la persona interesada desde conversaciones multicanal

El sistema debe capturar, almacenar y asociar automáticamente los datos del usuario provenientes de una conversación en una red social (Facebook, WhatsApp, Instagram, etc.).

## Historia de usuario

*Como* organización que gestiona leads desde múltiples canales
*Quiero* capturar, almacenar y asociar automáticamente los datos del usuario desde cualquier conversación
*Para* centralizar la información y dar seguimiento eficiente a cada persona interesada

Criterios de aceptación.

- Cuando un lead inicia conversación, el Bot Automatizado solicita datos mínimos cuando no existan: nombre, teléfono y/o correo.
- El sistema registra metadatos de la conversación: canal, fecha/hora de inicio, fecha/hora de cierre (cuando aplique) y responsable asignado.
- El sistema crea o actualiza un registro único por persona interesada, evitando duplicados mediante reglas de identidad (p. ej., teléfono + canal).
- El sistema permite capturar datos adicionales: eventos/cursos de interés, horario preferido, modalidad y notas internas.
- El sistema valida el formato de correo electrónico y número de celular (opcional futuro: verificación por mensaje/código).
- Los datos se almacenan en base de datos y pueden consultarse en cualquier momento por Bots autorizados.
- Solo Usuarios autorizados pueden ver o editar datos sensibles del cliente potencial.
- Cada conversación entrante genera o actualiza un registro asociado a una persona interesada.
- La información puede recuperarse y consultarse en cualquier momento (persistencia comprobable).
