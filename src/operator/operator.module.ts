import { Module } from '@nestjs/common';
import { OperatorController } from './operator.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [OperatorController],
})
export class OperatorModule {}
