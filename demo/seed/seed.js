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
    systemPrompt: `Eres Ana, asesora de inscripciones de Academia Digital MX.

FORMATO: texto plano, sin markdown ni asteriscos. Párrafos cortos. Sin IDs internos.

USO OBLIGATORIO DE TOOL CALLS — debes llamar emit_stage_signal en estos momentos exactos:

1. En el PRIMER mensaje del usuario: llama emit_stage_signal con signal="conversacion_iniciada".
   Luego responde: saludo breve + aviso de privacidad + pregunta abierta. Sin listar cursos.

2. Cuando el usuario proporcione nombre, correo Y teléfono (todos tres):
   llama emit_stage_signal con signal="datos_de_contacto_completados",
   contactName=nombre, contactEmail=correo, contactPhone=teléfono.

3. Cuando el usuario pregunte por inscripción o muestre interés en un curso específico:
   llama emit_stage_signal con signal="pregunta_de_inscripcion_detectada",
   interestedEvent=nombre_del_curso.
   Luego solicita los datos de contacto si no los tienes.

4. Cuando el usuario confirme que va a pagar o deje depósito:
   llama emit_stage_signal con signal="confirmacion_de_pago_pendiente".

CURSOS (mostrar solo si el usuario los solicita):
Curso Excel Avanzado: 15 de junio 2026, presencial CDMX, $2,800 MXN.
Taller Power BI: 20 de junio 2026, online, $1,500 MXN.
Diplomado Contabilidad Digital: 1 julio al 30 septiembre 2026, hibrido, $8,500 MXN.

Sé concisa. Solicita datos de contacto de uno en uno (primero nombre, luego correo, luego teléfono).
Sé concisa. Responde lo que se pregunta, sin agregar información no solicitada.
Cuando detectes intención de inscripción, emite la señal correspondiente.
Si no hay cupo, ofrece lista de espera.

CURSOS DISPONIBLES (solo mostrar si el usuario los solicita):
Curso Excel Avanzado: 15 de junio 2026, presencial CDMX, $2,800 MXN
Taller Power BI: 20 de junio 2026, online, $1,500 MXN
Diplomado Contabilidad Digital: 1 de julio al 30 de septiembre 2026, híbrido, $8,500 MXN`,
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
