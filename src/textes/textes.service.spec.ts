import { Test, TestingModule } from '@nestjs/testing';
import { TextesService } from './textes.service';

describe('TextesService', () => {
  let service: TextesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextesService],
    }).compile();

    service = module.get<TextesService>(TextesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
