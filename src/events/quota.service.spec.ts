import { Test, TestingModule } from '@nestjs/testing';
import { QuotaService } from './quota.service';
import { AuditLogService } from '../audit/audit-log.service';
import { getQueueToken } from '@nestjs/bull';

const mockAuditLog = { record: jest.fn().mockResolvedValue(undefined) };
const mockQueue = { add: jest.fn().mockResolvedValue({ id: 'job-1' }) };

function mockDbWithQuota(available: number, existing?: any) {
  return {
    reservation: {
      findUnique: jest.fn().mockResolvedValue(existing ?? null),
      findFirst: jest.fn().mockResolvedValue(existing ?? null),
      create: jest.fn().mockResolvedValue({
        id: 'res-1',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        status: 'TEMPORARY',
        eventId: 'evt-1',
      }),
      update: jest.fn().mockResolvedValue(undefined),
    },
    event: {
      update: jest.fn().mockResolvedValue(undefined),
    },
    $transaction: jest.fn().mockImplementation(async (fn) => {
      const txClient = {
        event: { update: jest.fn().mockResolvedValue(undefined) },
        reservation: {
          create: jest.fn().mockResolvedValue({
            id: 'res-1',
            expiresAt: new Date(Date.now() + 30 * 60 * 1000),
            eventId: 'evt-1',
          }),
          update: jest.fn().mockResolvedValue(undefined),
        },
        $queryRaw: jest
          .fn()
          .mockResolvedValue([
            { id: 'evt-1', totalQuota: 10, reservedQuota: 10 - available, confirmedQuota: 0 },
          ]),
      };
      return fn(txClient);
    }),
  } as any;
}

describe('QuotaService', () => {
  let service: QuotaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotaService,
        { provide: AuditLogService, useValue: mockAuditLog },
        { provide: getQueueToken('reservation-expiry'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<QuotaService>(QuotaService);
  });

  it('should reserve quota when available', async () => {
    const db = mockDbWithQuota(5);
    const result = await service.reserveQuota(db, 't1', 'lead-1', 'conv-1', 'evt-1', 'idem-1');
    expect(result.reservationId).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });

  it('should be idempotent on same idempotencyKey with active reservation', async () => {
    const existingReservation = {
      id: 'res-existing',
      status: 'TEMPORARY',
      expiresAt: new Date(Date.now() + 10000),
    };
    const db = mockDbWithQuota(5, existingReservation);
    const result = await service.reserveQuota(db, 't1', 'lead-1', 'conv-1', 'evt-1', 'idem-1');
    expect(result.reservationId).toBe('res-existing');
    // No debe crear nueva reserva
    expect(db.$transaction).not.toHaveBeenCalled();
  });

  it('should release quota', async () => {
    const existingReservation = { id: 'res-1', status: 'TEMPORARY', eventId: 'evt-1' };
    const db = {
      reservation: {
        findFirst: jest.fn().mockResolvedValue(existingReservation),
        update: jest.fn().mockResolvedValue(undefined),
      },
      event: { update: jest.fn().mockResolvedValue(undefined) },
      $transaction: jest.fn().mockImplementation(async (fn) =>
        fn({
          reservation: { update: jest.fn().mockResolvedValue(undefined) },
          event: { update: jest.fn().mockResolvedValue(undefined) },
        }),
      ),
    } as any;

    const result = await service.releaseQuota(db, 't1', 'lead-1', 'conv-1', 'evt-1');
    expect(result.released).toBe(true);
  });

  it('should throw on no quota available', async () => {
    const db = mockDbWithQuota(0);
    await expect(
      service.reserveQuota(db, 't1', 'lead-1', 'conv-1', 'evt-1', 'idem-new'),
    ).rejects.toThrow();
  });
});
