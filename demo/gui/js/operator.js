// ── Refresh completo del panel operador ──────────────────────────────────────
async function refreshOperator() {
  await Promise.all([loadOpStats(), loadOpLeftPanel()]);
}

// ── Badge de handoffs pendientes ─────────────────────────────────────────────
async function refreshHandoffBadge() {
  try {
    const res = await fetch(`${API}/${TENANT}/operator/stats`);
    if (!res.ok) return;
    const data = await res.json();
    const badge = document.getElementById('handoff-badge');
    if (data.pendingHandoff > 0) {
      badge.textContent = data.pendingHandoff;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch {}
}

// ── Estadísticas del tenant ───────────────────────────────────────────────────
async function loadOpStats() {
  try {
    const res = await fetch(`${API}/${TENANT}/operator/stats`);
    if (!res.ok) return;
    const data = await res.json();
    document.getElementById('op-totalLeads').textContent     = data.totalLeads ?? '–';
    document.getElementById('op-activeConvs').textContent    = data.activeConversations ?? '–';
    document.getElementById('op-pendingHandoff').textContent = data.pendingHandoff ?? '–';
    const badge = document.getElementById('handoff-badge');
    if (data.pendingHandoff > 0) {
      badge.textContent = data.pendingHandoff;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  } catch (err) {
    logStructured('ERROR', `operator stats: ${err.message}`, USER_CHANNEL);
  }
}

// ── Panel izquierdo unificado: conversaciones sin evento + eventos con sesiones ──
async function loadOpLeftPanel() {
  try {
    // Ambas llamadas en paralelo
    const [convsRes, eventsRes] = await Promise.all([
      fetch(`${API}/${TENANT}/operator/conversations/all`),
      fetch(`${API}/${TENANT}/operator/events`),
    ]);
    const convsData = convsRes.ok ? await convsRes.json() : { sinEvento: [], porEvento: [] };
    const events    = eventsRes.ok ? await eventsRes.json() : [];

    // Mapa rápido eventId → conversaciones
    const convsByEvent = new Map(
      (convsData.porEvento ?? []).map(g => [g.eventId, g.conversations])
    );

    renderSinEvento(convsData.sinEvento ?? []);
    renderEventosConSesiones(events, convsByEvent);
  } catch (err) {
    logStructured('ERROR', `loadOpLeftPanel: ${err.message}`, USER_CHANNEL);
  }
}

// Renderiza "Conversaciones sin evento" en #op-conversations
function renderSinEvento(convs) {
  const container = document.getElementById('op-conversations');
  if (!container) return;
  if (!convs.length) {
    container.innerHTML = '<div class="empty-state" style="font-size:11px">Sin conversaciones fuera de evento</div>';
    return;
  }
  container.innerHTML = convs.map(c => sessionRow(c)).join('');
}

// Fila compacta de sesión (usada tanto en "sin evento" como dentro de cada evento)
function sessionRow(c) {
  const icon = c.status === 'CLOSED'
    ? (c.lead?.cierreResult === 'GANADO' ? '✅' : '❌')
    : c.status === 'HANDOFF_PENDING' ? '🔴'
    : c.status === 'WITH_OPERATOR'   ? '🟢' : '⚫';
  const name  = c.lead?.name || '(sin nombre)';
  const stage = c.lead?.stage || 'LEAD';
  const score = c.lead?.score ?? 0;
  const t     = formatDate(c.updatedAt);
  const color = stageTagColor(stage);
  // Indicador de origen de la sesión:
  // ⏳ = en lista de espera (sin cupo disponible)
  // ~  = detectado por keywords del chat (sin reserva aún, en proceso)
  // sin símbolo = tiene reserva activa
  const srcHint = c.isWaitingList
    ? `<span title="En lista de espera" style="color:var(--yellow);font-size:10px">⏳</span>`
    : c.eventDetectedFrom === 'historial'
      ? `<span title="En proceso (sin reserva aún)" style="color:var(--muted);font-size:9px">~</span>`
      : '';
  const sel   = selectedConv?.id === c.id
    ? 'background:rgba(88,166,255,.08);border-color:var(--accent);'
    : c.needsHuman ? 'background:rgba(248,81,73,.04);' : '';
  const borderL = c.needsHuman ? '2px solid var(--red)' : '2px solid transparent';

  return `<div onclick="openConvDetail(${JSON.stringify(c).replace(/"/g, '&quot;')})"
    style="display:flex;align-items:center;gap:5px;padding:4px 6px;border-radius:4px;
           cursor:pointer;font-size:11px;border-left:${borderL};margin-bottom:2px;
           border:1px solid var(--border);${sel}transition:background .12s"
    onmouseover="this.style.background='var(--surface)'"
    onmouseout="this.style.background='${c.needsHuman ? 'rgba(248,81,73,.04)' : (selectedConv?.id === c.id ? 'rgba(88,166,255,.08)' : 'transparent')}'">
    <span style="flex-shrink:0">${icon}</span>
    <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</span>
    ${srcHint}
    <span class="tag tag-${color}" style="font-size:9px;flex-shrink:0">${stage}</span>
    <span style="color:var(--muted);font-size:9px;flex-shrink:0">★${score}</span>
    <span style="color:var(--muted);font-size:9px;flex-shrink:0">${t}</span>
  </div>`;
}

// Renderiza "Eventos y cupos" con sesiones embebidas en #op-events
function renderEventosConSesiones(events, convsByEvent) {
  const container = document.getElementById('op-events');
  if (!container) return;
  if (!events.length) {
    container.innerHTML = '<div class="empty-state">Sin eventos</div>';
    return;
  }

  container.innerHTML = events.map(e => {
    const pct       = e.quota?.occupancyPct ?? 0;
    const fillClass = pct >= 90 ? 'full' : pct >= 60 ? 'warn' : 'ok';
    const tagClass  = pct >= 90 ? 'tag-red' : pct >= 60 ? 'tag-yellow' : 'tag-green';
    const tagText   = pct >= 90 ? '🔴 Lleno' : pct >= 60 ? '⚡ Limitado' : '✓ Libre';
    const allConvs     = convsByEvent.get(e.id) ?? [];
    const normalConvs  = allConvs.filter(c => !c.isWaitingList);
    const wlConvs      = allConvs.filter(c =>  c.isWaitingList);
    const isExpanded   = expandedEvent === e.id;

    // Sesiones activas (reserva o keyword-detected, sin lista de espera)
    const sessionSection = normalConvs.length > 0 ? `
      <div style="margin-top:7px">
        <div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;
             margin-bottom:3px;padding-bottom:2px;border-bottom:1px solid var(--border)">
          Sesiones (${normalConvs.length}) · ${normalConvs.filter(c => c.needsHuman).length} con escala
        </div>
        ${normalConvs.map(c => sessionRow(c)).join('')}
      </div>` : `
      <div style="margin-top:6px;font-size:10px;color:var(--muted);font-style:italic">
        Sin sesiones activas
      </div>`;

    // Etiqueta del botón de lista de espera
    const wlLabel = isExpanded ? '▲ Ocultar lista de espera' : '▼ Lista de espera';
    const wlBadge = wlConvs.length > 0
      ? `<span style="margin-left:6px;background:var(--yellow);color:#000;font-size:9px;
           padding:1px 5px;border-radius:8px;font-weight:700">${wlConvs.length}</span>`
      : '';

    // Contenido de la lista de espera cuando está expandida
    const wlSessionsHtml = wlConvs.length > 0 ? `
      <div style="margin-bottom:4px">
        <div style="font-size:9px;color:var(--yellow);text-transform:uppercase;letter-spacing:.06em;
             margin-bottom:3px;padding-bottom:2px;border-bottom:1px solid var(--border)">
          En espera — sesiones activas
        </div>
        ${wlConvs.map(c => sessionRow(c)).join('')}
      </div>` : '';

    return `
      <div class="evt-card">
        <div class="evt-header">
          <div class="evt-name" style="font-size:12px">${e.name}</div>
          <span class="tag ${tagClass}" style="font-size:10px">${tagText}</span>
        </div>
        <div class="evt-quota" style="font-size:10px">
          <span>Tot:<b>${e.quota?.total ?? 0}</b></span>
          <span>Res:<b>${e.quota?.reserved ?? 0}</b></span>
          <span>Conf:<b>${e.quota?.confirmed ?? 0}</b></span>
          <span style="color:var(--green)">Libre:<b>${e.quota?.available ?? 0}</b></span>
        </div>
        <div class="quota-bar"><div class="quota-fill ${fillClass}" style="width:${pct}%"></div></div>
        ${sessionSection}
        <button class="btn" style="margin-top:6px;padding:2px 8px;font-size:10px;width:100%;justify-content:center"
          onclick="toggleWaitlist('${e.id}')">${wlLabel}${wlBadge}</button>
        <div id="wl-${e.id}" style="display:${isExpanded ? 'block' : 'none'};margin-top:4px">
          ${isExpanded ? wlSessionsHtml : ''}
        </div>
      </div>`;
  }).join('');
  // loadWaitlist() ya no se llama aquí:
  // las sesiones de lista de espera vienen de getAllConversationsGrouped (wlConvs),
  // que usa isWaitingList para clasificarlas. loadWaitlist() leía WaitingListEntry
  // y sobreescribía el contenido con "Lista vacía" cuando el tool no fue llamado.
}

// Mantener por compatibilidad con llamados existentes
async function loadOpConversations() { await loadOpLeftPanel(); }

// ── Detalle de conversación ───────────────────────────────────────────────────
async function openConvDetail(conv) {
  selectedConv = conv;
  const panel = document.getElementById('op-detail');
  const lead = conv.lead || {};
  const esc = conv.needsHuman;

  panel.innerHTML = `
    <div style="padding:14px 16px;border-bottom:1px solid var(--border);flex-shrink:0;background:var(--surface)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div>
          <div style="font-size:15px;font-weight:700">${lead.name || '(sin nombre)'}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:2px">
            ${lead.email || '–'} · ${lead.phone || '–'}
          </div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          ${esc ? '<span class="tag tag-red">🚨 Escalar</span>' : ''}
          <span class="tag tag-${stageTagColor(lead.stage)}">${lead.stage || 'LEAD'}</span>
          <span class="tag tag-green">★ ${lead.score ?? 0}</span>
        </div>
      </div>
      ${lead.stage === 'SQL' ? `
      <div style="display:flex;gap:8px">
        <button class="btn primary" style="flex:1;justify-content:center;background:var(--green);border-color:var(--green)"
          onclick="closeConv('${conv.id}','GANADO')">✓ Ganado</button>
        <button class="btn" style="flex:1;justify-content:center;color:var(--red);border-color:var(--red)"
          onclick="closeConv('${conv.id}','PERDIDO')">✗ Perdido</button>
      </div>` : ''}
      ${esc && lead.stage !== 'SQL' ? `
      <div style="display:flex;gap:8px;margin-top:6px">
        <button class="btn" style="flex:1;justify-content:center"
          onclick="reactivateBot('${conv.id}')">🤖 Reactivar conversación con bot</button>
      </div>` : ''}
    </div>
    <div id="op-chat-history"
         style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:6px;background:var(--bg)">
      <div style="text-align:center;color:var(--muted);font-size:12px">Cargando historial...</div>
    </div>
    <div style="padding:10px 12px;border-top:1px solid var(--border);background:var(--surface);display:flex;gap:8px;flex-shrink:0">
      <input id="op-msg-input" type="text" placeholder="Escribe un mensaje como operador..."
        style="flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:8px;
               padding:8px 12px;color:var(--text);font-family:Inter,sans-serif;font-size:13px;outline:none"
        onkeydown="if(event.key==='Enter') sendOpMessage('${conv.id}')" />
      <button class="btn primary" onclick="sendOpMessage('${conv.id}')">Enviar</button>
    </div>`;

  await loadConvHistory(conv.id);
  startDetailPolling(conv.id);
  // Refrescar panel izquierdo sin await para no bloquear la apertura del detalle
  loadOpLeftPanel().catch(() => {});
}

// ── Historial de mensajes (panel operador) ────────────────────────────────────
async function loadConvHistory(convId) {
  const container = document.getElementById('op-chat-history');
  if (!container) return;
  try {
    const res = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/messages`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const msgs = await res.json();
    if (!msgs.length) {
      container.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:12px;padding:20px">Sin mensajes en sesión activa</div>';
      return;
    }
    container.innerHTML = msgs.map(m => {
      const isUser = m.role === 'user';
      const isOp   = m.sender === 'operator';
      const align  = isUser ? 'flex-end' : 'flex-start';
      const bg     = isUser ? 'var(--accent)' : isOp ? 'rgba(188,140,255,.2)' : 'var(--surface2)';
      const color  = isUser ? '#000' : 'var(--text)';
      const border = isOp ? '1px solid rgba(188,140,255,.4)' : isUser ? 'none' : '1px solid var(--border)';
      const label  = isUser ? ''
        : isOp ? '<span style="font-size:10px;color:var(--purple);display:block;margin-bottom:2px">🧑‍💼 Operador</span>'
               : '<span style="font-size:10px;color:var(--green);display:block;margin-bottom:2px">🤖 Bot</span>';
      const t = new Date(m.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
      return `<div style="display:flex;flex-direction:column;align-items:${align}">
        ${label}
        <div style="max-width:80%;padding:8px 12px;border-radius:10px;font-size:13px;
                    background:${bg};color:${color};border:${border}">
          ${m.content}
          <div style="font-size:10px;opacity:.6;margin-top:3px;text-align:${isUser ? 'right' : 'left'}">${t}</div>
        </div>
      </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
  } catch (err) {
    if (container) container.innerHTML = `<div style="color:var(--red);font-size:12px;padding:12px">Error: ${err.message}</div>`;
  }
}

// ── Envío de mensaje del operador ────────────────────────────────────────────
async function sendOpMessage(convId) {
  const input = document.getElementById('op-msg-input');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  input.value = '';
  try {
    const res = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, operatorId: 'demo-operator' }),
    });
    if (res.status === 404 || res.status === 500) {
      logStructured('SISTEMA', `conv ${convId.slice(0,8)} ya no existe — panel limpiado`, USER_CHANNEL);
      selectedConv = null;
      stopDetailPolling();
      document.getElementById('op-detail').innerHTML = `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;
                    color:var(--muted);flex-direction:column;gap:8px">
          <div style="font-size:32px">⚠️</div>
          <div style="font-size:13px">Esta conversación ya no existe (demo reseteado)</div>
        </div>`;
      await refreshOperator();
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // Log del mensaje del operador en el canal correspondiente
    const opSession = sessions.find(s => s.convId === convId);
    const opCh = opSession?.channelId ?? USER_CHANNEL;
    logStructured('OPERADOR', `"${text.slice(0, 80)}"`, opCh);
    logToSession(convId, 'OPERADOR', text);
    logToSession(convId, 'API_CALL', `POST /operator/conversations/${convId.slice(0,8)}/message 200`);
    await flushSessionLog(convId);
    await loadConvHistory(convId);
  } catch (err) {
    logStructured('ERROR', `envío operador: ${err.message}`, USER_CHANNEL);
  }
}

