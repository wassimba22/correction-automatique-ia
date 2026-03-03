import { Test, TestingModule } from '@nestjs/testing';
import { TextesController } from './textes.controller';

describe('TextesController', () => {
  let controller: TextesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TextesController],
    }).compile();

    controller = module.get<TextesController>(TextesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
