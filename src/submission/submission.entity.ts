import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';

@Entity()
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'text', nullable: true })
  correction: string | null;

  @Column({ type: 'float', nullable: true })
  grade: number | null;

  @Column({ type: 'text', nullable: true })
  aiComment: string | null;

  @ManyToOne(() => User, { nullable: false })
  student: User;

  @ManyToOne(() => Exercice, { nullable: false })
  exercise: Exercice;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
