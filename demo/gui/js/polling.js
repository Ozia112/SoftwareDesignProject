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

// ── SSE: stream de eventos de conversación en tiempo real ─────────────────────
// Cada pestaña suscrita al mismo convId recibe los mismos eventos.
// Cuando el AgentRunner procesa un mensaje, emite tool_call / stage_change /
// escalation / error / bot_message — visibles en ambas pestañas sin polling.

let sseSource = null;
let sseConvId = null;
let sseConnected = false;

function subscribeToSSE(convId) {
  if (!convId || sseConvId === convId) return;
  unsubscribeSSE();
  sseConvId     = convId;
  sseConnected  = false;
  sseSource = new EventSource(`${API}/${TENANT}/conversations/${convId}/events`);

  sseSource.onopen = () => {
    sseConnected = true;
    logStructured('SISTEMA', `SSE conectado · conv=${convId.slice(0, 12)}…`, USER_CHANNEL);
  };

  sseSource.onmessage = (e) => {
    try {
      const evt = JSON.parse(e.data);
      handleSSEEvent(evt);
    } catch {}
  };

  sseSource.onerror = () => {
    // El navegador reintenta automáticamente — solo limpiar el flag de conexión
    sseConnected = false;
  };
}

function unsubscribeSSE() {
  if (sseSource) {
    sseSource.close();
    sseSource     = null;
    sseConvId     = null;
    sseConnected  = false;
  }
}

// ── Despacho de eventos SSE al terminal ──────────────────────────────────────
function handleSSEEvent(evt) {
  const ch = USER_CHANNEL;
  const d  = evt.data ?? {};

  switch (evt.type) {
    case 'tool_call':
      logStructured('TOOL', computeToolDetail(d.name, d.input ?? {}), ch);
      break;

    case 'stage_change':
      logStructured('ETAPA', `${d.from} → ${d.to} · score=${d.score ?? '?'}`, ch);
      updateStage(d.to);
      if (d.score !== undefined) {
        state.score = d.score;
        updateMetrics();
      }
      break;

    case 'escalation':
      logStructured('ESCALA', d.reason ?? 'escalación detectada', ch);
      break;

    case 'bot_message':
      if (d.text) logStructured('BOT', `"${String(d.text).slice(0, 100)}"`, ch);
      break;

    case 'error':
      logStructured('ERROR', d.message ?? 'error desconocido', ch);
      break;

    case 'api_call':
      // Omitir si este tab generó el messageId — ya lo registró desde la respuesta POST
      if (d.messageId && sentByThisTab.has(d.messageId)) break;
      apiLog(d.method, d.url, d.status, d.req, d.res, ch);
      logStructured('API←', `${d.status} · stage=${d.res?.stage ?? '?'} · score=${d.res?.score ?? '?'} · tools=${d.res?.tools ?? 0}`, ch);
      break;
  }
}

// ── Cálculo del detalle de tool call (compartido con parseServerDebugLog) ─────
function computeToolDetail(name, input) {
  const p = input ?? {};
  if (name === 'emit_stage_signal') {
    let detail = `emit_stage_signal · signal=${p.signal}`;
    if (p.contactName)     detail += ` · name="${p.contactName}"`;
    if (p.contactEmail)    detail += ` · email=${p.contactEmail}`;
    if (p.contactPhone)    detail += ` · phone=${p.contactPhone}`;
    if (p.interestedEvent) detail += ` · curso="${p.interestedEvent}"`;
    return detail;
  }
  if (name === 'reserve_quota' || name === 'block_quota' || name === 'release_quota') {
    return `${name} · event=${p.eventId ?? '?'}`;
  }
  if (name === 'request_human_handoff') return `request_human_handoff · reason=${p.reason}`;
  if (name === 'get_event_context')     return `get_event_context · event=${p.eventId}`;
  if (name === 'get_general_context')   return 'get_general_context';
  if (name === 'register_waiting_list') return `register_waiting_list · event=${p.eventId ?? '?'}`;
  return `${name} · ${JSON.stringify(p).slice(0, 80)}`;
}
