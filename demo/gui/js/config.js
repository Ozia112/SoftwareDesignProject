// ── Constantes de API ────────────────────────────────────────────────────────
const API    = 'http://localhost:3000/api/v1';
const TENANT = 'demo-tenant';

// ── Canal activo ─────────────────────────────────────────────────────────────
// Se inicializa en null; solo se asigna al crear o restaurar una sesión.
// Nunca se genera aleatoriamente al cargar la página — eso era el bug.
let USER_CHANNEL = null;

function newChannel() {
  USER_CHANNEL = 'demo-gui-user-' + Math.random().toString(36).slice(2, 8);
}

// ── Estado de la sesión actual ───────────────────────────────────────────────
let state = {
  stage: null, score: 0, toolCalls: 0, messages: 0,
  turns: 0, leadId: null, convId: null,
};

// ── Estado del debounce de mensajes ─────────────────────────────────────────
let userState = 'reading';       // 'typing' | 'waiting' | 'reading'
let pendingMessages = [];
let flushTimer = null;
let typingInactivityTimer = null;

// ── Estado de sesiones múltiples ─────────────────────────────────────────────
let sessions = [];
let activeSessionIdx = -1;
let currentScenarioLabel = 'Chat manual';

// ── Estado del panel operador ────────────────────────────────────────────────
let selectedConv = null;
let expandedEvent = null;

// ── Canal que muestra el tab de Logs (puede diferir del chat activo) ──────────
// null = sigue al canal activo del chat (USER_CHANNEL).
// Cuando el usuario elige manualmente en el selector, queda fijo hasta que
// vuelva a cambiar de sesión en el chat tab (auto-sync).
let logsChannelId = null;

// ── Estado de polling ────────────────────────────────────────────────────────
let opClientPollingInterval = null;
let opDetailPollingInterval = null;
let lastKnownMsgCount = 0;

// ── Log por sesión: buffer en memoria, flush al backend ──────────────────────
const sessionLogs = {};      // { [convId]: string[] }  — para persistencia en archivo

// ── Buffer de terminal por canal: solo muestra la sesión activa ───────────────
const terminalBuffers = {};  // { [channelId | '__system__']: [{line, type}] }

// ── Buffer de API calls por canal ────────────────────────────────────────────
const apiCallBuffers = {};   // { [channelId]: [{method,url,status,reqStr,resStr,ts}] }

// ── Caché de mensajes del chat por canal (fallback cuando Redis expira) ────────
const chatHistories = {};    // { [channelId]: [{text, role, meta}] }

// ── IDs únicos por instancia de pestaña (no persiste, reset en cada carga) ────
// Usado para deduplicar eventos SSE: el tab que envió el mensaje ya lo registró
// localmente desde la respuesta POST, así que ignora su propio evento SSE.
const sentByThisTab = new Set();   // messageIds enviados por esta instancia

// ── Persistencia de sesiones y logs en localStorage ───────────────────────────
const LS_SESSIONS_KEY   = 'saas_demo_sessions';
const LS_LOGS_KEY       = 'saas_demo_logs';
const LS_APICALLS_KEY   = 'saas_demo_apicalls';
const LS_ACTIVE_TAB_KEY = 'saas_demo_active_tab';
const LS_LOGS_CH_KEY    = 'saas_demo_logs_channel';

function saveSessionsToStorage() {
  try {
    localStorage.setItem(LS_SESSIONS_KEY, JSON.stringify(sessions));
  } catch {}
}

// ── Persistencia de logs en localStorage (debounced) ─────────────────────────
let _logSaveTimer = null;
function scheduleSaveLogs() {
  clearTimeout(_logSaveTimer);
  _logSaveTimer = setTimeout(() => {
    try {
      // Limitar a 150 entradas por canal para no exceder el límite de localStorage
      const trimmed = {};
      for (const [k, v] of Object.entries(terminalBuffers)) {
        trimmed[k] = Array.isArray(v) ? v.slice(-150) : v;
      }
      localStorage.setItem(LS_LOGS_KEY,     JSON.stringify(trimmed));
      localStorage.setItem(LS_APICALLS_KEY, JSON.stringify(apiCallBuffers));
    } catch {}
  }, 500);
}

function saveLogsToStorage() {
  clearTimeout(_logSaveTimer);
  try {
    const trimmed = {};
    for (const [k, v] of Object.entries(terminalBuffers)) {
      trimmed[k] = Array.isArray(v) ? v.slice(-150) : v;
    }
    localStorage.setItem(LS_LOGS_KEY,     JSON.stringify(trimmed));
    localStorage.setItem(LS_APICALLS_KEY, JSON.stringify(apiCallBuffers));
  } catch {}
}

function loadLogsFromStorage() {
  try {
    const rawLogs  = localStorage.getItem(LS_LOGS_KEY);
    const rawCalls = localStorage.getItem(LS_APICALLS_KEY);
    if (rawLogs)  Object.assign(terminalBuffers, JSON.parse(rawLogs));
    if (rawCalls) Object.assign(apiCallBuffers,  JSON.parse(rawCalls));
  } catch {}
}

function clearLogsFromStorage() {
  try {
    localStorage.removeItem(LS_LOGS_KEY);
    localStorage.removeItem(LS_APICALLS_KEY);
  } catch {}
}

// Restaura la lista de sesiones desde localStorage.
// Solo actualiza el array de sesiones — cada pestaña maneja su propia sesión activa.
function loadSessionsFromStorage() {
  try {
    const raw = localStorage.getItem(LS_SESSIONS_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored) || stored.length === 0) return;
    sessions = stored;
    // Activar la primera sesión disponible si no hay ninguna activa en este tab
    if (activeSessionIdx < 0 && sessions.length > 0) {
      const s = sessions[0];
      activeSessionIdx = 0;
      USER_CHANNEL  = s.channelId;
      state.convId  = s.convId  ?? null;
      state.stage   = s.stage   ?? null;
      state.score   = s.score   ?? 0;
      state.leadId  = s.leadId  ?? null;
    }
  } catch {}
}
