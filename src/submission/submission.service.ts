import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Repository } from 'typeorm';
import { IaService } from '../ia/ia.service';
import { Submission, SubmissionStatus } from './submission.entity';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Exercice)
    private exerciceRepo: Repository<Exercice>,
    @InjectQueue('submission-evaluation')
    private submissionQueue: Queue,
    private aiService: IaService,
  ) {}

  async findAll() {
    return this.submissionRepo.find({
      relations: ['student', 'exercise'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const submission = await this.submissionRepo.findOne({
      where: { id },
      relations: ['student', 'exercise'],
    });

    if (!submission) {
      throw new NotFoundException('Soumission introuvable');
    }

    return submission;
  }

  async createSubmissionByIds(
    text: string,
    studentId: string,
    exerciseId: number,
  ) {
    const student = await this.userRepo.findOne({ where: { id: studentId } });
    if (!student) {
      throw new NotFoundException('Etudiant introuvable');
    }

    const exercise = await this.exerciceRepo.findOne({
      where: { id: exerciseId },
    });
    if (!exercise) {
      throw new NotFoundException('Exercice introuvable');
    }

    return this.createSubmission(text, student, exercise);
  }

  async createSubmission(text: string, student: User, exercise: Exercice) {
    const submission = this.submissionRepo.create({
      text,
      student,
      exercise,
      correction: null,
      grade: null,
      aiComment: null,
      status: SubmissionStatus.PENDING,
      errorMessage: null,
      processedAt: null,
    });

    const saved = await this.submissionRepo.save(submission);

    await this.submissionQueue.add(
      'evaluate',
      { submissionId: saved.id },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 200,
      },
    );

    return saved;
  }

  async processSubmission(submissionId: string) {
    const submission = await this.submissionRepo.findOne({
      where: { id: submissionId },
    });

    if (!submission) {
      throw new NotFoundException('Soumission introuvable');
    }

    submission.status = SubmissionStatus.PROCESSING;
    submission.errorMessage = null;
    await this.submissionRepo.save(submission);

    try {
      const aiResult = await this.aiService.analyserTexte(submission.text);
      const aiObject =
        aiResult && typeof aiResult === 'object' && !Array.isArray(aiResult)
          ? (aiResult as Record<string, unknown>)
          : {};

      const gradeSource = aiObject.note ?? aiObject.noteIA ?? aiObject.grade;
      const grade =
        typeof gradeSource === 'number'
          ? gradeSource
          : typeof gradeSource === 'string'
            ? Number(gradeSource.replace(',', '.'))
            : null;

      submission.correction =
        (typeof aiObject.correction === 'string' && aiObject.correction) ||
        (typeof aiObject.contenuCorrige === 'string' && aiObject.contenuCorrige) ||
        submission.text;
      submission.grade =
        typeof grade === 'number' && !Number.isNaN(grade) ? grade : null;
      submission.aiComment =
        (typeof aiObject.commentaire === 'string' && aiObject.commentaire) ||
        (typeof aiObject.commentaireAuto === 'string' && aiObject.commentaireAuto) ||
        (typeof aiObject.explication === 'string' && aiObject.explication) ||
        'Commentaire IA non fourni par le modele.';
      submission.status = SubmissionStatus.DONE;
      submission.processedAt = new Date();
      submission.errorMessage = null;
      await this.submissionRepo.save(submission);
    } catch (error: unknown) {
      submission.status = SubmissionStatus.FAILED;
      submission.errorMessage =
        error instanceof Error ? error.message : 'Erreur inconnue IA';
      submission.processedAt = new Date();
      await this.submissionRepo.save(submission);
      throw error;
    }
  }
}
