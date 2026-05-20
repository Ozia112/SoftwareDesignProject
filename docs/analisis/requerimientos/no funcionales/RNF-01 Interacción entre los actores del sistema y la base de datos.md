# RNF 01 Interacción entre los actores del sistema y la base de datos (Seguridad)

## Descripción

El sistema debe restringir el acceso a la base de datos según el rol del actor del sistema garantizando la confidencialidad, integridad y trazabilidad de la información. Los controles de cifrado, autenticación, rotación de credenciales y auditoría deben ser verificables mediante pruebas y herramientas estándar.

## Métrica

- El 100% de las operaciones de lectura y escritura sobre la base de datos se ejecutan a través de componentes que aplican control de acceso basado en roles (RBAC).
- 0 accesos no autorizados exitosos: el 100% de intentos no autorizados deben ser denegados en auditorías y pruebas de seguridad.
- El acceso a datos personales de los posibles clientes debe estar restringido para que solo roles autorizados puedas acceder a estos.
- Logs de auditoría inmutables: todas las operaciones sensibles registradas en formato append-only con campos: actor, rol, acción, recurso, conversation_id, transaction_id, timestamp y hash de entrada; sin permisos de DELETE/UPDATE.
- Protección contra abuso: bloqueo o throttling de IPs/tokens con umbral configurable 10 intentos fallidos por minuto.
- Alertas críticas generadas en menos de 5 minutos ante patrones anómalos de acceso.

## Condiciones

- Deben existir roles definidos: Bot, Operador humano y Operador administrativo.
- Mapeo de privilegios (concreto):
  - Bot: lectura de datos públicos de eventos y metadatos; escritura de registros de conversación y calificaciones; no puede leer ni modificar datos personales ni cambiar precios o cupos.
  - Operador humano: lectura limitada de datos personales (nombre, teléfono, correo) cuando esté autorizado; modificación de campos operativos del lead (etapa comercial, notas); no puede modificar precios/cupos/datos financieros sin permiso administrativo.
  - Operador administrativo: acceso total a eventos, usuarios y configuración; capacidad para gestionar roles y permisos.
- El acceso a la base de datos se realiza únicamente a través del backend; no se permiten conexiones directas desde clientes o integraciones sin el mediador del backend.
- Cifrado en tránsito y en reposo y políticas de rotación aplicadas según lo indicado en la sección Métrica.
- Los logs de auditoría se almacenan en un repositorio inmutable o servicio WORM y cada entrada incluye hash encadenado o firma para impedir modificaciones.

## Criterios de aceptación

- Instrumentación y trazabilidad: todas las operaciones registran `transaction_id` y `actor`; se puede demostrar con consultas de evidencia en los logs.
- Seguridad: informe de prueba de penetración (pentest) contra el API/backend, incluyendo escenarios cross-rol, sin hallazgos críticos (0 brechas).
- Verificación de cifrado: resultados de escáner o revisión confirman TLS ≥ 1.2 y cifrado AES-256 en reposo.
- Rotación de credenciales: evidencia de políticas y registros que demuestran rotación según los intervalos definidos.
- Prueba de abuso: test de fuerza/brute-force demuestra bloqueo/throttling al superar umbral 10.
- Auditoría: verificación que los logs son append-only y que no existe capacidad de DELETE/UPDATE para registros de auditoría.
