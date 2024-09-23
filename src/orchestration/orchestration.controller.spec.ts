import { Test, TestingModule } from '@nestjs/testing';
import { OrchestrationController } from './orchestration.controller';

describe('OrchestrationController', () => {
  let controller: OrchestrationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrchestrationController],
    }).compile();

    controller = module.get<OrchestrationController>(OrchestrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
