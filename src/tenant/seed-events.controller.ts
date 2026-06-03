import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { promises as fsp } from 'fs';
import * as path from 'path';
import { TenantConfigService } from './tenant-config.service';
import { ContextBankService } from '../context-bank/context-bank.service';
import { createRedis } from '../common/redis.factory';

// Controlador solo para demo/pruebas — no forma parte del sistema productivo
// Para eliminar: borrar este archivo y quitarlo de TenantModule
@ApiTags('Demo Seed')
@Controller('admin')
export class SeedEventsController {
  private readonly sessionRedis = createRedis('session:');
  private readonly eventosDir = path.join(process.cwd(), 'demo', 'eventos');

  constructor(
    private readonly tenantConfigService: TenantConfigService,
    private readonly contextBank: ContextBankService,
  ) {}

  // ── Helpers de archivos JSON de eventos ───────────────────────────────────

  private async readEventFiles(): Promise<any[]> {
    try {
      const files = await fsp.readdir(this.eventosDir);
      const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('schema'));
      const results: any[] = [];
      for (const file of jsonFiles) {
        const raw = await fsp.readFile(path.join(this.eventosDir, file), 'utf8');
        results.push(JSON.parse(raw));
      }
      return results;
    } catch {
      return [];
    }
  }

  // Limpia el array participantes[] de todos los JSONs y sincroniza totalQuota si cambió
  private async clearParticipantesFromFiles(): Promise<number> {
    let cleared = 0;
    try {
      const files = await fsp.readdir(this.eventosDir);
      const jsonFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('schema'));
      for (const file of jsonFiles) {
        const filePath = path.join(this.eventosDir, file);
        const raw = await fsp.readFile(filePath, 'utf8');
        const json = JSON.parse(raw);
        if (json.participantes?.length > 0) {
          json.participantes = [];
          await fsp.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
          cleared++;
        }
      }
    } catch { /* silencioso — no crítico */ }
    return cleared;
  }

  // Agrega un participante al JSON del evento correspondiente
  async appendParticipanteToFile(
    eventId: string,
    participante: {
      leadId: string;
      reservacionId: string;
      nombre?: string | null;
      email?: string | null;
      telefono?: string | null;
      status: string;
      fechaRegistro: string;
    },
  ): Promise<void> {
    try {
      const files = await fsp.readdir(this.eventosDir);
      const match = files.find(f => f.startsWith(eventId) && f.endsWith('.json'));
      if (!match) return;
      const filePath = path.join(this.eventosDir, match);
      const raw = await fsp.readFile(filePath, 'utf8');
      const json = JSON.parse(raw);
      if (!Array.isArray(json.participantes)) json.participantes = [];
      // Idempotencia: evitar duplicados por reservacionId
      const exists = json.participantes.some((p: any) => p.reservacionId === participante.reservacionId);
      if (!exists) {
        json.participantes.push(participante);
        await fsp.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
      }
    } catch { /* silencioso */ }
  }

  // ── Endpoints ─────────────────────────────────────────────────────────────

  @Post('reset-demo')
  @ApiOperation({ summary: '[DEMO] Eliminar todos los leads/conversaciones y resetear cupos' })
  async resetDemo(@Body() body: { tenantId: string }): Promise<{ ok: boolean; deleted: Record<string, number> }> {
    const config = await this.tenantConfigService.getTenantConfig(body.tenantId);
    if (!config.dbUrl) throw new Error('No DB URL configured for tenant');
    const db = this.tenantConfigService.getPrismaClient(body.tenantId, config.dbUrl);

    const leads = await db.lead.findMany({ where: { tenantId: body.tenantId }, select: { id: true } });
    const leadIds = leads.map((l) => l.id);
    const convs = await db.conversation.findMany({ where: { tenantId: body.tenantId }, select: { id: true } });
    const convIds = convs.map((c) => c.id);

    // Fase 1: AuditLog (FK → Conversation)
    const auditDel = convIds.length
      ? await db.auditLog.deleteMany({ where: { conversationId: { in: convIds } } })
      : { count: 0 };

    // Fase 2: Hijos directos de Lead
    const [wlDel, resDel, shDel] = leadIds.length
      ? await Promise.all([
          db.waitingListEntry.deleteMany({ where: { leadId: { in: leadIds } } }),
          db.reservation.deleteMany({ where: { leadId: { in: leadIds } } }),
          db.stageHistory.deleteMany({ where: { leadId: { in: leadIds } } }),
        ])
      : [{ count: 0 }, { count: 0 }, { count: 0 }];

    // Fase 3: Conversation
    const convDel = await db.conversation.deleteMany({ where: { tenantId: body.tenantId } });

    // Fase 4: Lead
    const leadDel = await db.lead.deleteMany({ where: { tenantId: body.tenantId } });

    // Resetear contadores de cupo (redundante si se usa count real, pero mantiene consistencia)
    await db.event.updateMany({
      where: { tenantId: body.tenantId },
      data: { reservedQuota: 0, confirmedQuota: 0 },
    });

    // Limpiar sesiones Redis
    let cursor = '0';
    let sessionsDel = 0;
    do {
      const [nextCursor, keys] = await this.sessionRedis.scan(cursor, 'MATCH', `${body.tenantId}:*`, 'COUNT', 100);
      cursor = nextCursor;
      if (keys.length) {
        await this.sessionRedis.del(...keys);
        sessionsDel += keys.length;
      }
    } while (cursor !== '0');

    // Limpiar participantes en los JSONs para mantener sincronía con la BD
    const jsonsCleaned = await this.clearParticipantesFromFiles();

    await this.tenantConfigService.invalidateCache(body.tenantId);

    return {
      ok: true,
      deleted: {
        auditLogs:        auditDel.count,
        waitlistEntries:  wlDel.count,
        reservations:     resDel.count,
        stageHistory:     shDel.count,
        conversations:    convDel.count,
        leads:            leadDel.count,
        redisSessions:    sessionsDel,
        jsonParticipants: jsonsCleaned,
      },
    };
  }

  @Post('seed-events')
  @ApiOperation({ summary: '[DEMO] Inyectar/actualizar eventos desde JSON estructurado' })
  async seedEvents(@Body() body: { tenantId: string; events: any[] }): Promise<{ seeded: number; participantesRegistrados: number }> {
    const config = await this.tenantConfigService.getTenantConfig(body.tenantId);
    if (!config.dbUrl) throw new Error('No DB URL configured for tenant');
    const db = this.tenantConfigService.getPrismaClient(body.tenantId, config.dbUrl);

    let seeded = 0;
    let participantesRegistrados = 0;

    for (const ev of body.events) {
      // Upsert del evento con contextData estructurado
      await db.event.upsert({
        where: { id: ev.id },
        create: {
          id:          ev.id,
          tenantId:    body.tenantId,
          name:        ev.name,
          description: ev.description,
          startDate:   ev.startDate ? new Date(ev.startDate) : null,
          endDate:     ev.endDate   ? new Date(ev.endDate)   : null,
          totalQuota:  ev.totalQuota ?? 20,
          isActive:    ev.isActive  ?? true,
          contextData: ev.contextData ?? {},
        },
        update: {
          name:        ev.name,
          description: ev.description,
          startDate:   ev.startDate ? new Date(ev.startDate) : null,
          endDate:     ev.endDate   ? new Date(ev.endDate)   : null,
          totalQuota:  ev.totalQuota ?? 20,
          isActive:    ev.isActive  ?? true,
          contextData: ev.contextData ?? {},
        },
      });
      seeded++;
      // Invalidar caché del banco de contexto para que el próximo get_event_context
      // lea los datos frescos de DB y no sirva datos desactualizados de la caché anterior
      await this.contextBank.invalidateEventContext(body.tenantId, ev.id);

      // Si el JSON trae participantes con FKs válidas, intentar crearlos/verificarlos en DB
      if (Array.isArray(ev.participantes) && ev.participantes.length > 0) {
        for (const p of ev.participantes) {
          if (!p.leadId || !p.reservacionId) continue;
          // Verificar que el Lead existe (FK válida)
          const leadExists = await db.lead.findUnique({ where: { id: p.leadId }, select: { id: true } });
          if (!leadExists) continue; // FK rota — omitir, ya fue eliminado en reset
          // Idempotencia: solo crear si no existe la reservación
          const resExists = await db.reservation.findUnique({ where: { idempotencyKey: p.reservacionId } });
          if (!resExists) {
            try {
              await db.reservation.create({
                data: {
                  id:             p.reservacionId,
                  leadId:         p.leadId,
                  eventId:        ev.id,
                  tenantId:       body.tenantId,
                  status:         p.status ?? 'CONFIRMED',
                  idempotencyKey: p.reservacionId,
                  confirmedAt:    p.fechaRegistro ? new Date(p.fechaRegistro) : new Date(),
                },
              });
              participantesRegistrados++;
            } catch { /* reservación ya existe o FK rota */ }
          }
        }
      }
    }

    return { seeded, participantesRegistrados };
  }

  @Post('seed-event-file/:eventId')
  @ApiOperation({ summary: '[DEMO] Leer demo/eventos/{eventId}.json y actualizar solo ese evento' })
  async seedEventFile(
    @Param('eventId') eventId: string,
    @Body() body: { tenantId: string },
  ): Promise<{ seeded: number; eventId: string }> {
    const safeId = eventId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    const file = path.join(this.eventosDir, `${safeId}.json`);
    try {
      const raw = await fsp.readFile(file, 'utf8');
      const json = JSON.parse(raw);
      const ev = {
        id:          json.id,
        name:        json.info.nombre,
        description: json.info.descripcion,
        startDate:   json.info.inicio,
        endDate:     json.info.fin,
        totalQuota:  json.info.cupoTotal,
        isActive:    json.activo !== false,
        contextData: {
          precio: json.comercial?.precio, moneda: json.comercial?.moneda ?? 'MXN',
          descuentos: json.comercial?.descuentos ?? [], metodoPago: json.comercial?.metodoPago ?? null,
          politicaReembolso: json.comercial?.politicaReembolso ?? null,
          modalidad: json.logistica?.modalidad, ubicacion: json.logistica?.ubicacion ?? null,
          horario: json.logistica?.horario, duracion: json.logistica?.duracion,
          plataforma: json.logistica?.plataforma ?? null, enlaceAcceso: json.logistica?.enlaceAcceso ?? null,
          nivel: json.academico?.nivel, requisitos: json.academico?.requisitos ?? [],
          instructor: json.academico?.instructor ?? null,
          temario: json.academico?.temario ?? [], incluye: json.academico?.incluye ?? [],
        },
        participantes: json.participantes ?? [],
      };
      const result = await this.seedEvents({ tenantId: body.tenantId, events: [ev] });
      return { seeded: result.seeded, eventId: safeId };
    } catch (err) {
      throw new Error(`No se pudo leer ${safeId}.json: ${(err as Error).message}`);
    }
  }

  @Post('seed-from-files')
  @ApiOperation({ summary: '[DEMO] Leer demo/eventos/*.json y poblar la BD' })
  async seedFromFiles(@Body() body: { tenantId: string }): Promise<{ seeded: number }> {
    const jsons = await this.readEventFiles();
    if (!jsons.length) return { seeded: 0 };

    // Mapear estructura JSON a formato del endpoint seedEvents
    const events = jsons.map(json => ({
      id:           json.id,
      name:         json.info.nombre,
      description:  json.info.descripcion,
      startDate:    json.info.inicio,
      endDate:      json.info.fin,
      totalQuota:   json.info.cupoTotal,
      isActive:     json.activo !== false,
      contextData: {
        precio:            json.comercial?.precio,
        moneda:            json.comercial?.moneda ?? 'MXN',
        descuentos:        json.comercial?.descuentos ?? [],
        metodoPago:        json.comercial?.metodoPago ?? null,
        politicaReembolso: json.comercial?.politicaReembolso ?? null,
        modalidad:         json.logistica?.modalidad,
        ubicacion:         json.logistica?.ubicacion ?? null,
        horario:           json.logistica?.horario,
        duracion:          json.logistica?.duracion,
        plataforma:        json.logistica?.plataforma ?? null,
        enlaceAcceso:      json.logistica?.enlaceAcceso ?? null,
        nivel:             json.academico?.nivel,
        requisitos:        json.academico?.requisitos ?? [],
        instructor:        json.academico?.instructor ?? null,
        temario:           json.academico?.temario ?? [],
        incluye:           json.academico?.incluye ?? [],
      },
      participantes: json.participantes ?? [],
    }));

    const result = await this.seedEvents({ tenantId: body.tenantId, events });
    return { seeded: result.seeded };
  }

  @Get('session-log/:convId')
  @ApiOperation({ summary: '[DEMO] Leer archivo de log de sesión' })
  async getSessionLog(@Param('convId') convId: string): Promise<{ found: boolean; content: string }> {
    const safeId = (convId ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    if (!safeId) return { found: false, content: '' };
    const file = path.join(process.cwd(), 'demo', 'logs', 'sessions', `${safeId}.txt`);
    try {
      const content = await fsp.readFile(file, 'utf8');
      return { found: true, content };
    } catch {
      return { found: false, content: '' };
    }
  }

  @Post('session-log')
  @ApiOperation({ summary: '[DEMO] Persistir líneas de log de sesión a archivo TXT' })
  async saveSessionLog(
    @Body() body: { convId: string; lines: string[] },
  ): Promise<{ ok: boolean }> {
    const safeId = (body.convId ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    if (!safeId || !Array.isArray(body.lines) || !body.lines.length) return { ok: false };
    const dir = path.join(process.cwd(), 'demo', 'logs', 'sessions');
    try {
      await fsp.mkdir(dir, { recursive: true });
      await fsp.appendFile(
        path.join(dir, `${safeId}.txt`),
        body.lines.join('\n') + '\n',
        'utf8',
      );
    } catch { /* ignorar errores de FS en demo */ }
    return { ok: true };
  }
}
