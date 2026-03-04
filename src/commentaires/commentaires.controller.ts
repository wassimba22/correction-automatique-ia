import { Controller, Param, Post, UseGuards, Body, Request } from '@nestjs/common';
import { CreateCommentaireDto } from './dto/create-commentaire.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CommentairesService } from './commentaires.service';

@Controller('commentaires')
export class CommentairesController {
  constructor(private readonly commentairesService: CommentairesService) {}
    @Post(':texteId')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
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
