import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';
import { OneToOne } from 'typeorm';
import { Correction } from '../corrections/corrections.entity';
import { Note } from '../notes/notes.entity';
import { OneToMany } from 'typeorm';
import { Commentaire } from '../commentaires/commentaires.entity';


@Entity()
export class Texte {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenuOriginal: string;

  @Column({ default: 'soumis' })
  statut: string; 
  // soumis | corrigé | noté

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateSoumission: Date;

  @ManyToOne(() => User, user => user.textes, {
    onDelete: 'CASCADE',
  })
  student: User;

  @ManyToOne(() => Exercice, ex => ex.textes, {
    onDelete: 'CASCADE',
  })
  exercice: Exercice;
  @OneToOne(() => Correction, correction => correction.texte)
correction: Correction;
@OneToOne(() => Note, note => note.texte)
note: Note;
@OneToMany(() => Commentaire, commentaire => commentaire.texte)
commentaires: Commentaire[];
}