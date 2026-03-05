import { Controller, Post, UseGuards, Body, Param, Get } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { ExercicesService } from './exercices.service';

@Controller('exercices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExercicesController {
  constructor(private exercicesService: ExercicesService) {}

  @Roles('teacher')
  @Post()
  create(@Body() body: any) {
    return this.exercicesService.create(body);
  }
  @Get(':id/exercices')
@UseGuards(JwtAuthGuard)
async getExercices(@Param('id') id: string) {
  return this.exercicesService.findExercices(id);
}
}
