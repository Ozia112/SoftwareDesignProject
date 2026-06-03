// ── Utilidades de tiempo ──────────────────────────────────────────────────────
function now() {
  return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDate(iso) {
  if (!iso) return '–';
  return new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

function stageTagColor(stage) {
  return { LEAD: 'blue', MQL: 'blue', PROSPECTO: 'purple', SQL: 'yellow', CIERRE: 'green' }[stage] ?? 'blue';
}

// ── Terminal estructurada por sesión ─────────────────────────────────────────
// Formato: [HH:mm:ss][shortId][ACTOR] detalle
// Solo muestra los logs de la sesión activa (USER_CHANNEL).

const ACTOR_COLORS = {
  CLIENTE:  'info',     // cyan  — mensaje enviado por el usuario
  BOT:      'success',  // green — respuesta del bot
  OPERADOR: 'warn',     // yellow — mensaje del operador humano
  TOOL:     'dim',      // muted — herramienta llamada por el bot
  ETAPA:    'success',  // green — transición de etapa comercial
  RESERVA:  'success',  // green — cupo reservado
  ESCALA:   'warn',     // yellow — escalación a operador
  ERROR:    'error',    // red   — error del sistema o validación
  'API→':   'dim',      // muted — request saliente
  'API←':   'dim',      // muted — response recibida
  SISTEMA:  'dim',      // muted — eventos internos del sistema
  SESION:   'info',     // cyan  — inicio/cambio de sesión
  CONTEXTO: 'dim',      // muted — lectura del banco de contexto
  HANDOFF:  'warn',     // yellow — traspaso a operador
};

function appendTerminalLine(line, type) {
  const el = document.createElement('div');
  el.className = `log-line ${type}`;
  el.textContent = line;
  const full = document.getElementById('log-tab-area');
  if (!full) return;
  full.appendChild(el);
  full.scrollTop = full.scrollHeight;
}

// Registra un evento estructurado.
// channelId: USER_CHANNEL para eventos de sesión, null/undefined para eventos de sistema.
// Solo se renderiza al terminal si channelId === USER_CHANNEL (sesión activa).
function logStructured(actor, detail, channelId) {
  const sid = channelId ? channelId.slice(-6) : '--sys--';
  const ts  = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const line = `[${ts}][${sid}][${actor}] ${detail}`;
  const type = ACTOR_COLORS[actor] ?? 'dim';

  const key = channelId ?? '__system__';
  if (!terminalBuffers[key]) terminalBuffers[key] = [];
  terminalBuffers[key].push({ line, type });

  // Renderizar solo si es la sesión activa o no hay sesión aún
  if (!channelId || channelId === USER_CHANNEL) {
    appendTerminalLine(line, type);
  }
}

// Limpia el terminal y re-renderiza solo los logs del canal indicado
function renderTerminalForSession(channelId) {
  const full = document.getElementById('log-tab-area');
  if (!full) return;
  full.innerHTML = '';
  const buf = terminalBuffers[channelId] ?? [];
  for (const { line, type } of buf) appendTerminalLine(line, type);
  if (!buf.length) {
    appendTerminalLine('── sin logs para esta sesión ──', 'dim');
  }
}

function clearLogs() {
  const key = USER_CHANNEL ?? '__system__';
  // Terminal
  if (terminalBuffers[key]) terminalBuffers[key] = [];
  const full = document.getElementById('log-tab-area');
  if (full) full.innerHTML = '<div class="log-line dim">── log limpiado ──</div>';
  // API calls: limpiar buffer de sesión activa y DOM
  if (apiCallBuffers[key]) apiCallBuffers[key] = [];
  const ac = document.getElementById('api-calls-log');
  if (ac) ac.innerHTML = '<div style="color:var(--muted)">── sin llamadas para esta sesión ──</div>';
}

// Construye un elemento DOM de API call a partir de datos estructurados
function buildApiCallEntry({ method, url, status, reqStr, resStr, ts }) {
  const ok = status >= 200 && status < 300;
  const div = document.createElement('div');
  div.style.cssText = 'border:1px solid var(--border);border-radius:4px;padding:5px 7px;';
  div.innerHTML =
    `<div style="display:flex;gap:6px;margin-bottom:2px">` +
    `<span style="color:${ok ? 'var(--green)' : 'var(--red)'};font-weight:700">${status}</span>` +
    `<span style="color:var(--muted)">${method}</span>` +
    `<span style="color:var(--accent);word-break:break-all;font-size:9px">${url}</span>` +
    `<span style="color:var(--muted);margin-left:auto;flex-shrink:0;font-size:9px">${ts}</span></div>` +
    (reqStr ? `<div style="color:var(--muted)">→ ${reqStr}</div>` : '') +
    (resStr ? `<div style="color:var(--text)">← ${resStr}</div>` : '');
  return div;
}

// Registra una llamada API en el buffer del canal y la renderiza si es el canal activo
function apiLog(method, url, status, reqBody, resBody, channelId) {
  const ch  = channelId ?? USER_CHANNEL ?? '__system__';
  const req = reqBody ? JSON.stringify(reqBody).slice(0, 100) : '';
  const res = resBody ? JSON.stringify(resBody).slice(0, 140) : '';
  const item = { method, url, status, reqStr: req, resStr: res, ts: now() };

  if (!apiCallBuffers[ch]) apiCallBuffers[ch] = [];
  apiCallBuffers[ch].unshift(item);              // más reciente primero
  if (apiCallBuffers[ch].length > 20) apiCallBuffers[ch].pop();

  // Solo renderizar si este canal es el activo
  if (!channelId || channelId === USER_CHANNEL) {
    const el = document.getElementById('api-calls-log');
    if (!el) return;
    el.prepend(buildApiCallEntry(item));
    if (el.children.length > 15) el.lastChild.remove();
  }
}

// Muestra las API calls del canal indicado (usado al cambiar sesión)
function renderApiCallsForSession(channelId) {
  const el = document.getElementById('api-calls-log');
  if (!el) return;
  el.innerHTML = '';
  const buf = apiCallBuffers[channelId] ?? [];
  if (!buf.length) {
    el.innerHTML = '<div style="color:var(--muted)">── sin llamadas para esta sesión ──</div>';
    return;
  }
  for (const item of buf) el.appendChild(buildApiCallEntry(item));
}

// ── Chat helpers ──────────────────────────────────────────────────────────────
// skipHistory=true cuando se restaura desde caché para evitar duplicados
function addMsg(text, role, meta = '', skipHistory = false) {
  const area = document.getElementById('chat-area');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  div.innerHTML = `${text}${meta ? `<div class="msg-meta">${meta}</div>` : ''}`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  // Guardar en caché por canal para restaurar cuando Redis expire
  if (!skipHistory && USER_CHANNEL && role !== 'system-msg' && role !== 'escalated-msg') {
    if (!chatHistories[USER_CHANNEL]) chatHistories[USER_CHANNEL] = [];
    chatHistories[USER_CHANNEL].push({ text, role, meta });
  }
}

function setTyping(visible) {
  document.getElementById('typing').classList.toggle('visible', visible);
  if (visible) document.getElementById('chat-area').scrollTop = 99999;
}

// ── Estado visual del lead ────────────────────────────────────────────────────
function updateStage(stage) {
  if (!stage || stage === state.stage) return;
  const stages = ['LEAD', 'MQL', 'PROSPECTO', 'SQL', 'CIERRE'];
  const idx = stages.indexOf(stage);
  stages.forEach((s, i) => {
    const el = document.getElementById(`s-${s}`);
    if (!el) return;
    el.className = 'stage-item ' + (i < idx ? 'done' : i === idx ? 'active' : 'pending');
  });
  state.stage = stage;
  // El ETAPA log lo emite parseServerDebugLog; aquí solo actualizamos el DOM
}

function updateMetrics() {
  document.getElementById('m-score').textContent   = state.score;
  document.getElementById('m-tools').textContent   = state.toolCalls;
  document.getElementById('m-msgs').textContent    = state.messages;
  document.getElementById('m-turns').textContent   = state.turns;
  document.getElementById('cfg-leadid').textContent = state.leadId ? state.leadId.slice(0, 12) + '…' : '–';
  document.getElementById('cfg-convid').textContent = state.convId  ? state.convId.slice(0, 12)  + '…' : '–';
}

function selectEvent(id) {
  document.querySelectorAll('.event-card').forEach(c => c.classList.remove('selected'));
  const key = id.replace('EVT-', '');
  document.getElementById(`evt-${key}`)?.classList.add('selected');
}

function updateClock() {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('es-MX');
}

// ── Lista de sesiones activas (right panel) ───────────────────────────────────
function renderSessionList() {
  const container = document.getElementById('session-list');
  if (!container) return;
  if (!sessions.length) {
    container.innerHTML = '<div style="color:var(--muted);font-size:11px;padding:4px 0">Sin sesiones — inicia un escenario</div>';
    return;
  }
  container.innerHTML = sessions.map((s, i) => {
    const active = i === activeSessionIdx;
    const opIcon = s.hasOperator ? ' 🧑‍💼' : '';
    return `<div onclick="selectSession(${i})" style="
      display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;cursor:pointer;
      border:1px solid ${active ? 'var(--accent)' : 'var(--border)'};
      background:${active ? 'rgba(88,166,255,.08)' : 'var(--surface2)'};
      font-size:11px;margin-bottom:3px">
      <span style="flex:1;font-weight:${active ? 600 : 400};color:${active ? 'var(--accent)' : 'var(--text)'}">
        ${s.label}${opIcon}
      </span>
      <span class="tag tag-${stageTagColor(s.stage)}" style="font-size:9px">${s.stage || 'LEAD'}</span>
      <span style="color:var(--muted);font-size:9px">★${s.score || 0}</span>
      ${s.convId ? `<span onclick="event.stopPropagation();downloadSessionLog('${s.convId}')"
        title="Guardar log en demo/logs/sessions/" style="cursor:pointer;font-size:10px;padding:1px 5px;
        border-radius:3px;background:var(--surface);border:1px solid var(--border)">⬇</span>` : ''}
    </div>`;
  }).join('');
}

// ── Navegación de tabs ────────────────────────────────────────────────────────
function switchTab(name) {
  ['chat', 'operator', 'logs'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === name);
    document.getElementById(`tab-btn-${t}`).classList.toggle('active', t === name);
  });
  if (name === 'operator') refreshOperator();
}

// ── Logging por sesión (persistencia a archivo) ───────────────────────────────
function logToSession(convId, type, detail) {
  if (!convId) return;
  if (!sessionLogs[convId]) sessionLogs[convId] = [];
  const cleanDetail = String(detail ?? '').replace(/\n/g, ' ↵ ').slice(0, 400);
  sessionLogs[convId].push(
    `[${new Date().toISOString()}]-[${convId}]-[${type}: ${cleanDetail}]`,
  );
}

async function flushSessionLog(convId) {
  if (!convId || !sessionLogs[convId]?.length) return;
  const lines = sessionLogs[convId].splice(0);
  try {
    await fetch(`${API.replace('/v1', '')}/v1/admin/session-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ convId, lines }),
    });
  } catch {}
}

async function downloadSessionLog(convId) {
  const pendingLines = sessionLogs[convId] ?? [];
  const base = `${API.replace('/v1', '')}/v1/admin/session-log`;

  // Paso 1: flush de líneas pendientes en buffer (si las hay)
  if (pendingLines.length) {
    try {
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ convId, lines: pendingLines.splice(0) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      logStructured('ERROR', `flush antes de descarga: ${err.message}`, USER_CHANNEL);
    }
  }

  // Paso 2: obtener el archivo completo del servidor y descargar
  try {
    const res = await fetch(`${base}/${convId}`);
    const data = await res.json();
    if (data.found && data.content) {
      const blob = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `session-${convId.slice(0, 16)}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      logStructured('SISTEMA', `log descargado · ${convId.slice(0, 16)}.txt`, USER_CHANNEL);
    } else {
      logStructured('ERROR', `sin archivo de log para ${convId.slice(0, 12)} (aún no se ha guardado)`, USER_CHANNEL);
    }
  } catch (err) {
    logStructured('ERROR', `descarga log: ${err.message}`, USER_CHANNEL);
  }
}
