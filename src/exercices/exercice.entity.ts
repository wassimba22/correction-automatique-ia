import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Package } from '../packages/package.entity';
import { Texte } from '../textes/texte.entity';

@Entity()
export class Exercice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  consigne: string;

  @Column()
  type: string;

  @Column({ type: 'timestamp', nullable: true })
  dateLimite: Date;

  @ManyToOne(() => Package, (pkg) => pkg.exercices, {
    onDelete: 'CASCADE',
  })
  package: Package;

  @OneToMany(() => Texte, (texte) => texte.exercice)
  textes: Texte[];
}
