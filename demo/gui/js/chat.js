// ── Mensajes automáticos de entrada por anuncio ───────────────────────────────
const AD_MESSAGES = {
  excel:     'Hola, vi el anuncio del Curso Excel Avanzado y me gustaría inscribirme',
  powerbi:   'Hola, vi el anuncio del Taller Power BI y quiero conocer más detalles para inscribirme',
  diplomado: 'Hola, vi el anuncio del Diplomado de Contabilidad Digital y estoy interesado en inscribirme',
};

// ── Parser del debugLog del servidor ─────────────────────────────────────────
// Usado como fallback cuando SSE no está conectado (primer mensaje de la sesión).
// Para parsear el nombre del tool usa computeToolDetail de polling.js.
function parseServerDebugLog(debugLog, ch) {
  for (const raw of debugLog) {
    // ── Tool call ───────────────────────────────────────────────────────
    if (raw.startsWith('🔧 TOOL:')) {
      const m = raw.match(/🔧 TOOL:\s+(\S+)\s+(.*)/);
      if (!m) continue;
      const toolName = m[1];
      let input = {};
      try { input = JSON.parse(m[2].trim()); } catch {}
      logStructured('TOOL', computeToolDetail(toolName, input), ch);

    // ── Transición de etapa ─────────────────────────────────────────────
    } else if (raw.includes('🏷️') && raw.includes('→')) {
      const m = raw.match(/Etapa:\s+(\w+)\s+→\s+(\w+)\s+\(score:\s*(\d+)\)/);
      if (m) logStructured('ETAPA', `${m[1]} → ${m[2]} · score=${m[3]}`, ch);

    // ── Cupo reservado ──────────────────────────────────────────────────
    } else if (raw.includes('📋 Cupo reservado')) {
      const ridM = raw.match(/"reservationId":"([^"]+)"/);
      const expM = raw.match(/"expiresAt":"([^"]+)"/);
      const shortId = ridM ? ridM[1].slice(-8) : '?';
      const exp = expM
        ? new Date(expM[1]).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        : '?';
      logStructured('RESERVA', `id=${shortId} · exp=${exp}`, ch);

    // ── Banco de contexto (solo si tiene contenido) ─────────────────────
    } else if (raw.includes('📚 Banco de contexto')) {
      const ctx = raw.replace(/.*→\s*/, '').trim();
      if (ctx && ctx !== '(vacío)' && ctx !== '{}') {
        logStructured('CONTEXTO', ctx.slice(0, 60), ch);
      }

    // ── Escalación ──────────────────────────────────────────────────────
    } else if (raw.includes('🚨 ESCALACIÓN') && !raw.includes('AUTOMÁTICA')) {
      const reason = raw.replace(/.*ESCALACIÓN:\s*/, '').trim();
      logStructured('ESCALA', reason, ch);

    // ── Handoff solicitado (ya cubierto por ESCALA, omitir) ─────────────
    } else if (raw.includes('HANDOFF solicitado')) {
      // skip

    // ── Error de validación o precondición ──────────────────────────────
    } else if (raw.includes('✗ Error') || raw.includes('STAGE_PRECONDITION')) {
      const msg = raw.replace(/.*✗\s*Error:\s*/, '').replace(/.*Error:\s*/, '').trim();
      logStructured('ERROR', msg.slice(0, 120), ch);

    // ── Timeout o error del LLM ─────────────────────────────────────────
    } else if (raw.startsWith('❌')) {
      logStructured('ERROR', raw.replace(/^❌\s*/, '').trim().slice(0, 120), ch);

    // ── Fallback del sistema ────────────────────────────────────────────
    } else if (raw.startsWith('🚨 FALLBACK') || raw.startsWith('🚨 ESCALACIÓN AUTOMÁTICA')) {
      logStructured('SISTEMA', raw.replace(/^🚨\s*/, '').trim().slice(0, 100), ch);
    }
    // Líneas "sin cambio", "✓ ...", "📝 Lista de espera" → omitidas (ruido)
  }
}

