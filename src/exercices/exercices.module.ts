import { Module } from '@nestjs/common';
import { ExercicesService } from './exercices.service';
import { ExercicesController } from './exercices.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercice } from './exercice.entity';
import { Package } from '../packages/package.entity';
import { Texte } from '../textes/texte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exercice, Package, Texte])],
  providers: [ExercicesService],
  controllers: [ExercicesController],
})
export class ExercicesModule {}
