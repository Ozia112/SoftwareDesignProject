#!/usr/bin/env bash
# ============================================================
# demo/start.sh — arranca todo el stack de demo
# Uso: bash demo/start.sh
#
# La API key se lee de demo/.env.demo (nunca del comando).
# Copia demo/.env.demo.example → demo/.env.demo y pon tu key.
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/.env.demo"

# ── Cargar .env.demo si existe ──────────────────────────────
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck source=/dev/null
  source "$ENV_FILE"
  set +a
fi

# ── Validar que la key está disponible ──────────────────────
if [ -z "${CLAUDE_API_KEY:-}" ]; then
  echo -e "${RED}Error: CLAUDE_API_KEY no configurada.${NC}"
  echo ""
  echo "  Crea el archivo demo/.env.demo con tu API key:"
  echo "    cp demo/.env.demo.example demo/.env.demo"
  echo "    # Edita demo/.env.demo y pon tu key de Claude"
  echo ""
  echo "  El archivo es local y está en .gitignore — nunca se sube al repo."
  exit 1
fi

cd "$SCRIPT_DIR/.."

echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SaaS Bot Orchestrator — Demo Stack${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}\n"

# ── 1. Docker Compose ──────────────────────────────────────
echo -e "${YELLOW}1/4  Levantando Docker (PostgreSQL + Redis + Orquestador + GUI)...${NC}"
cd demo
docker compose up -d --build postgres redis orchestrator gui
echo -e "${GREEN}  ✓ Docker containers iniciados${NC}"
cd ..

# ── 2. Esperar health ──────────────────────────────────────
echo -e "${YELLOW}2/4  Esperando que el orquestador esté listo...${NC}"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Orquestador listo${NC}"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo -e "${RED}  ✗ Timeout. Revisa: docker logs saas-demo-orchestrator${NC}"
    exit 1
  fi
  sleep 2
done

# ── 3. Seed ────────────────────────────────────────────────
echo -e "${YELLOW}3/4  Inyectando tenant y eventos de demo...${NC}"
node demo/seed/seed.js
echo -e "${GREEN}  ✓ Datos de demo listos${NC}"

# ── 4. Resumen ─────────────────────────────────────────────
echo -e "\n${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Stack de demo corriendo${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🖥️  GUI demo:         ${CYAN}http://localhost:8080${NC}"
echo -e "  📖  Swagger API:      ${CYAN}http://localhost:3000/api/docs${NC}"
echo -e "  📊  Métricas:         ${CYAN}http://localhost:3000/api/v1/metrics${NC}"
echo -e "  📱  WhatsApp QR:      ${CYAN}http://localhost:4000/qr${NC}  (si open-wa corriendo)"
echo ""
echo -e "  Para agregar WhatsApp:"
echo -e "  ${YELLOW}cd demo && docker compose up -d open-wa${NC}"
echo ""
echo -e "  Para detener todo:"
echo -e "  ${YELLOW}cd demo && docker compose down${NC}"
echo ""
