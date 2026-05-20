import type { ChannelType } from '@prisma/client';

export interface IncomingMessageDto {
  tenantId: string;
  channelType: ChannelType;
  channelId: string; // ID del usuario en el canal (phone, telegram_id, etc.)
  messageId: string; // ID del mensaje en el canal (para dedup)
  text: string;
  timestamp: string; // ISO-8601
  metadata?: Record<string, unknown>;
}

export interface ConversationContextDto {
  tenantId: string;
  leadId: string;
  conversationId: string;
  channelType: ChannelType;
  channelId: string;
}

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string | unknown[];
  timestamp: string;
}
