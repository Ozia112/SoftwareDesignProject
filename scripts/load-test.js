/**
 * Load test — PSD-37 / RNF-02
 * Escenario: 50 conversaciones concurrentes, 10 mensajes cada una
 * Objetivo: P90 < 2s, P99 < 5s, throughput >= 600 msg/min
 *
 * Uso: node scripts/load-test.js
 * Requiere: servidor corriendo en PORT (default 3000)
 */

const http = require('http');
const { performance } = require('perf_hooks');

const BASE_URL = process.env.LOAD_TEST_URL || 'http://localhost:3000';
const TENANT_ID = process.env.LOAD_TEST_TENANT || 'test-tenant';
const CONCURRENT_USERS = 50;
const MESSAGES_PER_USER = 10;

const latencies = [];
let totalRequests = 0;
let failedRequests = 0;

function postMessage(channelId, text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      channelId,
      text,
      messageId: `msg-${channelId}-${Date.now()}-${Math.random()}`,
    });

    const options = {
      hostname: new URL(BASE_URL).hostname,
      port: new URL(BASE_URL).port || 80,
      path: `/api/v1/${TENANT_ID}/messages`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'X-Tenant-Id': TENANT_ID,
      },
    };

    const start = performance.now();
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const elapsed = performance.now() - start;
        latencies.push(elapsed);
        totalRequests++;
        if (res.statusCode >= 400) failedRequests++;
        resolve({ status: res.statusCode, elapsed });
      });
    });

    req.on('error', (err) => {
      failedRequests++;
      totalRequests++;
      reject(err);
    });

    req.write(body);
    req.end();
  });
}

async function simulateUser(userId) {
  for (let i = 0; i < MESSAGES_PER_USER; i++) {
    const messages = [
      'Hola, me interesa información sobre el curso',
      'Mi nombre es Usuario Test y mi email es test@example.com',
      '¿Tienen disponibilidad para el evento de junio?',
      'Me gustaría inscribirme al curso de contabilidad',
      '¿Cuál es el precio del curso?',
      'Perfecto, quiero reservar mi lugar',
      '¿Cómo procedo con el pago?',
      'Gracias, ¿me pueden enviar más información?',
      '¿Tienen horarios flexibles?',
      '¿Hay descuentos por inscripción anticipada?',
    ];

    try {
      await postMessage(`user-${userId}`, messages[i % messages.length]);
    } catch (err) {
      // error contado en postMessage
    }

    // Pequeña pausa entre mensajes del mismo usuario
    await new Promise((r) => setTimeout(r, 100));
  }
}

async function runLoadTest() {
  console.log(`\nLoad Test — ${CONCURRENT_USERS} users × ${MESSAGES_PER_USER} messages`);
  console.log(`Target: ${BASE_URL}/api/v1/${TENANT_ID}/messages\n`);

  const startTime = performance.now();

  const userPromises = Array.from({ length: CONCURRENT_USERS }, (_, i) => simulateUser(i));
  await Promise.allSettled(userPromises);

  const totalElapsed = (performance.now() - startTime) / 1000;
  const throughput = totalRequests / totalElapsed;

  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)];
  const p90 = latencies[Math.floor(latencies.length * 0.9)];
  const p99 = latencies[Math.floor(latencies.length * 0.99)];
  const avg = latencies.reduce((a, b) => a + b, 0) / latencies.length;

  console.log('=== Results ===');
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Failed requests: ${failedRequests}`);
  console.log(`Total time: ${totalElapsed.toFixed(2)}s`);
  console.log(`Throughput: ${(throughput * 60).toFixed(0)} req/min`);
  console.log(`Latency avg: ${avg.toFixed(0)}ms`);
  console.log(`Latency P50: ${p50.toFixed(0)}ms`);
  console.log(`Latency P90: ${p90.toFixed(0)}ms`);
  console.log(`Latency P99: ${p99.toFixed(0)}ms`);
  console.log('\n=== RNF-02 Compliance ===');
  console.log(`P90 < 2000ms: ${p90 < 2000 ? '✓ PASS' : '✗ FAIL'} (${p90.toFixed(0)}ms)`);
  console.log(`P99 < 5000ms: ${p99 < 5000 ? '✓ PASS' : '✗ FAIL'} (${p99.toFixed(0)}ms)`);
  console.log(`Throughput >= 600 req/min: ${throughput * 60 >= 600 ? '✓ PASS' : '✗ FAIL'} (${(throughput * 60).toFixed(0)} req/min)`);

  process.exit(failedRequests > totalRequests * 0.05 ? 1 : 0);
}

runLoadTest().catch(console.error);
