# Prompt reusable para apartado de actividad individual

Usa este prompt cuando necesites generar o actualizar exclusivamente el apartado `Actividades realizadas por integrante` dentro de un reporte semanal o mensual.

## Instrucciones para el modelo

Genera un apartado titulado `## Actividades realizadas por integrante` en un solo documento, con dos secciones estrictas y en este orden:

1. `## A) Resumen operativo`
2. `## B) Trazabilidad extendida`

## Estructura obligatoria

## A) Resumen operativo

Debe incluir, en este orden:

1. `### 1) Archivos creados con contenido por integrante`
   - Solo incluir archivos creados en el rango que tengan contenido (no vacios).
   - No listar archivos placeholder vacios.
   - Tabla con columnas:
     - `Integrante`
     - `Archivos creados con contenido`
     - `Areas documentales relacionadas`
2. `### 2) Participacion por integrante`
   - Tabla con columnas:
     - `Integrante`
     - `Participacion total`
     - `Lineas docs`
     - `Lineas backlog`
     - `Puntos revision`
3. `### 3) Participacion por area documental`
   - Tabla con columnas:
     - `Area documental`
     - `Lineas cambiadas`
     - `Lider del area`
4. `### 4) Hallazgos operativos`
   - 3 a 5 bullets maximo.

## B) Trazabilidad extendida

Debe incluir, en este orden:

1. `### Metodologia de participacion`
2. `### Fuentes consideradas (issues y PRs)`
3. `### Archivos creados por integrante`
4. `### Evidencia documental por area y archivo`
5. `### Desglose por integrante`

## Criterios obligatorios

- Usa como base un concentrado calculado por script o por evidencia directa de GitHub y git.
- Respeta estas ponderaciones, salvo que el usuario indique otras:
  - 70% ejecucion documental
  - 20% administracion del backlog
  - 10% revision/integracion
- En ejecucion documental usa lineas agregadas + eliminadas en commits/diffs del rango indicado.
- En backlog usa lineas reales de texto en issues creados dentro del rango indicado.
- En revision/integracion usa evidencia real de PRs del rango indicado.
- No inventes revisiones si no existen.
- Si hay PRs mergeados fuera del rango, mencionarlos solo como nota aparte y no los mezcles en el porcentaje del rango, salvo que el usuario lo pida explicitamente.
- Todo dato mostrado en `A) Resumen operativo` debe estar respaldado en `B) Trazabilidad extendida`.
- La primera tabla de `A) Resumen operativo` siempre debe ser la de archivos creados con contenido por integrante.

## Manejo de entregables (paths de documentos)

**IMPORTANTE**: El script puede operar en dos modos respecto a los entregables:

### Modo 1: Autodetección (RECOMENDADO)
- **NO** especificar `DeliverablePaths` en el script.
- El script extrae automáticamente los paths de los documentos **mencionados en los issue bodies** (dentro de backticks o como referencias tipo `docs/...`).
- Esto evita sesgar los resultados hacia directorios específicos.
- Las líneas contadas reflejan TODO el cambio documentacional asociado a esos issues/PRs, no solo lo que está en directorios filtrados.

**Ventaja**: Resultados más equilibrados y precisos entre integrantes.

### Modo 2: Paths manuales (uso avanzado)
- Especificar `DeliverablePaths` cuando necesites enfocarte en frentes documentales específicos.
- **Precaución**: Los paths específicos pueden sesgar la participación hacia quien concentró cambios en esos directorios específicos.
- Ejemplo: Si filtras solo `docs/pipeline-operativo.md` pero Diego y Maximiliano trabajaron en `docs/diseño/casos de uso/`, sus contribuciones no se contarán.

### Filtrado automático de .gitignore
- El script **ignora automáticamente** archivos que están en `.gitignore` (de develop o main).
- Esto evita contar líneas de archivos administrativos como:
  - `/docs/prompts` — prompts de reporte
  - `/scripts` — scripts de análisis
  - `*.ps1`, `*.yml` — archivos de configuración
  - `pull_request_template.md` — templates
  - `.vscode` — configuración de editor
