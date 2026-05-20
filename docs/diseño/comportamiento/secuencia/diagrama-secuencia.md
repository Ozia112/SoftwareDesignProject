# Diagramas de Secuencia

Los diagramas de secuencia modelan las interacciones entre los actores del sistema a lo largo del tiempo, mostrando el orden en que ocurren los mensajes dentro de cada proceso. Se organizan en cuatro diagramas que cubren el ciclo completo del proceso comercial:

1. **Captación, consentimiento y transición a Prospecto** — cubre el inicio de la conversación, el registro del consentimiento tácito, la recopilación de datos de contacto y la transición de etapa desde Lead hasta Prospecto, incluyendo la verificación de cupo previa a la inscripción.
2. **Inscripción, reserva temporal, SQL y confirmación** — modela la reserva temporal de vacante, el control de vencimiento por temporizador, el escalamiento a operador humano en etapa SQL y los flujos de confirmación o rechazo de pago.
3. **Lista de espera y notificación por liberación de vacante** — describe el registro en lista de espera para eventos sin cupo disponible, el proceso de liberación de vacante y la notificación al siguiente Prospecto elegible.
4. **Cancelación pre-inicio e inscripción extemporánea** — cubre la cancelación de una inscripción confirmada antes del inicio del evento y la validación del avance del evento para permitir o bloquear inscripciones tardías.

En todos los diagramas se distingue entre `vacante` (lugar individual dentro del evento) y `cupo` (capacidad total del evento), de acuerdo con las definiciones establecidas en el glosario del sistema.

## 1. Captación, consentimiento y transición a Prospecto

- Diagrama:

![diagrama de secuencia 1](sequence-diagram-01-captacion-consentimiento-y-transicion-a-prospecto.svg)

- Codigo:

```plantuml
@startuml
title Captacion, consentimiento y transicion comercial inicial
autonumber

actor "Cliente potencial" as Cliente
participant Bot
participant Sistema
database "Banco de contexto general" as BCG
database "Base de datos operativa" as DB

Cliente -> Bot: Abrir conversacion
Bot -> Sistema: Solicitar avisos legales
Sistema -> BCG: Consultar avisos y terminos vigentes
BCG --> Sistema: Avisos disponibles
Sistema --> Bot: Avisos + texto de consentimiento
Bot --> Cliente: Mostrar avisos y explicar consentimiento tacito

Cliente -> Bot: Enviar primer mensaje
Bot -> Sistema: Registrar consentimiento tacito
Sistema -> DB: Persistir consentimiento y auditoria

Bot -> Sistema: Emitir señal `conversacion_iniciada`
Sistema -> DB: Crear o actualizar persona interesada
Sistema -> DB: Registrar etapa = Lead

Bot --> Cliente: Solicitar datos minimos
Cliente -> Bot: Compartir nombre y telefono/correo
Bot -> Sistema: Validar y guardar datos de contacto
Sistema -> DB: Crear o actualizar registro unico

Bot -> Sistema: Emitir señal `datos_de_contacto_completados`
Sistema -> DB: Actualizar etapa = MQL
Sistema -> DB: Recalcular calificacion

Cliente -> Bot: Preguntar por inscripcion o metodos de pago
Bot -> Sistema: Emitir señal `pregunta_de_inscripcion_detectada`
Sistema -> DB: Evaluar transicion comercial
Sistema -> DB: Actualizar etapa = Prospecto
Sistema -> DB: Registrar historial de etapa

Sistema -> Sistema: Validar cupo antes de continuar a inscripcion
alt Hay cupo disponible
  Sistema --> Bot: Prospecto con vacante disponible
  Bot --> Cliente: Mostrar costo, instrucciones de pago y siguiente paso
else Evento lleno
  Sistema --> Bot: Evento lleno
  Bot --> Cliente: Ofrecer lista de espera o eventos similares
end

note right of Sistema
Alineado con:
CU-COM-004, CU-COM-005,
RF-COM-02, RF-COM-03,
RF-COM-07 y RF-EVT-01.
end note
@enduml
```

## 2. Inscripción, reserva temporal, SQL y confirmación

- Diagrama:

![diagrama de secuencia 2](sequence-diagram-02-inscripcion-reserva-temporal-sql-y-confirmacion.svg)

- Codigo:

