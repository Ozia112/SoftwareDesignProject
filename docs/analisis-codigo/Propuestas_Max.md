# Propuestas de diseño detalladas

## Detalle: Unificar la configuración

Por "unificar la configuración" me refiero a dejar los valores que pueden cambiar según el entorno (direcciones de servicios, puertos, identificadores de tenant, flags de comportamiento) en un único lugar que todas las partes del demo consulten en tiempo de ejecución. Actualmente esos valores están repartidos entre varios archivos y scripts; si cambias uno, a veces hay que actualizar varios sitios.

Beneficios principales:

- Menos errores por valores desincronizados.
- Posibilidad de ejecutar solo una parte del sistema (por ejemplo, la interfaz) apuntando a otro backend sin tener que reconstruir nada.
- Facilita la automatización y las pruebas, porque los entornos se configuran cambiando un único archivo o variable.

Propuesta de pasos prácticos (incremental y reversible):

1. Definir un archivo de configuración simple en la raíz de `demo/` que sea JSON y contenga las claves que hoy están dispersas (por ejemplo: URL base del orquestador, puerto del bridge, tenant). Este archivo se sirve o se monta en los procesos que lo necesiten.
2. Cambiar la interfaz y el bridge para que lean esa configuración al inicio en lugar de usar valores codificados. Al principio esto puede fallar si no existe el archivo; documentar el formato y mantener los valores por defecto para compatibilidad.
3. Actualizar `start.sh` y `docker-compose.yml` para montar o servir dicho archivo cuando se levante el demo.

Ejemplo breve (solo formato; conservar en `Max2.md` para implementación):

```json
{
    "API_BASE": "http://localhost:3000/api/v1",
    "TENANT_ID": "demo-tenant",
    "BRIDGE_URL": "http://localhost:4000"
}
```

Notas de seguridad y operación:

- No incluir credenciales sensibles en el archivo JSON si va a ser servido públicamente; usar variables de entorno o un mecanismo de secretos para llaves privadas.
- Mantener valores por defecto en el código durante una transición corta para evitar romper demos existentes.

## Detalle: Separar la preparación de datos (seed)

Problema observado:

- Actualmente la carga de datos de ejemplo se realiza de forma manual (por ejemplo, `docker exec` a un contenedor) o con scripts acoplados al entorno, lo que dificulta la reproducibilidad y la automatización.

Beneficios de separarlo:

- Permite reproducir entornos idénticos en CI/CD y en nuevos desarrollos.
- Evita la necesidad de intervenir contenedores en ejecución para inicializar datos.
- Facilita pruebas e integración continua si la preparación es idempotente y declarativa.

Propuesta de pasos prácticos:

1. Crear un servicio `seed` opcional en `docker-compose.yml` que ejecute `node seed/seed.js` (o el script correspondiente) una única vez. Configurar `restart: "no"` para que no vuelva a ejecutar.
2. Alternativamente, ofrecer un script CLI en `demo/` (`npm run seed` o `node seed/seed.js`) que pueda ejecutarse desde pipelines y entornos locales.
3. Hacer que el script de seed sea idempotente: comprobar si los datos ya existen y en ese caso no volver a insertarlos.
4. Documentar el procedimiento en `README.md` del demo y eliminar la recomendación de usar `docker exec` en la ruta normal de puesta en marcha.

Ejemplo de fragmento para `docker-compose.yml` (formato ilustrativo):

```yaml
    seed:
        image: node:18
        working_dir: /app
        volumes:
            - ./seed:/app/seed:ro
        command: ["node", "seed/seed.js"]
        depends_on:
            - orchestrator
        restart: "no"
```

## Detalle: Desacoplar la comunicación entre componentes

Problema observado:

- El `open-wa-bridge` y el orquestador están acoplados mediante llamadas HTTP directas y URLs codificadas, lo que obliga a que ambos estén simultáneamente disponibles y complica escalado o pruebas aisladas.

Beneficios de desacoplar:

- Componentes independientes pueden funcionar, escalar y desplegarse separadamente.
- Mejora la resiliencia: pérdida temporal de un componente no bloquea al resto.
- Facilita integrar reemplazos (por ejemplo, otra pasarela de mensajería) sin cambiar el orquestador.

Propuesta de pasos prácticos:

1. Introducir un mecanismo opcional de mensajería (Redis Pub/Sub, RabbitMQ o una cola ligera) como capa de desacoplamiento. Mantener la llamada HTTP directa como fallback durante la transición.
2. Modificar `open-wa-bridge` para publicar eventos (por ejemplo `message.received`) en el bus y suscribirse a canales de control si es necesario.
3. Hacer que el orquestador consuma eventos desde el bus en lugar de depender exclusivamente de endpoints HTTP expuestos por el bridge.
4. Documentar el contrato de eventos (nombres de tópico/evento y formato JSON) y ofrecer ejemplos.

Ejemplo de mensaje (formato sugerido):

```json
{
    "event": "message.received",
    "tenant": "demo-tenant",
    "payload": {
        "from": "+5491122334455",
        "text": "Hola",
        "id": "msg-123"
    },
    "timestamp": "2026-06-17T12:00:00Z"
}
```

Notas operativas:

- Mantener la solución opcional: forzar a usar pub/sub solo cuando se quiera escalar o testear en aislamiento.
- Añadir healthchecks para la cola y métricas para latencia de entrega.

## Detalle: Acordar formatos claros y estables (OpenAPI / JSON Schema)

Problema observado:

- La interfaz y el servidor intercambian datos en formatos poco formalizados; la interfaz incluso analiza texto de logs en vez de consumir datos estructurados.

Beneficios de formalizar contratos:

- Reduce roturas por cambios inesperados en la API o en eventos.
- Permite generar clientes, mocks y validaciones automáticas.
- Facilita pruebas de contrato entre front-end y back-end.

Propuesta de pasos prácticos:

1. Definir un `openapi.yaml` mínimo para los endpoints públicos que utiliza la GUI (health, fetch events, post messages, etc.).
2. Definir JSON Schema para los eventos y mensajes que circulan entre bridge y orquestador.
3. Añadir validación ligera en el orquestador (por ejemplo, usando Ajv en Node.js) para rechazar payloads inválidos con errores claros.
4. Integrar Swagger UI o Redoc en modo documentación para que desarrolladores y QA tengan referencias vivas.

Ejemplo de fragmento de schema (ilustrativo):

```json
{
    "$id": "https://example.org/schemas/message.json",
    "type": "object",
    "required": ["from", "text", "id"],
    "properties": {
        "from": { "type": "string" },
        "text": { "type": "string" },
        "id": { "type": "string" }
    }
}
```

## Detalle: Reducir o eliminar pasos interactivos

Problema observado:

- Algunos scripts de arranque o tareas del demo requieren interacción manual, lo que impide automatizar despliegues y pruebas.

Beneficios de automatizar:

- Permite integrar el demo en pipelines de CI/CD y ejecutar pruebas reproducibles.
- Mejora la experiencia de desarrolladores nuevos que deben seguir pasos claros y no interactivos.

Propuesta de pasos prácticos:

1. Hacer que `start.sh` acepte banderas y variables de entorno para ejecutarse sin preguntas (por ejemplo `START_INTERACTIVE=false`).
2. Ofrecer comandos `npm` o `Makefile` que encapsulen pasos comunes sin interacción.
3. Documentar los modos: `dev` (rápido, con valores por defecto), `ci` (no interactivo, usa `seed` idempotente y healthchecks) y `prod` (más restricciones de seguridad).
4. Mantener mensajes informativos en logs en lugar de prompts que requieren respuesta.
