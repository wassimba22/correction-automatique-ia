import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Texte } from '../textes/texte.entity';

@Module({
  providers: [UsersService],
  imports: [AuthModule, TypeOrmModule.forFeature([User, Texte])],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
