#!/usr/bin/env node
/**
 * Seed de demo — inyecta tenant + eventos + contexto
 * Uso: node demo/seed/seed.js
 * Requiere: servidor corriendo en localhost:3000
 */

const BASE = process.env.ORCHESTRATOR_URL || 'http://localhost:3000';
const TENANT_ID = 'demo-tenant';
const CLAUDE_KEY = process.env.CLAUDE_API_KEY || process.argv[2] || '';

if (!CLAUDE_KEY) {
  console.error('Uso: CLAUDE_API_KEY=sk-ant-... node demo/seed/seed.js');
  process.exit(1);
}

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${path} → ${res.status}: ${text}`);
  }
  return res.json();
}

async function seed() {
  console.log('\n🌱  Iniciando seed de demo...\n');

  // ── 1. Crear tenant ──────────────────────────────────────
  console.log('1/5  Creando tenant...');
  await post('/api/v1/admin/tenants', {
    tenantId: TENANT_ID,
    name: 'Academia Digital MX',
    llmModel: 'claude-haiku-4-5-20251001',
    systemPrompt: `Eres Ana, asesora de inscripciones de Academia Digital MX. Texto plano, sin markdown, sin asteriscos, sin IDs internos.

USA TOOL CALLS OBLIGATORIAMENTE según estas reglas:

REGLA A — UNA SOLA VEZ al inicio de la conversación:
Llama emit_stage_signal(signal="conversacion_iniciada"). Luego: saludo breve + aviso de privacidad + pide el nombre.

REGLA B — Recopilación de contacto (pide uno por uno: nombre → correo → teléfono):
Cuando tengas nombre, correo Y teléfono:
  Llama emit_stage_signal(signal="datos_de_contacto_completados", contactName=..., contactEmail=..., contactPhone=...).
  Confirma registro y pregunta por qué curso tiene interés (si no lo dijo antes).

REGLA C — Cuando el usuario mencione interés en inscribirse a un curso:
  Llama emit_stage_signal(signal="pregunta_de_inscripcion_detectada", interestedEvent=NOMBRE_EXACTO_DEL_CURSO).
  Llama reserve_quota(eventId=ID_EVENTO, idempotencyKey="res-"+nombre+"-"+eventId).
  Si hay cupo: confirma reserva + proporciona datos de pago:
    Banco BBVA | Cuenta 0123 4567 8901 | CLABE 012345678901234567 | Beneficiario Academia Digital MX
    Comprobante a pagos@academiadigital.mx
  Si sin cupo: llama register_waiting_list y notifica al usuario.

REGLA D — PAGO CONFIRMADO (MÁXIMA PRIORIDAD):
Si el usuario dice que ya realizó el pago, ya pagó, ya hizo la transferencia, ya depositó,
ya realizó el depósito, ya transfirió, ya envió el comprobante, o cualquier variante:
  OBLIGATORIO: llama emit_stage_signal(signal="confirmacion_de_pago_pendiente").
  OBLIGATORIO: llama request_human_handoff(reason="pago_pendiente").
  Responde: "Perfecto. Un asesor revisará tu comprobante y confirmará tu inscripción. Te contactaremos pronto."

