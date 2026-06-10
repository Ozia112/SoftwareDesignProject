// ── Registro y actualización de sesiones ─────────────────────────────────────
function addOrUpdateSession(channelId, convId, label, stage, score) {
  const idx = sessions.findIndex(s => s.channelId === channelId);
  if (idx >= 0) {
    // Solo actualizar campos que vienen con valor definido — evita sobrescribir
    // score/stage con undefined cuando la respuesta es un enrutado a operador
    sessions[idx] = {
      ...sessions[idx],
      convId,
      ...(stage !== undefined && stage !== null && { stage }),
      ...(score !== undefined && { score }),
    };
    if (activeSessionIdx === -1) activeSessionIdx = idx;
  } else {
    sessions.push({
      channelId, convId, label, stage, score,
      startedAt: new Date().toISOString(),
      hasOperator: false,
    });
    activeSessionIdx = sessions.length - 1;
  }
  saveSessionsToStorage();
  // Si el tab de Logs no tiene selección manual, seguir al canal activo
  if (logsChannelId === null) {
    logsChannelId = channelId;
    updateLogsSessionSelector();
  } else {
    updateLogsSessionSelector(); // solo actualizar items del dropdown sin cambiar selección
  }
  renderSessionList();
}

// ── Cambiar de sesión activa ──────────────────────────────────────────────────
// Fix B5: se resetea state.stage a null antes de llamar updateStage para
//         forzar la actualización del DOM (updateStage tiene early-return si
//         stage === state.stage).
async function selectSession(idx) {
  if (idx < 0 || idx >= sessions.length) return;
  if (idx === activeSessionIdx) return;  // ya activa, evita reset innecesario del DOM
  const s = sessions[idx];
  activeSessionIdx = idx;
  USER_CHANNEL  = s.channelId;
  // Auto-sync: el tab de Logs sigue a la sesión activa del chat
  logsChannelId = s.channelId;
  try { localStorage.setItem(LS_LOGS_CH_KEY, s.channelId); } catch {}
  updateLogsSessionSelector();
  // Mostrar solo los logs de esta sesión en el terminal
  renderTerminalForSession(s.channelId);
  renderApiCallsForSession(s.channelId);
  state.convId  = s.convId;
  state.score   = s.score;
  pendingMessages = [];
  stopOperatorPolling();
  updateMetrics();
  const targetStage = s.stage;
  state.stage = null;           // forzar re-render del panel de etapas
  updateStage(targetStage);
  document.getElementById('chat-area').innerHTML = '';
  if (s.convId) {
    await loadChatHistory(s.convId, s.channelId);
    subscribeToSSE(s.convId);
  }
  if (s.hasOperator) startOperatorPolling(s.convId);
  saveSessionsToStorage();
  renderSessionList();
}

// ── Sincronización cross-tab: escuchar cambios de localStorage ────────────────
// Reacciona a cambios de sesiones, logs y API calls emitidos por otras pestañas.
window.addEventListener('storage', (e) => {
  // ── Sesiones: fusionar sin cambiar sesión activa de este tab ──────────────
  if (e.key === LS_SESSIONS_KEY && e.newValue) {
    try {
      const incoming = JSON.parse(e.newValue);
      if (!Array.isArray(incoming)) return;
      for (const s of incoming) {
        const local = sessions.findIndex(x => x.channelId === s.channelId);
        if (local < 0) sessions.push(s);
        else sessions[local] = { ...sessions[local], ...s };
      }
      if (activeSessionIdx >= sessions.length) activeSessionIdx = sessions.length - 1;
      // Si este tab aún no tiene canal (abrió antes de que existiera alguna sesión),
      // heredar la primera sesión disponible y renderizar con datos ya en buffer.
      if (!USER_CHANNEL && sessions.length > 0) {
        const s = sessions[0];
        activeSessionIdx = 0;
        USER_CHANNEL  = s.channelId;
        state.convId  = s.convId  ?? null;
        state.stage   = s.stage   ?? null;
        state.score   = s.score   ?? 0;
        logsChannelId = s.channelId;
        try { localStorage.setItem(LS_LOGS_CH_KEY, s.channelId); } catch {}
        updateStage(s.stage);
        updateMetrics();
        renderTerminalForSession(s.channelId);
        renderApiCallsForSession(s.channelId);
        if (state.convId) subscribeToSSE(state.convId);
      }
      renderSessionList();
      updateLogsSessionSelector();
    } catch {}
  }

  // ── Terminal logs: actualizar buffers y re-renderizar si está visible ─────
  if (e.key === LS_LOGS_KEY && e.newValue) {
    try {
      const incoming = JSON.parse(e.newValue);
      Object.assign(terminalBuffers, incoming);
      const showCh = logsChannelId ?? USER_CHANNEL ?? sessions[0]?.channelId;
      if (showCh) renderTerminalForSession(showCh);
    } catch {}
  }

  // ── API calls: igual que terminal ─────────────────────────────────────────
  if (e.key === LS_APICALLS_KEY && e.newValue) {
    try {
      const incoming = JSON.parse(e.newValue);
      Object.assign(apiCallBuffers, incoming);
      const showCh = logsChannelId ?? USER_CHANNEL ?? sessions[0]?.channelId;
      if (showCh) renderApiCallsForSession(showCh);
    } catch {}
  }
});

