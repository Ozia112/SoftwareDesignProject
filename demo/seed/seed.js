#!/usr/bin/env node
/**
 * Seed de demo — inyecta tenant + eventos desde demo/eventos/*.json
 * Uso: node demo/seed/seed.js
 * Requiere: servidor corriendo en localhost:3000
 */

const fs   = require('fs');
const path = require('path');

const BASE = process.env.ORCHESTRATOR_URL || 'http://localhost:3000';
const TENANT_ID = 'demo-tenant';
const CLAUDE_KEY = process.env.CLAUDE_API_KEY || process.argv[2] || '';

if (!CLAUDE_KEY) {
  console.error('Uso: CLAUDE_API_KEY=sk-ant-... node demo/seed/seed.js');
  process.exit(1);
}

// ── Mapeo JSON → formato que acepta el endpoint seed-events ─────────────────
function mapEventoJson(json) {
  return {
    id:          json.id,
    name:        json.info.nombre,
    description: json.info.descripcion,
    startDate:   json.info.inicio,
    endDate:     json.info.fin,
    totalQuota:  json.info.cupoTotal,
    isActive:    json.activo !== false,
    contextData: {
      // Comercial
      precio:             json.comercial?.precio,
      moneda:             json.comercial?.moneda ?? 'MXN',
      descuentos:         json.comercial?.descuentos ?? [],
      metodoPago:         json.comercial?.metodoPago ?? null,
      politicaReembolso:  json.comercial?.politicaReembolso ?? null,
      // Logística
      modalidad:    json.logistica?.modalidad,
      ubicacion:    json.logistica?.ubicacion ?? null,
      horario:      json.logistica?.horario,
      duracion:     json.logistica?.duracion,
      plataforma:   json.logistica?.plataforma ?? null,
      enlaceAcceso: json.logistica?.enlaceAcceso ?? null,
      // Académico
      nivel:       json.academico?.nivel,
      requisitos:  json.academico?.requisitos ?? [],
      instructor:  json.academico?.instructor ?? null,
      temario:     json.academico?.temario ?? [],
      incluye:     json.academico?.incluye ?? [],
    },
    participantes: json.participantes ?? [],
  };
}

