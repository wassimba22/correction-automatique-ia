import { Injectable } from '@nestjs/common';

@Injectable()
export class ExercicesService {
    constructor(
        private packageRepository: any,
        private exerciceRepository: any,
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
}
