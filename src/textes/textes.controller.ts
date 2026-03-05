import { Controller, Post, Get, UseGuards, Body, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { TextesService } from './textes.service';

@Controller('textes')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TextesController {
  constructor(private readonly textesService: TextesService) {}

  @Roles('student')
  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.textesService.create(body, req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOne(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.textesService.findOneComplet(id, req.user);
  }
  @Get('me')
@UseGuards(JwtAuthGuard)
@Roles('student')
async mesTextes(@Request() req) {
  return this.textesService.findMesTextes(req.user.id);
}
@Get(':id/textes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
async getTextes(@Param('id') id: string) {
  return this.textesService.findTextesByExercice(id);
}
}
