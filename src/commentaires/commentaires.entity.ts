import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { Texte } from '../textes/texte.entity';
import { User } from '../users/user.entity';

@Entity()
export class Commentaire {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenu: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCreation: Date;

  @ManyToOne(() => Texte, texte => texte.commentaires, {
    onDelete: 'CASCADE',
  })
  texte: Texte;

  @ManyToOne(() => User, user => user.commentaires, {
    onDelete: 'CASCADE',
  })
  enseignant: User;
}
