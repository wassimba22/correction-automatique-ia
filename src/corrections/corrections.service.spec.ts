import { Test, TestingModule } from '@nestjs/testing';
import { CorrectionsService } from './corrections.service';

describe('CorrectionsService', () => {
  let service: CorrectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrectionsService],
    }).compile();

    service = module.get<CorrectionsService>(CorrectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
