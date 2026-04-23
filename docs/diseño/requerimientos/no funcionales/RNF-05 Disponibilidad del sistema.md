# RNF-05 Disponibilidad del sistema (Disponibilidad)

## Descripción

El sistema (bot + backend) debe estar disponible para procesar conversaciones entrantes durante la mayor parte del tiempo operativo. La disponibilidad se mide externamente y considera exclusiones por mantenimiento planificado y fallos de terceros fuera del control del sistema.

## Métrica

- Disponibilidad mensual ≥ 99.5% (≤ 3.6 horas de downtime/mes).
- Las ventanas de mantenimiento planificadas notificadas con ≥ 24 h de antelación no se contabilizan como downtime.

## Condiciones

- Se mide con un monitor externo que realiza health-checks al endpoint de salud del backend cada 60 segundos.
- Se excluyen fallos en plataformas de mensajería fuera del control del sistema (WhatsApp y en el futuro otras redes sociales).
- El endpoint de salud deberá considerar como disponibles los subsistemas críticos (base de datos, colas, servicio de mensajería) antes de devolver estado OK.
- Las ventanas de mantenimiento deben registrarse y notificarse con al menos 24 horas de anticipación.

## Criterios de aceptación

- El dashboard de monitoreo muestra uptime ≥ 99.5% en un periodo de 30 días calendario.
- Las alertas automáticas por degradación o caída se generan en menos de 5 minutos.
- Las pruebas controladas de mantenimiento y recuperación demuestran que los health-checks reflejan correctamente el estado de los subsistemas y que el sistema puede recuperarse dentro del RTO definido (RNF-04).
- Evidencia de notificación de ventanas de mantenimiento con ≥ 24 h de antelación.
