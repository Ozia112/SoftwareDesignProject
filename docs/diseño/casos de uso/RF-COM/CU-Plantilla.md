# CU-XXX-NNN Nombre breve del caso de uso

## Metadatos

- ID: CU-XXX-NNN
- Dominio: COM | EVT | RNF | OTRO
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

- RF-COM-002
- RF-EVT-001

## Actores

### Actor principal

- Usuario / Bot / Operador / Sistema externo

### Actores secundarios

- Sistema de notificaciones
- Base de datos
- Administrador
- Pasarela externa

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

## Reglas de negocio / restricciones

- RN-XX: Regla aplicable
- Restricción de tiempo, cupo, privacidad, etc.

## Datos relevantes

### Entradas

- Dato 1
- Dato 2

### Salidas

- Resultado 1
- Resultado 2

## Diagramas relacionados

- BPMN-XXX-001
- ../resources/cu-xxx-nnn-01.png

## Observaciones

- Supuestos
- Dudas abiertas
- Notas para revisión

## Trazabilidad

- RF: RF-COM-002, RF-EVT-001
- BPMN: BPMN-CUPO-001
- DDR: DDR-01
- Evidencia académica / entrega: enlace si aplica
