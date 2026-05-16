import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app/app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const port = Number(process.env.PORT ?? 3000);
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:4200';

  app.use(helmet());
  app.enableCors({ origin: corsOrigin, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );
  app.setGlobalPrefix('api', { exclude: ['health'] });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Anime Gamify API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swaggerConfig));

  await app.listen(port);
  Logger.log(`Backend ready on http://localhost:${port}/api`, 'Bootstrap');
}

void bootstrap();
