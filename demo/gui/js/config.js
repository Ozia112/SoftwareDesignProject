// ── Constantes de API ────────────────────────────────────────────────────────
const API    = 'http://localhost:3000/api/v1';
const TENANT = 'demo-tenant';

// ── Canal activo ─────────────────────────────────────────────────────────────
let USER_CHANNEL = 'demo-gui-user-' + Math.random().toString(36).slice(2, 8);

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
