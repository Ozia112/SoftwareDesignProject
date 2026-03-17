# Pipeline Operativo v2

> Objetivo: asegurar trazabilidad simple y estricta desde el trabajo semanal hasta la integración del repositorio, conservando el flujo Issue → Rama → PR y separando claramente **trabajo del proyecto**, **trazabilidad de juntas** y **cortes semanales/mensuales**.

---

## 1. Principios del flujo

1. El **Issue es la fuente de verdad**.
2. Toda contribución al repositorio se realiza mediante **Pull Request**.
3. Toda rama temporal nace desde `develop`.
4. `main` solo recibe integraciones de corte formal.
5. La nomenclatura de Issues, ramas y PRs debe ser estricta para preservar trazabilidad.
6. El proceso debe mantenerse simple y entendible para todos los integrantes.

---

## 2. Estrategia de integración

### 2.1 Ramas permanentes

* **`main`**: contiene entregas formales verificadas y consolidadas.
* **`develop`**: rama de integración del trabajo aprobado durante el ciclo activo.

### 2.2 Ramas temporales

Todas las ramas temporales:

* se crean desde `develop`,
* se usan para un solo Issue,
* se integran por PR hacia `develop`,
* se eliminan tras merge.

### 2.3 Cortes

#### Corte semanal

Es un corte operativo interno del equipo.

Incluye:

* actualización del estado real de los Issues y PRs,
* integración a `develop` de lo aprobado,
* consolidación del reporte semanal,
* revisión de pendientes, bloqueos y arrastre.

> El corte semanal no implica por sí mismo merge a `main` ni tag obligatorio.

#### Corte mensual

Es el corte formal de entrega.

Incluye:

* consolidación de cambios aprobados en `develop`,
* merge `develop → main`,
* creación de tag en `main`,
* preparación del paquete de entrega.

---

## 3. Tipos de Issue

Solo se manejan **3 tipos de Issue** para mantener el sistema simple.

### 3.1 PSD — trabajo real del proyecto

Representa trabajo concreto del proyecto: documentación, refinamiento, modelado, implementación, correcciones o mantenimiento.

**Formato:**
`PSD-NN [Tipo] Tema descriptivo`

**Tipos permitidos dentro del título:**

* `[Docs]`
* `[Feat]`
* `[Fix]`
* `[Chore]`

**Ejemplos:**

* `PSD-03 [Docs] Documentar RF-COM-01 a RF-COM-03`
* `PSD-04 [Docs] Modelar BPMN del flujo comercial principal`
* `PSD-05 [Chore] Ajustar pipeline operativo para corte semanal y mensual`

### 3.2 Weekly — junta, transcripción y trazabilidad

Se usa únicamente para documentar la junta semanal o reunión relevante.

**Incluye:**

* resumen o transcripción,
* acuerdos,
* decisiones,
* dudas,
* pendientes derivados,
* enlaces a PSD afectados.

**No se usa para:**

* representar trabajo del proyecto,
* sustituir planeación operativa,
* cerrar entregables del milestone.

**Formato:**
`[Weekly] wk-NN YYYY-MM-DD - Tema breve`

**Ejemplos:**

* `[Weekly] wk-01 2026-03-05 - Ajustes RF COM y prioridades`
* `[Weekly] wk-02 2026-03-12 - Revision de BPMN y artefactos`

### 3.3 Sprint — issue padre del ciclo semanal

Es el **Issue contenedor del milestone semanal**. Su función es agrupar el trabajo de la semana y servir como punto de seguimiento progresivo.

**Incluye:**

* objetivo de la semana,
* alcance del ciclo,
* lista de subissues PSD enlazados,
* referencia al Weekly correspondiente,
* checklist de cierre,
* evidencia del reporte semanal.

**Se cierra únicamente cuando:**

1. los subissues comprometidos están cerrados o explícitamente replanificados,
2. existe reporte semanal,
3. el equipo dejó trazabilidad de avances por integrante,
4. el estado del GitHub Project está actualizado.

**Formato:**
`[Sprint] sp-NN YYYY-MM-DD a YYYY-MM-DD - Objetivo breve`

**Ejemplos:**

* `[Sprint] sp-01 2026-03-06 a 2026-03-12 - Casos de uso y BPMN inicial`
* `[Sprint] sp-02 2026-03-13 a 2026-03-19 - Refinamiento RNF y consistencia documental`

---

## 4. Relación entre tipos de Issue

### 4.1 Jerarquía operativa

* **Sprint** = contenedor de planeación, seguimiento y cierre semanal.
* **PSD** = trabajo real y entregables del proyecto.
* **Weekly** = evidencia de reunión y acuerdos.

