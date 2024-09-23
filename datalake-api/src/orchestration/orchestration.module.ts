
import { Module } from '@nestjs.common';
import { OrchestrationService } from './orchestration.service';
import { OrchestrationController } from './orchestration.controller';

@Module({
  controllers: [OrchestrationController],
  providers: [OrchestrationService],
})
export class OrchestrationModule {}
