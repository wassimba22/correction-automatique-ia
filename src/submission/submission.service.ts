import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IaService } from '../ia/ia.service';
import { Submission } from './submission.entity';
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
    private aiService: IaService,
  ) {}

  async findAll() {
    return this.submissionRepo.find({
      relations: ['student', 'exercise'],
      order: { createdAt: 'DESC' },
    });
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
    const aiResult = await this.aiService.analyserTexte(text);
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

    const submission = this.submissionRepo.create({
      text,
      student,
      exercise,
      correction:
        (typeof aiObject.correction === 'string' && aiObject.correction) ||
        (typeof aiObject.contenuCorrige === 'string' && aiObject.contenuCorrige) ||
        text,
      grade: typeof grade === 'number' && !Number.isNaN(grade) ? grade : null,
      aiComment:
        (typeof aiObject.commentaire === 'string' && aiObject.commentaire) ||
        (typeof aiObject.commentaireAuto === 'string' && aiObject.commentaireAuto) ||
        (typeof aiObject.explication === 'string' && aiObject.explication) ||
        'Commentaire IA non fourni par le modele.',
    });

    return this.submissionRepo.save(submission);
  }
}
