import { Controller, UseGuards, Get, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

interface AuthUser {
  userId: string;
  role: string;
}

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: { user: AuthUser }) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @Get('admin-only')
  adminRoute() {
    return 'Accessible seulement aux enseignants';
  }
  @Get(':id/historique')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('teacher')
async historique(@Param('id') id: string) {
  return this.usersService.getHistorique(id);
}
}
