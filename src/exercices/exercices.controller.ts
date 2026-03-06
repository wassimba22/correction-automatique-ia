import { Controller, Post, UseGuards, Body, Param, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ExercicesService } from './exercices.service';

@Controller('exercices')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Exercices')
@ApiBearerAuth()
export class ExercicesController {
  constructor(private exercicesService: ExercicesService) {}

  @Roles('teacher')
  @Post()
  @ApiOperation({ summary: 'Creer un exercice' })
  @ApiResponse({ status: 201, description: 'Exercice cree avec succes' })
  create(@Body() body: any) {
    return this.exercicesService.create(body);
  }

  @Get(':id/exercices')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lister les exercices d un package' })
  @ApiResponse({ status: 200, description: 'Exercices retournes' })
  async getExercices(@Param('id') id: string) {
    return this.exercicesService.findExercices(id);
  }

  @Get(':id/textes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Lister les textes soumis pour un exercice' })
  @ApiResponse({ status: 200, description: 'Textes pagines retournes' })
  async getTextes(
    @Param('id') id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.exercicesService.findTextesByExercice(
      id,
      Number(page) || 1,
      Number(limit) || 10,
    );
  }
}
