import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Inscrire un nouvel utilisateur' })
  @ApiResponse({ status: 201, description: 'Utilisateur cree avec succes' })
  register(@Body() body: any) {
    return this.authService.register(
      body.nom,
      body.email,
      body.password,
      body.role,
    );
  }

  @Post('login')
  @ApiOperation({ summary: 'Authentifier un utilisateur' })
  @ApiResponse({ status: 200, description: 'Jeton JWT retourne' })
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}