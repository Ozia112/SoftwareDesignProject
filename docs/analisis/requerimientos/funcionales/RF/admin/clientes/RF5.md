# RF5. El sistema debe permitir cancelar el cupo de clientes ausentes

## Descripción

El sistema debe permitir al usuario autorizado cancelar el cupo asignado a un cliente que no se haya presentado. Antes de realizar la cancelación, el sistema debe validar que el cliente y el cupo correspondan a una ausencia registrada o confirmada.

## Historia de usuario

**Como** usuario autorizado para administrar clientes,
**Quiero** cancelar el cupo de un cliente ausente,
**Para** actualizar su registro y liberar la disponibilidad correspondiente.

## Criterios de aceptación

- [ ] El sistema permite consultar los clientes con cupo asignado.
- [ ] El sistema permite seleccionar un cliente ausente.
- [ ] El sistema solicita confirmación antes de cancelar el cupo.
- [ ] El sistema valida que el cliente tenga un cupo asignado.
- [ ] El sistema cancela el cupo correctamente.
- [ ] El sistema actualiza la disponibilidad después de la cancelación.
- [ ] El sistema confirma cuando el cupo se cancela correctamente.
