# Revisión: Casos de uso vs. Definiciones del Glosario

## Contradicción 1 — Momento del aviso de privacidad (Mayor)

**Glosario (MQL):**
> *"Las personas interesadas que llegan a esta etapa obligatoriamente deben ser notificadas de las políticas de privacidad… antes de ser atendidas por el bot o por un operador humano."*

El glosario lo sitúa en el ingreso a **etapa MQL**.

- **CU-COM-004** (disparador): *"La Persona interesada inicia una conversación"* → lo solicita desde el primer mensaje, cuando la persona aún es **Lead**, antes de calificar como MQL.
- **CU-COM-002** (paso 8): lo solicita después de que la persona *"muestra interés en inscribirse"* (paso 7) → esto apunta a la transición Lead→MQL o MQL→Prospecto, que no coincide con CU-COM-004.

Los dos casos de uso no son consistentes entre sí, y ninguno está perfectamente alineado con el glosario. Si CU-COM-004 prevalece (aviso al inicio), la regla del glosario queda superada sin explicación. Si CU-COM-002 prevalece, CU-COM-004 describe un disparador incorrecto.

---

## Contradicción 2 — Criterio de orden en la lista de espera (Mayor)

**Glosario (Lista de espera):**
> *"La lista mantiene un orden basado en el **puntaje** de los interesados. En caso de empate, se aplica **FIFO** como criterio de desempate."*

Orden primario = puntaje. FIFO = solo desempate.

**CU-EVT-001** (Reglas de negocio):
> *"La lista debe mantener orden determinístico (**FIFO por defecto**)"*

El caso de uso invierte la lógica: pone FIFO como el criterio principal y la prioridad por puntaje como opcional (*"o prioridad configurada"*). Esto contradice directamente el glosario.

---

## Contradicción 3 — Puntaje y avance de etapa comercial (Moderada)

**Glosario (Puntaje de interesados):**
> *"El puntaje es independiente de la etapa comercial. **No determina por sí solo el avance de etapa**, sino que influye exclusivamente en la priorización operativa."*

**CU-COM-005** (paso 7):
> *"El Sistema actualiza o asigna la **etapa comercial** correspondiente"* — ejecutado inmediatamente después de asignar la calificación.

**RN-COM-02-02** del mismo CU:
> *"La calificación puede influir en la actualización de la etapa"*

Esta regla de negocio interna también contradice al glosario. Si la calificación/puntaje "puede influir en la actualización de la etapa", se está atribuyendo al puntaje un poder sobre el avance de etapa que el glosario niega explícitamente. El avance de etapa según el glosario se basa en **criterios observables** (acciones, información entregada, decisiones del cliente), no en la puntuación.

---

## Regla incumplida — CU-COM-002 ofrece lista de espera sin validar etapa Prospecto

**Glosario (Lista de espera):**
> *"Solo las personas en etapa **Prospecto** pueden ingresar a la lista de espera."*

**CU-COM-002 (E1, paso 3):** El Bot ofrece la lista de espera cuando el Sistema detecta cupo=0 en el **paso 3** del flujo, que ocurre justo al inicio de la conversación (la persona acaba de preguntar por el evento). En ese punto la persona sigue siendo un **Lead**, sin datos registrados, sin pasar por MQL, sin solicitar métodos de pago.

CU-EVT-001 sí incluye la precondición correcta (*"La Persona interesada se encuentra en etapa comercial Prospecto"*), pero el flujo de CU-COM-002 que invoca a CU-EVT-001 no valida esa restricción antes de ofertar la lista. Esto crea una ruta donde un Lead podría intentar ingresar a lista de espera.

---

## Observación — CU-COM-001 no vincula el escalamiento a ninguna etapa

El flujo principal (paso 4) dice *"el bot llega al punto donde no puede continuar la conversación"* sin ninguna referencia a la etapa comercial. El glosario define claramente cuándo debería ocurrir el escalamiento por naturaleza de la etapa:

- **Prospecto**: se comparte info de pagos → típicamente requiere operador.
- **SQL**: confirmación de pago → requiere operador obligatorio.

El caso de uso no captura esta lógica y deja el disparador del escalamiento como un criterio ambiguo del bot, sin anclar la regla en las etapas definidas.

---

## Resumen de hallazgos

| #   | Caso de uso                          | Problema                                                                                       | Severidad |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------- | --------- |
| 1   | CU-COM-004 vs CU-COM-002 vs Glosario | Momento del aviso de privacidad inconsistente entre CUs y con el glosario (MQL)                | Alta      |
| 2   | CU-EVT-001                           | Orden de lista de espera invierte la lógica: FIFO como primario, puntaje como opcional         | Alta      |
| 3   | CU-COM-005                           | El puntaje/calificación actualiza directamente la etapa comercial, lo cual el glosario prohíbe | Media     |
| 4   | CU-COM-002 E1                        | Ofrece lista de espera sin validar que la persona sea Prospecto                                | Media     |
| 5   | CU-COM-001                           | Escalamiento a operador humano no está anclado a las etapas comerciales                        | Baja      |
