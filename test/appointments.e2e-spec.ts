import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '../src/common/interceptors/response.interceptor';

/**
 * E2E test suite for the Appointments resource.
 *
 * These tests require a running PostgreSQL database. Use docker-compose
 * to spin up the DB before running:
 *
 *   docker-compose up db -d
 *   npm run test:e2e
 */
describe('AppointmentsController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Mirror the same global configuration from main.ts
    app.enableVersioning({ type: VersioningType.URI });
    app.setGlobalPrefix('api', { exclude: ['/health'] });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ─── Health check ──────────────────────────────────────────────────────────
  describe('GET /health', () => {
    it('should return status ok', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('timestamp');
    });
  });

  // ─── POST /api/v1/appointments ────────────────────────────────────────────
  describe('POST /api/v1/appointments', () => {
    it('should return 400 when body is empty', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when petId is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .send({
          funcionarioId: 1,
          tipo: 'CONSULTA',
          dataHora: new Date(Date.now() + 86400000).toISOString(),
          duracao: 30,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when tipo is invalid enum value', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .send({
          petId: 1,
          funcionarioId: 1,
          tipo: 'INVALID_TYPE',
          dataHora: new Date(Date.now() + 86400000).toISOString(),
          duracao: 30,
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when extra unexpected fields are sent (whitelist)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/appointments')
        .send({
          petId: 1,
          funcionarioId: 1,
          tipo: 'CONSULTA',
          dataHora: new Date(Date.now() + 86400000).toISOString(),
          duracao: 30,
          unexpectedField: 'should_be_rejected',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ─── GET /api/v1/appointments ─────────────────────────────────────────────
  describe('GET /api/v1/appointments', () => {
    it('should return a standard response envelope', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/appointments')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
      expect(response.body.meta).toHaveProperty('timestamp');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  // ─── GET /api/v1/appointments/:id ────────────────────────────────────────
  describe('GET /api/v1/appointments/:id', () => {
    it('should return 404 for a non-existent appointment', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/appointments/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should return 400 when id is not a valid integer', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/appointments/not-a-number')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ─── PATCH /api/v1/appointments/:id/status ───────────────────────────────
  describe('PATCH /api/v1/appointments/:id/status (check-in)', () => {
    it('should return 404 for a non-existent appointment', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/appointments/999999/status')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  // ─── DELETE /api/v1/appointments/:id ─────────────────────────────────────
  describe('DELETE /api/v1/appointments/:id', () => {
    it('should return 404 for a non-existent appointment', async () => {
      const response = await request(app.getHttpServer())
        .delete('/api/v1/appointments/999999')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
