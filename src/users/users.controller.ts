import { Controller, UseGuards, Get, Request, Param } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

interface AuthUser {
  userId: string;
  role: string;
}

@Controller('users')
@ApiTags('Users')
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Recuperer le profil utilisateur connecte' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur retourne' })
  getProfile(@Request() req: { user: AuthUser }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('admin-only')
  @ApiOperation({ summary: 'Route reservee aux enseignants' })
  @ApiResponse({ status: 200, description: 'Acces autorise' })
  adminRoute() {
    return 'Accessible seulement aux enseignants';
  }

  @Get(':id/historique')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Consulter l historique d un eleve' })
  @ApiResponse({ status: 200, description: 'Historique des textes retourne' })
  async historique(@Param('id') id: string) {
    return this.usersService.getHistorique(id);
  }
}
