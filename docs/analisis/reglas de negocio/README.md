# Reglas de negocio

## Proposito

Esta carpeta centraliza las reglas de negocio del proyecto para evitar que queden repetidas o mezcladas dentro de los casos de uso.

La separacion sigue este criterio:

- Los **casos de uso** describen la interaccion actor-sistema y el resultado esperado.
- Las **reglas de negocio** describen restricciones, politicas, elegibilidad, prioridades, limites y condiciones normativas del dominio.
- El **diseño** describe como la solucion implementa esas reglas mediante servicios, componentes, algoritmos, estados internos o persistencia.

## Base de referencia

- **ISO/IEC/IEEE 29148:2018** ubica restricciones, atributos y contenido de requisitos dentro de ingenieria de requerimientos.
- **ISO/IEC/IEEE 15289** permite que los information items se combinen o se subdividan segun la necesidad del proyecto. Eso justifica tener reglas de negocio en documentos separados del CU.
- **IEEE 1016** y **ISO/IEC/IEEE 42010** sirven para mover al diseño lo que ya describe solucion, arquitectura o comportamiento interno.

## Convencion local de identificacion

La nomenclatura adoptada en este repositorio es:

- `RN-COM-ESC-XX`: reglas comerciales de escalamiento
- `RN-COM-CONV-XX`: reglas del flujo conversacional
- `RN-COM-CONT-XX`: reglas de bancos de contexto
- `RN-COM-PRIV-XX`: reglas de privacidad y consentimiento
- `RN-COM-ETAPA-XX`: reglas de etapa comercial y calificacion
- `RN-COM-REACT-XX`: reglas de reactivacion outbound
- `RN-EVT-LE-XX`: reglas de lista de espera
- `RN-EVT-CAN-XX`: reglas de cancelacion
- `RN-EVT-CUPO-XX`: reglas de cupo e inscripcion

## Estructura sugerida

```text
docs/analisis/reglas de negocio/
  README.md
  RN-Plantilla.md
  COM/
    catalogo-rn-com.md
  EVT/
    catalogo-rn-evt.md
```

## Como usar esta carpeta

1. El CU no debe repetir el texto completo de la regla.
2. El CU solo debe referenciar los IDs aplicables en `Reglas de negocio relacionadas`.
3. Si una regla se vuelve compleja, sensible o compartida por muchos artefactos, puede evolucionar de catalogo a documento individual usando [RN-Plantilla.md](RN-Plantilla.md).
4. Si una “regla” define algoritmos, eventos internos, persistencia, logs, reintentos o tablas de transicion tecnicas, entonces ya no debe quedarse aqui sola: debe tener un derivado en diseño.

## Criterio rapido

- Si responde a “que esta permitido, prohibido u obligado por el negocio”, va aqui.
- Si responde a “como lo hace el sistema por dentro”, va a diseño.
