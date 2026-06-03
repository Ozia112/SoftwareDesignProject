// ── Polling: cliente escucha mensajes del operador ───────────────────────────
async function startOperatorPolling(convId) {
  if (opClientPollingInterval) return;
  // Tomar baseline para no re-renderizar mensajes ya mostrados
  try {
    const r = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/messages`);
    if (r.ok) lastKnownMsgCount = (await r.json()).length;
  } catch {}

  opClientPollingInterval = setInterval(async () => {
    try {
      const res = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/messages`);
      if (!res.ok) return;
      const msgs = await res.json();
      if (msgs.length <= lastKnownMsgCount) return;
      const newMsgs = msgs.slice(lastKnownMsgCount);
      lastKnownMsgCount = msgs.length;
      for (const m of newMsgs) {
        const t = new Date(m.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
        if (m.sender === 'operator') {
          addMsg(m.content, 'bot', `🧑‍💼 Operador · ${t}`);
          logToSession(convId, 'OPERADOR_RECIBIDO', m.content.slice(0, 300));
          userState = 'reading';
        } else if (m.role === 'assistant' && typeof m.content === 'string' && m.content) {
          // Mensajes del bot después de reactivación — también deben mostrarse al cliente
          addMsg(m.content, 'bot', `Ana · ${t}`);
          logStructured('BOT', `"${m.content.slice(0, 100)}"`, USER_CHANNEL);
          userState = 'reading';
        }
      }
    } catch {}
  }, 4000);
}

function stopOperatorPolling() {
  clearInterval(opClientPollingInterval);
  opClientPollingInterval = null;
  lastKnownMsgCount = 0;
}

// ── Polling: operador ve mensajes nuevos del cliente ─────────────────────────
function startDetailPolling(convId) {
  stopDetailPolling();
  opDetailPollingInterval = setInterval(async () => loadConvHistory(convId), 4000);
}

function stopDetailPolling() {
  clearInterval(opDetailPollingInterval);
  opDetailPollingInterval = null;
}
