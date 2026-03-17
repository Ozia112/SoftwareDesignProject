# CU-EVT-002 Gestión de cancelación

## Metadatos

- ID: CU-EVT-002
- Dominio: EVT
- Nombre: Gestión de cancelación
- Estado: Borrador
- Versión: v0.1
- Fecha de creación: 2026-03-11
- Última actualización: 2026-03-11
- Responsable: Maximiliano Carrillo Alvarado
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

Debe permitir al administrador gestionar las cancelaciones de una inscripción ya confirmada antes del inicio del evento en cuestión, además, debe actualizar la cola de espera y notificar al siguiente en la lista para que pueda inscribirse al curso actual

## Alcance

Modulo de gestión de inscripción del sistema

## RF relacionados

- RF-EVT-001
- RF-EVT-003
- RF-EVT-005

## Actores

### Actor principal

- Administrador quien será el que haga los cambios

### Actores secundarios

- Sistema de notificaciones
- Base de datos
- Lead

## Disparador

El administrador hace cambios en las inscripciones de un evento que no ha iniciado

## Precondiciones

- Existe una inscripción para el evento (ya sea que solo haya sido reservada en espera de pago o ya confirmada)
- Es antes que el evento inicie

## Postcondiciones

### En éxito

- Debe incrementar en 1 el cupo disponible en la base de datos
- Si hay lista de espera el sistema debe notificar al siguiente usatio en la cola [RF-EVT-03]
- Debe quedar registrado el nombre del administrador quien haya hecho la cancelación

### En fallo

- La inscripción permanece sin cambios
- La base de datos permanece sin cambios
- Se registra en los logs el intento de cancelación

## Flujo principal

1. El administrador desea cancelar una inscripción activa de un evento

2. El sistema debe verificar la disponibilidad del evneto [RF-EVT-001].

3. El sistema le permite al administrador actualizar el estado de la inscripción

4. La base de datos debe sumar en 1 el cupo disponible

5. El sistema verifica si hay cola de espera

6. El sistema notifica a los leads en la cola de espera [RF-EVT-003]

7. Queda registrado el nombre del administrador quien hizo la cancelación

## Flujos alternos

### A1. No existe cola de espera

1. En el paso 5, si el sistema no encuentra una cola de espera
2. El flujo debe continuar directamente en el paso 7

### A2. El evento ya inicio

1. En el paso 2 si el evento ya esta iniciado
2. El sistema debe notificar al administrador que no se puede hacer cambios de un evento ya iniciado
3. Se registra el nombre del administrador en los logs con el intento fallido de cancelación
4. El flujo termina

## Flujos de excepción

### E1. Falla en el envio de notificación de la lista de espera

1. En el paso 6, si el servicio de notificación no responde o devuelve error
2. El sistema notifica al administrador que se ha hecho la cancelación y se ha liberado el cupo pero que no ha funcionado el servicio de notificación
3. El sistema registra el incidente en los logs
4. El sistema deja la notificación como pendiente para que se haga automaticamente (opcional, hay que redefinir como hacer esto a futuro)
5. finaliza el flujo

### E2. No se pudo cancelar la inscripción

1. En el paso 1 o 3, el sistema detecta que la inscripción no existe o ya está cancelada
2. El sistema rechaza la operación sin modificar cupo ni estados
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
