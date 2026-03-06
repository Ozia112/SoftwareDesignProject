# Workflow del Repositorio (CI + Backlog Automation + Naming)

> **Objetivo:** asegurar integración continua con ramas estables, trazabilidad Issue→Rama→PR y automatización de estados en **GitHub Projects (v2)**.

---

## 1) Estrategia de Integración Continua (CI)

### 1.1 Ramas permanentes

- **`main`**: solo contiene **información verificada**, **actualizada** y **código funcional** (build/ejecución correcta).
- **`develop`**: rama de **integración** (aquí se integra el trabajo del equipo durante el ciclo semanal).

### 1.2 Ramas temporales

Todas las ramas temporales:

- se crean **desde `develop`**
- se integran por **Pull Request hacia `develop`**
- son de vida corta (se eliminan tras merge).

Al cierre de cada semana:

- merge `develop → main`
- se crea un **tag** sobre el commit en `main` (ver sección 6).

---

## 2) Flujo operativo basado en Issue → Rama → PR

> En este repositorio, el **Issue es la fuente de verdad**, y la rama/PR se derivan de él.

### 2.1 Flujo normal (happy path)

1) Se crea el **Issue** sin asignar → **Status: Backlog**
2) Se asigna responsable → **Status: Ready**
3) Se crea **rama desde el Issue** (GitHub “Create branch”) → **Status: Ready**
4) Se abre PR hacia `develop` → **Status (Issue y PR): In Progress**
5) Se solicita revisión (Request review) → **Status (Issue y PR): In Review**
6) Se aprueba y se integra (merge) → **Status (Issue y PR): Done** y el Issue queda **Closed**

### 2.2 Casos alternativos

- **Changes requested**: **Status (Issue y PR): In Progress**
- **PR reabierto**: **Status (Issue y PR): In Progress**
- **PR cerrado sin merge**: **Status (Issue y PR): Archived** y el Issue queda **Closed (unresolved)**

---

## 3) Nomenclatura de Issues (estricta)

> Regla clave: el nombre del Issue debe permitir identificar **tipo** y (si aplica) **PSD** o **Weekly**, porque GitHub usa el título para proponer el nombre de rama.

### 3.1 Issues estándar del proyecto (PSD / trabajo normal)

**Formato recomendado:**
`PSD-NN [Tipo] Tema descriptivo`

**Tipos permitidos:**

- `[Docs]` documentación
- `[Feat]` funcionalidad
- `[Fix]` corrección
- `[Chore]` mantenimiento

**Ejemplos:**

- `PSD-03 [Docs] Documentar RF-COM-01 a RF-COM-03`
- `PSD-05 [Feat] Implementar calificación automática de leads`
- `PSD-05 [Fix] Corregir validación de correo en captura de lead`

### 3.2 Issues de transcripción / reuniones (Weekly)

**Formato recomendado:**
`[Weekly] wk-NN YYYY-MM-DD - Tema breve`

**Ejemplos:**

- `[Weekly] wk-01 2026-03-05 - Lineamientos del backlog`
- `[Weekly] wk-02 2026-03-12 - Ajustes RF COM y prioridades`

---

## 4) Nomenclatura de ramas (creadas desde el Issue)

GitHub propone automáticamente un nombre de rama a partir del Issue con el formato:

`<issue-number>-<slug-del-título>`

**Política del repo:** usar **tal cual** el nombre recomendado por GitHub (sin prefijos adicionales como `docs/`, `feature/`, etc.).  
La clasificación (Docs/Feat/Fix/Chore/Weekly) se determina por el **título del Issue**, que queda reflejado en el slug.

### 4.1 Ramas para Issues estándar (PSD)

La rama se crea con el patrón:

`<issue-number>-psd-nn-<tipo>-<tema-kebab>`

**Ejemplo real:**
Issue: `PSD-03 [Docs] Documentar RF-COM-01 a RF-COM-03 #22`  
Rama (GitHub): `22-psd-03-docs-documentar-rf-com-01-a-rf-com-03`

### 4.2 Ramas para Weeklies

La rama se crea con el patrón:

`<issue-number>-weekly-wk-nn-yyyy-mm-dd-<tema-kebab>`

**Ejemplo:**
Issue: `[Weekly] wk-01 2026-03-05 - Lineamientos del backlog #41`  
Rama (GitHub): `41-weekly-wk-01-2026-03-05-lineamientos-del-backlog`

## 5) Pull Requests (PR)

### 5.1 Nombre del PR

**PSD:**
`#<issue-number> PSD-NN: <tema breve>`

**Weekly:**
`#<issue-number> Weekly wk-NN: <YYYY-MM-DD> <tema breve>`

Ejemplos:

- `#22 PSD-03: Documentar RF-COM-01 a RF-COM-03`
- `#41 Weekly wk-01: 2026-03-05 Lineamientos del backlog`

### 5.2 Descripción del PR (mínimo)

- Contexto y cambios principales
- Lista de entregables / rutas afectadas

**Recomendado (pero no obligatorio si se creó rama desde Issue):**

- `Closes #<issue-number>`

> La automatización no depende de `Closes #...` si la rama contiene `<issue-number>-...`, pero ayuda a trazabilidad y cierre automático.

---

## 6) Convención de commits

### 6.1 Requisito mínimo

- Título del commit obligatorio (subject claro)
- Descripción/cuerpo libre

### 6.2 Formato recomendado

`<tipo>(<scope>): <mensaje corto>`

Ejemplos:

- `docs(readme): update pipeline section`
- `docs(meetings): add wk-01 transcription and summary`
- `feat(com): add lead qualification rules`
- `fix(com): correct email validation`

---

## 7) Versionado con tags (cierre semanal)

Después del merge `develop → main`, crear tag en `main`.

Formato recomendado:

- `rel-YYYY-MM-DD`

Ejemplos:

- `rel-2026-03-05`
- `rel-2026-03-12`

---

## 8) Automatización de estados en GitHub Projects (v2)

El repositorio incluye un workflow que sincroniza **Status** entre Issue y PR con base en eventos:

- `issues.assigned` → Ready (Issue)
- `pull_request.opened/reopened/ready_for_review` → In Progress (Issue y PR)
- `pull_request.review_requested` → In Review (Issue y PR)
- `pull_request_review.submitted`:
  - `changes_requested` → In Progress (Issue y PR)
  - `approved` → Done (Issue y PR) *(si tu equipo prefiere Done solo al merge, cambia esta regla)*
- `pull_request.closed`:
  - merged → Done + close Issue
  - not merged → Archived + close Issue
