import { Injectable } from '@nestjs/common';

@Injectable()
export class ExercicesService {
    constructor(
        private packageRepository: any,
        private exerciceRepository: any,
        private texteRepository: any,
    ) {}

    async create(data: any) {
  const pkg = await this.packageRepository.findOne({
    where: { id: data.packageId },
  });

  const exercice = this.exerciceRepository.create({
    consigne: data.consigne,
    type: data.type,
    dateLimite: data.dateLimite,
    package: pkg,
  });

  return this.exerciceRepository.save(exercice);
}
async findExercices(packageId: string) {
  return this.exerciceRepository.find({
    where: { package: { id: packageId } },
  });
}

async findTextesByExercice(
  exerciceId: string,
  page: number = 1,
  limit: number = 10,
) {

  const [data, total] = await this.texteRepository.findAndCount({
    where: { exercice: { id: exerciceId } },
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
