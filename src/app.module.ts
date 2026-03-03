import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PackagesModule } from './packages/packages.module';
import { ExercicesModule } from './exercices/exercices.module';
import { TextesModule } from './textes/textes.module';
import { User } from './users/entities/user.entity';
import { Package } from './packages/epackage.entity';
import { Exercice } from './exercices/exercice.entity';
import { Texte } from './textes/texte.entity';
import { Correction } from './corrections/correction.entity';
import { Note } from './notes/note.entity';
import { NotesModule } from './notes/notes.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'wassim22',
      database: 'correction_db',
      autoLoadEntities: true, // ← Ajoute cette ligne
      synchronize: true,
      entities: [User, Package, Exercice, Texte, Correction, Note],
    }),
    UsersModule,
    AuthModule,
    PackagesModule,
    ExercicesModule,
    TextesModule,
    NotesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
