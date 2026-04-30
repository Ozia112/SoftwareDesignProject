# Resumen de actividades individuales

Durante este periodo se realizó una **consolidación integral del diseño del sistema**, enfocada en la corrección de inconsistencias, alineación semántica y fortalecimiento de la trazabilidad entre requerimientos funcionales, casos de uso y definiciones del dominio.

## Actividades realizadas

Se llevó a cabo una revisión exhaustiva del sistema, abordando los siguientes ejes principales:

### 1. Corrección y alineación del modelo conceptual

* Se depuró y normalizó el glosario (`Definiciones.md`), eliminando información no respaldada y estandarizando la terminología (ej. “puntaje” → “calificación”).
* Se redefinieron conceptos clave como **reserva temporal, lista de espera, exploit del bot y cartera de clientes**, asegurando consistencia con los casos de uso.
* Se eliminaron señales inexistentes y se ajustaron las transiciones de etapa conforme al comportamiento real del sistema.

### 2. Reestructuración de casos de uso (COM y EVT)

* Se corrigieron errores de trazabilidad, referencias y flujos en múltiples casos de uso (CU-COM-001 a CU-COM-005 y CU-EVT-001).
* Se reorganizaron flujos principales por etapa comercial y se eliminaron redundancias y ambigüedades.
* Se renombró y rediseñó **CU-COM-003**, convirtiéndolo en el núcleo de gestión del banco de contexto (lectura/escritura de eventos y cupos).
* Se creó **CU-COM-006**, incorporando la gestión de notificaciones de reactivación y desuscripción, cubriendo un vacío funcional del sistema.

### 3. Corrección de requerimientos funcionales

* Se ajustaron los RF del dominio COM y EVT para reflejar correctamente las reglas de negocio reales:

  * Corrección del modelo de **calificación automática** en RF-COM-02.
  * Cambio de **consentimiento explícito a tácito** en RF-COM-07.
  * Corrección de etapas y triggers en RF-EVT-01, RF-EVT-02 y RF-EVT-04.
* Se eliminó **RF-EVT-05** por redundancia, integrando su lógica en RF-EVT-03 y RF-EVT-04 sin pérdida funcional.
* Se corrigió el criterio de orden en lista de espera y notificaciones (calificación como prioridad, FIFO como desempate).

### 4. Normalización estructural del proyecto

* Se unificó el formato de historias de usuario (“Como… Quiero… Para…”).
* Se estandarizaron los criterios de aceptación con formato `[ ]`.
* Se corrigieron encabezados y estructura en múltiples RFs para mantener consistencia documental.

### 5. Resolución de contradicciones y trazabilidad

* Se verificó y aseguró el cierre de **5 contradicciones críticas** entre casos de uso.
* Se estableció coherencia entre:

  * Glosario
  * Requerimientos funcionales
  * Casos de uso
* Se garantizó que todos los flujos estén correctamente anclados a reglas de negocio y etapas comerciales.

## Impacto en el sistema

Las actividades realizadas permitieron:

* Eliminar inconsistencias estructurales del sistema
* Alinear completamente el modelo conceptual con la implementación lógica
* Garantizar trazabilidad entre artefactos (RF ↔ CU ↔ definiciones)
* Cubrir vacíos funcionales críticos (notificaciones y desuscripción)
* Mejorar la claridad, mantenibilidad y escalabilidad del diseño

## Conclusión

El trabajo realizado representa una **fase de consolidación del diseño**, donde el sistema pasó de tener inconsistencias y ambigüedades a contar con una estructura coherente, trazable y alineada a reglas de negocio claras. Esto reduce significativamente el riesgo en etapas posteriores y establece una base sólida para la implementación y validación del sistema.
