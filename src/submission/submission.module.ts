import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IaModule } from '../ia/ia.module';
import { Submission } from './submission.entity';
import { SubmissionService } from './submission.service';
import { SubmissionController } from './submission.controller';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';
import { SubmissionProcessor } from './submission.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'submission-evaluation',
      connection: {
        host: '127.0.0.1',
        port: 6380,
      },
    }),
    TypeOrmModule.forFeature([Submission, User, Exercice]),
    IaModule,
  ],
  controllers: [SubmissionController],
  providers: [SubmissionService, SubmissionProcessor],
  exports: [SubmissionService],
})
export class SubmissionModule {}