```plantuml
@startuml
title Inscripcion, reserva temporal, SQL y confirmacion
autonumber

actor "Cliente potencial" as Cliente
participant Bot
participant Sistema
database "Banco de contexto del evento" as BCE
participant "Temporizador de reserva" as Timer
participant "Operador humano" as Operador

Cliente -> Bot: Solicitar inscripcion al evento
Bot -> Sistema: Verificar elegibilidad y vacante disponible
Sistema -> BCE: Consultar estado del evento,\nvacantes y tiempo de reserva

alt Evento disponible y con vacantes
  BCE --> Sistema: Vacante disponible + tiempo_reserva
  Sistema -> BCE: Crear reserva temporal de vacante
  Sistema -> Timer: Programar vencimiento de reserva

  note right of BCE
  Mientras la reserva esta activa:
  - la vacante no puede ser tomada por otra persona
  - el cupo visible disminuye
  end note

  Sistema --> Bot: Reserva creada con limite de tiempo
  Bot --> Cliente: Compartir instrucciones de pago y tiempo limite

  alt Cliente envia comprobante antes del vencimiento
    Cliente -> Bot: "Ya hice el pago" + comprobante
    Bot -> Sistema: Emitir señal `confirmacion_de_pago_pendiente`
    Sistema -> Sistema: Actualizar etapa comercial = SQL
    Sistema -> Operador: Escalar conversacion por CU-COM-001

    alt Operador disponible
      Operador -> Sistema: Validar comprobante
      alt Pago valido dentro del plazo
        Sistema -> Timer: Cancelar vencimiento
        Sistema -> BCE: Confirmar vacante e inscripcion
        Sistema -> BCE: Registrar auditoria de confirmacion
        Sistema --> Operador: Confirmacion exitosa
        Operador --> Cliente: Inscripcion confirmada
      else Pago invalido o no verificable
        Sistema -> BCE: Liberar reserva temporal
        Sistema -> BCE: Registrar causa e historial
        Sistema --> Operador: Pago rechazado
        Operador --> Cliente: Pago no confirmado; vacante liberada
      end
    else No hay operador disponible
      Sistema --> Bot: Encolar conversacion humana
      Bot --> Cliente: Informar espera para validacion humana
    end

  else Reserva expira sin confirmacion
    Timer -> Sistema: Evento `reserva_expirada`
    Sistema -> BCE: Liberar reserva temporal
    Sistema -> BCE: Registrar historial de expiracion
    Sistema --> Bot: Reserva vencida
    Bot --> Cliente: Informar vencimiento y opciones para reintentar
  end

else Evento lleno o no elegible
  Sistema --> Bot: Inscripcion no disponible
  Bot --> Cliente: Ofrecer lista de espera o eventos similares
end

note right of Sistema
Alineado con:
CU-COM-001, CU-COM-005, CU-EVT-003,
RF-EVT-01, RF-EVT-02 y RF-EVT-04.

La transicion a SQL ocurre unicamente
con la señal `confirmacion_de_pago_pendiente`.
end note
@enduml
```

## 3. Lista de espera y notificación por liberación de vacante

- Diagrama:

![diagrama de secuencia 3](sequence-diagram-03-lista-de-espera-y-notificacion-por-liberacion-de-vacante.svg)

- Codigo:

```plantuml
@startuml
title Lista de espera y notificacion por liberacion de vacante
autonumber

actor "Prospecto" as Prospecto
participant Bot
participant Sistema
database "Banco de contexto del evento" as BCE

Prospecto -> Bot: Intentar inscribirse en evento lleno
Bot --> Prospecto: Ofrecer registro en lista de espera
Prospecto -> Bot: Aceptar registro

Bot -> Sistema: Solicitar alta en lista de espera
Sistema -> Sistema: Verificar etapa comercial = Prospecto
Sistema -> BCE: Validar que no exista registro duplicado
Sistema -> BCE: Consultar calificacion y orden actual
Sistema -> BCE: Registrar prospecto con prioridad\n(calificacion desc, FIFO en empate)
Sistema --> Bot: Confirmar posicion en lista
Bot --> Prospecto: Informar registro exitoso y posicion

== Liberacion de vacante ==

Sistema -> BCE: Registrar liberacion con evento,\nfecha, causa y correlacion
Sistema -> BCE: Seleccionar N elegibles para N vacantes

loop Por cada vacante liberada
  Sistema --> Bot: Solicitar notificacion al siguiente elegible
  Bot --> Prospecto: Avisar que existe una vacante disponible

  alt El prospecto responde a tiempo
    Prospecto -> Bot: Solicitar continuar inscripcion
    Bot -> Sistema: Reactivar flujo de inscripcion
  else No hay respuesta
    Sistema -> BCE: Registrar no respuesta
    Sistema -> BCE: Seleccionar siguiente elegible
  end
end

note right of Sistema
Alineado con:
CU-EVT-001, CU-EVT-002,
RF-EVT-03 y RF-EVT-06.

Solo Prospecto puede entrar a lista de espera.
end note
@enduml
```

## 4. Cancelación pre-inicio e inscripción extemporánea

- Diagrama:

![diagrama de secuencia 4](sequence-diagram-04-cancelacion-pre-inicio-e-inscripcion-extemporanea.svg)

- Codigo:

```plantuml
@startuml
title Cancelacion pre-inicio e inscripcion extemporanea
autonumber

actor "Operador humano" as Operador
actor "Cliente potencial" as Cliente
participant Bot
participant Sistema
database "Banco de contexto del evento" as BCE

group Cancelacion pre-inicio
  Operador -> Sistema: Solicitar cancelacion de inscripcion confirmada
  Sistema -> BCE: Verificar que el evento no haya iniciado

  alt Evento no iniciado
    Sistema -> BCE: Cambiar estado a cancelada
    Sistema -> BCE: Liberar vacante confirmada
    Sistema -> BCE: Actualizar cupo disponible
    Sistema -> BCE: Registrar usuario, fecha y motivo
    Sistema -> Sistema: Disparar notificacion a lista de espera si aplica
    Sistema --> Operador: Cancelacion completada
  else Evento ya iniciado
    Sistema --> Operador: Rechazar cancelacion segun CU-EVT-002
  end
end

== Inscripcion extemporanea ==

Cliente -> Bot: Solicitar inscripcion tardia
Bot -> Sistema: Consultar avance del evento
Sistema -> BCE: Obtener sesiones realizadas,\nsesiones totales y umbral configurado

alt Avance <= umbral permitido
  Sistema --> Bot: Permitir flujo extemporaneo
  Bot --> Cliente: Continuar a validacion de vacante y reserva
else Avance > umbral permitido
  Sistema --> Bot: Bloquear inscripcion,\ncancelacion y reembolso extemporaneos
  Bot --> Cliente: Informar politica del evento
end

note right of Sistema
Alineado con:
CU-EVT-002, CU-EVT-003,
RF-EVT-04 y RF-EVT-05.
end note
@enduml
```
