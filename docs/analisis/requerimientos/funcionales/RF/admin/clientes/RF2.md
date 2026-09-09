# RF2. El sistema debe permitir gestionar la etapa comercial de los clientes

## Descripción

El sistema debe permitir al usuario autorizado consultar y modificar la etapa comercial de los clientes a partir de la etapa **Prospecto** y hasta completar el proceso en **Cierre ganado** o **Cierre perdido**. El usuario autorizado no interviene en las etapas **Lead** ni **MQL**, cuya gestión corresponde al flujo automatizado, en el caso de la estapa **Prospecto** únicamente interviene cuando se actualiza la lista de espera. Antes de guardar el cambio, el sistema debe validar que la nueva etapa sea válida y corresponda al avance del proceso comercial.

## Historia de usuario

**Como** usuario autorizado para administrar clientes,
**Quiero** gestionar la etapa comercial de un cliente,
**Para** mantener actualizado el seguimiento de su proceso comercial durante la atención humana.

## Criterios de aceptación

- [ ] El sistema permite al usuario autorizado consultar la etapa comercial actual de los clientes.
- [ ] El sistema no permite al usuario autorizado modificar las etapas Lead ni MQL, y en condiciones normales tampoco interviene directamente con la etapa prospecto.
- [ ] El sistema permite avanzar un cliente de Prospecto a SQL cuando corresponda.
- [ ] El sistema permite registrar el Cierre ganado cuando se confirma exitosamente el pago y la inscripción queda confirmada.
- [ ] El sistema permite registrar el Cierre perdido cuando no se confirma el pago o el cliente decide no continuar.
- [ ] El sistema valida que la etapa seleccionada sea válida y corresponda al estado del proceso comercial.
- [ ] Si existe un error de validación, el sistema informa el problema y no guarda el cambio.
- [ ] El sistema guarda la nueva etapa comercial correctamente junto con el resultado del cierre, cuando corresponda.
- [ ] El sistema confirma cuando la etapa se actualiza.
- [ ] La etapa actualizada se muestra en la información del cliente.
