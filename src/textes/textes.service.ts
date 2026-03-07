import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IaService } from 'src/ia/ia.service';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';
import { Texte } from './texte.entity';
import { Correction } from '../corrections/corrections.entity';
import { Note } from '../notes/notes.entity';
import { Commentaire } from '../commentaires/commentaires.entity';

@Injectable()
export class TextesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Exercice)
    private readonly exerciceRepository: Repository<Exercice>,
    @InjectRepository(Texte)
    private readonly texteRepository: Repository<Texte>,
    @InjectRepository(Correction)
    private readonly correctionRepository: Repository<Correction>,
    @InjectRepository(Note)
    private readonly noteRepository: Repository<Note>,
    @InjectRepository(Commentaire)
    private readonly commentaireRepository: Repository<Commentaire>,
    private readonly iaService: IaService,
  ) {}

  async create(data: any, studentId: string) {
    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new Error('Etudiant introuvable');
    }

    const exerciceId = Number(data.exerciceId);
    const exercice = await this.exerciceRepository.findOne({
      where: { id: exerciceId },
    });

    if (!exercice) {
      throw new Error('Exercice introuvable');
    }

    const texte = this.texteRepository.create({
      contenuOriginal: data.contenuOriginal,
      student,
      exercice,
      statut: 'soumis',
    });

    const savedTexte = await this.texteRepository.save(texte);
    const iaResult = await this.iaService.analyserTexte(data.contenuOriginal);
    const aiObject =
      iaResult && typeof iaResult === 'object' && !Array.isArray(iaResult)
        ? (iaResult as Record<string, unknown>)
        : {};

    const noteSource = aiObject.note ?? aiObject.noteIA ?? aiObject.grade;
    const noteValue =
      typeof noteSource === 'number'
        ? noteSource
        : typeof noteSource === 'string'
          ? Number(noteSource.replace(',', '.'))
          : undefined;

    const correction = this.correctionRepository.create({
      contenuCorrige:
        (typeof aiObject.correction === 'string' && aiObject.correction) ||
        (typeof aiObject.contenuCorrige === 'string' && aiObject.contenuCorrige) ||
        data.contenuOriginal,
      explication:
        (typeof aiObject.commentaire === 'string' && aiObject.commentaire) ||
        (typeof aiObject.commentaireAuto === 'string' && aiObject.commentaireAuto) ||
        (typeof aiObject.explication === 'string' && aiObject.explication) ||
        'Analyse IA disponible sans details supplementaires.',
      texte: savedTexte,
    });
    await this.correctionRepository.save(correction);

    const note = this.noteRepository.create({
      noteIA: typeof noteValue === 'number' && !Number.isNaN(noteValue) ? noteValue : undefined,
      noteFinale: undefined,
      validee: false,
      texte: savedTexte,
    });
    await this.noteRepository.save(note);

    const commentaire = this.commentaireRepository.create({
      contenu:
        (typeof aiObject.commentaire === 'string' && aiObject.commentaire) ||
        (typeof aiObject.commentaireAuto === 'string' && aiObject.commentaireAuto) ||
        (typeof aiObject.explication === 'string' && aiObject.explication) ||
        'Commentaire IA non fourni par le modele.',
      texte: savedTexte,
    });
    await this.commentaireRepository.save(commentaire);

    savedTexte.statut = 'corrige';
    await this.texteRepository.save(savedTexte);

    return savedTexte;
  }

  async findOneComplet(id: string, user: any) {
    const texte = await this.texteRepository.findOne({
      where: { id },
      relations: [
        'student',
        'exercice',
        'correction',
        'note',
        'commentaires',
        'commentaires.enseignant',
      ],
    });

    if (!texte) {
      throw new Error('Texte introuvable');
    }

    if (user.role === 'student' && texte.student.id !== user.id) {
      throw new Error('Acces refuse');
    }

    return texte;
  }

  async findMesTextes(
    studentId: string,
    page: number,
    limit: number,
    filters: any,
  ) {
    const query = this.texteRepository
      .createQueryBuilder('texte')
      .leftJoinAndSelect('texte.exercice', 'exercice')
      .leftJoinAndSelect('texte.note', 'note')
      .where('texte.studentId = :studentId', { studentId });

    if (filters.statut) {
      query.andWhere('texte.statut = :statut', { statut: filters.statut });
    }

    if (filters.validee !== undefined) {
      query.andWhere('note.validee = :validee', { validee: filters.validee });
    }

    if (filters.minNote) {
      query.andWhere('note.noteFinale >= :minNote', { minNote: filters.minNote });
    }

    if (filters.maxNote) {
      query.andWhere('note.noteFinale <= :maxNote', { maxNote: filters.maxNote });
    }

    if (filters.sort) {
      const order = filters.order || 'DESC';
      if (filters.sort === 'noteFinale') {
        query.orderBy('note.noteFinale', order);
      } else if (filters.sort === 'dateSoumission') {
        query.orderBy('texte.dateSoumission', order);
      }
    } else {
      query.orderBy('texte.dateSoumission', 'DESC');
    }

    query.skip((page - 1) * limit).take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findTextesByExercice(exerciceId: string) {
    const parsedExerciceId = Number(exerciceId);
    return this.texteRepository.find({
      where: { exercice: { id: parsedExerciceId } },
      relations: ['student', 'note'],
      order: { dateSoumission: 'DESC' },
    });
  }

  async findMonTexte(exerciceId: string, studentId: string) {
    const parsedExerciceId = Number(exerciceId);
    return this.texteRepository.findOne({
      where: {
        exercice: { id: parsedExerciceId },
        student: { id: studentId },
      },
      relations: ['note'],
    });
  }
}

