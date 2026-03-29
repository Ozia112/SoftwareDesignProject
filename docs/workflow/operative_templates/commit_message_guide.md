# Commit Message Guide

## Convención base

Usar el formato:

`type(scope): mensaje breve en imperativo`

## Tipos permitidos

- `feat:` para funcionalidad o documentación nueva
- `fix:` para correcciones
- `docs:` para cambios documentales
- `chore:` para trabajo de mantenimiento o limpieza
- `refactor:` para reordenar sin cambiar el comportamiento documental o funcional
- `test:` para pruebas o validaciones

## Reglas de redacción

- El mensaje debe ser breve y específico.
- El verbo principal debe ir en imperativo.
- El scope debe indicar el frente afectado, por ejemplo `docs`, `workflow`, `com`, `evt`.
- Evitar mensajes genéricos como "update" o "changes".
- Si hay más de un cambio fuerte, priorizar el alcance dominante.

## Ejemplos

- `feat(docs): agregar plantillas institucionales`
- `fix(workflow): corregir taxonomía de labels`
- `docs(pipeline): desacoplar plantillas del flujo operativo`
- `chore(repo): normalizar rutas de documentación`

## Criterio práctico

Si el cambio crea algo nuevo, usar `feat:`.
Si corrige algo existente, usar `fix:`.
Si solo redefine documentación, usar `docs:`.
Si el cambio es soporte o limpieza, usar `chore:`.