// ── Cierre de conversación ────────────────────────────────────────────────────
async function closeConv(convId, outcome) {
  if (!confirm(`¿Cerrar conversación como ${outcome}?`)) return;
  stopDetailPolling();
  try {
    const res = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome, operatorId: 'demo-operator' }),
    });
    // Conversación eliminada (ej. reset demo ejecutado mientras el panel estaba abierto)
    if (res.status === 404 || res.status === 500) {
      logStructured('SISTEMA', `conv ${convId.slice(0,8)} ya no existe en BD`, USER_CHANNEL);
      selectedConv = null;
      document.getElementById('op-detail').innerHTML = `
        <div style="flex:1;display:flex;align-items:center;justify-content:center;
                    color:var(--muted);flex-direction:column;gap:8px">
          <div style="font-size:32px">⚠️</div>
          <div style="font-size:13px">Esta conversación ya no existe (demo reseteado)</div>
        </div>`;
      await refreshOperator();
      return;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const closeCh = sessions.find(s => s.convId === convId)?.channelId ?? USER_CHANNEL;
    logStructured('SISTEMA', `conv ${convId.slice(0,8)} cerrada como ${outcome}`, closeCh);
    selectedConv = null;
    document.getElementById('op-detail').innerHTML = `
      <div style="flex:1;display:flex;align-items:center;justify-content:center;color:var(--muted);flex-direction:column;gap:8px">
        <div style="font-size:32px">${outcome === 'GANADO' ? '🏆' : '📋'}</div>
        <div style="font-size:13px">Conversación cerrada como
          <strong style="color:${outcome === 'GANADO' ? 'var(--green)' : 'var(--red)'}">${outcome}</strong>
        </div>
      </div>`;
    await refreshOperator();
  } catch (err) {
    logStructured('ERROR', `cierre conversación: ${err.message}`, USER_CHANNEL);
  }
}

