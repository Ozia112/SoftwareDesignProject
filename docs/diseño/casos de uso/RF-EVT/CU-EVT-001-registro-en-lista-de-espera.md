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
- Issue relacionado: PSD-15
- PR relacionado: #52

## Objetivo

Permitir que la Persona interesada se registre en la lista de espera de un Evento cuando el cupo esté lleno, para ser considerada cuando se libere una vacante.

## Alcance

Aplica al proceso de registro en lista de espera gestionado por el Sistema cuando un Evento no tiene cupo disponible.

## RF relacionados

- RF-EVT-01
- RF-EVT-07

## Actores

### Actor principal

- Persona interesada

### Actores secundarios

- Bot
- Sistema
- Base de datos

## Disparador

La Persona interesada intenta inscribirse a un Evento y el Sistema detecta que el cupo es 0.

## Precondiciones

- El Evento existe en el sistema
- El Evento está activo
- El cupo del Evento es 0
- La Persona interesada ya interactúa con el Bot

## Postcondiciones

### En éxito

- La Persona interesada queda registrada en la lista de espera
- Se mantiene un orden determinístico (FIFO o prioridad configurada)
- No existen duplicados para el mismo Evento

### En fallo

- No se registra a la Persona interesada en la lista de espera
- El sistema informa la causa

## Flujo principal

1. La Persona interesada solicita inscripción en un Evento  
2. El Sistema valida la disponibilidad de cupo [RF-EVT-01]  
3. El Sistema detecta que el cupo es 0  
4. El Bot informa que el Evento está lleno  
5. El Bot ofrece registrarse en lista de espera  
6. La Persona interesada acepta  
7. El Sistema valida que no exista un registro previo en la lista [RF-EVT-07]  
8. El Sistema registra a la Persona interesada en la lista de espera  
9. El Sistema asigna una posición según el orden definido  
10. El Bot informa la posición en la lista y el seguimiento futuro  

## Flujos alternos

### A1. Rechazo de registro

1. La Persona interesada rechaza ingresar a la lista  
2. El Bot ofrece otras opciones (otros eventos o finalizar)  
3. El flujo finaliza  

### A2. Registro duplicado

1. El Sistema detecta que la Persona interesada ya está en la lista  
2. El Bot informa su posición actual  
3. El flujo finaliza  

## Flujos de excepción

### E1. Evento inexistente

1. El Sistema no encuentra el Evento  
2. El Bot informa que no existe  
3. El flujo finaliza  

### E2. Evento no disponible

1. El Evento está inactivo o finalizado  
2. El Bot informa que no está disponible  
3. El flujo finaliza  

### E3. Error en registro

1. Ocurre un error al registrar en la lista  
2. El Sistema notifica al Bot  
3. El Bot informa a la Persona interesada  
4. El flujo finaliza  

## Reglas de negocio / restricciones

- Una Persona interesada no puede registrarse más de una vez por Evento  
- La lista debe mantener orden determinístico (FIFO por defecto)  
- El registro requiere datos mínimos de contacto  

## Datos relevantes

### Entradas
- Solicitud de inscripción
- Datos de la Persona interesada

### Salidas
- Confirmación de registro en lista de espera
- Posición en la lista

## Diagramas relacionados

- BPMN-EVT-001
- ../resources/cu-evt-001.png

## Observaciones

- Puede integrarse con notificaciones automáticas (RF-EVT-03)
- Puede integrarse con reservas prioritarias futuras

## Trazabilidad

- RF: RF-EVT-01, RF-EVT-07
- DDR: DDR-01
