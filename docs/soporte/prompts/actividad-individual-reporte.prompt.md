# Prompt reusable para apartado de actividad individual

Usa este prompt cuando necesites generar o actualizar exclusivamente el apartado `Actividades realizadas por integrante` dentro de un reporte semanal o mensual.

## Instrucciones para el modelo

Genera un apartado titulado `## Actividades realizadas por integrante` con esta estructura general:

1. `### Metodologia de participacion`
2. Un resumen de ponderaciones y resultados globales.
3. Un subapartado `### <Nombre del integrante>` por cada participante.

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

## Entradas esperadas

- Rango de fechas:
  - Inicio: `<YYYY-MM-DD HH:mm:ss>`
  - Fin: `<YYYY-MM-DD HH:mm:ss>`
- Concentrado por participante en formato JSON, tabla o texto estructurado.
- Opcionalmente: lista de issues y PRs que forman parte del sprint o del reporte.
- Si cuentas con una lista exacta de issues y PRs del sprint, ├║sala para filtrar el concentrado y evitar ruido de otros trabajos del mismo rango.
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
- Si detectas limitaciones metodologicas, menci├│nalas en 1 o 2 lineas dentro de la metodologia.

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

Usa este concentrado:
<pegar salida JSON o markdown del script>

Mant├®n la estructura general del reporte actual y no modifiques otras secciones.
```
