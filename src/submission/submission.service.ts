import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IaService as AiService } from '../ia/ia.service';
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
    private aiService: AiService,
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

    let parsed: {
      correction?: string;
      note?: number;
      commentaire?: string;
    } = {};

    // Hugging Face responses vary by model: handle array, object, or raw JSON string.
    if (Array.isArray(aiResult) && aiResult[0]?.generated_text) {
      try {
        parsed = JSON.parse(aiResult[0].generated_text);
      } catch {
        parsed = {};
      }
    } else if (typeof aiResult === 'string') {
      try {
        parsed = JSON.parse(aiResult);
      } catch {
        parsed = {};
      }
    } else if (aiResult && typeof aiResult === 'object') {
      parsed = aiResult as typeof parsed;
    }

    const submission = this.submissionRepo.create({
      text,
      student,
      exercise,
      correction: parsed.correction ?? null,
      grade: parsed.note ?? null,
      aiComment: parsed.commentaire ?? null,
    });

    return this.submissionRepo.save(submission);
  }
}
