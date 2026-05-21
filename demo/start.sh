#!/usr/bin/env bash
# ============================================================
# demo/start.sh — arranca todo el stack de demo
# Uso: bash demo/start.sh
# ============================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── 0. Pedir la key de forma segura ────────────────────────
# read -s: sin eco. El historial guarda "bash demo/start.sh", no la key.
if [ -z "${CLAUDE_API_KEY:-}" ]; then
  echo -e "${BOLD}API key de Claude${NC} (empieza con sk-ant-)"
  echo -e "${YELLOW}  Sin eco · sin historial · nunca toca disco${NC}"
  printf "  Key: "
  read -rs CLAUDE_API_KEY
  echo ""
fi

if [ -z "$CLAUDE_API_KEY" ]; then
  echo -e "${RED}✗ No se proporcionó ninguna key.${NC}"
  exit 1
fi

export CLAUDE_API_KEY

# ── 1. Validar la key contra la API de Anthropic ───────────
echo -e "\n${YELLOW}Validando API key...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 8 \
  -H "x-api-key: $CLAUDE_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  "https://api.anthropic.com/v1/models" 2>/dev/null || echo "000")

case "$HTTP_STATUS" in
  200)
    echo -e "${GREEN}  ✓ Key válida${NC}"
    ;;
  401)
    echo -e "${RED}  ✗ Key inválida o revocada (401). Verifica tu API key de Claude.${NC}"
    unset CLAUDE_API_KEY
    exit 1
    ;;
  403)
    echo -e "${RED}  ✗ Sin permisos (403). La key existe pero no tiene acceso a la API.${NC}"
    unset CLAUDE_API_KEY
    exit 1
    ;;
  000)
    echo -e "${YELLOW}  ⚠ Sin conexión a api.anthropic.com — continuando sin validar.${NC}"
    ;;
  *)
    echo -e "${YELLOW}  ⚠ Respuesta inesperada ($HTTP_STATUS) — continuando sin validar.${NC}"
    ;;
esac

# ── 2. Aviso de tamaño del contexto Docker ─────────────────
echo ""
if command -v du &>/dev/null; then
  CTX_SIZE=$(du -sh "$REPO_ROOT" --exclude="$REPO_ROOT/node_modules" \
                                  --exclude="$REPO_ROOT/.git" \
                                  --exclude="$REPO_ROOT/dist" \
                                  2>/dev/null | cut -f1 || echo "?")
  echo -e "${CYAN}Contexto Docker (sin node_modules/.git/dist): ~${CTX_SIZE}${NC}"
  echo -e "${CYAN}  El .dockerignore excluye los directorios pesados.${NC}"
fi

echo -e "\n${CYAN}══════════════════════════════════════════════════${NC}"
echo -e "${CYAN}   SaaS Bot Orchestrator — Demo Stack${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════${NC}\n"

# ── 3. Docker Compose ──────────────────────────────────────
echo -e "${YELLOW}1/4  Levantando Docker (PostgreSQL + Redis + Orquestador + GUI)...${NC}"
cd "$SCRIPT_DIR"
docker compose up -d --build postgres redis orchestrator gui
echo -e "${GREEN}  ✓ Containers iniciados${NC}"
cd "$REPO_ROOT"

# ── 4. Esperar health ──────────────────────────────────────
echo -e "${YELLOW}2/4  Esperando al orquestador...${NC}"
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Orquestador listo${NC}"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo -e "${RED}  ✗ Timeout. Revisa: docker logs saas-demo-orchestrator${NC}"
    unset CLAUDE_API_KEY
    exit 1
  fi
  sleep 2
done

# ── 5. Seed ────────────────────────────────────────────────
echo -e "${YELLOW}3/4  Inyectando tenant y eventos de demo...${NC}"
node "$REPO_ROOT/demo/seed/seed.js"
echo -e "${GREEN}  ✓ Datos de demo listos${NC}"

# ── 6. Resumen ─────────────────────────────────────────────
echo -e "\n${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅  Stack de demo corriendo${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🖥️  GUI demo:     ${CYAN}http://localhost:8080${NC}"
echo -e "  📖  Swagger:      ${CYAN}http://localhost:3000/api/docs${NC}"
echo -e "  📊  Métricas:     ${CYAN}http://localhost:3000/api/v1/metrics${NC}"
echo -e "  📱  WhatsApp QR:  ${CYAN}http://localhost:4000/qr${NC}  (si open-wa corriendo)"
echo ""
echo -e "  Para agregar WhatsApp:"
echo -e "  ${YELLOW}cd demo && docker compose up -d open-wa${NC}"
echo ""
echo -e "  Para detener todo:"
echo -e "  ${YELLOW}cd demo && docker compose down${NC}"
echo ""

unset CLAUDE_API_KEY
