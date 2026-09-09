# RF3. El sistema debe permitir reservar y liberar cupos para los clientes

## Descripción

El sistema debe permitir al usuario autorizado reservar un cupo para un cliente y liberar un cupo previamente reservado. El sistema debe validar la disponibilidad y el estado del cupo antes de realizar cada operación.

## Historia de usuario

**Como** usuario autorizado para administrar clientes,
**Quiero** reservar o liberar un cupo para un cliente,
**Para** mantener actualizada la disponibilidad del curso.

## Criterios de aceptación

- [ ] El sistema permite seleccionar un cliente y un curso para gestionar un cupo.
- [ ] El sistema permite reservar un cupo disponible para el cliente.
- [ ] El sistema valida que exista un cupo disponible antes de reservarlo.
- [ ] El sistema permite liberar un cupo reservado para el cliente.
- [ ] El sistema valida que el cupo pueda ser liberado antes de realizar la operación.
  - El otro cliente se encuentra en etapa de cierre perdido
  - El cliente confirmo su baja del curso (aún falta RF para esto)
- [ ] El sistema actualiza la disponibilidad después de cada operación.
- [ ] El sistema confirma cuando el cupo se reserva o se libera correctamente.
