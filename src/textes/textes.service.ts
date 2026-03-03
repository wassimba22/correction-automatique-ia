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
}