- **Beneficio**: "Otros docs" solo contiene documentos reales, no archivos de tooling.

## Validación manual de líneas (Regla de respaldo)

Después de generar el reporte, valida visualmente que las líneas reportadas concuerdan con la evidencia:

Después de generar el reporte, valida visualmente que las líneas reportadas concuerdan con la eviden cia:

1. **Para cada integrante**, verifica:
   - Los archivos listados en "Archivos creados por integrante" (Sección B).
   - El rango de líneas esperado basado en el tamaño/complejidad de esos documentos.
   - Si Maximiliano creó 10 archivos de casos de uso versus Isaac creó 1 archivo de pipeline, espera que Maximiliano tenga más líneas (a menos que pipeline-operativo sea MUCHO más largo).

2. **Busca inconsistencias**:
   - Si un integrante muestra 0 líneas pero creó muchos archivos → probablemente un filtro incorrecto.
   - Si las líneas están "caóticamente inclinadas" hacia un integrante → valida si fue realmente toda su participación o si un filtro de path lo modificó.
   - Si hay saltos grandes entre reportes sucesivos → revisa si cambió la config de DeliverablePaths.

3. **En caso de duda**:
   - Usa el comando: `git log --since="..." --until="..." --numstat -- docs/`
   - Compara manualmente los números con lo reportado.
   - Documenta cualquier discrepancia en la sección de "Metodología de participación" del reporte.

## Manejo de intent-aware line counting

**ÚltIMA RECOMENDACIÓN**: El parámetro `-IntentAwareLineCount` está **DESHABILITADO por defecto** porque:
- Tiende a filtrar líneas significativas como "no meaning ful".
- Causa distribuciones sesgadas donde un integrante domina injustamente.
- Es demasiado subjetivo determinar si una línea "cuenta" o no.

**Si necesitas usar intent-aware** (para filtrar placeholders o lineas administrativas):
- Revisa manualmente cada archivo creado antes de confiar en esos números.
- Docúmentalo explícitamente en la metodología del reporte.
- Espera sesgo en los resultados y valida cada número.

## Entradas esperadas

- Rango de fechas:

  - Inicio: `<YYYY-MM-DD HH:mm:ss>`
  - Fin: `<YYYY-MM-DD HH:mm:ss>`
- Concentrado por participante en formato JSON, tabla o texto estructurado.
- Concentrado de trazabilidad por area y archivo (si el script lo provee).
- Opcionalmente: lista de issues y PRs que forman parte del sprint o del reporte.
- Si cuentas con una lista exacta de issues y PRs del sprint, usala para filtrar el concentrado y evitar ruido de otros trabajos del mismo rango.
- El script puede autodetectar PRs vinculados a issues por palabras clave de cierre (`Closes`, `Fixes`, `Resolves` y variantes) con referencias tipo `#123` o `owner/repo#123`.

## Reglas de redaccion

- Mantener un tono tecnico y verificable.
- Dejar claro:
  - quien tuvo mayor volumen de escritura documental,
  - quien tuvo mayor participacion total,
  - quien tuvo menor participacion.
- Para cada integrante incluye:
  - porcentaje total,
  - lineas documentales,
  - lineas de backlog,
  - puntos de revision/integracion,
  - breve interpretacion del resultado.
- Si detectas limitaciones metodologicas, mencionalas en 1 o 2 lineas dentro de la metodologia.

## Plantilla de llamada

```text
Genera el apartado `Actividades realizadas por integrante` para el rango:
Inicio: 2026-03-06 00:00:00
Fin: 2026-03-12 23:59:59

Usa esta ponderacion:
- 70% ejecucion documental
- 20% backlog
- 10% revision/integracion

Si quieres limitarlo solo al sprint actual, usa estos filtros:
- Issues: 24,25,26,27,28,29,30,32,33
- PRs: 31,34,35,37,38

Si no proporcionas PRs, el script intenta detectarlos automaticamente por palabras clave de cierre en el body de los PRs del rango.

Usa este concentrado (incluye resumen y trazabilidad):
<pegar salida JSON o markdown del script>

Mantén la estructura general del reporte actual y no modifiques otras secciones.
```
