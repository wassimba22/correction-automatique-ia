import { Module } from '@nestjs/common';
import { ExercicesService } from './exercices.service';
import { ExercicesController } from './exercices.controller';

@Module({
  providers: [ExercicesService],
  controllers: [ExercicesController]
})
export class ExercicesModule {}
