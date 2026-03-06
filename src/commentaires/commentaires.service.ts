import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Texte } from '../textes/texte.entity';
import { User } from '../users/user.entity';
import { Commentaire } from './commentaires.entity';

@Injectable()
export class CommentairesService {
  constructor(
    @InjectRepository(Texte)
    private texteRepository: Repository<Texte>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Commentaire)
    private commentaireRepository: Repository<Commentaire>,
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

    if (!teacher) {
      throw new Error('Enseignant introuvable');
    }

    const commentaire = this.commentaireRepository.create({
      contenu,
      texte,
      enseignant: teacher,
    });

    return this.commentaireRepository.save(commentaire);
  }
}
