# CU-EVT-003 Sistema de inscripción

## Metadatos

- ID: CU-EVT-003
- Dominio: EVT
- Nombre: Sistema de inscripción
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-03-16
- Última actualización: 2026-03-16
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

El sistema debe apoyar al agente humano que trata con el lead evitando mal funcionamiento como sobre inscribir a un evento con un cupo lleno y evitar errores humanos como inscribir alguien cuando un evento ya ha iniciado/finalizado

## Alcance

Indicar el límite del sistema o subsistema al que aplica este caso de uso.

## RF relacionados

- RF-EVT-01
- RF-EVT-02
- RF-EVT-03
- RF-EVT-04
- RF-EVT-06

## Actores

### Actor principal

- Agente humano, quien estará en contacto constantemente con el lead ayudandole a inscribirse

### Actores secundarios

- Sistema de notificaciones
- Base de datos
- lead

## Disparador

Un agente humano quiere inscribir a un lead interesado a un evento en especifico

## Precondiciones

- El lead ya ha proporcionado sus datos personales
- Ya ha pasado por el proceso automatizado
- El lead es conciente de la información del evento

## Postcondiciones

- El lead queda inscrito en la base de datos

### En éxito

- El agente humano inscribe al lead al evento y el sistema se encarga de que la inscripción sea permanente

### En fallo

- El sistema no puede inscribir al lead y por ende no queda registrado en la base de datos, en caso de que si haya sido inscrito pero era una inscripción temporal el sistema debe eliminarlo de la base de datos y notificar a los demás interesados [CU-EVT-02]

## Flujo principal

1. El agente humano inicia la inscripción del lead
2. El sistema debe verificar que el evento este disponible [RF-EVT-01]
3. El sistema reserva la vacante [RF-EVT-02]
4. El agente humano agrega la información personal del lead a la base de datos
5. El debe bloquear la vacante temporalmente [RF-EVT-02]
6. El sistema notifica al agente humano que la inscripción ha sido exitosa
7. El agente humano le informa al lead que se ha quedado registrado y espera la confirmación de su pago en un periodo de tiempo

## Flujos alternos

### A1. El lead no paga a tiempo

1. El sistema detecta que el lead no ha hecho el pago correspondiente
2. El sistema debe verificar la inscripción temporal
3. El sistema debe quitar al lead de la base de datos
4. El sistema debe notificar a la cola de espera [RF-EVT-03]
5. El flujo termina

### A2. El lead paga a tiempo

1. El sistema detecta que el lead ha hecho el pago correspondiente
2. El sistema debe verificar la inscripción temporal
3. El sistema debe volver permanente la inscripción [RF-EVT-04]
4. El flujo acaba

### A3. El evento ya ha iniciado

1. El sistema verifica la disponibilidad del evento [RF-EVT-01]
2. Al evento ya ha avanzado más de lo permitido para las inscripciones
3. El sistema debe bloquear las inscripciones del evento en cuestion [RF-EVT-06]
4. El sistema debe cancelar las inscripciones termporales [RF-EVT-04]
5. Si quedan inscripciones temporales pasa al flujo A2, caso contrario el flujo termina

## Flujos de excepción

### E1. El evento esta lleno

1. En el paso 2, si el evento esta lleno
2. El sistema detiene y rechaza la inscripción
3. El sistema notifica al agente humano que se ha llenado el evento
4. El agente humano debe preguntarle al lead si desea que lo pongan en la cola de espera
5. Si el lead acepta se le agrega [RF-EVT-07], caso contrario no se le agrega
6. El flujo termina

### E2. Falla la inscripción/registro de datos

1. En el paso 4 cuando el agente humano trata de agregar la información esta falla
2. El sistema debe notificar al agente humano y borrar los datos que se hayan podido registrar para liberar la vacante
3. El sistema debe permitir al agente humano reintentar la inscripción
4. El sistema regresa al paso 1 si el agente lo vuelve a intentar, caso contrario el flujo acaba
