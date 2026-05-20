import { Module } from '@nestjs/common';
import { CommercialStageService } from './commercial-stage.service';
import { ScoringService } from './scoring.service';
import { ConsentService } from './consent.service';

@Module({
  providers: [CommercialStageService, ScoringService, ConsentService],
  exports: [CommercialStageService, ScoringService, ConsentService],
})
export class CommercialModule {}
