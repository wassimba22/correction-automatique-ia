import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Package } from './package.entity';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  async create(data: any, teacherId: string) {
    const teacher = await this.usersRepository.findOne({
      where: { id: teacherId },
    });

    const pkg = this.packageRepository.create({
      ...data,
      teacher,
    });

    return this.packageRepository.save(pkg);
  }

  async findAll(user: any) {
    const teacherId = user?.userId ?? user?.id;

    if (user?.role === 'teacher' && teacherId) {
      return this.packageRepository.find({
        where: { teacher: { id: teacherId } },
        relations: ['teacher'],
      });
    }

    return this.packageRepository.find({
      relations: ['teacher'],
    });
  }
}
