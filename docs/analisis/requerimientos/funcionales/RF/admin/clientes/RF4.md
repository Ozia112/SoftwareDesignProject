# RF4. El sistema debe permitir confirmar el pago total y fijar el cupo

## Descripción

El sistema debe permitir al usuario autorizado registrar la confirmación del pago total de un cliente y fijar el cupo correspondiente. El usuario autorizado debe validar la información del pago y actualizar el estado del cupo después de confirmar la operación.

## Historia de usuario

**Como** usuario autorizado para administrar clientes,
**Quiero** confirmar el pago total de un cliente y fijar su cupo,
**Para** formalizar su participación en el curso.

## Criterios de aceptación

- [ ] El sistema permite seleccionar un cliente con un cupo reservado.
- [ ] El sistema permite registrar la confirmación del pago total.
- [ ] El sistema valida que la información del pago sea válida.
- [ ] Si existe un error de validación, el sistema informa el problema y no fija el cupo.
- [ ] El sistema fija el cupo cuando el pago total se confirma correctamente.
- [ ] El sistema actualiza el estado del cliente y del cupo.
- [ ] El sistema confirma cuando la operación se realiza correctamente.
