import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TenantConfigService } from './tenant-config.service';

// Controlador solo para demo/pruebas — no forma parte del sistema productivo
// Para eliminar: borrar este archivo y quitarlo de TenantModule
@ApiTags('Demo Seed')
@Controller('admin/seed-events')
export class SeedEventsController {
  constructor(private readonly tenantConfigService: TenantConfigService) {}

  @Post()
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
