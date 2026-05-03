import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: '*',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  const authService = app.get(AuthService);
  await authService.initSuperAdmin();

  const config = new DocumentBuilder()
    .setTitle('e-Kantin API')
    .setDescription('Backend API Sistem Pemesanan Kantin Sekolah')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.setGlobalPrefix('api');

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);

  console.log(`🚀 e-Kantin running on http://localhost:${PORT}/api`);
  console.log(`📚 Swagger docs at http://localhost:${PORT}/api/docs`);
}

void bootstrap();
