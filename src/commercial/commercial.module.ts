import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module';
import { CommercialStageService } from './commercial-stage.service';
import { ScoringService } from './scoring.service';
import { ConsentService } from './consent.service';

@Module({
  imports: [AuditModule],
  providers: [CommercialStageService, ScoringService, ConsentService],
  exports: [CommercialStageService, ScoringService, ConsentService],
})
export class CommercialModule {}
