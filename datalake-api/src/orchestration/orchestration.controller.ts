
import { Controller, Post, Body } from '@nestjs.common';
import { OrchestrationService } from './orchestration.service';

@Controller('orchestrate')
export class OrchestrationController {
  constructor(private readonly orchestrationService: OrchestrationService) {}

  @Post()
  orchestrateWorkflow(@Body() body: { workflow: any }) {
    this.orchestrationService.orchestrateWorkflow(body.workflow);
    return { status: 'success', message: 'Workflow orchestration started.' };
  }
}
