import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Texte } from '../textes/texte.entity';
import { User } from '../users/user.entity';

@Entity()
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', nullable: true })
  noteIA: number | null;

  @Column({ type: 'float', nullable: true })
  noteFinale: number | null;

  @Column({ default: false })
  validee: boolean;

  @Column({ type: 'timestamp', nullable: true })
  dateValidation: Date | null;

  @OneToOne(() => Texte, (texte) => texte.note, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  texte: Texte;

  @ManyToOne(() => User, { nullable: true })
  enseignantValidateur: User | null;
}
