import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Texte } from '../textes/texte.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Texte])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
