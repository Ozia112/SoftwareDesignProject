# CU-XXX-NNN Nombre breve del caso de uso

## Metadatos

- ID: CU-XXX-NNN
- Dominio: DOM-01 | DOM-02 | RNF | OTRO
- Nombre: Nombre breve del caso de uso
- Estado: Borrador | En revision | Aprobado | Sustituido
- Versión: v0.1
- Fecha de creación: YYYY-MM-DD
- Última actualización: YYYY-MM-DD
- Responsable: Nombre
- Issue relacionado: PSD-XX
- PR relacionado: #XX

## Objetivo

Describir el resultado de valor que obtiene el actor al ejecutar este caso de uso.

## Alcance

Indicar el límite del sistema o subsistema al que aplica este caso de uso.

## RF relacionados

- RF-XXX-001
- RF-YYY-002

## Actores

### Actor principal

- Usuario / Bot / Operador / Sistema externo

### Actores secundarios

- Sistema de autenticación
- Servicio de notificaciones
- Módulo de auditoría
- Sistema externo integrado

## Disparador

Evento que inicia el caso de uso.

## Precondiciones

- Condición 1
- Condición 2

## Postcondiciones

### En éxito

- Resultado esperado si el flujo termina correctamente

### En fallo

- Estado resultante si el flujo no puede completarse

## Flujo principal

1. El actor realiza la acción inicial.
2. El sistema valida la condición correspondiente [RF-XXX-YYY].
3. El sistema ejecuta la acción principal [RF-XXX-YYY].
4. El sistema confirma el resultado al actor.

## Flujos alternos

### A1. Nombre del flujo alterno

1. Condición que desvía del flujo principal.
2. El sistema responde de forma alternativa [RF-XXX-YYY].
3. El flujo termina o regresa al paso N del flujo principal.

### A2. Nombre del flujo alterno

1. ...
2. ...

## Flujos de excepción

### E1. Nombre de la excepción

1. Ocurre una condición inválida o error.
2. El sistema detiene, rechaza o compensa la operación [RF-XXX-YYY].
3. Se informa el motivo al actor.

### E2. Nombre de la excepción

1. ...
2. ...

[RF-XXX-YYY]: #

## Reglas de negocio / restricciones

- La entidad principal debe estar en estado válido para procesarse  
- La información debe provenir de una fuente autorizada  
- La salida debe incluir los campos mínimos definidos por el negocio  

## Datos relevantes

### Entradas

- Solicitud de operación
- Parámetros de entrada requeridos
- Criterios de filtrado (opcional)

### Salidas

- Resultado de la operación
- Detalle de respuesta (opcional)

## Diagramas relacionados

- BPMN-XXX-001
- ../resources/cu-xxx-001.png

## Observaciones

- La presentación puede variar según canal o interfaz de consumo
- Puede ampliarse con integraciones adicionales en futuras versiones

## Trazabilidad

- RF: RF-XXX-001, RF-YYY-002
- DDR: DDR-XX
