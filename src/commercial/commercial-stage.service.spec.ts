import { Test, TestingModule } from '@nestjs/testing';
import { CommercialStageService } from './commercial-stage.service';
import { AuditLogService } from '../audit/audit-log.service';

const mockAuditLog = { record: jest.fn().mockResolvedValue(undefined) };

function mockDb(stage: string) {
  return {
    lead: {
      findFirstOrThrow: jest.fn().mockResolvedValue({ id: 'lead-1', tenantId: 't1', currentStage: stage, score: 5 }),
      update: jest.fn().mockResolvedValue(undefined),
    },
    stageHistory: { create: jest.fn().mockResolvedValue(undefined) },
    $transaction: jest.fn().mockImplementation((fn) => fn({
      lead: { update: jest.fn().mockResolvedValue(undefined) },
      stageHistory: { create: jest.fn().mockResolvedValue(undefined) },
    })),
  } as any;
}

describe('CommercialStageService', () => {
  let service: CommercialStageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommercialStageService,
        { provide: AuditLogService, useValue: mockAuditLog },
      ],
    }).compile();

    service = module.get<CommercialStageService>(CommercialStageService);
  });

  it('should transition LEAD → MQL on datos_de_contacto_completados', async () => {
    const db = mockDb('LEAD');
    const result = await service.processSignal(db, 't1', 'lead-1', 'conv-1', 'datos_de_contacto_completados');
    expect(result.changed).toBe(true);
    expect(result.currentStage).toBe('MQL');
  });

  it('should transition MQL → PROSPECTO on pregunta_de_inscripcion_detectada', async () => {
    const db = mockDb('MQL');
    const result = await service.processSignal(db, 't1', 'lead-1', 'conv-1', 'pregunta_de_inscripcion_detectada');
    expect(result.changed).toBe(true);
    expect(result.currentStage).toBe('PROSPECTO');
  });

  it('should transition PROSPECTO → SQL on confirmacion_de_pago_pendiente', async () => {
    const db = mockDb('PROSPECTO');
    const result = await service.processSignal(db, 't1', 'lead-1', 'conv-1', 'confirmacion_de_pago_pendiente');
    expect(result.changed).toBe(true);
    expect(result.currentStage).toBe('SQL');
  });

  it('should NOT transition from LEAD on unknown signal', async () => {
    const db = mockDb('LEAD');
    const result = await service.processSignal(db, 't1', 'lead-1', 'conv-1', 'confirmacion_de_pago_pendiente' as any);
    expect(result.changed).toBe(false);
    expect(result.currentStage).toBe('LEAD');
  });

  it('should NOT transition from CIERRE (terminal state)', async () => {
    const db = mockDb('CIERRE');
    const result = await service.processSignal(db, 't1', 'lead-1', 'conv-1', 'conversacion_iniciada');
    expect(result.changed).toBe(false);
  });

  it('canOperateAt should validate stage hierarchy', () => {
    expect(service.canOperateAt('PROSPECTO', 'PROSPECTO')).toBe(true);
    expect(service.canOperateAt('MQL', 'PROSPECTO')).toBe(false);
    expect(service.canOperateAt('SQL', 'PROSPECTO')).toBe(true);
  });
});
