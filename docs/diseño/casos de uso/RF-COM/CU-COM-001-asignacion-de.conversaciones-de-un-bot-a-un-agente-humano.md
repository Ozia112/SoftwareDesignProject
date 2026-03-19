#CU-003 Presentación de eventos disponibles

Metadatos

-ID: CU-003

-Dominio: EVT

-Nombre: Presentación de eventos disponibles

-Estado: Borrador

-Versión: v0.1

-Fecha de creación: 2026-03-18

-Última actualización: 2026-03-18

-Responsable: Pendiente

-Issue relacionado: PSD-03

-PR relacionado: #XX

#Objetivo

-Mostrar al lead los eventos disponibles de forma clara para que pueda conocer las opciones y tomar una decisión.

#Alcance

Aplica al módulo de consulta y visualización de eventos dentro del sistema de gestión de entretenimiento.

#RF relacionados

-RF-EVT-01

-RF-COM-02

#Actores
Actor principal
Lead

#Actores secundarios

Sistema

Base de datos

Disparador

El lead solicita información sobre eventos disponibles.

Precondiciones

Existen eventos registrados en el sistema.

El sistema tiene acceso a la base de datos de eventos.

Postcondiciones
En éxito

El lead visualiza la lista de eventos disponibles con su información relevante.

En fallo

El sistema informa que no hay eventos disponibles o que ocurrió un error.

Flujo principal

El lead solicita ver los eventos disponibles.

El sistema consulta la base de datos de eventos [RF-EVT-01].

El sistema filtra los eventos disponibles según disponibilidad.

El sistema muestra al lead la lista de eventos con detalles básicos (nombre, fecha, precio, disponibilidad).

El sistema espera selección o acción del lead.

Flujos alternos
A1. Sin eventos disponibles

No existen eventos disponibles en el sistema.

El sistema informa al lead que no hay eventos disponibles [RF-EVT-01].

Flujos de excepción
E1. Error de consulta

Ocurre un error al acceder a la base de datos.

El sistema no puede recuperar la información [RF-EVT-01].

Se notifica al lead sobre el problema.

Reglas de negocio / restricciones

RN-01: Solo se muestran eventos activos y disponibles.

RN-02: La información mostrada debe estar actualizada.

Restricción: La disponibilidad depende del cupo y fechas del evento.

Datos relevantes
Entradas

Solicitud del lead

Parámetros de búsqueda (opcional)

Salidas

Lista de eventos disponibles

Detalles de cada evento

Diagramas relacionados

BPMN-EVT-01

../resources/cu-003-01.png

Observaciones

Se puede extender para incluir filtros por tipo de evento o presupuesto.

Trazabilidad

RF: RF-EVT-01, RF-COM-02

BPMN: BPMN-EVT-01

DDR: DDR-01

Evidencia académica / entrega: Pendiente