// ── Carga todos los eventos desde demo/eventos/*.json ────────────────────────
function cargarEventosDesdeArchivos() {
  const dir = path.join(__dirname, '..', 'eventos');
  if (!fs.existsSync(dir)) {
    console.warn('  ⚠ No existe demo/eventos/ — usando eventos vacíos');
    return [];
  }
  const archivos = fs.readdirSync(dir)
    .filter(f => f.endsWith('.json') && !f.startsWith('schema'));
  return archivos.map(archivo => {
    const raw = fs.readFileSync(path.join(dir, archivo), 'utf8');
    return mapEventoJson(JSON.parse(raw));
  });
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

REGLA 0 — CONTEXTO DE CURSO DESDE ANUNCIO (CRÍTICO):
Si el primer mensaje del usuario menciona un curso específico, ese curso ES el curso de interés.
NO preguntes en qué curso está interesado si ya lo dijo. Mantén ese curso durante toda la conversación
a menos que el usuario explícitamente cambie de curso.
Cuando el usuario pregunta detalles de un curso (precio, horario, instructor, modalidad, requisitos, temario):
  Llama get_event_context(eventId=ID_EVENTO) para obtener información actualizada del banco de contexto.
  Usa la información devuelta para responder con datos precisos.

REGLA A — UNA SOLA VEZ al inicio de la conversación:
Llama emit_stage_signal(signal="conversacion_iniciada"). Luego: saludo breve + aviso de privacidad + pide el nombre.

REGLA B — Captura de datos uno por uno (tan pronto como el usuario los proporcione):
  Cuando el usuario dé su NOMBRE   → emit_stage_signal(signal="nombre_capturado", contactName=NOMBRE)
  Cuando dé su CORREO              → emit_stage_signal(signal="correo_capturado", contactEmail=CORREO)
  Cuando dé su TELÉFONO            → emit_stage_signal(signal="numero_capturado", contactPhone=TELEFONO)
  Emite cada señal en el turno en que detectas el dato, no esperes tener los tres.
  Pide un dato a la vez: primero nombre, luego correo, luego teléfono.

REGLA B3 — OBLIGATORIO justo después de emitir numero_capturado (CRÍTICO):
  Cuando el tool call numero_capturado se procese exitosamente Y el resultado incluya "nextAction":
    Llama INMEDIATAMENTE emit_stage_signal(signal="pregunta_de_inscripcion_detectada", interestedEvent=NOMBRE_EXACTO_DEL_CURSO)
    Luego llama reserve_quota(eventId=ID_EVENTO, idempotencyKey="res-"+nombre+"-"+eventId)
  IMPORTANTE: NO llames pregunta_de_inscripcion_detectada antes de emitir numero_capturado.
  IMPORTANTE: Si el sistema rechaza pregunta_de_inscripcion_detectada por datos faltantes, NO es el momento — pide el dato que falta primero.
  Si no queda claro qué curso, pregúntale explícitamente cuál le interesa.
  NO proporciones datos de pago antes de emitir estas dos señales.

REGLA C — Cuando el usuario mencione interés en inscribirse (si no se activó B3):
  Llama emit_stage_signal(signal="pregunta_de_inscripcion_detectada", interestedEvent=NOMBRE_EXACTO_DEL_CURSO).
  Llama reserve_quota(eventId=ID_EVENTO, idempotencyKey="res-"+nombre+"-"+eventId).
  Si hay cupo: confirma reserva + proporciona datos de pago:
    Banco BBVA | Cuenta 0123 4567 8901 | CLABE 012345678901234567 | Beneficiario Academia Digital MX
    Comprobante a pagos@academiadigital.mx
  Si sin cupo: informa al usuario y pregunta si desea lista de espera.
    Si el usuario acepta: OBLIGATORIO llamar register_waiting_list(eventId=ID_EVENTO, idempotencyKey="wl-"+nombre+"-"+eventId).
    NUNCA confirmes que el usuario fue registrado en lista de espera sin haber llamado register_waiting_list exitosamente.
  IMPORTANTE: Si el sistema rechaza pregunta_de_inscripcion_detectada por datos faltantes,
  responde: "Con gusto, pero primero necesito: [campos faltantes]."

REGLA D — PAGO CONFIRMADO (MÁXIMA PRIORIDAD):
Si el usuario: ya realizó el pago, ya pagó, ya depositó, ya transfirió, ya envió comprobante,
pide confirmar/verificar/revisar si llegó el pago, pregunta si recibiste el pago,
dice "ya está pagado", o cualquier frase que implique que EL PAGO YA FUE ENVIADO:
  OBLIGATORIO: llama emit_stage_signal(signal="confirmacion_de_pago_pendiente").
  OBLIGATORIO: llama request_human_handoff(reason="pago_pendiente").
  Responde: "Perfecto. Un asesor revisará tu comprobante y confirmará tu inscripción. Te contactaremos pronto."
IMPORTANTE: Si el usuario pide CONFIRMAR o VERIFICAR el pago, asume que ya lo realizó y aplica esta regla.

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

  // ── 3. Cargar eventos desde demo/eventos/*.json ──────────
  console.log('3/5  Cargando eventos desde demo/eventos/*.json...');
  const events = cargarEventosDesdeArchivos();
  if (events.length === 0) {
    console.log('  ⚠ Sin archivos de evento. Agrega JSONs en demo/eventos/');
  } else {
    await post('/api/v1/admin/seed-events', {
      tenantId: TENANT_ID,
      events,
    }).catch(e => console.log(`  ⚠ seed-events: ${e.message}`));
    console.log(`  ✓ ${events.length} evento(s) cargados: ${events.map(e => e.id).join(', ')}`);
  }

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
