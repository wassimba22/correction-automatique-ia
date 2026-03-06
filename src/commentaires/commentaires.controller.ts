import { Controller, Param, Post, UseGuards, Body, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CommentairesService } from './commentaires.service';

@Controller('commentaires')
@ApiTags('Commentaires')
@ApiBearerAuth()
export class CommentairesController {
  constructor(private readonly commentairesService: CommentairesService) {}

  @Post(':texteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Ajouter un commentaire enseignant sur un texte' })
  @ApiResponse({ status: 201, description: 'Commentaire cree avec succes' })
  async ajouter(
    @Param('texteId') texteId: string,
    @Body() dto: CreateCommentaireDto,
    @Request() req,
  ) {
    return this.commentairesService.ajouterCommentaire(
      texteId,
      dto.contenu,
      req.user.id,
    );
  }
}
