import { Controller, Post, UseGuards, Body, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { TextesService } from './textes.service';

@Controller('textes')
@UseGuards(JwtAuthGuard, RolesGuard)

export class TextesController {
  constructor(private readonly textesService: TextesService) {}

  @Roles('student')
  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.textesService.create(body, req.user.userId);
  }
}
