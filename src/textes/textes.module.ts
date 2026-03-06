import { Module } from '@nestjs/common';
import { TextesService } from './textes.service';
import { TextesController } from './textes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Texte } from './texte.entity';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';
import { Correction } from '../corrections/corrections.entity';
import { Note } from '../notes/notes.entity';
import { Commentaire } from '../commentaires/commentaires.entity';
import { IaModule } from '../ia/ia.module';

@Module({
  providers: [TextesService],
  imports: [
    IaModule,
    TypeOrmModule.forFeature([Texte, User, Exercice, Correction, Note, Commentaire]),
  ],
  controllers: [TextesController],
})
export class TextesModule {}
