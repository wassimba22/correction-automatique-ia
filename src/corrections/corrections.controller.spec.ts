import { Test, TestingModule } from '@nestjs/testing';
import { CorrectionsController } from './corrections.controller';

describe('CorrectionsController', () => {
  let controller: CorrectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorrectionsController],
    }).compile();

    controller = module.get<CorrectionsController>(CorrectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
