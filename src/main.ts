import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './app.config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);

  const adress = configService.get<AppConfig['APP_ADDRESS']>('APP_ADDRESS')!;
  const port = configService.get<AppConfig['APP_PORT']>('APP_PORT');

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('User Segmentation API')
    .setDescription('API for managing user segments and experiments')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'User Segmentation API Documentation',
  });

  const allowedHeaders = configService.get<AppConfig['CORS_ALLOWED_HEADERS']>(
    'CORS_ALLOWED_HEADERS',
  );
  const credentials =
    configService.get<AppConfig['CORS_CREDENTIALS']>('CORS_CREDENTIALS');
  const methods = configService.get<AppConfig['CORS_METHODS']>('CORS_METHODS');
  const originString =
    configService.get<AppConfig['CORS_ORIGIN']>('CORS_ORIGIN');

  const origins = originString
    ? originString.split(',').map((o) => o.trim())
    : [];

  app.enableCors({
    origin: origins,
    credentials,
    allowedHeaders,
    methods,
  });

  await app.listen(port, adress);
}
bootstrap();
