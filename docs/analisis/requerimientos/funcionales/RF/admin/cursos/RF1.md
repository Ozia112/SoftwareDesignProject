# RF1. El sistema debe permitir agregar cursos

## Descripción

El sistema debe permitir al administrador (se puede cambiar a roles especificos después) autorizado registrar nuevos cursos proporcionando la información requerida. Antes de guardar el curso, el sistema debe validar que los datos sean completos y válidos, informar cualquier error y confirmar cuando el registro se haya creado correctamente.

## Historia de usuario

**Como** usuario autorizado para administrar cursos,
**Quiero** agregar un nuevo curso al sistema,
**Para** mantener actualizado el catálogo de cursos disponibles.

## Criterios de aceptación

- [ ] El sistema permite acceder a la opción para agregar un curso.
- [ ] El sistema solicita la información necesaria para registrar el curso.
    Debe tener:
    -Nombre del curso
    -Descripción del curso
    -Fecha de inicio
    -Fecha de finalización (opcional)
    -Horarios
    -Maestro
    -Capacidad (esto choca con el RF3, hablarlo con el equipo)
    -Estado (por defecto activo)
- [ ] El sistema valida que los campos obligatorios estén completos.
- [ ] El sistema valida que los datos ingresados cumplan con el formato esperado.
- [ ] Si existe un error de validación, el sistema informa el problema y no guarda el curso.
- [ ] Si la información es válida, el sistema registra el curso correctamente.
- [ ] Después de guardar el curso, el sistema confirma que el registro fue creado.
- [ ] El sistema debe guardar para la base de datos lo siguiente
    -idCurso
    -nombre
    -descripcion
    -fechaCreacion
    -fechaInicio
    -fechaFin
    -horarios
    -idMaestro
    -nombreMaestro
    -capacidad
    -estado
    -idCreador (opcional para saber que perfil, rol o usuario creo el curso)
- [ ] El curso agregado aparece en el catálogo de cursos.
