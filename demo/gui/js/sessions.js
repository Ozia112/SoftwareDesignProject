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
  if (s.convId) await loadChatHistory(s.convId, s.channelId);
  if (s.hasOperator) startOperatorPolling(s.convId);
  renderSessionList();
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
