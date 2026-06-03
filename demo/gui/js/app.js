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
logStructured('SESION', 'GUI demo cargada · conectando al orquestador...', null);

// Detectar escritura del usuario para el debounce de mensajes
document.getElementById('msg-input').addEventListener('input', () => {
  userState = 'typing';
  clearTimeout(typingInactivityTimer);
  typingInactivityTimer = setTimeout(() => {
    userState = 'reading';
    tryFlush();
  }, 10000);
});