IDs de eventos (NUNCA mostrar al usuario):
EVT-EXCEL-01 = Curso Excel Avanzado (15 jun 2026, presencial CDMX, $2,800 MXN)
EVT-PBI-01   = Taller Power BI (20 jun 2026, online Zoom, $1,500 MXN)
EVT-CONT-01  = Diplomado Contabilidad Digital (1 jul–30 sep 2026, híbrido, $8,500 MXN)`,
  }).catch(e => {
    // Si el upsert falla por otra razón distinta a "ya existe", lo mostramos
    if (e.message && !e.message.includes('409')) {
      console.warn(`  ⚠ Tenant creation warning: ${e.message}`);
    } else {
      console.log('  (tenant ya existe, actualizando)');
    }
  });

  // ── 2. Credenciales ──────────────────────────────────────
  console.log('2/5  Guardando credenciales...');
  await post(`/api/v1/admin/tenants/${TENANT_ID}/credentials`, {
    credentialType: 'llm_api_key',
    plainValue: CLAUDE_KEY,
  });
  await post(`/api/v1/admin/tenants/${TENANT_ID}/credentials`, {
    credentialType: 'db_url',
    plainValue: process.env.DATABASE_URL || 'postgresql://app:app@localhost:5432/saas_dev',
  });
  console.log('  ✓ Credenciales guardadas');

  // ── 3. Inyectar eventos via DB directa ───────────────────
  // (usamos el endpoint de admin que expone el context bank)
  console.log('3/5  Inyectando eventos via seed API...');
  await post('/api/v1/admin/seed-events', {
    tenantId: TENANT_ID,
    events: [
      {
        id: 'EVT-EXCEL-01',
        name: 'Curso Excel Avanzado',
        description: 'Domina tablas dinámicas, macros, Power Query y fórmulas avanzadas. Certificado incluido.',
        startDate: '2026-06-15T09:00:00-06:00',
        endDate: '2026-06-15T18:00:00-06:00',
        totalQuota: 20,
        contextData: {
          precio: 2800,
          moneda: 'MXN',
          modalidad: 'Presencial',
          ubicacion: 'Av. Insurgentes Sur 1216, CDMX',
          horario: 'Domingo 9am–6pm',
          incluye: ['material digital', 'certificado', 'acceso grabación 30 días'],
          nivel: 'Intermedio-Avanzado',
          requisitos: 'Excel básico-intermedio',
          instructor: 'Ing. Mario López Sánchez',
          duracion: '8 horas',
        },
      },
      {
        id: 'EVT-PBI-01',
        name: 'Taller Power BI',
        description: 'Construye dashboards interactivos y conecta múltiples fuentes de datos.',
        startDate: '2026-06-20T10:00:00-06:00',
        endDate: '2026-06-20T14:00:00-06:00',
        totalQuota: 30,
        contextData: {
          precio: 1500,
          moneda: 'MXN',
          modalidad: 'Online (Zoom)',
          horario: 'Sábado 10am–2pm',
          incluye: ['grabación permanente', 'archivos de práctica'],
          nivel: 'Principiante',
          requisitos: 'Ninguno',
          instructor: 'Lic. Sandra Ruiz',
          duracion: '4 horas',
        },
      },
      {
        id: 'EVT-CONT-01',
        name: 'Diplomado Contabilidad Digital',
        description: 'Contabilidad electrónica, facturación CFDI 4.0, declaraciones fiscales y herramientas digitales.',
        startDate: '2026-07-01T08:00:00-06:00',
        endDate: '2026-09-30T20:00:00-06:00',
        totalQuota: 15,
        contextData: {
          precio: 8500,
          moneda: 'MXN',
          modalidad: 'Híbrida (presencial + online)',
          horario: 'Martes y Jueves 7pm–9pm + Sábados 9am–12pm',
          duracion: '3 meses (120 horas)',
          incluye: ['certificado con validez fiscal', 'asesoría 1:1 mensual', 'acceso vitalicio plataforma'],
          nivel: 'Básico a Avanzado',
          requisitos: 'Ninguno',
          instructor: 'CP. Ana Beltrán Domínguez',
          becas: '15% descuento para desempleados',
        },
      },
    ],
  }).catch(() => console.log('  (endpoint seed-events no disponible, ver nota abajo)'));

  // ── 4. Verificar health ──────────────────────────────────
  console.log('4/5  Verificando servidor...');
  const health = await fetch(`${BASE}/api/v1/health`).then(r => r.json()).catch(() => ({ status: 'unknown' }));
  console.log(`  ✓ Servidor: ${health.status || 'running'}`);

  // ── 5. Enviar mensaje de prueba ──────────────────────────
  console.log('5/5  Enviando mensaje de prueba (canal Web)...');
  const result = await post(`/api/v1/${TENANT_ID}/messages`, {
    channelId: 'seed-test-user',
    text: 'Hola, ¿qué cursos tienen disponibles?',
    messageId: `seed-${Date.now()}`,
  }).catch(e => ({ error: e.message }));

  if (result.response) {
    console.log('\n✅  Seed completado. Respuesta del bot:\n');
    console.log(`  "${result.response}"\n`);
  } else {
    console.log('\n⚠️  Seed completado pero el bot no respondió:', result.error || result);
  }

  console.log('\n📋  Resumen:');
  console.log(`  Tenant:      ${TENANT_ID}`);
  console.log(`  Eventos:     EVT-EXCEL-01, EVT-PBI-01, EVT-CONT-01`);
  console.log(`  Canal web:   POST ${BASE}/api/v1/${TENANT_ID}/messages`);
  console.log(`  Swagger:     ${BASE}/api/docs`);
  console.log(`  GUI demo:    http://localhost:8080`);
  console.log('');
}

seed().catch(err => {
  console.error('\n❌  Error en seed:', err.message);
  process.exit(1);
});
