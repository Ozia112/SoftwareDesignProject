# Relaciones operativas

Este documento resume recorridos frecuentes sobre el grafo. Sirve como "primera parada" para agentes antes de usar `rg` o abrir muchos archivos.

## Recorridos recomendados

### Resolver una pregunta difusa o de negocio (recomendado primero)

1. Buscar el termino en `.graph/search_index.json` (`terms`, `by_tag` con `capability:*`).
2. Si resuelve a un nodo `CAP-*` bajo `DOM-CAPABILITIES`, expandir `covers` (RF/CU), `governed_by` (RN/DDR), `modeled_by` (SEQ/COLLAB), `planned_in` (SRC-ORQ-*) y `validated_by` (fixtures demo).
3. Abrir solo los artefactos que falten para la tarea concreta.

Ejemplos: "reserva de cupo" -> `CAP-EVT-QUOTA`, "lista de espera" -> `CAP-EVT-WAITLIST`, "handoff" -> `CAP-COM-HANDOFF`, "context bank" -> `CAP-COM-CONTEXT-BANK`, "tool calls" -> `CAP-ORQ-TOOL-CALLS`.

### Resolver un servicio o tool call concreto

1. Buscar el nombre exacto (`QuotaService`, `release_quota`, etc.) en `by_service` o `by_tool_call` de `.graph/search_index.json`.
2. El resultado es el nodo `SRC-ORQ-*` dueño del servicio/tool call.
3. Desde ahi seguir `contained_by`/`covered_by` (reverse adjacency) para llegar al `CAP-*` y al `CU-*` correspondiente.

### Cambiar un requerimiento funcional COM

1. Resolver el nodo `RF-COM-XX` en `.graph/search_index.json`.
2. Seguir relaciones `satisfied_by` hacia los `CU-COM-*` que lo satisfacen.
3. Revisar reglas `RN-COM-*` asociadas (`applies_to` -> el RF/CU, o `governed_by` desde el `CU`/`CAP-*`).
4. Revisar `DDR-01` si el cambio toca etapa comercial, calificacion, privacidad o cupos.
5. Revisar `DDR-02` si el cambio toca orquestador, servicios o tool calls.

### Cambiar un requerimiento funcional EVT

1. Resolver el nodo `RF-EVT-XX` en `.graph/search_index.json`.
2. Seguir a `CU-EVT-001`, `CU-EVT-002` o `CU-EVT-003` (`satisfied_by`).
3. Revisar `RN-EVT-*` asociadas via `applies_to`/`governed_by`.
4. Revisar `DDR-01` si el cambio toca estados operativos contra etapa comercial.
5. Revisar `DDR-02` si el cambio impacta `QuotaService`, `WaitingListService` o `CancellationService` (o resolver directo via `by_service`).

### Implementar un servicio del orquestador en `src/`

1. Abrir `DDR-02`.
2. Ubicar el servicio en el nodo `SRC-ORQ-*` (o resolverlo directo via `by_service`/`by_tool_call`).
3. Desde `SRC-ORQ-*`, seguir `plans` (reverse de `planned_in`) para llegar a los `CAP-*`/`RN-*`/`CU-*` que ese modulo debe implementar.
4. Abrir los RF y RN relacionados con ese CU.
5. Revisar RNF si el servicio toca seguridad, rendimiento, disponibilidad, continuidad o claridad de mensajes.

### Depurar un caso de uso

1. Abrir el `CU-*`.
2. Revisar su bloque `RF relacionados`, `Reglas de negocio relacionadas` y `Trazabilidad`.
3. Comparar con el catalogo `RN-COM` o `RN-EVT`.
4. Revisar `utils/guia-depuracion-de-casos-de-uso.md`.
5. Si hay contradicciones, revisar `utils/contradicciones-cus.md`.

### Preparar una entrega o reporte

1. Entrar por `SUP-ENTREGAS`.
2. Revisar entregas semanales o mensuales segun corresponda.
3. Usar `SUP-SCRIPTS` para generar contexto si aplica.
4. Usar prompts en `SUP-PROMPTS` solo como apoyo de redaccion.

## Nodos de alta prioridad

| Nodo                      | Por que conviene leerlo primero                                              |
| ------------------------- | ---------------------------------------------------------------------------- |
| `DOM-CAPABILITIES`        | Indice de capacidades `CAP-*`; punto de entrada para preguntas difusas.      |
| `DDR-02`                  | Define servicios, tool calls, monorepo y stack futuro.                       |
| `CU-COM-005`              | Fuente funcional de etapa comercial y calificacion.                          |
| `CU-EVT-003`              | Fuente funcional de cupos, reservas y bloqueo.                               |
| `RN-COM-CATALOG`          | Catalogo de reglas comerciales; las reglas individuales viven en `RN-COM-*`. |
| `RN-EVT-CATALOG`          | Catalogo de reglas de eventos; las reglas individuales viven en `RN-EVT-*`.  |
| `SUP-UTILS-RESTRUCTURING` | Explica la separacion analisis/diseno/soporte.                               |

## Pendientes de cobertura

- Crear nodos `SRC-*` reales cuando exista `src/`.
- Agregar relaciones `implements` desde codigo a RF/CU/RN.
- `python scripts/check_doc_coverage.py --strict-core` cubre archivos de `docs/analisis` y `docs/diseño` sin nodo dedicado; falta extender la validacion a IDs mencionados en Markdown que no tengan nodo declarado.
- Normalizar nombres de carpetas con espacios si el equipo decide hacerlo despues.
