import { Injectable } from '@nestjs/common';
import { IaService } from 'src/ia/ia.service';
import { Column } from 'typeorm/browser/decorator/columns/Column.js';

@Injectable()
export class TextesService {
  constructor(
    private readonly userRepository: any,
    private readonly exerciceRepository: any,
    private readonly texteRepository: any,
    private readonly correctionRepository: any,
    private readonly noteRepository: any,
    private readonly commentaireRepository: any,
    private readonly iaService: IaService,
  ) {}

async create(data: any, studentId: string) {

  const student = await this.userRepository.findOne({
    where: { id: studentId },
  });

  const exercice = await this.exerciceRepository.findOne({
    where: { id: data.exerciceId },
  });

  // 1️⃣ Enregistrer texte
  const texte = this.texteRepository.create({
    contenuOriginal: data.contenuOriginal,
    student,
    exercice,
    statut: 'soumis',
  });

  const savedTexte = await this.texteRepository.save(texte);

  // 2️⃣ Appel IA
  const iaResult = await this.iaService.analyserTexte(data.contenuOriginal);

  // 3️⃣ Créer Correction
  const correction = this.correctionRepository.create({
    contenuCorrige: iaResult.contenuCorrige,
    explication: iaResult.explication,
    texte: savedTexte,
  });

  await this.correctionRepository.save(correction);

  // 4️⃣ Créer Note
  const note = this.noteRepository.create({
    noteIA: iaResult.noteIA,
    noteFinale: null,
    validee: false,
    texte: savedTexte,
  });

  await this.noteRepository.save(note);

// 5️⃣ Créer Commentaire automatique
const commentaire = this.commentaireRepository.create({
  contenu: iaResult.commentaireAuto,
  texte: savedTexte,
  type: 'IA',
});

  await this.commentaireRepository.save(commentaire);

  // 6️⃣ Mettre statut à corrigé
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

  // 🔐 Sécurité : si étudiant
  if (user.role === 'student' && texte.student.id !== user.id) {
    throw new Error('Accès refusé');
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
    }
    else if (filters.sort === 'dateSoumission') {
      query.orderBy('texte.dateSoumission', order);
    }
  }
  else {
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

  return this.texteRepository.find({
    where: { exercice: { id: exerciceId } },
    relations: ['student', 'note'],
    order: { dateSoumission: 'DESC' },
  });
}

async findMonTexte(exerciceId: string, studentId: string) {

  return this.texteRepository.findOne({
    where: {
      exercice: { id: exerciceId },
      student: { id: studentId },
    },
    relations: ['note'],
  });
}

}
