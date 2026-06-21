export interface IChatChannel {
  tenantId: string;
  channelType: 'whatsapp' | 'telegram' | 'web';
  sendMessage(conversationId: string, text: string): Promise<void>;
}
