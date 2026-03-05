import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PraticiensModule } from './domains/praticiens/praticiens.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Rends les variables d'environnement accessibles partout
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME') || 'postgres',
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        // ATTENTION: synchronize doit être 'false' en production !
        // Il crée automatiquement les tables au démarrage selon votre code.
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    PraticiensModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
