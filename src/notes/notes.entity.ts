import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Texte } from '../textes/texte.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Note {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float', nullable: true })
  noteIA: number;

  @Column({ type: 'float', nullable: true })
  noteFinale: number;

  @Column({ default: false })
  validee: boolean;

  @OneToOne(() => Texte, texte => texte.note, {
    onDelete: 'CASCADE',
  })
  @Column({ type: 'timestamp', nullable: true })
dateValidation: Date;

@ManyToOne(() => User, { nullable: true })
enseignantValidateur: User;
  @JoinColumn()
  texte: Texte;
}
@ManyToOne(() => User, { nullable: true })
@JoinColumn()
enseignantValidateur: User;

function ManyToOne(arg0: () => typeof User, arg1: { nullable: boolean; }): (target: Note, propertyKey: "enseignantValidateur") => void {
    throw new Error('Function not implemented.');
}
