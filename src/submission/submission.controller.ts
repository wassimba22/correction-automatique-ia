import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubmissionService } from './submission.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';

@ApiTags('Submission')
@Controller('submission')
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  @ApiOperation({ summary: 'Lister toutes les soumissions' })
  @ApiResponse({ status: 200, description: 'Liste des soumissions retournee' })
  async findAll() {
    return this.submissionService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Creer une soumission et lancer evaluation IA' })
  @ApiResponse({ status: 201, description: 'Soumission creee avec succes' })
  async create(@Body() dto: CreateSubmissionDto) {
    return this.submissionService.createSubmissionByIds(
      dto.text,
      dto.studentId,
      dto.exerciseId,
    );
  }
}