### 4.2 Regla práctica

* Todo entregable real debe vivir en un **PSD**.
* Toda junta debe registrarse en un **Weekly**.
* Todo corte semanal debe consolidarse en un **Sprint**.

### 4.3 Dependencias

* Un **Sprint** puede bloquearse por PSD críticos no resueltos.
* Un **PSD** puede depender de otro PSD.
* Un **Weekly** no bloquea técnicamente el desarrollo, pero sí debe existir si hubo junta.

---

## 5. Flujo operativo

### 5.1 Flujo general del ciclo semanal

1. Se realiza la junta del equipo/profesor.
2. Se abre o actualiza el **Weekly** correspondiente.
3. Se abre o actualiza el **Sprint** de la semana.
4. Del Sprint se derivan o actualizan los **PSD** necesarios.
5. Cada PSD se trabaja con flujo **Issue → Rama → PR**.
6. Los PR aprobados se integran a `develop`.
7. El Sprint se actualiza progresivamente con avances y bloqueos.
8. Al cierre de la semana se genera el reporte semanal y se evalúa el cierre del Sprint.

### 5.2 Flujo normal de un PSD

1. Se crea el Issue PSD → **Backlog**.
2. Se asigna responsable → **Ready**.
3. Se crea la rama desde el Issue.
4. Se trabaja y se abre PR hacia `develop` → **In Progress**.
5. Se solicita revisión → **In Review**.
6. Se aprueba y se mergea → **Done**.
7. El Issue se cierra.

### 5.3 Casos alternativos

* **Changes requested** → vuelve a **In Progress**.
* **PR reabierto** → vuelve a **In Progress**.
* **PR cerrado sin merge** → **Archived** y el Issue se cierra como no resuelto.
* **PSD replanificado** → se documenta en el Sprint y puede moverse al siguiente ciclo.

---

## 6. Nomenclatura de ramas

La rama se crea siempre desde el Issue usando GitHub “Create branch”.

### 6.1 Ramas para PSD

**Patrón:**
`<issue-number>-psd-nn-<tipo>-<tema-kebab>`

**Ejemplo:**

* Issue: `PSD-03 [Docs] Documentar RF-COM-01 a RF-COM-03 #22`
* Rama: `22-psd-03-docs-documentar-rf-com-01-a-rf-com-03`

### 6.2 Ramas para Weekly

**Patrón:**
`<issue-number>-weekly-wk-nn-yyyy-mm-dd-<tema-kebab>`

**Ejemplo:**

* Issue: `[Weekly] wk-01 2026-03-05 - Ajustes RF COM y prioridades #41`
* Rama: `41-weekly-wk-01-2026-03-05-ajustes-rf-com-y-prioridades`

### 6.3 Ramas para Sprint

**Patrón:**
`<issue-number>-sprint-sp-nn-yyyy-mm-dd-a-yyyy-mm-dd-<tema-kebab>`

**Ejemplo:**

* Issue: `[Sprint] sp-01 2026-03-06 a 2026-03-12 - Casos de uso y BPMN inicial #52`
* Rama: `52-sprint-sp-01-2026-03-06-a-2026-03-12-casos-de-uso-y-bpmn-inicial`

---

## 7. Pull Requests

### 7.1 Nombre del PR

**PSD:**
`#<issue-number> PSD-NN: <tema breve>`

**Weekly:**
`#<issue-number> Weekly wk-NN: <YYYY-MM-DD> <tema breve>`

**Sprint:**
`#<issue-number> Sprint sp-NN: <objetivo breve>`

### 7.2 Descripción mínima del PR

* contexto,
* cambios principales,
* entregables o rutas afectadas,
* referencia al issue,
* relación con el Sprint si aplica.

**Recomendado:**

* `Closes #<issue-number>`

---

## 8. GitHub Project y estados

### 8.1 Estados mínimos

* **Backlog**
* **Ready**
* **In Progress**
* **In Review**
* **Done**
* **Archived**

### 8.2 Regla de uso

* El estado operativo del trabajo se controla en GitHub Project.
* El Sprint debe mostrar de forma visible qué está terminado, qué sigue en curso y qué quedó bloqueado.
* Los PSD son la unidad principal de avance.

### 8.3 Automatización esperada

* `issues.assigned` → Ready
* `pull_request.opened/reopened/ready_for_review` → In Progress
* `pull_request.review_requested` → In Review
* `pull_request_review.submitted` con aprobación → Done o listo para merge, según política del equipo
* `pull_request.closed` merged → Done + cerrar Issue
* `pull_request.closed` sin merge → Archived + cerrar Issue

