# Demo — SaaS Bot Orchestrator

> **Solo para pruebas y presentación.** Esta carpeta es completamente aislada del sistema productivo.
> Para eliminarla del repo: `git rm -rf demo/` y revertir las referencias en `src/app.module.ts` y `src/tenant/tenant.module.ts`.

---

## Inicio rápido (1 comando)

```bash
CLAUDE_API_KEY=sk-ant-... bash demo/start.sh
```

Esto levanta PostgreSQL, Redis, el orquestador, la GUI y el seed automáticamente.

---

## Qué abre el demo

| URL | Descripción |
|-----|-------------|
| `http://localhost:8080` | **GUI demo** — chat cliente + dashboard tenant |
| `http://localhost:3000/api/docs` | Swagger — todos los endpoints |
| `http://localhost:3000/api/v1/metrics` | Prometheus metrics |
| `http://localhost:4000/qr` | QR para conectar WhatsApp (si open-wa está corriendo) |

---

## Inicio manual (4 terminales)

### Terminal 1 — Docker (infra)
```bash
cd demo
docker compose up postgres redis
```

### Terminal 2 — Orquestador
```bash
# Desde raíz del repo
DATABASE_URL="postgresql://app:app@localhost:5432/saas_dev" \
REDIS_HOST=localhost \
ENCRYPTION_MASTER_KEY=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= \
pnpm start:dev
```

### Terminal 3 — Seed + prueba
```bash
CLAUDE_API_KEY=sk-ant-... node demo/seed/seed.js
```

### Terminal 4 — GUI
```bash
# Con Python (siempre disponible):
python -m http.server 8080 --directory demo/gui

# O con npx:
npx serve demo/gui -p 8080
```

---

## WhatsApp real con open-wa

Requiere un número de WhatsApp activo en tu teléfono.

```bash
# Opción A — Docker (recomendado)
cd demo
docker compose up open-wa

# Opción B — Local
cd demo/open-wa-bridge
npm install
ORCHESTRATOR_URL=http://localhost:3000 TENANT_ID=demo-tenant node index.js
```

Luego abre `http://localhost:4000/qr` y escanea el QR con WhatsApp en tu teléfono.

Desde ese momento cualquier mensaje que te manden a ese número llega al bot.

---

## Escenarios de demo (GUI)

La GUI tiene botones para flujos completos:

1. **▶ Iniciar demo** — saludo inicial, muestra cursos disponibles
2. **📋 Contacto** — el lead da nombre, correo y teléfono → sube a MQL
3. **🎓 Inscripción** — pregunta por inscripción → sube a PROSPECTO + reserva cupo
4. **🚫 Sin cupo → lista espera** — cuando no hay disponibilidad
5. **💳 Confirmar pago** → SQL + escalado a operador
6. **🧑‍💼 Escalar a operador** — handoff con razón
7. **✏️ Mensaje libre** — escribe cualquier cosa

---

## Cómo quitar el demo del repo

```bash
# Eliminar toda la carpeta demo
git rm -rf demo/

# Revertir el SeedEventsController del módulo tenant
# En src/tenant/tenant.module.ts — quitar SeedEventsController
# En src/tenant/ — borrar seed-events.controller.ts

# Revertir HealthController en app.module.ts (o dejarlo, no daña)

git commit -m "chore: remove demo stack"
```

---

## Variables de entorno para seed manual

```bash
CLAUDE_API_KEY=sk-ant-...           # tu API key de Claude
DATABASE_URL=postgresql://app:app@localhost:5432/saas_dev
ORCHESTRATOR_URL=http://localhost:3000
```
