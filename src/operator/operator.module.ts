import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { AuditModule } from '../audit/audit.module';
import { ConversationModule } from '../conversation/conversation.module';

@Module({
  imports: [AuditModule, ConversationModule],
  controllers: [OperatorController],
})
export class OperatorModule {}
