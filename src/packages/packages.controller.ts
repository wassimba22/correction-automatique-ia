import { Controller, Post, Body, Request, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/roles.guard';  
import { UseGuards } from '@nestjs/common';  
import { Roles } from 'src/auth/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PackagesService } from './packages.service';

@Controller('packages')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Packages')
@ApiBearerAuth()
export class PackagesController {
  constructor(private packagesService: PackagesService) {}

  @Post()
  @Roles('teacher')
  @ApiOperation({ summary: 'Creer un package d exercices' })
  @ApiResponse({ status: 201, description: 'Package cree avec succes' })
  create(@Body() body: any, @Request() req) {
    return this.packagesService.create(body, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lister les packages visibles par utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des packages retournee' })
  async findAll(@Request() req) {
    return this.packagesService.findAll(req.user);
  }
}
