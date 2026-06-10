# Mapa de nodos del repositorio

Este directorio define una aproximacion local tipo Repo GraphRAG para navegar el repositorio sin depender de busquedas repetidas. La idea es que un agente pueda decidir primero que nodos leer y despues abrir solo los artefactos relevantes.

## Archivos

- `nodos-docs.yaml`: grafo inicial de nodos, rutas y relaciones.
- `relaciones-operativas.md`: recorridos sugeridos para tareas frecuentes.

## Generacion

El YAML canonico vive en `docs/soporte/mapa-nodos/nodos-docs.yaml`.

Para regenerar los indices JSON:

```txt
python build-graph.py --pretty
```

La salida generada queda en `.graph/` y debe actualizarse cuando cambie el YAML.

## Principio del mapa

El repositorio se modela como un grafo documental y tecnico:

- Los nodos de nivel alto agrupan areas: analisis, diseno, soporte y futuro codigo.
- Los nodos de dominio agrupan COM, EVT, reglas, decisiones, modelos y workflow.
- Los nodos de artefacto apuntan a archivos concretos.
- Los nodos futuros de `src/` reservan el lugar para codigo y servicios cuando se implemente el orquestador.

## Tipos de nodo

| Tipo            | Uso                                                                         |
| --------------- | --------------------------------------------------------------------------- |
| `root`          | Raiz del repositorio.                                                       |
| `area`          | Agrupador principal: analisis, diseno, soporte, src futuro, demo.           |
| `domain`        | Dominio funcional o tecnico: COM, EVT, workflow, arquitectura, capacidades. |
| `capability`    | Nodo `CAP-*` que consolida RF/CU/RN/DDR/diagramas/SRC de una capacidad.     |
| `business-rule` | Regla de negocio individual `RN-*`, apunta a una seccion del catalogo.      |
| `artifact`      | Documento, diagrama, decision, catalogo o fixture concreto.                 |
| `code-anchor`   | Nodo reservado para modulo, servicio o contrato de codigo bajo `src/`.      |

## Taxonomia de tags

Cada nodo declara `tags` con prefijos consultables vía `by_tag` y vía `terms` (para `capability:`, `domain:` y `quality:`):

- `area:*`: `analisis`, `diseno`, `soporte`, `demo`.
- `domain:*`: `com`, `evt`.
- `kind:*`: tipo detallado (`business-rule`, `capability`, `fixture`, `template`, `ci-workflow`, ...).
- `capability:*`: capacidad funcional (`quota`, `waitlist`, `cancellation`, `handoff`, `context-bank`, `commercial-stage`, ...).

Los nodos tambien pueden declarar `services` (clases NestJS futuras) y `tool_calls` (nombres de tool calls), indexados en `by_service` y `by_tool_call`.

## Relaciones

El significado canonico de cada relacion vive en el bloque `relation_vocabulary` al inicio de `nodos-docs.yaml`. Resumen:

| Relacion | Significado |
| --- | --- |
| `contains` | Un nodo agrupa a otro. |
| `satisfies` | Un caso de uso satisface uno o mas requerimientos funcionales. |
| `covers` | Una capacidad (`CAP-*`) consolida artefactos funcionales. |
| `applies_to` | Una regla de negocio aplica sobre artefactos, capacidades o anclas. |
| `governed_by` | Un artefacto queda condicionado por reglas o decisiones. |
| `models` / `modeled_by` | Un diagrama representa, o es representado por, un caso de uso/capacidad. |
| `derives_from` | Un artefacto deriva de otro como fuente primaria. |
| `planned_in` | Un artefacto, regla o capacidad esta previsto en un modulo/servicio futuro. |
| `implements_future` | Relacion legada; preferir `planned_in` o `derives_from`. |
| `validated_by` / `exercises` | Fixtures o demos que ejercitan, o son ejercitados por, una capacidad. |
| `supports` | Un artefacto operativo ayuda a producir, auditar o mantener otro. |
| `references` | Relacion contextual no normativa. |
| `traces_to` | Trazabilidad generica; preferir una relacion mas especifica si existe. |

## Como usarlo con agentes

1. Abrir primero `.graph/search_index.json`.
2. Para preguntas difusas o de negocio, resolver primero un nodo `CAP-*` bajo `DOM-CAPABILITIES` (por ejemplo "reserva de cupo" -> `CAP-EVT-QUOTA`) y expandir `covers`/`governed_by`/`modeled_by`/`planned_in`/`validated_by` desde ahi.
3. Para nombres de servicios o tool calls (`QuotaService`, `release_quota`), resolver via `by_service`/`by_tool_call`.
4. Identificar el nodo raiz de la tarea, por ejemplo `CU-COM-005` o `DDR-02`.
5. Seguir solo las relaciones declaradas que correspondan a la tarea (ver tabla de relaciones).
6. Abrir archivos concretos despues de resolver el subgrafo minimo.
7. Si se agrega codigo en `src/`, crear nodos `SRC-*` y enlazarlos con `planned_in`.

## Convenciones de IDs

- Requerimientos funcionales: `RF-COM-01`, `RF-EVT-01`.
- Requerimientos no funcionales: `RNF-01`.
- Casos de uso: `CU-COM-001`, `CU-EVT-001`.
- Reglas de negocio: `RN-COM-*`, `RN-EVT-*` (catalogo) y reglas individuales `RN-COM-ESC-01`, `RN-EVT-CUPO-01`, etc.
- Decisiones de diseno: `DDR-01`, `DDR-02`.
- Capacidades: `CAP-EVT-*`, `CAP-COM-*`, `CAP-ORQ-*`, agrupadas en `DOM-CAPABILITIES`.
- Fixtures/demo: `DEMO-*`, agrupados en `AREA-DEMO`.
- Nodos agregadores: prefijo `AREA-`, `DOM-`, `SUP-` o `SRC-`.

## Cobertura de documentacion

Para verificar que `docs/analisis/**` y `docs/diseño/**` tengan un nodo dedicado (path exacto):

```txt
python scripts/check_doc_coverage.py --strict-core
```

`ci-docs.yml` ejecuta esta verificacion; los documentos fuera de esos directorios se reportan solo como informativos.

## Estado

Este mapa cubre la documentacion actual y deja anclas para codigo futuro. No sustituye la trazabilidad dentro de cada documento; la resume para reducir exploracion inicial.
