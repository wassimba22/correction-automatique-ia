import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsInt, Min } from 'class-validator';

export class CreateSubmissionDto {
  @ApiProperty({ example: 'Texte de l etudiant a corriger' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'd3a4b1a6-1b2f-4a8b-8d71-8d85bc03c2af' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  exerciseId: number;
}
