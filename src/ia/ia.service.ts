import { Injectable } from '@nestjs/common';

@Injectable()
export class IaService {
  async analyserTexte(contenu: string) {
    return {
      contenuCorrige: contenu,
      explication: 'Analyse automatique basique',
      noteIA: 10,
      commentaireAuto: 'Texte recu et analyse automatiquement.',
    };
  }
}
