
# Guion

## Apertura

En este video vamos a mostrar una demostración del sistema de inscripción y atención para eventos. La idea central es simple: el cliente potencial conversa con el Bot, el Bot entiende el contexto y emite señales, y el sistema ejecuta las operaciones de dominio necesarias para avanzar la conversación, reservar cupo o escalar la atención a una persona.

Este enfoque nos permite automatizar la primera parte del proceso sin perder control sobre las acciones sensibles. El Bot responde preguntas frecuentes, consulta el banco de contexto y actualiza la etapa comercial; cuando hace falta, el Orquestador valida las condiciones y deriva la acción al servicio correspondiente o al operador humano.

## Roles

En la demo participan tres roles principales:

- Operador humano: completa inscripciones, confirma pagos y resuelve las dudas que el Bot no puede atender por sí solo.
- Bot: atiende al cliente potencial, responde preguntas básicas sobre los eventos y dispara señales para avanzar la etapa comercial.
- Cliente potencial: la persona que inicia la conversación con interés en inscribirse a un evento.

## Etapas comerciales

A medida que avanza la conversación, el sistema clasifica a cada cliente potencial en una etapa comercial.

- Lead: la persona inicia la conversación con el Bot y muestra interés en un evento. En esta fase se solicita la aceptación tácita del aviso de privacidad y el nombre para poder continuar.
- MQL: el cliente ya proporcionó su nombre y ahora consulta información básica, como horarios, días y modalidad del evento.
- Prospecto: ya compartió número y correo, por lo que está más cerca del pago. En este punto, el sistema verifica que exista cupo; si no lo hay, puede entrar a lista de espera.
- SQL: el cliente ya pagó y pasa a atención del operador humano para cerrar dudas pendientes o completar el proceso.
- Cierre: el resultado final puede ser cierre ganado, cuando el pago queda confirmado y la inscripción se registra, o cierre perdido, cuando no se logra continuar con el proceso.

## Qué muestra el MVP

La versión mínima del producto presenta un módulo donde el cliente potencial conversa con el Bot mientras el sistema actualiza la etapa comercial con base en la información recolectada: nombre, correo, número telefónico y confirmación de pago.

El Bot también tiene acceso al banco de contexto del evento, donde puede consultar una descripción breve, horarios, días y modalidad, ya sea presencial, virtual o mixta. Con esa información puede responder de forma más útil y mantener la conversación orientada a la inscripción.

## Recorrido de la demo

Durante la demostración vamos a recorrer cinco momentos:

### 1. Escenarios predefinidos: haremos click en cada escenario y seguiremos el flujo completo hasta llegar a SQL

> Se abre el curso de excel

Para inicar la demo del caminimo minimo, abrimos el curso de Excel Avanzado y el lead envia un mensaje anunciando que vio el anuncio, en este momento su etapa comercial sigue siendo de Lead y el Bot manda un mensaje sobre que va a guardar algunos datos para la inscripción al curso

> Se agrega un nombre con apellidos

Una vez enviado el nombre el sistema procesa el mensaje, guarda el nombre en la base de datos, y el Orquestador sube la etapa del cliente de Lead a MQL

> Se agrega el correo y el número

Una vez que el cliente agrega su corre y número para contactarse, el sistama guarda todo, lo sube a prospecto y guarda un cupo temporal al evento, cabe aclarar que en cualquier momento de la conversación el cliente puede hacer preguntas sobre el evento o sobre otros eventos disponibles, cosa que veremos en otro flujo, para continuar el sistema le da los detalles del precio y los metodos de pago esperando confirmación de pago de parte del cliente potencial

> Se agrega la confirmación de pago

Una vez que el cliente mande un mensaje confirmando su pago el Orquestador notifica al Operador y aumenta la etapa comercial de prospecto a SQL

### 2. Escalación a operador humano: mostraremos cómo el operador puede aprobar o denegar una inscripción cuando el Bot necesita apoyo

> Señalar con el mouse la notificación en "Vista Operador"

Y escala la conversación, en vista del operador la persona encargada de cerrar la venta puede mandar mensajes para contestar preguntas que el bot no pueda contestar o cerrar ventas cambiando la etapa de SQL a Cierre ganado o perdido de acuerdo a la confirmación de pago

### 3. Conversaciones en paralelo: abriremos una segunda sesión con otro escenario para demostrar que la plataforma puede atender dos conversaciones al mismo tiempo

El sistema es capaz de mantener varias conversaciones simultaneamente sin que se mezcle la información entre chats gracias a que cada conversación activa posee una ID

> Crear 2 conversaciones en Diplomado Contabilidad

Una vez que las conversaciones llegan ambas a prospecto se explica como funciona la lista de espera

### 4. Terminal y APIs: revisaremos las llamadas al sistema para evidenciar el uso de tools y el manejo conversacional del Bot

### 5. Concatenación de mensajes: enviaremos varios mensajes seguidos antes de que el Bot responda para mostrar cómo el sistema agrupa el texto y lo procesa como una sola interacción

## Mensaje arquitectónico

Una parte importante de la demo es dejar claro el criterio de arquitectura: el Bot no accede directamente a la base de datos ni ejecuta por sí mismo las operaciones del negocio. En lugar de eso, emite señales y solicita acciones mediante el Orquestador.

Eso nos permite mantener separadas la etapa comercial, la calificación y el estado operativo. El sistema decide cuándo reservar cupo, cuándo liberar una espera, cuándo escalar una conversación y cuándo registrar el cierre.

## Escalabilidad

La arquitectura está pensada para crecer. A futuro, el `AgentRunner` puede evolucionar hacia un árbol de estados jerárquico con aristas condicionales para hacer más flexible la inyección de prompts y contexto al Bot.

También podemos evolucionar el registro de eventos hacia una estructura más rígida, con campos nullables y autorizaciones condicionales, para alimentar mejor el banco de contexto. Eso facilitaría el acceso controlado a etapas comerciales, calificaciones, frecuencias y roles.

Por último, el módulo de calificaciones debe mantenerse desacoplado para poder ajustar métricas y reglas sin afectar el resto del sistema. La dirección que seguimos es:

- Endpoints independientes para recopilar métricas.
- Calificación basada en efectividad de mensajes, rapidez de respuesta y velocidad de avance entre etapas.
- Parámetros configurables para evitar una calificación estática y permitir una jerarquía real.

## Cierre

Con esto cerramos la demo: mostramos cómo el Bot atiende la primera conversación, cómo el sistema controla el avance comercial y cómo el operador humano entra solo cuando es necesario. El resultado es un flujo más claro para el usuario y una arquitectura más segura, controlable y escalable para el equipo.
