import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentairesService {
    constructor(
        private texteRepository: any,
        private userRepository: any,
        private commentaireRepository: any,
    ) {}

    async ajouterCommentaire(
  texteId: string,
  contenu: string,
  teacherId: string,
) {

  const texte = await this.texteRepository.findOne({
    where: { id: texteId },
  });

  if (!texte) {
    throw new Error('Texte introuvable');
  }

  const teacher = await this.userRepository.findOne({
    where: { id: teacherId },
  });

  const commentaire = this.commentaireRepository.create({
    contenu,
    texte,
    enseignant: teacher,
    type: 'HUMAIN',
  });

  return this.commentaireRepository.save(commentaire);
}
}
