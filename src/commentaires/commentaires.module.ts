import { Module } from '@nestjs/common';
import { CommentairesService } from './commentaires.service';
import { CommentairesController } from './commentaires.controller';

@Module({
  providers: [CommentairesService],
  controllers: [CommentairesController]
})
export class CommentairesModule {}
