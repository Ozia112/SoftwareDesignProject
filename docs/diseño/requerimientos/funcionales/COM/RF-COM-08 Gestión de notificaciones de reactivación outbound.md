# RF-COM-08 Gestión de notificaciones de reactivación outbound

## Descripción

El sistema debe ser capaz de enviar notificaciones outbound de forma proactiva a los clientes potenciales registrados en la cartera de clientes (Prospectos, SQLs y Alumnos activos) cuando ocurran eventos comerciales relevantes, con el objetivo de reactivar su proceso comercial y mantenerlos informados sobre nuevas oportunidades.

Las notificaciones outbound solo se envían a destinatarios que han registrado consentimiento tácito de acuerdo a lo establecido en CU-COM-004, garantizando cumplimiento con normativas de protección de datos. El sistema debe permitir a los clientes potenciales solicitar la desuscripción de notificaciones de reactivación, y registrar dicha preferencia en el Banco de contexto general.

## Historia de Usuario

**Como** gerente comercial  
**Quiero** que el sistema envíe notificaciones proactivas a mis clientes potenciales cuando se reabra un evento o se publique uno relacionado  
**Para** mantener a mis clientes informados de nuevas oportunidades y reactivar su interés en la inscripción, incrementando las tasas de conversión

## Disparadores de notificación

El sistema debe soportar los siguientes disparadores para activar el envío de notificaciones:

- **Evento reabierto:** Se registra una nueva edición o reapertura de un evento que ya existía en el sistema.
- **Evento relacionado:** Se publica un nuevo evento cuya categoría, temática o instructor coincide con eventos previos de interés del cliente potencial.
- **Desuscripción solicitada:** Un cliente potencial solicita explícitamente no recibir más notificaciones de reactivación.

## Criterios de Aceptación

### Gestión de destinatarios

- [ ] El sistema identifica automáticamente los clientes potenciales en etapa Prospecto, SQL o Cierre Ganado (Alumno activo) elegibles para recibir notificaciones.
- [ ] El sistema valida que cada destinatario tiene consentimiento tácito registrado antes de enviar cualquier notificación.
- [ ] El sistema omite a los destinatarios que han solicitado desuscripción.
- [ ] El sistema previene envío repetido aplicando un período anti-spam configurable.

### Envío de notificaciones

- [ ] Las notificaciones se envían a través del canal de comunicación registrado del cliente potencial.
- [ ] El sistema registra cada envío con timestamp, destinatario y resultado en los logs.
- [ ] El sistema continúa con el siguiente destinatario incluso si falla el envío a uno específico.
- [ ] Los destinatarios que responden a la notificación pueden iniciar un nuevo flujo conversacional.

### Gestión de desuscripción

- [ ] Un cliente potencial puede solicitar desuscripción de notificaciones de reactivación a través de una respuesta en el canal.
- [ ] El sistema registra la preferencia de desuscripción en el Banco de contexto general.
- [ ] El sistema envía confirmación al cliente potencial indicando que su solicitud fue procesada.
- [ ] Un cliente potencial desuscrito no recibirá futuras notificaciones mientras la preferencia esté activa.
- [ ] La preferencia de desuscripción puede ser revertida únicamente por el Operador administrativo del canal o por el cliente potencial mediante una nueva solicitud explícita.

### Restricciones y reglas de negocio

- [ ] El envío de notificaciones no modifica etapas comerciales ni calificaciones.
- [ ] El envío de notificaciones no inicia automáticamente un flujo comercial; solo coloca el mensaje en el canal del destinatario.
- [ ] La única operación de escritura permitida es el registro o eliminación de la preferencia de desuscripción en el Banco de contexto general.
- [ ] Los criterios para determinar si un evento es "relacionado" son configurables por el Operador administrativo del canal.