---

## 9. Planeación semanal

La planeación semanal no constituye un tipo de Issue adicional.

Se expresa mediante:

* el **Sprint** activo,
* sus PSD hijos,
* el estado del GitHub Project,
* prioridades, responsables y bloqueos.

### 9.1 Contenido mínimo del Sprint

* objetivo semanal,
* alcance,
* entregables comprometidos,
* lista de PSD hijos,
* responsable principal de seguimiento,
* riesgos y bloqueos,
* criterio de cierre,
* enlace al Weekly,
* enlace al reporte semanal.

---

## 10. Reporte semanal

El reporte semanal es el entregable de cierre del Sprint.

### 10.1 Objetivo

Mostrar al profesor y al equipo el avance real del ciclo semanal.

### 10.2 Contenido mínimo

* actividades realizadas por cada integrante,
* issues trabajados por cada integrante,
* PRs abiertos, revisados y mergeados,
* estado de entregables comprometidos,
* bloqueos o arrastres,
* resumen ejecutivo del avance semanal,
* evidencia de productividad y dedicación cuando aplique.

### 10.3 Evidencia complementaria opcional

Se pueden agregar métricas de herramientas como WakaTime para apoyar la exposición del trabajo, siempre que se presenten como complemento y no como único criterio de productividad.

**Ejemplos de evidencia complementaria:**

* tiempo de trabajo por integrante,
* distribución por lenguaje o archivo,
* tendencia semanal de actividad.

> La productividad del equipo no se evalúa solo por horas registradas, sino por entregables, trazabilidad y avance validado.

---

## 11. Criterios de cierre

### 11.1 Cierre de un PSD

Un PSD puede cerrarse cuando:

* existe entregable verificable,
* el PR fue aprobado y mergeado a `develop`,
* el estado del Project quedó actualizado.

### 11.2 Cierre de un Weekly

Un Weekly puede cerrarse cuando:

* quedó la transcripción o resumen,
* se documentaron acuerdos,
* se enlazaron PSD relevantes.

### 11.3 Cierre de un Sprint

Un Sprint puede cerrarse cuando:

* los PSD comprometidos fueron cerrados o replanificados explícitamente,
* el Weekly relacionado está documentado,
* existe reporte semanal,
* el estado del Project refleja el resultado real del ciclo,
* se dejó constancia de pendientes para el siguiente ciclo.

### 11.4 Cierre mensual

El corte mensual puede cerrarse cuando:

* los entregables del periodo están integrados en `develop`,
* se aprueba el paso a `main`,
* se crea el tag correspondiente,
* el paquete documental está completo.

---

## 12. Reglas de simplicidad

1. No crear tipos de Issue adicionales fuera de **PSD**, **Weekly** y **Sprint**.
2. No usar Weekly para trabajo del proyecto.
3. No usar Sprint para reemplazar los PSD.
4. No llevar trabajo sin Issue.
5. No abrir más Issues de los que el equipo puede atender en el ciclo.
6. Toda excepción al flujo debe documentarse en el Sprint o en el PR correspondiente.

---

## 13. Apertura sugerida de cada semana

1. Actualizar o abrir el **Weekly** de la junta.
2. Abrir el **Sprint** de la semana.
3. Crear o ajustar los **PSD** comprometidos.
4. Asignar responsables.
5. Trabajar cada PSD vía rama y PR.
6. Consolidar el reporte semanal.

---

## 14. Ejemplo de estructura mínima por semana

* 1 Issue **Weekly**
* 1 Issue **Sprint**
* N Issues **PSD** según carga real del equipo

Ejemplo:

* `[Weekly] wk-03 2026-03-06 - Casos de uso, BPMN y alcance`
* `[Sprint] sp-03 2026-03-06 a 2026-03-12 - Consolidar RF core y artefactos`
* `PSD-11 [Docs] Consolidar RF-COM-02 como requerimiento core`
* `PSD-12 [Docs] Analizar impacto de RF-COM-02 sobre RF COM y RF EVT`
* `PSD-13 [Docs] Redactar casos de uso de RF-COM-01 y RF-COM-03 a RF-COM-06`
* `PSD-14 [Docs] Modelar BPMN del flujo principal y gestion de cupo`

---

## 15. Regla final

Si una actividad produce un entregable del proyecto, debe vivir en un **PSD**.
Si una actividad documenta una reunión, debe vivir en un **Weekly**.
Si una actividad consolida el avance de la semana, debe vivir en un **Sprint**.
