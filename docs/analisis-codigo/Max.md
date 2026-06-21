# Análisis del acoplamiento entre módulos    y propuestas de diseño

## Qué encontré

- Hay un orquestador, una interfaz web estática, un puente para WhatsApp y scripts que preparan datos de ejemplo. Todos dependen unos de otros para funcionar correctamente.
- Muchas decisiones están orientadas a facilitar la ejecución local (uso de direcciones relativas), lo cual es útil para demos pero deben ser cambiadas para el producto final.

## Problemas principales

- Dependencias: algunos componentes esperan valores concretos (por ejemplo, direcciones y nombres) que están repartidos en distintos lugares, por lo que un cambio pequeño obliga a tocar varios archivos.
- Dificultad para ejecutar por partes: no es sencillo arrancar solo la interfaz o solo el puente sin el resto, porque el flujo asume que todo está presente y activo.
- Fragilidad frente a cambios: la interfaz interpreta registros y respuestas en formatos poco estructurados, así que cualquier cambio en el servidor puede romper la experiencia de usuario.

## Propuestas

- Unificar la configuración en un solo lugar y que las partes la lean en tiempo de ejecución, en lugar de repetir valores en muchos archivos. Así será más fácil cambiar dónde corre cada cosa.
- Separar la preparación de datos (seed) del resto: que exista una forma clara y repetible de cargar datos de muestra sin tener que ejecutar comandos manuales dentro de contenedores.
- Desacoplar cómo se comunican los componentes: en vez de depender fuertemente de una llamada directa entre dos piezas, introducir una forma de intercambio más flexible que permita que cada parte funcione de manera independiente cuando sea necesario.
- Acordar formatos claros y estables para la información que intercambian la interfaz y el servidor, para evitar que cambios menores rompan el comportamiento.
- Reducir o eliminar pasos interactivos para posibilitar ejecuciones automáticas en entornos de prueba y en integraciones continuas.
