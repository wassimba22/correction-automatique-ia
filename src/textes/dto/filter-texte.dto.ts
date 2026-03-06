import { IsOptional, IsNumber, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterTexteDto {

  @ApiPropertyOptional({
    description: 'Filtrer par statut du texte',
    example: 'corrige',
  })

  @IsOptional()
  @IsString()
  statut?: string;

  @ApiPropertyOptional({
    description: 'Filtrer par validation de note',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  validee?: boolean;

  @ApiPropertyOptional({
    description: 'Note minimale',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minNote?: number;

  @ApiPropertyOptional({
    description: 'Note maximale',
    example: 18,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxNote?: number;

  @ApiPropertyOptional({
    description: 'Champ de tri',
    example: 'dateSoumission',
  })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Ordre de tri',
    enum: ['ASC', 'DESC'],
    example: 'DESC',
  })
  @IsOptional()
  @IsString()
  order?: 'ASC' | 'DESC';

}