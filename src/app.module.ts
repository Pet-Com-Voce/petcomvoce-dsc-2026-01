import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { Employee } from './modules/identity-access/domain/entities/employee.entity';
import { Company } from './modules/identity-access/domain/entities/company.entity';
import { Pet } from './modules/identity-access/domain/entities/pet.entity';
import { Tutor } from './modules/identity-access/domain/entities/tutor.entity';
import {
  MedicalRecord,
  MedicalRecordSupply,
} from './modules/clinical/domain/entities/medical-record.entity';
import { VaccinationRecord } from './modules/clinical/domain/entities/vaccination-record.entity';
import { Appointment } from './modules/scheduling/domain/entities/appointment.entity';
import { Budget } from './modules/scheduling/domain/entities/budget.entity';
import { IdentityAccessModule } from './modules/identity-access/identity-access.module';
import { ClinicalModule } from './modules/clinical/clinical.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './common/controllers/health.controller';

@Module({
  imports: [
    // ─── Config (env vars global) ──────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ─── Rate limiting ────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute window
        limit: 100, // max 100 requests per IP per minute
      },
    ]),

    // ─── Database ─────────────────────────────────────────────────────────
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        Tutor,
        Pet,
        Company,
        Employee,
        MedicalRecord,
        MedicalRecordSupply,
        VaccinationRecord,
        Appointment,
        Budget,
      ],
      synchronize: process.env.NODE_ENV !== 'production',
    }),

    // ─── Feature modules ──────────────────────────────────────────────────
    IdentityAccessModule,
    ClinicalModule,
    SchedulingModule,
    AuthModule,
  ],
  controllers: [HealthController],
  providers: [
    // Global rate-limit guard applied to all routes
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
