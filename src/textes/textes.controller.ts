import { Controller, Post, Get, UseGuards, Body, Request, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { TextesService } from './textes.service';
import { FilterTexteDto } from './dto/filter-texte.dto';

@Controller('textes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Textes')
@ApiBearerAuth()

export class TextesController {
  constructor(private readonly textesService: TextesService) {}

  @Roles('student')
  @Post()
  @ApiOperation({ summary: 'Soumettre un texte pour correction' })
  @ApiResponse({ status: 201, description: 'Texte cree avec succes' })
  create(@Body() body: any, @Request() req: any) {
    return this.textesService.create(body, req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Recuperer un texte complet par ID' })
  @ApiResponse({ status: 200, description: 'Texte detaille retourne' })
  async getOne(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.textesService.findOneComplet(id, req.user);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Lister mes textes avec pagination et filtres' })
  @ApiResponse({ status: 200, description: 'Liste paginee des textes retournee' })
  async mesTextes(
    @Request() req,
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query() filters: FilterTexteDto,
  ) {
    return this.textesService.findMesTextes(
      req.user.id,
      Number(page) || 1,
      Number(limit) || 10,
      filters,
    );
  }

  @Get(':id/textes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Lister les textes soumis pour un exercice' })
  @ApiResponse({ status: 200, description: 'Textes de l exercice retournes' })
  async getTextes(@Param('id') id: string) {
    return this.textesService.findTextesByExercice(id);
  }

  @Get(':id/mon-texte')
  @UseGuards(JwtAuthGuard)
  @Roles('student')
  @ApiOperation({ summary: 'Recuperer mon texte pour un exercice donne' })
  @ApiResponse({ status: 200, description: 'Texte de l etudiant retourne' })
  async monTexte(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.textesService.findMonTexte(id, req.user.id);
  }
}
