import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Texte } from '../textes/texte.entity';

@Entity()
export class Correction {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenuCorrige: string;

  @Column({ type: 'text' })
  explication: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  dateCorrection: Date;

  @OneToOne(() => Texte, texte => texte.correction, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  texte: Texte;
}
