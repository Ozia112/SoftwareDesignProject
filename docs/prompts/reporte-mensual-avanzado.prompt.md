# Prompt reutilizable para el reporte mensual de avance

Usa este prompt para generar o actualizar un reporte mensual de avance del proyecto con la misma estructura documental, el mismo tono y el mismo nivel de detalle que el reporte de marzo 2026.

## Objetivo

Generar un documento claro para lectores técnicos y no técnicos, con lectura principal en A-D y auditoria exhaustiva en E. El reporte debe ser riguroso, verificable y reutilizable para meses posteriores sin perder consistencia.

## Entradas esperadas

- Nombre del repositorio.
- Mes y año del reporte.
- Rango de fechas exacto.
- Bundle de evidencia generado por script con:
  - Cambios documentales.
  - Participacion individual.
  - Issues cerrados.
  - Pull requests mergeados.
  - Resumen de reuniones y transcripciones.
  - Estado de ramas.

El bundle debe generarse con `scripts/generate-monthly-report-context.ps1`, que reutiliza el resumen individual existente y agrega evidencia de GitHub y git.

## Regla general de escritura

- Mantener lenguaje profesional, tecnico y accesible.
- Explicar el avance del proyecto, no la solicitud del reporte.
- No mezclar la narrativa principal con la auditoria tecnica.
- No inventar evidencia, numeros ni relaciones entre artefactos.
- Si una etapa IEEE no aplica o no tiene evidencia, omitirla.
- Si un artefacto no tiene respaldo en git o GitHub, no incluirlo.
- No mencionar issues o pull requests en A-D salvo que formen parte de la trazabilidad general y no como metrica.
- Usar markdown limpio y tablas cuando mejoren la lectura.

## Analisis por apartado

### A) Resumen operativo

**Proposito del apartado:** dar una lectura ejecutiva del mes. Debe ser tecnico, corto y entendible por personas fuera del repositorio.

**Tono:** profesional, claro y sin exceso de jerga interna.

**Evidencia permitida:**
- Requerimientos funcionales y no funcionales solo si la evidencia del mes lo justifica.
- Casos de uso, BPMN, glosario, reglas de negocio, pipeline operativo o minutas solo si aparecen en transcripciones, resúmenes o archivos del periodo.
- Etapas del proyecto solo si aplican al estado real del mes. En este proyecto normalmente aparecen Requerimientos y Diseño; Verificacion solo si la evidencia del mes la respalda.

**Restricciones:**
- Mantener intacta la estructura interna y los titulos existentes del apartado.
- No incluir metricas de issues o pull requests.
- No convertirlo en una auditoria tecnica.
- No agregar calculos ni ponderaciones.

**Forma esperada:**
- Una narrativa inicial corta.
- Una tabla breve con lectura sencilla por tema.
- Un bloque de bullets con lo mas visible del mes.

### B) Participacion individual

**Proposito del apartado:** explicar como contribuyo cada integrante durante el mes, con foco en el tipo de trabajo y el valor aportado.

**Tono:** tecnico, sobrio y orientado a colaboracion.

**Evidencia permitida:**
- Archivos creados o modificados.
- Areas documentales tocadas.
- Impacto en requerimientos, diseno, glosario o diagramacion.
- Actividad de apoyo en backlog o revision solo si ya aparece en el bundle de evidencia.

**Restricciones:**
- No extender el apartado con datos irrelevantes.
- No usar metrica interna pesada dentro de la narrativa.
- No repetir la misma idea entre texto y tabla.

**Forma esperada:**
- Introduccion breve.
- Tabla con integrante, enfoque, aporte del mes y lo que deja listo para el siguiente mes.

### C) Que toca para el siguiente mes

**Proposito del apartado:** traducir los acuerdos del mes en un plan de trabajo claro para el siguiente periodo.

**Tono:** orientado a ejecucion, sin sonar como backlog abierto.

**Evidencia permitida:**
- Decisiones de transcripciones y resúmenes de reuniones.
- Artefactos ya cerrados que sirvan como base para el siguiente paso.
- Estado de ramas y continuidad documental.

**Restricciones:**
- No basar el plan en issues o PRs abiertos.
- No presentar ideas sueltas sin respaldo documental.
- No mezclar esta seccion con la auditoria de E.

