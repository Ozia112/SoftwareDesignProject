# CU-EVT-002 Gestión de cancelación

## Metadatos

- ID: CU-EVT-002
- Dominio: EVT
- Nombre: Gestión de cancelación
- Estado: Borrador
- Versión: v0.2
- Fecha de creación: 2026-03-11
- Última actualización: 2026-03-25
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-12
- PR relacionado: #XX

## Objetivo

Debe permitir al operador administrativo gestionar las cancelaciones de una inscripción ya confirmada antes del inicio del evento en cuestión, además, debe actualizar la lista de espera y notificar al siguiente en la lista para que pueda inscribirse al curso actual

## Alcance

Modulo de gestión de inscripción del sistema

## RF relacionados

- RF-EVT-001
- RF-EVT-003
- RF-EVT-005

## Actores

### Actor principal

- Operador administrativo quien será el que haga los cambios

### Actores secundarios

- Sistema de notificaciones
- Banco de contexto (gestiona inscripciones, cupos y lista de espera)
- Personas interesadas

## Disparador

El operador administrativo hace cambios en las inscripciones de un evento que no ha iniciado

## Precondiciones

- Existe una inscripción para el evento (ya sea que solo haya sido reservada en espera de pago o ya confirmada)
- Es antes que el evento inicie

## Postcondiciones

### En éxito

- Debe incrementar en 1 el cupo disponible en el banco de contexto
- Si hay lista de espera el sistema debe notificar al siguiente usuario en la lista de espera [RF-EVT-03]
- Debe quedar registrado el nombre del operador administrativo quien haya hecho la cancelación

### En fallo

- La inscripción permanece sin cambios
- El banco de contexto permanece sin cambios
- Se registra en los logs el intento de cancelación

## Flujo principal

1. El operador administrativo desea cancelar una inscripción activa de un evento

2. El sistema debe verificar la disponibilidad del evneto [RF-EVT-001].

3. El sistema le permite al operador administrativo actualizar el estado de la inscripción

4. El banco de contexto debe sumar en 1 el cupo disponible

5. El sistema verifica si hay lista de espera

6. El sistema notifica a los MQL en la lista de espera [RF-EVT-003]

7. Queda registrado el nombre del operador administrativo quien hizo la cancelación

## Flujos alternos

### A1. No existe lista de espera

1. En el paso 5, si el sistema no encuentra una lista de espera
2. El flujo debe continuar directamente en el paso 7

### A2. El evento ya inicio

1. En el paso 2 si el evento ya esta iniciado
2. El sistema debe notificar al operador administrativo que no se puede hacer cambios de un evento ya iniciado
3. Se registra el nombre del operador administrativo en los logs con el intento fallido de cancelación
4. El flujo termina

## Flujos de excepción

### E1. Falla en el envio de notificación de la lista de espera

1. En el paso 6, si el servicio de notificación no responde o devuelve error
2. El sistema notifica al operador administrativo que se ha hecho la cancelación y se ha liberado el cupo pero que no ha funcionado el servicio de notificación
3. El sistema registra el incidente en los logs
4. El sistema deja la notificación como pendiente para que se haga automaticamente (opcional, hay que redefinir como hacer esto a futuro)
5. finaliza el flujo

### E2. No se pudo cancelar la inscripción

1. En el paso 1 o 3, el sistema detecta que la inscripción no existe o ya está cancelada
2. El sistema rechaza la operación sin modificar cupo ni estados
3. El flujo termina