async function toggleWaitlist(eventId) {
  expandedEvent = expandedEvent === eventId ? null : eventId;
  await loadOpLeftPanel();
}

async function loadOpEvents() { await loadOpLeftPanel(); }

async function loadWaitlist(eventId) {
  const container = document.getElementById(`wl-${eventId}`);
  if (!container) return;
  container.innerHTML = '<div style="color:var(--muted);font-size:10px;padding:4px 0">Cargando...</div>';
  try {
    const res = await fetch(`${API}/${TENANT}/operator/events/${eventId}/waitlist`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    if (!list.length) {
      container.innerHTML = '<div style="color:var(--muted);font-size:10px;padding:4px 0">Lista vacía</div>';
      return;
    }
    container.innerHTML = list.map(e => `
      <div class="wl-row" style="font-size:11px">
        <div class="wl-pos" style="font-size:9px">${e.position}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600">${e.leadName || '–'}</div>
          <div style="color:var(--muted);font-size:10px">${e.leadEmail || '–'}</div>
        </div>
        <div style="display:flex;gap:4px">
          <span class="tag tag-green" style="font-size:9px">★${e.score ?? 0}</span>
          <span class="tag tag-blue"  style="font-size:9px">${e.status}</span>
        </div>
      </div>`).join('');
  } catch (err) {
    container.innerHTML = `<div style="color:var(--red);font-size:10px;padding:4px 0">Error: ${err.message}</div>`;
  }
}

// ── Actualización de cupos en el sidebar derecho ──────────────────────────────
async function refreshSidebarEvents() {
  try {
    const res = await fetch(`${API}/${TENANT}/operator/events`);
    if (!res.ok) return;
    const events = await res.json();
    for (const e of events) {
      const key  = e.id.replace('EVT-', '');
      const qtEl = document.getElementById(`qt-${key}`);
      const qfEl = document.getElementById(`qf-${key}`);
      if (!qtEl || !qfEl) continue;
      const pct   = e.quota?.occupancyPct ?? 0;
      const avail = e.quota?.available ?? 0;
      if (pct >= 90) {
        qtEl.className = 'tag tag-red';
        qtEl.textContent = `🔴 ${avail} cupos`;
      } else if (pct >= 60) {
        qtEl.className = 'tag tag-yellow';
        qtEl.textContent = `⚡ ${avail} cupos`;
      } else {
        qtEl.className = 'tag tag-green';
        qtEl.textContent = `✓ ${avail} cupos`;
      }
      qfEl.style.width      = pct + '%';
      qfEl.style.background = pct >= 90 ? 'var(--red)' : pct >= 60 ? 'var(--yellow)' : 'var(--green)';
    }
  } catch {}
}

// ── Reactivar conversación con el bot (solo leads fuera de SQL) ───────────────
async function reactivateBot(convId) {
  if (!confirm('¿Devolver esta conversación al bot automático?')) return;
  try {
    const res = await fetch(`${API}/${TENANT}/operator/conversations/${convId}/reactivate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operatorId: 'demo-operator' }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    const data = await res.json();
    const reactCh = sessions.find(s => s.convId === convId)?.channelId ?? USER_CHANNEL;
    logStructured('SISTEMA', `bot reactivado · análisis de contexto completado (tools=${data.toolCallsExecuted ?? 0})`, reactCh);
    if (data.botResponse) {
      logStructured('BOT', `"${data.botResponse.slice(0, 100)}"`, reactCh);
    }
    stopDetailPolling();
    selectedConv = null;
    document.getElementById('op-detail').innerHTML = `
      <div style="flex:1;display:flex;align-items:center;justify-content:center;
                  color:var(--muted);flex-direction:column;gap:12px">
        <div style="font-size:32px">🤖</div>
        <div style="font-size:13px">Bot reactivado — contexto analizado</div>
        ${data.botResponse ? `
          <div style="max-width:320px;padding:10px 14px;background:var(--surface2);border:1px solid var(--border);
               border-radius:8px;font-size:12px;color:var(--text);text-align:left">
            <div style="font-size:10px;color:var(--green);margin-bottom:4px">🤖 Bot (primer mensaje al cliente)</div>
            "${data.botResponse.slice(0, 200)}${data.botResponse.length > 200 ? '…' : ''}"
          </div>` : ''}
      </div>`;
    await refreshOperator();
  } catch (err) {
    logStructured('ERROR', `reactivar bot: ${err.message}`, USER_CHANNEL);
  }
}
