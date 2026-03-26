# CU-EVT-003 Sistema de inscripción

## Metadatos

- ID: CU-EVT-003
- Dominio: EVT
- Nombre: Sistema de inscripción
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-16
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-12
- PR relacionado: #XX

## Objetivo

El sistema debe apoyar al operador humano que trata con el Prospecto evitando mal funcionamiento como sobre inscribir a un evento con un cupo lleno y evitar errores humanos como inscribir alguien cuando un evento ya ha iniciado/finalizado

## Alcance

Sistema de gestión de inscripciones - subsistema de registro de Prospectos en eventos. Aplica al proceso de inscripción de Prospectos interesados a eventos específicos, con validaciones de disponibilidad, bloqueos temporales de cupos y confirmación de pago.

## RF relacionados

- RF-EVT-01
- RF-EVT-02
- RF-EVT-03
- RF-EVT-04
- RF-EVT-06
- RF-EVT-07

## Actores

### Actor principal

- Operador humano, quien estará en contacto constantemente con el Prospecto ayudandole a inscribirse

### Actores secundarios

- Banco de contexto (gestiona datos de eventos, inscripciones y lista de espera)
- Prospecto

## Disparador

Un operador humano quiere inscribir a un Prospecto interesado a un evento en especifico

## Precondiciones

- El Prospecto ya ha proporcionado sus datos personales
- Ya ha pasado por el proceso automatizado
- El Prospecto es conciente de la información del evento

## Postcondiciones

- El Prospecto queda inscrito en el banco de contexto

### En éxito

- El operador humano inscribe al Prospecto al evento y el sistema se encarga de que la inscripción sea permanente

### En fallo

- El sistema no puede inscribir al Prospecto y por ende no queda registrado en el banco de contexto, en caso de que si haya sido inscrito pero era una inscripción temporal el sistema debe eliminarlo del banco de contexto y notificar a los demás Leads [CU-EVT-002]
0
## Flujo principal

1. El operador humano inicia la inscripción del Prospecto
2. El sistema debe verificar que el evento este disponible [RF-EVT-01]
3. El sistema reserva la vacante [RF-EVT-02]
4. El operador humano agrega la información personal del Prospecto al banco de contexto
5. El debe bloquear la vacante temporalmente [RF-EVT-02]
6. El sistema notifica al operador humano que la inscripción ha sido exitosa
7. El operador humano le informa al Prospecto que se ha quedado registrado y espera la confirmación de su pago en un periodo de tiempo

## Flujos alternos

### A1. El Prospecto no paga a tiempo

1. El sistema detecta que el Prospecto no ha hecho el pago correspondiente (información dada por el operador humano)
2. El sistema debe verificar la inscripción temporal [RF-EVT-02]
3. El sistema debe quitar la información del Prospecto en el evento del banco de contexto y aumentar en 1 el cupo del evento
4. El sistema debe notificar a la lista de espera [RF-EVT-03]
5. El flujo termina

### A2. El Prospecto paga a tiempo

1. El sistema detecta que el Prospecto ha hecho el pago correspondiente
2. El sistema debe verificar la inscripción temporal
3. El sistema debe volver permanente la inscripción [RF-EVT-04]
4. El flujo acaba

### A3. El evento ya ha iniciado

1. El sistema verifica la disponibilidad del evento [RF-EVT-01]
2. Al evento ya ha avanzado más de lo permitido para las inscripciones
3. El sistema debe bloquear las inscripciones del evento en cuestión [RF-EVT-06]
4. El sistema debe cancelar las inscripciones temporales [RF-EVT-04]
5. Si quedan inscripciones temporales pasa al flujo A2, caso contrario el flujo termina

## Flujos de excepción

### E1. El evento está lleno

1. En el paso 2, si el evento está lleno
2. El sistema detiene y rechaza la inscripción
3. El sistema notifica al operador humano que se ha llenado el evento
4. El operador humano debe preguntarle al Prospecto si desea que lo pongan en la lista de espera
5. Si el Prospecto acepta se le agrega [RF-EVT-07], caso contrario no se le agrega
6. El flujo termina

### E2. Falla la inscripción/registro de datos

1. En el paso 4 cuando el operador humano trata de agregar la información esta falla
2. El sistema debe notificar al operador humano y borrar los datos que se hayan podido registrar para liberar la vacante
3. El sistema debe permitir al operador humano reintentar la inscripción
4. El sistema regresa al paso 1 si el agente lo vuelve a intentar, caso contrario el flujo acaba
