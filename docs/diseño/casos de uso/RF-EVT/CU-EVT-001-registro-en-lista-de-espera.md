# CU-EVT-001 Registro en lista de espera

## Metadatos

- ID: CU-EVT-001
- Dominio: EVT
- Nombre: Registro en lista de espera
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-03-11
- Última actualización: 2026-03-11
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

Permitir que un lead quede registrado en una lista de espera si los cupos de un evento se agotan para ser avisados si se libera una vacante

## Alcance

Indicar el límite del sistema o subsistema al que aplica este caso de uso.

## RF relacionados

- RF-EVT-01
- RF-EVT-07

## Actores

### Actor principal

- Lead quien pedirá el cupo en el evento

### Actores secundarios

- Base de datos
- Bot será quien tenga contacto directo con el lead

## Disparador

El lead interesado solicita inscribirse a un
Evento y El Sistema detecta que el cupo esta lleno

## Precondiciones

- El evento existe y esta activo
- El evento esta lleno

## Postcondiciones

### En éxito

- La persona interesada queda registrada a la lista de espera del evento
- No hay duplicados de una misma persona esperando el mismo evento

### En fallo

- El sistema no puede agregar al lead en la lista de espera

## Flujo principal

1. El lead le pide al bot inscribirse a un evento

2. Antes de contactar con un agente humano para su inscripción se checa el cupo en la base de datos del evento en cuestión [RF-EVT-001]

3. El sistema detecta que el cupo del evento esta lleno y le envia una notificación al bot

4. El bot debe avisar al lead que no queda cupo para el evento

5. El bot debe preguntarle al lead si esta interesado en dar sus datos para dejarlo en lista de espera en caso de que una vacante se desocupe

6. Si el lead esta interesado este da sus datos al bot, el bot debe checar que no este registrado el número y el nombre del lead en la lista de espera junto a la información del evento [RF-EVT-07]

7. El bot debe informar a el lead su posición en la lista de espera y el que el proceso continuara a futuro

## Flujos alternos

### A1. El lead no quiere dar sus datos

1.El lead no esta de acuerdo con dar sus datos para la lista de espera
2. El bot no puede agregarlo a la lista de espera, debe notificar al lead que no puede proseguir el proceso sin su información
3. Si el lead decide no continuar el flujo puede continuar si el lead quiere ir a otro evento o terminar en caso contrario

### A2. El lead ya se encuentra en la lista de espera

1. En el paso 6, si el lead ya se encuentra en la lista de espera
2. El bot notifica al lead que ya se encontraba en la lista de espera y le debe notificar su posición actual
3. El flujo termina

## Flujos de excepción

### E1. No existe el evento

1. En el paso 2 no encuentra el evento del que esta interesado el lead
2. El flujo principal se detiene y le notifica al lead que no existe el evento
3. El flujo termina

### E2. Evento ya acabado

1. En el paso 2 el evento esta marcado como no disponible
2. El flujo principal se detiene y le notifica al lead que el evento ya ha concluido
3. El flujo termina

## Reglas de negocio / restricciones

- RN-XX: Regla aplicable
- Restricción de tiempo, cupo, privacidad, etc.

## Datos relevantes

### Entradas

- Dato 1
- Dato 2

### Salidas

- Resultado 1
- Resultado 2

## Diagramas relacionados

- BPMN-XXX-001
- ../resources/cu-xxx-nnn-01.png

## Observaciones

- Supuestos
- Dudas abiertas
- Notas para revisión

## Trazabilidad

- RF: RF-COM-002, RF-EVT-001
- BPMN: BPMN-CUPO-001
- DDR: DDR-01
- Evidencia académica / entrega: enlace si aplica
