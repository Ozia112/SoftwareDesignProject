import { PrismaClient } from '@prisma/client';
import type { ToolCallResult } from '../dto/tool-calls.dto';

export interface ToolContext {
  tenantId: string;
  leadId: string;
  conversationId: string;
  db: PrismaClient;
}

export interface IToolHandler<TInput = unknown, TOutput = unknown> {
  readonly name: string;
  readonly schema: object; // Anthropic tool schema
  execute(params: TInput, context: ToolContext): Promise<ToolCallResult<TOutput>>;
}
