import { Module } from '@nestjs/common';
import { ContextBankService } from './context-bank.service';

@Module({
  providers: [ContextBankService],
  exports: [ContextBankService],
})
export class ContextBankModule {}
