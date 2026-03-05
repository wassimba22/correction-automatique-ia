import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PackagesModule } from './packages/packages.module';
import { ExercicesModule } from './exercices/exercices.module';
import { TextesModule } from './textes/textes.module';
import { NotesModule } from './notes/notes.module';
import { CorrectionsModule } from './corrections/corrections.module';
import { CommentairesModule } from './commentaires/commentaires.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { User } from './users/user.entity';
import { Package } from './packages/package.entity';
import { Exercice } from './exercices/exercice.entity';
import { Texte } from './textes/texte.entity';
import { Correction } from './corrections/correction.entity';
import { Note } from './notes/note.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'wassim22',
      database: 'correction_db',
      autoLoadEntities: true,
      synchronize: true,
      entities: [User, Package, Exercice, Texte, Correction, Note],
    }),
    UsersModule,
    AuthModule,
    PackagesModule,
    ExercicesModule,
    TextesModule,
    NotesModule,
    CorrectionsModule,
    CommentairesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
