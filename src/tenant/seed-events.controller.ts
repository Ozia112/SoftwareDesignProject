import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantConfigService } from './tenant-config.service';
import { createRedis } from '../common/redis.factory';

// Controlador solo para demo/pruebas — no forma parte del sistema productivo
// Para eliminar: borrar este archivo y quitarlo de TenantModule
@ApiTags('Demo Seed')
@Controller('admin')
export class SeedEventsController {
  private readonly sessionRedis = createRedis('session:');

  constructor(private readonly tenantConfigService: TenantConfigService) {}

  @Post('reset-demo')
  @ApiOperation({ summary: '[DEMO] Eliminar todos los leads/conversaciones y resetear cupos' })
  async resetDemo(@Body() body: { tenantId: string }): Promise<{ ok: boolean; deleted: Record<string, number> }> {
    const config = await this.tenantConfigService.getTenantConfig(body.tenantId);
    if (!config.dbUrl) throw new Error('No DB URL configured for tenant');
    const db = this.tenantConfigService.getPrismaClient(body.tenantId, config.dbUrl);

    // Obtener IDs de leads del tenant para cascade manual
    const leads = await db.lead.findMany({ where: { tenantId: body.tenantId }, select: { id: true } });
    const leadIds = leads.map((l) => l.id);

    const convs = await db.conversation.findMany({ where: { tenantId: body.tenantId }, select: { id: true } });
    const convIds = convs.map((c) => c.id);

    // Borrar en orden de dependencias FK
    const [auditDel, wlDel, resDel, shDel, convDel, leadDel] = await Promise.all([
      convIds.length ? db.auditLog.deleteMany({ where: { conversationId: { in: convIds } } }) : { count: 0 },
      leadIds.length ? db.waitingListEntry.deleteMany({ where: { leadId: { in: leadIds } } }) : { count: 0 },
      leadIds.length ? db.reservation.deleteMany({ where: { leadId: { in: leadIds } } }) : { count: 0 },
      leadIds.length ? db.stageHistory.deleteMany({ where: { leadId: { in: leadIds } } }) : { count: 0 },
      db.conversation.deleteMany({ where: { tenantId: body.tenantId } }),
      db.lead.deleteMany({ where: { tenantId: body.tenantId } }),
    ]);

    // Resetear cupos de eventos a 0
    await db.event.updateMany({
      where: { tenantId: body.tenantId },
      data: { reservedQuota: 0, confirmedQuota: 0 },
    });

    // Limpiar sesiones Redis del tenant
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

    // Invalidar caché del tenant
    await this.tenantConfigService.invalidateCache(body.tenantId);

    return {
      ok: true,
      deleted: {
        auditLogs: auditDel.count,
        waitlistEntries: wlDel.count,
        reservations: resDel.count,
        stageHistory: shDel.count,
        conversations: convDel.count,
        leads: leadDel.count,
        redisSessions: sessionsDel,
      },
    };
  }

  @Post('seed-events')
  @ApiOperation({ summary: '[DEMO] Inyectar eventos de prueba para un tenant' })
  async seedEvents(@Body() body: { tenantId: string; events: any[] }): Promise<{ seeded: number }> {
    const config = await this.tenantConfigService.getTenantConfig(body.tenantId);
    if (!config.dbUrl) throw new Error('No DB URL configured for tenant');
    const db = this.tenantConfigService.getPrismaClient(body.tenantId, config.dbUrl);

    let seeded = 0;
    for (const ev of body.events) {
      await db.event.upsert({
        where: { id: ev.id },
        create: {
          id: ev.id,
          tenantId: body.tenantId,
          name: ev.name,
          description: ev.description,
          startDate: ev.startDate ? new Date(ev.startDate) : null,
          endDate: ev.endDate ? new Date(ev.endDate) : null,
          totalQuota: ev.totalQuota ?? 20,
          isActive: true,
          contextData: ev.contextData ?? {},
        },
        update: {
          name: ev.name,
          description: ev.description,
          startDate: ev.startDate ? new Date(ev.startDate) : null,
          endDate: ev.endDate ? new Date(ev.endDate) : null,
          totalQuota: ev.totalQuota ?? 20,
          contextData: ev.contextData ?? {},
        },
      });
      seeded++;
    }

    return { seeded };
  }
}