// ── Envío al servidor ─────────────────────────────────────────────────────────
async function sendMessage(text) {
  setTyping(true);
  state.turns++;

  const ch    = USER_CHANNEL;   // canal activo al momento del envío
  const msgId = `gui-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sentByThisTab.add(msgId);    // dedup: este tab ya registrará el API call localmente
  const body = {
    channelId: ch,
    text,
    messageId: msgId,
  };

  logStructured('API→', `POST /${TENANT}/messages · "${text.replace(/\n/g,' ↵ ').slice(0,70)}"`, ch);

  try {
    const res = await fetch(`${API}/${TENANT}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    apiLog('POST', `${API}/${TENANT}/messages`, res.status, body, data, ch);
    setTyping(false);

    // Respuesta del bot o mensaje del sistema
    if (data.response) {
      addMsg(data.response, 'bot', `Ana · ${now()}`);
      if (data.routedTo !== 'operator') {
        logStructured('BOT', `"${data.response.slice(0, 100)}"`, ch);
      }
    }

    // debugLog como fallback: si SSE aún no está conectado (primer mensaje de la sesión),
    // parsear localmente. En mensajes posteriores los eventos llegan por SSE.
    if (data.debugLog?.length && !sseConnected) {
      parseServerDebugLog(data.debugLog, ch);
    }
    // El apiLog del POST siempre se registra en el tab que envía el mensaje.
    // El otro tab lo recibe por SSE (caso api_call en handleSSEEvent).

    // Persistencia en archivo para análisis
    const cid = state.convId || data.conversationId;
    if (cid) {
      logToSession(cid, 'API_REQUEST', `POST ${API}/${TENANT}/messages`);
      logToSession(cid, 'API_RESPONSE',
        `${res.status} routedTo=${data.routedTo||'bot'} stage=${data.stage||'?'} score=${data.score??'?'} tools=${data.toolCallsExecuted??0}`);
      if (data.response) logToSession(cid, data.routedTo === 'operator' ? 'SISTEMA' : 'BOT', data.response);
    }

    // API response line en terminal
    if (data.routedTo === 'operator') {
      logStructured('SISTEMA', `mensaje enrutado a operador · conv en HANDOFF_PENDING`, ch);
      logStructured('API←', `${res.status} · routedTo=operator`, ch);
    } else {
      const apiDetail = `${res.status} · stage=${data.stage||'?'} · score=${data.score??'?'} · tools=${data.toolCallsExecuted??0}${data.handoffTriggered?' · handoff=true':''}`;
      logStructured('API←', apiDetail, ch);
    }

    // Actualizar estado de la app
    if (data.stage)               updateStage(data.stage);
    if (data.score !== undefined) state.score = data.score;
    if (data.toolCallsExecuted)   state.toolCalls += data.toolCallsExecuted;
    if (data.leadId)              state.leadId = data.leadId;

    if (data.conversationId) {
      state.convId = data.conversationId;
      addOrUpdateSession(ch, data.conversationId, currentScenarioLabel, data.stage, state.score);
      // Abrir SSE para recibir eventos en tiempo real (y cross-tab) a partir del 2do mensaje
      subscribeToSSE(data.conversationId);
    }
    if (data.handoffTriggered && state.convId) {
      const si = sessions.findIndex(s => s.channelId === ch);
      if (si >= 0) { sessions[si].hasOperator = true; renderSessionList(); }
    }
    updateMetrics();

    if (data.handoffTriggered) {
      if (cid) logToSession(cid, 'HANDOFF', 'Conversación asignada a operador humano');
      refreshHandoffBadge();
      refreshSidebarEvents();
      if (state.convId) startOperatorPolling(state.convId);
    }

    if (cid) await flushSessionLog(cid);

  } catch (err) {
    setTyping(false);
    logStructured('ERROR', `red: ${err.message}`, ch);
    addMsg('⚠️ Error conectando al servidor. ¿Está corriendo el orquestador?', 'system-msg');
  }
}

// ── Captura y debounce del input del usuario ──────────────────────────────────
async function sendMsg() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;
  input.value = '';

  addMsg(text, 'user', `Tú · ${now()}`);
  state.messages++;
  updateMetrics();

  // Log CLIENTE en terminal y en archivo
  logStructured('CLIENTE', `"${text.replace(/\n/g, ' ↵ ').slice(0, 100)}"`, USER_CHANNEL);
  if (state.convId) logToSession(state.convId, 'CLIENTE', text);

  pendingMessages.push(text);
  clearTimeout(flushTimer);
  flushTimer = setTimeout(tryFlush, 4000);
}

