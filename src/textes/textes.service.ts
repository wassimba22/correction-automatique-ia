import { Injectable } from '@nestjs/common';

@Injectable()
export class TextesService {
  constructor(
    private readonly userRepository: any,
    private readonly exerciceRepository: any,
    private readonly texteRepository: any,
  ) {}

  async create(data: any, studentId: string) {

  const student = await this.userRepository.findOne({
    where: { id: studentId },
  });

  const exercice = await this.exerciceRepository.findOne({
    where: { id: data.exerciceId },
  });

  const texte = this.texteRepository.create({
    contenuOriginal: data.contenuOriginal,
    student,
    exercice,
  });

  return this.texteRepository.save(texte);
}
}
