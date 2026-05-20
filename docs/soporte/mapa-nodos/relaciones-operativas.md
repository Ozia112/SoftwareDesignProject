# Relaciones operativas

Este documento resume recorridos frecuentes sobre el grafo. Sirve como "primera parada" para agentes antes de usar `rg` o abrir muchos archivos.

## Recorridos recomendados

### Cambiar un requerimiento funcional COM

1. Resolver el nodo `RF-COM-XX` en `.graph/search_index.json`.
2. Seguir relaciones `traces_to` hacia los `CU-COM-*`.
3. Revisar reglas `RN-COM-*` asociadas.
4. Revisar `DDR-01` si el cambio toca etapa comercial, calificacion, privacidad o cupos.
5. Revisar `DDR-02` si el cambio toca orquestador, servicios o tool calls.

### Cambiar un requerimiento funcional EVT

1. Resolver el nodo `RF-EVT-XX` en `.graph/search_index.json`.
2. Seguir a `CU-EVT-001`, `CU-EVT-002` o `CU-EVT-003`.
3. Revisar `RN-EVT-*`.
4. Revisar `DDR-01` si el cambio toca estados operativos contra etapa comercial.
5. Revisar `DDR-02` si el cambio impacta `QuotaService`, `WaitingListService` o `CancellationService`.

### Implementar un servicio del orquestador en `src/`

1. Abrir `DDR-02`.
2. Ubicar el servicio en el nodo `SRC-ORQ-*`.
3. Abrir el CU ancla declarado en `DDR-02`.
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

| Nodo                      | Por que conviene leerlo primero                        |
| ------------------------- | ------------------------------------------------------ |
| `DDR-02`                  | Define servicios, tool calls, monorepo y stack futuro. |
| `CU-COM-005`              | Fuente funcional de etapa comercial y calificacion.    |
| `CU-EVT-003`              | Fuente funcional de cupos, reservas y bloqueo.         |
| `RN-COM-CATALOG`          | Evita duplicar reglas comerciales dentro de CUs.       |
| `RN-EVT-CATALOG`          | Evita duplicar reglas de eventos dentro de CUs.        |
| `SUP-UTILS-RESTRUCTURING` | Explica la separacion analisis/diseno/soporte.         |

## Pendientes de cobertura

- Crear nodos `SRC-*` reales cuando exista `src/`.
- Agregar relaciones `implements` desde codigo a RF/CU/RN.
- Automatizar una validacion que detecte IDs mencionados en Markdown sin nodo declarado.
- Normalizar nombres de carpetas con espacios si el equipo decide hacerlo despues.
