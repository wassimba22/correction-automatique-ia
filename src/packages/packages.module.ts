import { Module } from '@nestjs/common';
import { PackagesService } from './packages.service';
import { PackagesController } from './packages.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Package } from './package.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Package, User])],
  providers: [PackagesService],
  controllers: [PackagesController],
})
export class PackagesModule {}
