import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Texte } from '../textes/texte.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Texte)
    private texteRepository: Repository<Texte>,
  ) {}

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async create(userData: Partial<User>) {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }
  async getHistorique(studentId: string) {

  const textes = await this.texteRepository.find({
    where: { student: { id: studentId } },
    relations: ['exercice', 'note'],
    order: { dateSoumission: 'DESC' },
  });

  return textes;
}
}