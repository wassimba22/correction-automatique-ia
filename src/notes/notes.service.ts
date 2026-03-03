import { Injectable } from '@nestjs/common';

@Injectable()
export class NotesService {
    constructor(private noteRepository: any) {}

    async validerNote(texteId: string, noteFinale: number, teacher: any) {

  const note = await this.noteRepository.findOne({
    where: { texte: { id: texteId } },
    relations: ['texte'],
  });

  if (!note) {
    throw new Error('Note introuvable');
  }

  note.noteFinale = noteFinale;
  note.validee = true;
  note.dateValidation = new Date();
note.enseignantValidateur = teacher;

  return this.noteRepository.save(note);
}
}
