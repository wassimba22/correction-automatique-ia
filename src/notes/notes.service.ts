import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './notes.entity';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note)
    private noteRepository: Repository<Note>,
  ) {}

  async validerNote(texteId: string, noteFinale: number, _teacher: any) {
    const note = await this.noteRepository.findOne({
      where: { texte: { id: texteId } },
      relations: ['texte'],
    });

    if (!note) {
      throw new Error('Note introuvable');
    }

    note.noteFinale = noteFinale;
    note.validee = true;

    return this.noteRepository.save(note);
  }
}
