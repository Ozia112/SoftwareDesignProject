# RNF 01 Interacción entre los actores del sistema y la base de datos (Seguridad)

## Descripción

El sistema debe restringir el acceso a la base de datos según el rol del actor del sistema garantizando la confidencialidad e integridad de la información

## Métrica

- El 100% de las operaciones de lectura y escritura sobre la base de datos deben ejecutarse a través de componentes que apliquen control de acceso basado en roles
- Ningún actor no autorizado puede acceder a datos sensibles
- El acceso a datos personales de posibles clientes debe estar restringido para que solo los roles de operador humano o administrativo puedan acceder
- Todas las operaciones sobre datos sensibles deben quedar registradas en logs de auditoría con actor, rol, acción, recurso, id de conversación y timestamp

## Condiciones

- Deben existir roles definidos: Bot, Operador humano y Operador administrativo
- Mapeo de privilegios:
	- Bot: lectura de datos públicos de eventos y metadatos, escritura de registros de conversación y calificaciones, no puede leer ni modificar datos personales ni realizar eliminaciones ni cambios de configuración
	- Operador humano: lectura de datos de eventos y de datos personales limitados (nombre, teléfono, correo) cuando esté autorizado, permiso para modificar campos operativos del lead (etapa comercial, notas); no puede modificar precios, cupos ni datos financieros sin permiso administrativo
	- Operador administrativo: acceso total de lectura y escritura a eventos, usuarios y configuración; capacidad para gestionar roles y permisos
- El acceso a la base de datos se realiza únicamente a través del backend del sistema; no se permiten conexiones directas desde clientes externos o integraciones sin el mediador del backend
- Los datos personales y sensibles deben estar cifrados en tránsito y en reposo, las credenciales y tokens de servicio deben rotarse periódicamente
- Debe existir un Banco de contexto separado (o particionado) que distinga entre información pública de eventos y datos personales, el Bot solo debe consultar y exponer la porción del banco autorizada para su rol
- Toda operación de lectura/escritura sobre datos sensibles debe registrarse en un log de auditoría inmutable que incluya actor, rol, acción, recurso, identifier (por ejemplo conversation_id) y timestamp

## Criterios de aceptación

- Instrumentación y trazabilidad:
	- Todas las operaciones de lectura/escritura pasan por componentes que registran transaction_id y actor, se puede demostrar con una consulta de evidencia de logs
	- Existencia de alertas configuradas para intentos de acceso denegado repetidos o intentos sobre campos sensibles
- Cumplimiento:
	- En una auditoría interna o ejercicio de pruebas, 100% de intentos no autorizados son denegados según los roles definidos
- Operacional:
	- El Bot puede: consultar información de eventos, no puede acceder a datos de clientes y no puede modificar registros existentes; puede agregar información de una conversación activa (descrita en RF-COM-07)
	- El Operador humano puede: consultar información de la base de datos pero solo puede modificar datos permitidos por su rol
	- El Operador administrativo: tiene acceso total de lectura y escritura a la base de datos
