import { Module } from '@nestjs/common';
import { TextesService } from './textes.service';
import { TextesController } from './textes.controller';

@Module({
  providers: [TextesService],
  controllers: [TextesController]
})
export class TextesModule {}