// ── Validar sesiones contra el backend al cargar ─────────────────────────────
// Descarta sesiones que ya no existen en la BD (ej: después de reiniciar Docker).
// Se ejecuta una sola vez al inicio, sin bloquear la UI.
async function validateSessionsAfterLoad() {
  if (sessions.length === 0) return;
  const valid = [];
  for (const s of sessions) {
    if (!s.convId) { valid.push(s); continue; }
    try {
      const res = await fetch(
        `${API}/${TENANT}/operator/conversations/${s.convId}/messages`,
        { signal: AbortSignal.timeout(3000) },
      );
      if (res.ok) valid.push(s);
      // 404 o 5xx → conversación no existe → descartar silenciosamente
    } catch {
      valid.push(s); // error de red → conservar (optimista)
    }
  }
  if (valid.length !== sessions.length) {
    sessions = valid;
    if (activeSessionIdx >= sessions.length) activeSessionIdx = sessions.length > 0 ? 0 : -1;
    if (activeSessionIdx >= 0 && sessions[activeSessionIdx]) {
      const s = sessions[activeSessionIdx];
      USER_CHANNEL = s.channelId;
      state.convId = s.convId ?? null;
      state.stage  = s.stage  ?? null;
      state.score  = s.score  ?? 0;
    } else {
      USER_CHANNEL = null;
      state.convId = null;
    }
    saveSessionsToStorage();
    clearLogsFromStorage();
    renderSessionList();
    updateMetrics();
    logStructured('SISTEMA', `${sessions.length === 0 ? 'sesiones descartadas (backend reiniciado)' : `${sessions.length} sesión(es) válidas`}`, USER_CHANNEL);
  }
}

// ── Cargar historial de una conversación en el chat tab ───────────────────────
// Intenta Redis primero; si está vacío (TTL expirado) usa caché local del browser.
async function loadChatHistory(convId, channelId) {
  let loadedFromServer = false;
  try {
    const res = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/messages`);
    if (res.ok) {
      const msgs = await res.json();
      if (msgs.length) {
        loadedFromServer = true;
        for (const m of msgs) {
          const t = new Date(m.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
          if (m.role === 'user') {
            addMsg(m.content, 'user', `Tú · ${t}`, true); // skipHistory=true
          } else if (m.sender === 'operator') {
            addMsg(m.content, 'bot', `🧑‍💼 Operador · ${t}`, true);
          } else if (typeof m.content === 'string' && m.content) {
            addMsg(m.content, 'bot', `Ana · ${t}`, true);
          }
        }
        lastKnownMsgCount = msgs.length;
      }
    }
  } catch {}

  // Fallback: Redis TTL expirado — restaurar desde caché del browser
  if (!loadedFromServer && channelId && chatHistories[channelId]?.length) {
    logStructured('SISTEMA', 'Redis expirado · restaurando chat desde caché local', channelId);
    for (const m of chatHistories[channelId]) {
      addMsg(m.text, m.role, m.meta, true); // skipHistory=true para no duplicar
    }
  }
}
