import { Controller, Param, Patch, UseGuards, Body, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotesService } from './notes.service';

@Controller('notes')
@ApiTags('Notes')
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Patch(':texteId/valider')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('teacher')
  @ApiOperation({ summary: 'Valider une note proposee par IA' })
  @ApiResponse({ status: 200, description: 'Note validee avec succes' })
  async valider(
    @Param('texteId') texteId: string,
    @Body() dto: UpdateNoteDto,
    @Request() req: any,
  ) {
    return this.notesService.validerNote(texteId, dto.noteFinale, req.user);
  }
}
