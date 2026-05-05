# RNF-05 Disponibilidad del sistema (Disponibilidad)

## Descripción

El sistema (bot + backend) debe estar disponible para procesar conversaciones entrantes durante la mayor parte del tiempo operativo. La disponibilidad se mide externamente y considera exclusiones por mantenimiento planificado y fallos de terceros fuera del control del sistema.

## Métrica

- Disponibilidad mensual ≥ 99.5% (≤ 3.6 horas de downtime/mes).
- Las ventanas de mantenimiento planificadas notificadas con ≥ 24 h de antelación no se contabilizan como downtime.

## Condiciones

- Se mide con un monitor externo que realiza health-checks al endpoint de salud del backend cada 60 segundos.
- Se mide con un monitor externo que realiza health-checks al endpoint de salud del backend cada 60 segundos.
- El endpoint de salud mide únicamente los subsistemas propios necesarios para el procesamiento de conversaciones (p. ej. base de datos, colas, backend/orquestador). Los canales externos (WhatsApp y en el futuro otras redes sociales) se monitorizan por separado como dependencias; su indisponibilidad no computa contra el SLA del sistema, pero sí genera alerta operativa.
- Las ventanas de mantenimiento deben registrarse y notificarse con al menos 24 horas de anticipación.
- El endpoint de salud debe devolver un JSON estructurado que distinga entre `internal_status` y `external_dependencies`. Solo `internal_status` se utilizará para el cálculo del SLA (uptime del servicio), mientras que `external_dependencies` reporta disponibilidad de proveedores externos sin contar como downtime en el SLA.
- Ejemplo mínimo de respuesta de salud (simplificada):

```json
{
"status": "OK",
    "internal_status": "OK",
    "external_dependencies": {
        "whatsapp_connector": "DEGRADED",
        "sms_gateway": "OK"
    },
    "timestamp": "..."
}
```

- Las comprobaciones internas (base de datos, colas, bus de mensajes, orquestador) son críticas y su fallo computa como downtime para la métrica de disponibilidad.
- Las comprobaciones de conectores a proveedores externos (WhatsApp, SMS, Facebook, etc.) se monitorizan y generan alertas, pero su indisponibilidad no se contabiliza como downtime del sistema salvo que exista un acuerdo explicito que los incluya en el SLA.
- Métricas y objetivos adicionales sobre dependencias externas:
  - Tiempo de detección de fallo externo (monitor): ≤ 2 minutos tras la primera comprobación fallida.
  - Tiempo máximo para generar alerta y notificación al equipo de operaciones: ≤ 5 minutos.
  - RTO objetivo para reconexión a proveedor externo: ≤ 60 minutos (cuando aplique).
  - Política de degradación: al detectarse un fallo externo, el sistema debe:
    - Marcar la dependencia como `DEGRADED` en el endpoint de salud y dashboard.
    - Poner en cola las operaciones salientes dirigidas a ese proveedor y reportar el número de mensajes en cola.
    - Informar al usuario con un mensaje amigable cuando la acción dependa del canal (p. ej. "Actualmente no podemos enviar mensajes por WhatsApp; podemos notificarle por SMS o avisarle cuando se restablezca").
- Reglas de cálculo del SLA:
  - El monitor externo debe calcular el SLA utilizando únicamente la serie temporal de `internal_status` del endpoint de salud.
  - Eventos de downtime ocasionados exclusivamente por proveedores externos quedan reflejados en reportes de "dependencias de terceros" y no afectan el porcentaje de disponibilidad definido en este RNF.

## Criterios de aceptación

- El dashboard de monitoreo muestra uptime ≥ 99.5% en un periodo de 30 días calendario.
- Las alertas automáticas por degradación o caída se generan en menos de 5 minutos.
- Las pruebas controladas de mantenimiento y recuperación demuestran que los health-checks reflejan correctamente el estado de los subsistemas y que el sistema puede recuperarse dentro del RTO definido (RNF-04).
- Evidencia de notificación de ventanas de mantenimiento con ≥ 24 h de antelación.
