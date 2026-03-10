import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
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

  @Get(':id')
  @ApiOperation({ summary: 'Consulter une soumission par ID' })
  @ApiResponse({ status: 200, description: 'Soumission retournee' })
  async findOne(@Param('id') id: string) {
    return this.submissionService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Creer une soumission et lancer evaluation IA' })
  @ApiResponse({ status: 202, description: 'Soumission acceptee et queuee' })
  async create(@Body() dto: CreateSubmissionDto) {
    const submission = await this.submissionService.createSubmissionByIds(
      dto.text,
      dto.studentId,
      dto.exerciseId,
    );

    return {
      message: 'Soumission acceptee. Evaluation IA en cours.',
      submissionId: submission.id,
      status: submission.status,
    };
  }
}
