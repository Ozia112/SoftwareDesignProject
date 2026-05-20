# Diagramas de Colaboración

Los diagramas de colaboración representan las relaciones estructurales entre los objetos que participan en los procesos del sistema, mostrando qué actores y componentes se comunican entre sí y mediante qué mensajes, sin enfocarse en el orden temporal. Complementan a los diagramas de secuencia al ofrecer una vista de la red de colaboraciones del sistema.

Se presentan dos diagramas que cubren el ciclo completo del proceso comercial y de gestión de cupo:

1. **Captación hasta cierre ganado** — muestra las colaboraciones desde la apertura de conversación hasta la confirmación de inscripción, incluyendo el registro del consentimiento tácito, las transiciones de etapa comercial, la reserva temporal de vacante y la validación de pago por el operador humano.
2. **Excepciones: lista de espera, liberación y extemporáneo** — modela las colaboraciones asociadas al registro en lista de espera, la liberación de vacante por cancelación y la notificación al siguiente elegible, así como la validación de inscripciones extemporáneas según el avance del evento.

Cada diagrama incluye una nota de trazabilidad con los casos de uso y requerimientos funcionales que cubre.

## 1. Colaboración principal: captación hasta cierre ganado

- Diagrama:

![diagrama de colaboracion 1](collaboration-diagram-01-captacion-hasta-cierre-ganado.svg)

- Codigo:

```plantuml
@startuml
title Colaboracion principal: captacion hasta cierre ganado
left to right direction

object "Cliente potencial" as Cliente
object Bot
object Sistema
object "Banco de contexto\ngeneral" as BCG
object "Banco de contexto\ndel evento" as BCE
object "Base de datos\noperativa" as DB
object "Temporizador de\nreserva" as Timer
object "Operador humano" as Operador

Cliente --> Bot : 1. Abrir conversacion
Bot --> Sistema : 2. Solicitar avisos legales
Sistema --> BCG : 3. Consultar avisos y TyC
Sistema --> Bot : 4. Entregar avisos
Cliente --> Bot : 5. Enviar primer mensaje
Bot --> Sistema : 6. Registrar consentimiento tacito
Sistema --> DB : 7. Persistir consentimiento
Bot --> Sistema : 8. Emitir `conversacion_iniciada`
Sistema --> DB : 9. Registrar Lead
Cliente --> Bot : 10. Compartir datos minimos
Bot --> Sistema : 11. Guardar datos de contacto
Sistema --> DB : 12. Actualizar registro unico
Bot --> Sistema : 13. Emitir `datos_de_contacto_completados`
Sistema --> DB : 14. Cambiar etapa a MQL y recalcular calificacion
Cliente --> Bot : 15. Preguntar por inscripcion o pago
Bot --> Sistema : 16. Emitir `pregunta_de_inscripcion_detectada`
Sistema --> DB : 17. Cambiar etapa a Prospecto
Sistema --> BCE : 18. Verificar cupo y tiempo de reserva
Bot --> Sistema : 19. Solicitar reserva
Sistema --> BCE : 20. Crear reserva temporal
Sistema --> Timer : 21. Programar vencimiento
Cliente --> Bot : 22. Enviar comprobante o aviso de pago
Bot --> Sistema : 23. Emitir `confirmacion_de_pago_pendiente`
Sistema --> Operador : 24. Escalar conversacion (SQL)
Operador --> Sistema : 25. Validar comprobante
Sistema --> Timer : 26. Cancelar vencimiento
Sistema --> BCE : 27. Confirmar vacante e inscripcion
Sistema --> DB : 28. Registrar cierre ganado y auditoria
Operador --> Cliente : 29. Confirmar inscripcion

note bottom
Corresponde a los diagramas de secuencia 1 y 2.
Trazabilidad principal: CU-COM-001, CU-COM-004, CU-COM-005, CU-EVT-003.
end note
@enduml
```

## 2. Colaboración de excepciones: lista de espera, liberación y extemporáneo

- Diagrama:

![diagrama de colaboracion 2](collaboration-diagram-02-colaboracion-de-excepciones.svg)

- Codigo:

```plantuml
@startuml
title Colaboracion de excepciones: lista de espera, liberacion y extemporaneo
left to right direction

object "Prospecto" as Prospecto
object Bot
object Sistema
object "Banco de contexto\ndel evento" as BCE
object "Operador humano" as Operador

Prospecto --> Bot : 1. Intentar inscribirse en evento lleno
Bot --> Prospecto : 2. Ofrecer lista de espera
Prospecto --> Bot : 3. Aceptar registro
Bot --> Sistema : 4. Solicitar alta en lista de espera
Sistema --> BCE : 5. Validar etapa, duplicados y prioridad
Sistema --> BCE : 6. Registrar prospecto en lista
Bot --> Prospecto : 7. Confirmar posicion en lista

Operador --> Sistema : 8. Cancelar inscripcion confirmada
Sistema --> BCE : 9. Liberar vacante y actualizar cupo
Sistema --> BCE : 10. Registrar causa de liberacion
Sistema --> BCE : 11. Seleccionar siguiente elegible
Sistema --> Bot : 12. Ordenar notificacion
Bot --> Prospecto : 13. Avisar vacante disponible

Prospecto --> Bot : 14. Solicitar inscripcion tardia
Bot --> Sistema : 15. Consultar avance del evento
Sistema --> BCE : 16. Obtener sesiones y umbral configurado
Sistema --> Bot : 17. Permitir o bloquear flujo extemporaneo
Bot --> Prospecto : 18. Informar resultado

note bottom
Corresponde a los diagramas de secuencia 3 y 4.
Trazabilidad principal: CU-EVT-001, CU-EVT-002, CU-EVT-003, RF-EVT-03, RF-EVT-05, RF-EVT-06.
end note
@enduml
```
