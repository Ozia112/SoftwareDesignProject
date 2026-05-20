'use strict';
/**
 * open-wa bridge — conecta WhatsApp Web con el orquestador SaaS
 *
 * Flujo:
 *   WhatsApp Web ──(open-wa)──▶ este bridge ──HTTP──▶ orquestador
 *                                                          │
 *   WhatsApp Web ◀──(open-wa)── este bridge ◀──response───┘
 *
 * Setup:
 *   1. npm install
 *   2. CLAUDE_API_KEY=sk-ant-... node index.js
 *   3. Escanear QR con WhatsApp de tu teléfono
 */

const { create } = require('@open-wa/wa-automate');
const express = require('express');
const fetch = require('node-fetch');

const ORCHESTRATOR = process.env.ORCHESTRATOR_URL || 'http://localhost:3000';
const TENANT_ID = process.env.TENANT_ID || 'demo-tenant';
const PORT = parseInt(process.env.BRIDGE_PORT || '4000');

// ── Express para recibir respuestas del orquestador (webhook reverso) ──
const app = express();
app.use(express.json());

// Estado interno: map phone → response pending
const pendingResponses = new Map();

app.get('/health', (_, res) => res.json({ status: 'ok', tenant: TENANT_ID }));

// El orquestador puede pushear respuestas aquí si se configura
app.post('/outbound', async (req, res) => {
  const { channelId, text } = req.body;
  if (!globalClient) return res.status(503).json({ error: 'WA not connected' });
  try {
    await globalClient.sendText(channelId, text);
    res.json({ sent: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[bridge] HTTP server listening on :${PORT}`);
});

// ── Estadísticas en vivo (para la GUI) ──
let stats = { messagesIn: 0, messagesOut: 0, connectedPhone: null, qrDataUrl: null };

app.get('/stats', (_, res) => res.json(stats));
app.get('/qr', (_, res) => {
  if (stats.qrDataUrl) {
    res.send(`<img src="${stats.qrDataUrl}" style="width:300px"/><p>Escanea con WhatsApp</p>`);
  } else if (stats.connectedPhone) {
    res.send(`<p>Conectado: ${stats.connectedPhone}</p>`);
  } else {
    res.send('<p>Iniciando...</p>');
  }
});

let globalClient = null;

// ── Función principal: enviar mensaje al orquestador ──
async function routeToOrchestrator(client, message) {
  const phone = message.from.replace('@c.us', '').replace('@s.whatsapp.net', '');
  const text = message.body || '';

  console.log(`[wa→orch] ${phone}: ${text}`);
  stats.messagesIn++;

  try {
    const res = await fetch(`${ORCHESTRATOR}/api/v1/${TENANT_ID}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-Id': TENANT_ID,
      },
      body: JSON.stringify({
        channelId: phone,
        channelType: 'WHATSAPP',
        messageId: message.id || `wa-${Date.now()}`,
        text,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[orch] Error ${res.status}: ${errText}`);
      await client.sendText(message.from, 'Lo siento, hubo un problema técnico. Intenta de nuevo en un momento.');
      return;
    }

    const data = await res.json();

    if (data.response) {
      console.log(`[orch→wa] ${phone}: ${data.response}`);
      await client.sendText(message.from, data.response);
      stats.messagesOut++;
    }
  } catch (err) {
    console.error('[bridge] Error routing message:', err.message);
    await client.sendText(message.from, 'Sistema temporalmente no disponible. Por favor intenta más tarde.');
  }
}

// ── Iniciar open-wa ──
create({
  sessionId: 'saas-demo',
  sessionDataPath: '.wa-sessions',
  authTimeout: 60,
  qrTimeout: 60,
  cacheEnabled: true,
  headless: true,
  killProcessOnBrowserClose: true,
  useChrome: false,          // usa Chromium bundled
  multiDevice: true,
  logQR: true,               // imprime QR en terminal también

  // Muestra el QR como data URL para la GUI
  onQr: (qr) => {
    stats.qrDataUrl = qr;
    console.log('\n[bridge] QR disponible en http://localhost:' + PORT + '/qr\n');
  },
}).then((client) => {
  globalClient = client;
  stats.connectedPhone = client.getHostNumber?.() || 'conectado';
  stats.qrDataUrl = null;

  console.log(`\n✅  WhatsApp conectado — escuchando mensajes para tenant: ${TENANT_ID}\n`);

  // Escuchar mensajes entrantes
  client.onMessage(async (message) => {
    // Ignorar mensajes propios y de grupos
    if (message.fromMe || message.isGroupMsg) return;
    await routeToOrchestrator(client, message);
  });

  // Reconexión automática
  client.onStateChanged((state) => {
    console.log('[wa] Estado:', state);
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      client.forceRefocus();
    }
  });
}).catch((err) => {
  console.error('[bridge] Error iniciando open-wa:', err.message);
  console.error('Verifica que tienes Chromium disponible o instala: apt-get install chromium');
  process.exit(1);
});
