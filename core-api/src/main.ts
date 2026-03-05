import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Active validation automatique via class-validator et class-transformer
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Élimine les champs inconnus envoyés dans le JSON
    forbidNonWhitelisted: true, // Rejette la requête s'il y a des champs inconnus
    transform: true, // Transforme auto les payloads (ex: string "1" devient le nombre 1)
  }));

  // Configuration Swagger
  const config = new DocumentBuilder()
    .setTitle('Medaltea API')
    .setDescription("Documentation de l'API Core de Medaltea (Praticiens, Rendez-vous, etc.)")
    .setVersion('1.0')
    .addBearerAuth() // Pour la future connexion JWT
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // La documentation sera générée sur http://localhost:3000/api
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
