# Demo — SaaS Bot Orchestrator

> **Solo para pruebas y presentación.** Esta carpeta es completamente aislada del sistema productivo.
> Para eliminarla: ver sección [Cómo quitar el demo](#cómo-quitar-el-demo-del-repo).

---

## Prerrequisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) corriendo
- Node.js 22+ y pnpm (`npm install -g pnpm@10`)
- API key de Claude (`sk-ant-...`) — solo se pide en pantalla, nunca toca disco

---

## Inicio rápido

```bash
bash demo/start.sh
```

El script pide la API key de forma interactiva (sin eco, sin historial de shell):

```text
API key de Claude (empieza con sk-ant-)
  La key no se muestra ni se guarda en ningún archivo.
  Key: ████████████████████
```

Después levanta PostgreSQL, Redis, el orquestador y la GUI, e inyecta los eventos de demo automáticamente.

---

## Qué se abre

| URL                                    | Descripción                                         |
| -------------------------------------- | --------------------------------------------------- |
| `http://localhost:8080`                | **GUI demo** — chat cliente + dashboard tenant      |
| `http://localhost:3000/api/docs`       | Swagger — todos los endpoints                       |
| `http://localhost:3000/api/v1/metrics` | Prometheus metrics                                  |
| `http://localhost:4000/qr`             | QR para conectar WhatsApp (requiere open-wa activo) |

---

## Inicio manual (4 terminales)

Alternativa si `start.sh` no funciona en tu entorno.

### Terminal 1 — Infra

```bash
cd demo
docker compose up postgres redis
```

### Terminal 2 — Orquestador

La key se lee de la variable de entorno de la sesión actual, no de ningún archivo.
Escríbela una vez en la terminal — queda solo en memoria hasta que cierres la sesión.

```bash
# Git Bash / WSL / macOS
read -rs CLAUDE_API_KEY && export CLAUDE_API_KEY

DATABASE_URL="postgresql://app:app@localhost:5432/saas_dev" \
REDIS_HOST=localhost \
ENCRYPTION_MASTER_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
pnpm start:dev
```

### Terminal 3 — Seed

```bash
node demo/seed/seed.js
# El seed toma CLAUDE_API_KEY del entorno de la terminal 2
# Si es una terminal nueva: read -rs CLAUDE_API_KEY && export CLAUDE_API_KEY
```

### Terminal 4 — GUI

```bash
# Con Python (disponible en cualquier sistema):
python -m http.server 8080 --directory demo/gui
```

---

## WhatsApp real con open-wa

Requiere un número de WhatsApp activo en tu teléfono (para escanear el QR).

```bash
# Arrancar el bridge (Docker)
cd demo
docker compose up open-wa
```

Abre `http://localhost:4000/qr` y escanea el QR con tu teléfono.
Desde ese momento los mensajes que recibas en ese número llegan al bot.

---

## Smoke test en GitHub Actions (sin key local)

Si prefieres no escribir la key en ninguna terminal local, usa el workflow de CI:

1. Agrega el secret en el repo:
   **Settings → Secrets and variables → Actions → New repository secret**
   - Nombre: `CLAUDE_API_KEY`
   - Valor: tu key

2. Ejecuta el smoke test:
   **Actions → Smoke Test → Run workflow**

El test levanta PostgreSQL y Redis en CI, construye el orquestador, corre el seed y verifica que el bot responde. La key nunca sale de GitHub.

---

## Escenarios de demo (GUI)

| Botón              | Flujo                                                   |
| ------------------ | ------------------------------------------------------- |
| **Iniciar demo**   | Saludo inicial, el bot presenta los cursos disponibles  |
| **Contacto**       | El lead da nombre, correo y teléfono → etapa sube a MQL |
| **Inscripcion**    | Pregunta por un curso → etapa PROSPECTO + reserva cupo  |
| **Sin cupo**       | Evento lleno → se ofrece lista de espera                |
| **Confirmar pago** | Pago confirmado → etapa SQL + handoff a operador        |
| **Escalar**        | Solicitud de operador humano con razón                  |
| **Mensaje libre**  | Escribe cualquier mensaje al bot                        |

---

## Parar el demo

```bash
cd demo && docker compose down
```

---

## Cómo quitar el demo del repo

```bash
git rm -rf demo/
```

Revertir los dos archivos que el demo agrega al sistema:

```bash
# 1. src/tenant/tenant.module.ts — quitar SeedEventsController de controllers[]
# 2. src/tenant/seed-events.controller.ts — borrar el archivo
git rm src/tenant/seed-events.controller.ts

# HealthController se puede dejar (no afecta producción)

git commit -m "chore: remove demo stack"
```
