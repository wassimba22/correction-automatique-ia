import { Controller, Post, Body, Request } from '@nestjs/common';
import { RolesGuard } from 'src/auth/roles.guard';  
import { UseGuards } from '@nestjs/common';  
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PackagesService } from './packages.service';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Post()
  @Roles('teacher')
  create(@Body() body: any, @Request() req) {
    return this.packagesService.create(body, req.user.userId);
  }
}
