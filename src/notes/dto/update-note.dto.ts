import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateNoteDto {

  @ApiProperty({
    description: 'Note finale validee par l enseignant',
    minimum: 0,
    maximum: 20,
    example: 14.5,
  })

  @IsNumber()
  @Min(0)
  @Max(20)
  noteFinale: number;
}