// Espera a que el usuario termine de escribir antes de enviar al servidor
async function tryFlush() {
  if (userState === 'typing') {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(tryFlush, 4000);
    return;
  }
  if (pendingMessages.length === 0) return;
  const combined = pendingMessages.join('\n');
  pendingMessages = [];
  userState = 'waiting';
  await sendMessage(combined);
}

// ── Reset de sesión local (no toca la BD) ────────────────────────────────────
function clearAll() {
  if (state.convId) flushSessionLog(state.convId);
  stopOperatorPolling();
  stopDetailPolling();
  unsubscribeSSE();
  clearTimeout(flushTimer);
  clearTimeout(typingInactivityTimer);
  pendingMessages = [];
  userState = 'reading';
  currentScenarioLabel = 'Chat manual';
  newChannel();
  logsChannelId = USER_CHANNEL;  // el nuevo canal pasa a ser el canal de logs
  // Renderizar terminal y API calls vacíos para el nuevo canal
  renderTerminalForSession(USER_CHANNEL);
  renderApiCallsForSession(USER_CHANNEL);
  logStructured('SESION', `nueva sesión · channel=${USER_CHANNEL}`, USER_CHANNEL);
  document.getElementById('chat-area').innerHTML =
    '<div class="msg system-msg">Nueva sesión — el bot no recuerda la conversación anterior</div>';
  state = { stage: null, score: 0, toolCalls: 0, messages: 0, turns: 0, leadId: null, convId: null };
  ['LEAD', 'MQL', 'PROSPECTO', 'SQL', 'CIERRE'].forEach(s => {
    const el = document.getElementById(`s-${s}`);
    if (el) el.className = 'stage-item pending';
  });
  updateMetrics();
}

// ── Reset completo de la demo (llama a la BD) ────────────────────────────────
async function resetDemo() {
  if (!confirm('¿Eliminar TODOS los leads, conversaciones y reservas? Los eventos y credenciales se conservan.')) return;
  try {
    const res = await fetch(`${API.replace('/v1', '')}/v1/admin/reset-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: TENANT }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    clearAll();
    logStructured('SISTEMA',
      `reset demo · leads=${data.deleted?.leads??0} convs=${data.deleted?.conversations??0} reservas=${data.deleted?.reservations??0}`,
      USER_CHANNEL);
    sessions = [];
    activeSessionIdx = -1;
    Object.keys(chatHistories).forEach(k => delete chatHistories[k]);
    // Limpiar todos los buffers en memoria y en localStorage
    Object.keys(apiCallBuffers).forEach(k => delete apiCallBuffers[k]);
    Object.keys(terminalBuffers).forEach(k => delete terminalBuffers[k]);
    saveSessionsToStorage();   // persiste array vacío → otras pestañas ven reset
    clearLogsFromStorage();    // borra logs del localStorage
    renderApiCallsForSession(USER_CHANNEL);
    renderSessionList();
    updateLogsSessionSelector();
    // Limpiar el panel del operador
    selectedConv = null;
    stopDetailPolling();
    const opDetail = document.getElementById('op-detail');
    if (opDetail) opDetail.innerHTML = `
      <div style="flex:1;display:flex;align-items:center;justify-content:center;
                  color:var(--muted);flex-direction:column;gap:8px">
        <div style="font-size:32px">🧑‍💼</div>
        <div style="font-size:13px">Selecciona una conversación para ver el detalle</div>
      </div>`;
    refreshSidebarEvents();
    refreshHandoffBadge();
  } catch (err) {
    logStructured('ERROR', `reset demo: ${err.message}`, USER_CHANNEL);
  }
}

// ── Inicio de escenario desde anuncio ────────────────────────────────────────
async function startFromAd(course) {
  clearAll();
  currentScenarioLabel = { excel: '📊 Excel', powerbi: '📈 Power BI', diplomado: '🎓 Diplomado' }[course] || 'Chat';
  logStructured('SESION', `clic en anuncio · ${course} · channel=${USER_CHANNEL}`, USER_CHANNEL);
  const msg = AD_MESSAGES[course];
  if (!msg) return;
  switchTab('chat');
  addMsg(`🎯 Clic en anuncio: ${course}`, 'system-msg');
  await delay(400);
  addMsg(msg, 'user', `Tú · ${now()}`);
  state.messages++;
  updateMetrics();
  logStructured('CLIENTE', `"${msg.slice(0, 100)}"`, USER_CHANNEL);
  await sendMessage(msg);
}