**Forma esperada:**
- Una lectura corta de lo que sigue.
- Una tabla con frentes de trabajo, objetivo y apoyo sugerido.
- Una tabla o bloque adicional con reparto sugerido por integrante, buscando equilibrio de carga.

### D) Conclusiones

**Proposito del apartado:** cerrar el mes en terminos de avance desbloqueado del proyecto.

**Tono:** claro, ejecutivo y ligeramente visual.

**Evidencia permitida:**
- Lo que quedo consolidado durante el mes.
- Lo que sigue en trabajo.
- Lo que realmente se desbloqueo para el mes siguiente.

**Restricciones:**
- No copiar la solicitud del usuario ni explicar el prompt.
- No decir que el objetivo del reporte es el objetivo del repositorio.
- La lectura final debe resumir el avance logrado y el desbloqueo real del proyecto.
- Si se usan emojis, limitarse a convenios sobrios tipo ✅, 🚧, 🧭 y ⚡ para facilitar escaneo visual.

**Forma esperada:**
- Bloque de "Lo que quedo desbloqueado".
- Bloque de "Lo que sigue en trabajo".
- Bloque de "Lectura final" enfocado en el avance del proyecto.
- Bloque de "Lo inmediato" con acciones concretas.

### E) Trazabilidad y auditoria (mes)

**Proposito del apartado:** concentrar la evidencia tecnica completa para auditoria rigurosa.

**Tono:** detallado, preciso y deliberadamente exhaustivo.

**Evidencia permitida:**
- Git diff, git log, ramas, archivos creados, issues cerrados, PRs mergeados, revisiones y transcripciones.
- Fuentes y calculos usados para el reporte.
- Archivos de reuniones, requerimientos, casos de uso, decisiones, glosario y diagramas.

**Restricciones:**
- Esta es la unica seccion donde deben vivir los detalles tediosos.
- Aqui si deben ir calculos, ponderaciones, recuentos y trazabilidad granular.
- No mover esta informacion a A-D.

**Subsecciones obligatorias:**
1. Control de implementacion.
2. Participacion en ingenieria.
3. Gestion de operatividad (Backlog).
4. Fase de verificacion (QA).
5. Base de calculo y evidencia.

**Forma esperada:**
- Tablas densas por archivo y por evidencia.
- Tablas por integrante con columnas separadas para Requerimientos, Diseno, Glosario y Diagramacion.
- Tablas por issue resuelto, con lectura tecnica y responsable.
- Tablas por pull request con autor, fecha de merge y revision visible.
- Tabla final con fuentes, pesos y cifras base del reporte.

## Estructura obligatoria de salida

El reporte debe conservar exactamente este orden:

1. `# Entrega mensual <numero>: <mes y año>`
2. `## A) Resumen operativo`
3. `## B) Participacion individual`
4. `## C) Que toca para el siguiente mes`
5. `## D) Conclusiones`
6. `## E) Trazabilidad y auditoria (<mes>)`

## Plantilla de uso

```text
Genera la entrega mensual con esta estructura exacta:

# Entrega mensual <NRO>: <MES AÑO>

Rango de fechas:
Inicio: <YYYY-MM-DD HH:mm:ss>
Fin: <YYYY-MM-DD HH:mm:ss>

Repositorio:
<OWNER/REPO>

Bundle de evidencia:
<pegar JSON o markdown generado por el script de recoleccion>

Reglas:
- Mantener los titulos A-E y su orden.
- No cambiar el sentido de la narrativa principal.
- No mover la trazabilidad tecnica fuera de E.
- No inventar datos ni etapas no evidenciadas.
- Si una etapa IEEE no aplica, omitirla.
- Si una seccion no tiene evidencia suficiente, reducirla en vez de rellenarla.
```

## Criterio de calidad

Antes de cerrar el texto, revisar:
- Coherencia entre la narrativa de A-D y la evidencia de E.
- Que el apartado D cierre en terminos de avance desbloqueado del proyecto.
- Que el apartado E permita auditar el reporte sin depender de la narrativa.
- Que el texto sea reutilizable para meses posteriores sin reescritura estructural.
