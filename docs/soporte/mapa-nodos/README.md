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

| Tipo          | Uso                                                                    |
| ------------- | ---------------------------------------------------------------------- |
| `root`        | Raiz del repositorio.                                                  |
| `area`        | Agrupador principal: analisis, diseno, soporte, src futuro.            |
| `domain`      | Dominio funcional o tecnico: COM, EVT, workflow, arquitectura.         |
| `artifact`    | Documento, diagrama, decision o catalogo concreto.                     |
| `code-anchor` | Nodo reservado para modulo, servicio o contrato de codigo bajo `src/`. |

## Relaciones base

| Relacion            | Significado                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `contains`          | Un nodo agrupa a otro.                                            |
| `traces_to`         | Un artefacto tiene trazabilidad directa hacia otro.               |
| `governed_by`       | Un artefacto queda condicionado por reglas o decisiones.          |
| `derives_from`      | Un artefacto deriva de otro como fuente primaria.                 |
| `implements_future` | Un servicio o modulo futuro deberia implementar ese artefacto.    |
| `supports`          | Un artefacto operativo ayuda a producir, auditar o mantener otro. |
| `references`        | Relacion contextual no normativa.                                 |

## Como usarlo con agentes

1. Abrir primero `.graph/search_index.json`.
2. Identificar el nodo raiz de la tarea, por ejemplo `CU-COM-005` o `DDR-02`.
3. Seguir solo las relaciones declaradas (`traces_to`, `governed_by`, `derives_from`, etc.).
4. Abrir archivos concretos despues de resolver el subgrafo minimo.
5. Si se agrega codigo en `src/`, crear nodos `SRC-*` y enlazarlos con `implements_future` o `implements`.

## Convenciones de IDs

- Requerimientos funcionales: `RF-COM-01`, `RF-EVT-01`.
- Requerimientos no funcionales: `RNF-01`.
- Casos de uso: `CU-COM-001`, `CU-EVT-001`.
- Reglas de negocio: `RN-COM-*`, `RN-EVT-*`.
- Decisiones de diseno: `DDR-01`, `DDR-02`.
- Nodos agregadores: prefijo `AREA-`, `DOM-`, `SUP-` o `SRC-`.

## Estado

Este mapa cubre la documentacion actual y deja anclas para codigo futuro. No sustituye la trazabilidad dentro de cada documento; la resume para reducir exploracion inicial.
