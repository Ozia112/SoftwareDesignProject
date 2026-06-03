// ── Mensajes automáticos de entrada por anuncio ───────────────────────────────
const AD_MESSAGES = {
  excel:     'Hola, vi el anuncio del Curso Excel Avanzado y me gustaría inscribirme',
  powerbi:   'Hola, vi el anuncio del Taller Power BI y quiero conocer más detalles para inscribirme',
  diplomado: 'Hola, vi el anuncio del Diplomado de Contabilidad Digital y estoy interesado en inscribirme',
};

// ── Parser del debugLog del servidor ─────────────────────────────────────────
// Convierte las líneas con emojis del AgentRunner al formato estructurado del terminal.
// Reglas: TOOL (qué llamó), ETAPA (cuando hubo transición), ERROR (fallos).
// Los "sin cambio" se omiten — están implícitos en la ausencia de ETAPA.
function parseServerDebugLog(debugLog, ch) {
  let currentTool = null;

  for (const raw of debugLog) {
    // ── Tool call ───────────────────────────────────────────────────────
    if (raw.startsWith('🔧 TOOL:')) {
      const m = raw.match(/🔧 TOOL:\s+(\S+)\s+(.*)/);
      if (!m) continue;
      currentTool = m[1];
      let detail = currentTool;
      try {
        const p = JSON.parse(m[2].trim());
        if (currentTool === 'emit_stage_signal') {
          detail = `emit_stage_signal · signal=${p.signal}`;
          if (p.contactName)     detail += ` · name="${p.contactName}"`;
          if (p.contactEmail)    detail += ` · email=${p.contactEmail}`;
          if (p.contactPhone)    detail += ` · phone=${p.contactPhone}`;
          if (p.interestedEvent) detail += ` · curso="${p.interestedEvent}"`;
        } else if (currentTool === 'reserve_quota' || currentTool === 'block_quota' || currentTool === 'release_quota') {
          detail = `${currentTool} · event=${p.eventId ?? '?'}`;
        } else if (currentTool === 'request_human_handoff') {
          detail = `request_human_handoff · reason=${p.reason}`;
        } else if (currentTool === 'get_event_context') {
          detail = `get_event_context · event=${p.eventId}`;
        } else if (currentTool === 'get_general_context') {
          detail = 'get_general_context';
        } else if (currentTool === 'register_waiting_list') {
          detail = `register_waiting_list · event=${p.eventId ?? '?'}`;
        } else {
          detail = `${currentTool} · ${m[2].trim().slice(0, 80)}`;
        }
      } catch { detail = `${currentTool} · ${m[2].trim().slice(0, 80)}`; }
      logStructured('TOOL', detail, ch);

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

  const ch = USER_CHANNEL;   // canal activo al momento del envío
  const body = {
    channelId: ch,
    text,
    messageId: `gui-${Date.now()}-${Math.random().toString(36).slice(2)}`,
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

    // Parsear debugLog del servidor (tool calls, etapas, errores)
    if (data.debugLog?.length) {
      parseServerDebugLog(data.debugLog, ch);
    }

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
  clearTimeout(flushTimer);
  clearTimeout(typingInactivityTimer);
  pendingMessages = [];
  userState = 'reading';
  currentScenarioLabel = 'Chat manual';
  newChannel();
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
    // Limpiar todos los buffers de API calls (reset completo)
    Object.keys(apiCallBuffers).forEach(k => delete apiCallBuffers[k]);
    renderApiCallsForSession(USER_CHANNEL);
    renderSessionList();
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
