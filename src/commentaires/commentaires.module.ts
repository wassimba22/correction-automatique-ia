import { Module } from '@nestjs/common';
import { CommentairesService } from './commentaires.service';
import { CommentairesController } from './commentaires.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Texte } from '../textes/texte.entity';
import { User } from '../users/user.entity';
import { Commentaire } from './commentaires.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Texte, User, Commentaire])],
  providers: [CommentairesService],
  controllers: [CommentairesController],
})
export class CommentairesModule {}
