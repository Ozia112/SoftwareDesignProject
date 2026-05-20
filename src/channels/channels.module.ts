import { Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [ConversationModule],
  controllers: [WebhookController],
})
export class ChannelsModule {}
