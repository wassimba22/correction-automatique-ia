import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Exercice } from '../exercices/exercice.entity';

@Entity()
export class Package {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titre: string;

  @Column()
  description: string;

  @Column()
  niveau: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.packages, { eager: true })
  teacher: User;

  @OneToMany(() => Exercice, (exercice) => exercice.package)
  exercices: Exercice[];
}
