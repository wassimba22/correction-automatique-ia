import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { OneToMany } from 'typeorm';
import { Package } from '../packages/package.entity';
import { Texte } from '../textes/texte.entity';
import { Commentaire } from '../commentaires/commentaires.entity';
  


@Entity()
export class User {
  @OneToMany(() => Package, pkg => pkg.teacher)
packages: Package[];
@OneToMany(() => Texte, texte => texte.student)
textes: Texte[];
@OneToMany(() => Commentaire, commentaire => commentaire.enseignant)
commentaires: Commentaire[];

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nom: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  role: string; // student | teacher
}