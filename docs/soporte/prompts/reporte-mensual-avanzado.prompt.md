# Prompt reutilizable para el reporte mensual de avance

Usa este prompt para generar o actualizar un reporte mensual de avance del proyecto con la misma estructura documental, el mismo tono y el mismo nivel de detalle que el reporte de marzo 2026.

## Objetivo

Generar un documento claro para lectores técnicos y no técnicos, con lectura principal en A-D y auditoria exhaustiva en E. El reporte debe ser riguroso, verificable y reutilizable para meses posteriores sin perder consistencia.

## Modo de uso

- Usa este prompt en dos modos: `reconstruccion` y `actualizacion`.
- En `reconstruccion`, conserva la estructura canonica del reporte de marzo 2026 tanto como lo permita la evidencia del bundle.
- En `actualizacion`, usa la misma estructura para el mes objetivo y adapta el contenido a la evidencia nueva sin reintroducir bloques ya cubiertos.
- Si el bundle corresponde a marzo 2026, el resultado debe intentar reproducir el documento existente con la misma secuencia de apartados, subapartados y familias de tablas.

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
- Validar que todo enlace y toda ruta apunten a un archivo real del workspace; si una referencia es futura, inexistente o rota, corregirla en el texto o eliminarla.
- Tratar los errores de enlace, rutas mal escritas y referencias futuras como defectos de generacion del reporte, no como deuda documental del proyecto.
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
- Mantener la secuencia narrativa breve, tabla de lectura y bullets visibles como la forma canonica del reporte de marzo 2026.

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
- Si el bundle lo permite, reflejar el reparto dominante por integrante con una lectura resumida como la del reporte de marzo 2026, sin volver la seccion una auditoria.

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
- No introducir entregables de meses futuros ni semanas inexistentes dentro de un reporte del mes anterior.
- No mezclar esta seccion con la auditoria de E.
- Si el siguiente mes requiere una lectura operativa, organizarla en cuatro fases concretas con fechas, artefactos y resultado esperado.

**Forma esperada:**
- Una lectura corta de lo que sigue.
- Una tabla con frentes de trabajo, objetivo y apoyo sugerido.
- Una tabla o bloque adicional con reparto sugerido por integrante, buscando equilibrio de carga.
- Si el reporte incluye una proyección de meses futuros, esa proyección debe vivir solo aquí y debe presentarse en una única tabla con Abril, Mayo y Junio.
- Mantener C como bloque de continuidad operativa y no como backlog abierto; la redaccion debe parecer una derivacion directa de las juntas y resúmenes del mes.

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
- Si el mes necesita una proyección operativa por meses, debe quedar como una tabla breve dentro de esta sección y no repetirse en A, B, C o E.
- Para marzo 2026, la proyección operativa debe quedar dentro de D como tabla breve y no duplicarse en otra parte del reporte.

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
- Si se incluyen métricas por integrante, deben aparecer en un solo bloque de desglose sin duplicar la misma cifra en tablas paralelas.
- Toda cifra por integrante debe indicar si es exacta, derivada o estimada, y debe ser consistente con la base de evidencia usada por el reporte.
- No dejar encabezados vacíos, tablas repetidas ni bloques de desglose sin contenido.
- Para reproducir el reporte de marzo 2026, la auditoria debe organizarse con este orden canonico cuando la evidencia lo soporte: `0) Corte de cierre`, `0.1) Estado de milestones`, `1) Control de implementacion`, `2) Participacion en ingenieria`, `3) Gestion de operatividad (Backlog)`, `4) Fase de verificacion (QA)`, `5) Base de calculo y evidencia`, `6) Desglose por integrante`.
- En `6) Desglose por integrante`, usa un solo bloque final con cuatro tablas separadas: `Líneas totales del mes`, `Líneas solo de docs`, `Líneas de backlog` y `Revisiones del mes`.
- Si la evidencia del mes no soporta un bloque canonico completo, reduce la sección en lugar de inventar contenido o dejar encabezados huérfanos.

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
- Que, si el objetivo es recrear marzo 2026, el resultado conserve la misma secuencia de secciones, sub-secciones y tablas base del documento canónico.
