import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "./domain/entities/appointment.entity";
import { Budget } from "./domain/entities/budget.entity";
import { AppointmentsController } from "./appointments.controller";
import { CheckinAppointmentUseCase } from "./application/use-cases/checkin-appointment.use-case";
import { FindAppointmentByIdUseCase } from "./application/use-cases/find-appointment-by-id.use-case";
import { ListAppointmentsUseCase } from "./application/use-cases/list-appointments.use-case";
import { UpdateAppointmentUseCase } from "./application/use-cases/update-appointment.use-case";
import { DeleteAppointmentUseCase } from "./application/use-cases/delete-appointment.use-case";
import { CreateAppointmentUseCase } from "./application/use-cases/create-appointment.use-case";

@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Budget])],
  controllers: [AppointmentsController],
  providers: [
    CheckinAppointmentUseCase,
    FindAppointmentByIdUseCase,
    ListAppointmentsUseCase,
    UpdateAppointmentUseCase,
    DeleteAppointmentUseCase,
    CreateAppointmentUseCase,
  ],
})
export class SchedulingModule {}
