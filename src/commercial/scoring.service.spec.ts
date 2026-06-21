import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { AuditLogService } from '../audit/audit-log.service';

const mockAuditLog = { record: jest.fn().mockResolvedValue(undefined) };

function mockDb(score: number) {
  return {
    lead: {
      findFirstOrThrow: jest.fn().mockResolvedValue({ id: 'lead-1', tenantId: 't1', score }),
      update: jest.fn().mockResolvedValue(undefined),
    },
  } as any;
}

describe('ScoringService', () => {
  let service: ScoringService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScoringService, { provide: AuditLogService, useValue: mockAuditLog }],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
  });

  it('should increase score on contact_data_provided', async () => {
    const db = mockDb(0);
    const result = await service.applyEvent(db, 't1', 'lead-1', 'conv-1', {
      type: 'contact_data_provided',
    });
    expect(result.delta).toBe(3);
    expect(result.score).toBe(3);
  });

  it('should decrease score on spam_detected', async () => {
    const db = mockDb(10);
    const result = await service.applyEvent(db, 't1', 'lead-1', 'conv-1', {
      type: 'spam_detected',
    });
    expect(result.delta).toBe(-4);
    expect(result.score).toBe(6);
  });

  it('should cap score at 20', async () => {
    const db = mockDb(18);
    const result = await service.applyEvent(db, 't1', 'lead-1', 'conv-1', {
      type: 'payment_confirmed',
    });
    expect(result.score).toBe(20);
  });

  it('should not go below 0', async () => {
    const db = mockDb(2);
    const result = await service.applyEvent(db, 't1', 'lead-1', 'conv-1', {
      type: 'exploit_attempt',
    });
    expect(result.score).toBe(0);
  });

  it('should detect exploit reincidente on second exploit', async () => {
    const db = mockDb(10);
    await service.applyEvent(db, 't1', 'lead-1', 'conv-1', { type: 'exploit_attempt' });
    const result = await service.applyEvent(db, 't1', 'lead-1', 'conv-1', {
      type: 'exploit_attempt',
    });
    expect(result.exploitReincidente).toBe(true);
  });

  it('scoring should NOT modify stage (isolation)', async () => {
    // ScoringService only updates lead.score — no stage field in update
    const db = mockDb(5);
    db.lead.update = jest.fn().mockImplementation((args) => {
      expect(args.data).not.toHaveProperty('currentStage');
      return Promise.resolve(undefined);
    });
    await service.applyEvent(db, 't1', 'lead-1', 'conv-1', { type: 'inscription_intent' });
    expect(db.lead.update).toHaveBeenCalled();
  });
});
