# CU-EVT-001 Registro en lista de espera

## Metadatos

- ID: CU-EVT-001
- Dominio: EVT
- Nombre: Registro en lista de espera
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-11
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-12
- PR relacionado: #XX

## Objetivo

Permitir que un Lead quede registrado en una lista de espera si los cupos de un evento se agotan para ser avisado si se libera una vacante

## Alcance

Sistema de gestión de eventos - subsistema de lista de espera. Aplica cuando un evento ha agotado sus cupos disponibles y permite que Leads interesados se registren para ser notificados en caso de liberación de vacantes.

## RF relacionados

- RF-EVT-01
- RF-EVT-07

## Actores

### Actor principal

- Lead quien pedirá el cupo en el evento

### Actores secundarios

- Banco de contexto (gestiona datos de eventos, cupos y lista de espera)
- Bot será quien tenga contacto directo con el Lead

## Disparador

El Lead interesado solicita inscribirse a un
Evento y El Sistema detecta que el cupo esta lleno

## Precondiciones

- El evento existe y esta activo
- El evento esta lleno

## Postcondiciones

### En éxito

- El Lead queda registrado a la lista de espera del evento
- No hay duplicados de un mismo Lead esperando el mismo evento

### En fallo

- El sistema no puede agregar al Lead en la lista de espera

## Flujo principal

1. El Lead le pide al bot inscribirse a un evento

2. Antes de contactar con un operador humano para su inscripción se checa el cupo en el banco de contexto del evento en cuestión [RF-EVT-001]

3. El sistema detecta que el cupo del evento esta lleno y le envia una notificación al bot

4. El bot debe avisar al Lead que no queda cupo para el evento

5. El bot debe preguntarle al Lead si esta interesado en dar sus datos para dejarlo en lista de espera en caso de que una vacante se desocupe

6. Si el Lead esta interesado este da sus datos al bot, el bot debe checar que no este registrado el número y el nombre del Lead en la lista de espera junto a la información del evento [RF-EVT-07]

7. El bot debe informar a el Lead su posición en la lista de espera y el que el proceso continuara a futuro

## Flujos alternos

### A1. El Lead no quiere dar sus datos

1.El Lead no esta de acuerdo con dar sus datos para la lista de espera
2. El bot no puede agregarlo a la lista de espera, debe notificar al Lead que no puede proseguir el proceso sin su información
3. Si el Lead decide no continuar el flujo puede continuar si el Lead quiere ir a otro evento o terminar en caso contrario

### A2. El Lead ya se encuentra en la lista de espera

1. En el paso 6, si el Lead ya se encuentra en la lista de espera
2. El bot notifica al Lead que ya se encontraba en la lista de espera y le debe notificar su posición actual
3. El flujo termina

## Flujos de excepción

### E1. No existe el evento

1. En el paso 2 no encuentra el evento del que esta interesado el Lead
2. El flujo principal se detiene y le notifica al Lead que no existe el evento
3. El flujo termina

### E2. Evento ya acabado

1. En el paso 2 el evento esta marcado como no disponible
2. El flujo principal se detiene y le notifica al Lead que el evento ya ha concluido
3. El flujo termina
