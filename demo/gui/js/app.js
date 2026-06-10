// ── Health check ──────────────────────────────────────────────────────────────
async function checkHealth() {
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(2000) });
    const ok  = res.ok;
    document.getElementById('dot-orch').className  = 'status-dot ' + (ok ? 'ok' : 'err');
    document.getElementById('dot-pg').className    = 'status-dot ' + (ok ? 'ok' : 'err');
    document.getElementById('dot-redis').className = 'status-dot ok';
  } catch {
    document.getElementById('dot-orch').className = 'status-dot err';
    document.getElementById('dot-pg').className   = 'status-dot err';
  }
  try {
    const res = await fetch('http://localhost:4000/health', { signal: AbortSignal.timeout(1000) });
    document.getElementById('dot-wa').className = 'status-dot ' + (res.ok ? 'ok' : 'err');
  } catch {
    document.getElementById('dot-wa').className = 'status-dot err';
  }
}

// ── Inicialización ────────────────────────────────────────────────────────────
checkHealth();
setInterval(checkHealth,          5000);
setInterval(refreshHandoffBadge, 10000);
setInterval(refreshSidebarEvents, 30000);
setInterval(updateClock,           1000);

updateClock();
refreshSidebarEvents();

// Restaurar sesiones, logs y preferencias de navegación desde localStorage.
loadSessionsFromStorage();
loadLogsFromStorage();

// Restaurar canal de logs ANTES de renderizar (para que el render use el canal correcto)
const _savedLogsCh = localStorage.getItem(LS_LOGS_CH_KEY);
if (_savedLogsCh) logsChannelId = _savedLogsCh;

if (sessions.length > 0) {
  renderSessionList();
  updateMetrics();
  if (state.convId) {
    updateStage(state.stage);
    const _showCh = logsChannelId ?? USER_CHANNEL;
    renderTerminalForSession(_showCh);
    renderApiCallsForSession(_showCh);
    loadChatHistory(state.convId, USER_CHANNEL);
    subscribeToSSE(state.convId);
  }
  updateLogsSessionSelector();
  logStructured('SESION', `pestaña restaurada · ${sessions.length} sesión(es) disponible(s)`, USER_CHANNEL);
  validateSessionsAfterLoad();
} else {
  logStructured('SESION', 'GUI demo cargada · conectando al orquestador...', null);
}

// Restaurar pestaña activa al final (después de poblar el DOM)
const _savedTab = localStorage.getItem(LS_ACTIVE_TAB_KEY);
if (_savedTab) switchTab(_savedTab);

// Detectar escritura del usuario para el debounce de mensajes
document.getElementById('msg-input').addEventListener('input', () => {
  userState = 'typing';
  clearTimeout(typingInactivityTimer);
  typingInactivityTimer = setTimeout(() => {
    userState = 'reading';
    tryFlush();
  }, 5000);
});
