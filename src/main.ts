import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ─── Security ─────────────────────────────────────────────────────────────
  app.use(helmet());

  // ─── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // ─── Versioning ───────────────────────────────────────────────────────────
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // ─── Global prefix ────────────────────────────────────────────────────────
  app.setGlobalPrefix('api', { exclude: ['/health'] });

  // ─── Global pipes ─────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ─── Global filters ───────────────────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── Global interceptors ──────────────────────────────────────────────────
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ─── Swagger / OpenAPI ────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Pet Com Você API')
    .setDescription(
      `API de gestão integrada para pet shops e clínicas veterinárias.\n\n` +
        `**Módulos disponíveis:**\n` +
        `- 🐾 **Agendamentos** — Criação, consulta, check-in e cancelamento de atendimentos\n` +
        `- 🏥 **Clínico** — Prontuários médicos e registro de vacinas\n` +
        `- 🔑 **Identidade & Acesso** — Tutores, pets e funcionários\n\n` +
        `Todos os endpoints retornam respostas padronizadas no formato \`{ data, meta }\`.`,
    )
    .setVersion('1.0')
    .setContact('Pet Com Você', '', 'contato@petcomvoce.com.br')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Desenvolvimento local')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'Pet Com Você — API Docs',
  });

  // ─── Start ────────────────────────────────────────────────────────────────
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\n🐾  Pet Com Você API rodando em: http://localhost:${port}`);
  console.log(`📚  Documentação Swagger:         http://localhost:${port}/api/docs`);
  console.log(`💚  Health check:                 http://localhost:${port}/health\n`);
}

bootstrap();
