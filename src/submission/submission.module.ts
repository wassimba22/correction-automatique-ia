import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaModule } from '../ia/ia.module';
import { Submission } from './submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, User, Exercice]),
    IaModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService],
  exports: [SubmissionService],
})
export class SubmissionModule {}
