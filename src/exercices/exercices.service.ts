import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from '../packages/package.entity';
import { Exercice } from './exercice.entity';
import { Texte } from '../textes/texte.entity';

@Injectable()
export class ExercicesService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Exercice)
    private exerciceRepository: Repository<Exercice>,
    @InjectRepository(Texte)
    private texteRepository: Repository<Texte>,
  ) {}

  async create(data: any) {
    const packageId = Number(data.packageId);
    const pkg = await this.packageRepository.findOne({
      where: { id: packageId },
    });

    if (!pkg) {
      throw new Error('Package introuvable');
    }

    const exercice = this.exerciceRepository.create({
      consigne: data.consigne,
      type: data.type,
      dateLimite: data.dateLimite,
      package: pkg,
    });

    return this.exerciceRepository.save(exercice);
  }

  async findExercices(packageId: string) {
    const parsedPackageId = Number(packageId);
    return this.exerciceRepository.find({
      where: { package: { id: parsedPackageId } },
    });
  }

  async findTextesByExercice(
    exerciceId: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const parsedExerciceId = Number(exerciceId);
    const [data, total] = await this.texteRepository.findAndCount({
      where: { exercice: { id: parsedExerciceId } },
      relations: ['student', 'note'],
      order: { dateSoumission: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }
}
