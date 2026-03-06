import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentaireDto {

  @ApiProperty({
    description: 'Contenu du commentaire enseignant',
    example: 'Pense a mieux structurer ton introduction.',
  })

  @IsNotEmpty()
  contenu: string;
}