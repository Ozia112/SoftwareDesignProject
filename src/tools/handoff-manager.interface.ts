import { PrismaClient } from '@prisma/client';
import type { RequestHumanHandoffOutput } from '../dto/tool-calls.dto';

export abstract class HandoffManager {
  abstract requestHandoff(
    db: PrismaClient,
    tenantId: string,
    leadId: string,
    conversationId: string,
    reason: string,
  ): Promise<RequestHumanHandoffOutput>;
}
