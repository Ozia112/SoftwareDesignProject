# CU-COM-004 Presentación de avisos legales y registro de consentimiento tácito

## Metadatos

- ID: CU-COM-004
- Dominio: COM
- Nombre: Presentación de avisos legales y registro de consentimiento tácito
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-25
- Última actualización: 2026-04-28
- Responsable: Maximiliano Carrillo Alvarado
- Última corrección por: Isaac Ortiz
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Garantizar que la Persona interesada tenga acceso directo a cualquier aviso legal almacenado en el sistema a través de enlaces antes de interactuar con el Bot, y registrar su consentimiento tácito sobre el apartado legal y el uso de sus datos cuando envíe su primer mensaje en el canal de comunicación.

## Alcance

Aplica al inicio de cualquier conversación gestionada por el sistema bot, previo a la captura de datos o avance en el proceso comercial.

## RF relacionados

- [RF-COM-07]

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
- Los avisos legales están disponibles en el Banco de contexto general gestionado por [CU-COM-003 Gestión de bancos de contexto].

## Postcondiciones

### En éxito

- El consentimiento tácito de la Persona interesada queda registrado.
- Se habilita la interacción con el Bot.
- Se permite continuar con el flujo comercial.

### En fallo

- La Persona interesada no continúa la conversación por lo tanto su consentimiento tácito no queda registrado.
- Se bloquea la interacción con el Bot.

## Flujo principal

1. La Persona interesada inicia la conversación al dar click en un enlace o botón que lo envía a un canal de comunicación.
2. Se activa [CU-COM-003 Gestión de bancos de contexto] para obtener los avisos legales disponibles desde el Banco de contexto general. El Sistema los muestra a través de enlaces que redireccionan a los documentos completos, acompañados del mensaje: "Antes de continuar lee los [nombre de aviso] y [nombre de aviso]. Al continuar la conversación mandando cualquier mensaje en este canal de comunicación se interpreta como una confirmación de tu aprobación sobre el apartado legal y uso de tus datos proporcionados".
3. La Persona interesada inicia la interacción con el Bot, lo que se interpreta como aceptación tácita de cualquier aviso o acuerdo presentado.
4. El Sistema registra el consentimiento.
5. El Sistema habilita la continuidad de la interacción con el Bot.

## Flujos alternos

### A1. Rechazo del aviso de privacidad

1. En el paso 3, la Persona interesada rechaza cualquier aviso o acuerdo presentado al no continuar con la interacción.
2. El sistema deja el chat en "hold" sin guardar información de ningún tipo.
3. El flujo finaliza.

## Flujos de excepción

### E1. Error en el registro de consentimiento

1. En el paso 4, ocurre un error al registrar el consentimiento.
2. El Sistema informa al usuario sobre la falla.
3. El Sistema continúa con la conversación y en la siguiente solicitud intenta registrar nuevamente el consentimiento.
4. Se registra el error en logs.

## Reglas de negocio relacionadas

- `RN-COM-PRIV-01`
- `RN-COM-PRIV-02`
- `RN-COM-PRIV-03`

Referencia:

- `docs/analisis/reglas de negocio/COM/catalogo-rn-com.md`

## Datos relevantes

### Entradas

- Cualquier tipo de mensaje o interacción en el canal de comunicación por parte de la Persona interesada.

### Salidas

- Estado de consentimiento (aceptado / rechazado)
- Registro en sistema

## Diagramas relacionados

- BPMN-COM-004

## Observaciones

- Este caso de uso es obligatorio antes de cualquier flujo de captura de datos o calificación.
- Debe ejecutarse una sola vez al inicio de la conversación a traves de cualquier canal de comunicación, no es necesario repetirlo en cada interacción o etapa del proceso comercial.

## Trazabilidad

- RF: RF-COM-07
- BPMN: BPMN-COM-004
- DDR: DDR-01

[RF-COM-07]: /docs/analisis/requerimientos/funcionales/COM/RF-COM-07%20Informe%20de%20privacidad%20al%20usuario.md
[CU-COM-003 Gestión de bancos de contexto]: /docs/analisis/modelos%20del%20problema/casos%20de%20uso/COM/CU-COM-003%20Gestion%20de%20bancos%20de%20contexto.md
[nombre de aviso]: /docs/analisis/modelos%20del%20problema/casos%20de%20uso/COM/CU-COM-004%20Presentación%20de%20avisos%20legales%20y%20registro%20de%20consentimiento%20tácito.md "Nombre del aviso legal obtenido del banco de contexto"
