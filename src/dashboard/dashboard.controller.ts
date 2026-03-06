import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('dashboard')
@ApiTags('Dashboard')
@ApiBearerAuth()
export class DashboardController {

  constructor(private dashboardService: DashboardService) {}

  @Get('statistiques')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Recuperer les statistiques enseignant' })
  @ApiResponse({ status: 200, description: 'Statistiques retournees' })
  async statistiques() {
    return this.dashboardService.getStatistiques();
  }
}