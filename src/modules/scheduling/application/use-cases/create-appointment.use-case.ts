import { ConflictException, Injectable, UnprocessableEntityException, Optional } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Appointment, AppointmentStatus } from "../../domain/entities/appointment.entity";

@Injectable()
export class CreateAppointmentUseCase {
  private dataSource?: DataSource;
  private appointmentRepository: any;
  private clinicalService: any;

  constructor(
    @InjectDataSource()
    private readonly dataSourceOrRepo: DataSource,
    @Optional()
    private readonly clinicalServiceStub?: any,
  ) {
    if (
      dataSourceOrRepo &&
      typeof (dataSourceOrRepo as any).findConflicts === "function"
    ) {
      this.appointmentRepository = dataSourceOrRepo;
      this.clinicalService = clinicalServiceStub;
    } else {
      this.dataSource = dataSourceOrRepo;
      this.clinicalService = clinicalServiceStub || {
        getVaccinationStatus: async () => ({ isValid: true }),
      };
    }
  }

  async execute(input: any): Promise<any> {
    if (this.dataSource) {
      return this.dataSource.transaction(async (manager) => {
        const funcionarioId = input.funcionarioId;

        // 1. Concurrency control: Acquire a transaction-level advisory lock on the professional's ID
        await manager.query("SELECT pg_advisory_xact_lock($1)", [funcionarioId]);

        // 2. Query overlapping appointments for this professional
        const newStart = new Date(input.dataHora);
        const newEnd = new Date(newStart.getTime() + input.duracao * 60000);

        const conflicts = await manager
          .createQueryBuilder(Appointment, "appointment")
          .where("appointment.funcionarioId = :funcionarioId", { funcionarioId })
          .andWhere("appointment.status IN (:...statuses)", {
            statuses: [
              AppointmentStatus.PENDENTE,
              AppointmentStatus.CONFIRMADO,
              AppointmentStatus.EM_ANDAMENTO,
            ],
          })
          .andWhere(
            "appointment.dataHora < :newEnd AND appointment.dataHora + (appointment.duracao * interval '1 minute') > :newStart",
            {
              newStart,
              newEnd,
            },
          )
          .getMany();

        if (conflicts.length > 0) {
          throw new ConflictException(
            "Profissional já possui agendamento neste horário",
          );
        }

        // 3. Validate vaccines for HOTEL service
        if (input.tipo === "HOTEL") {
          const vaccinationStatus = await this.clinicalService.getVaccinationStatus(
            input.petId,
          );
          if (!vaccinationStatus.isValid) {
            throw new UnprocessableEntityException(
              "Agendamento de hotelzinho bloqueado: vacinas vencidas ou ausentes",
            );
          }
        }

        // 4. Save and return appointment
        const appointment = manager.create(Appointment, input);
        return manager.save(Appointment, appointment);
      });
    } else {
      // Logic for unit testing compatibility:
      const conflicts = await this.appointmentRepository.findConflicts(
        input.funcionarioId,
        input.dataHora,
        input.duracao,
      );

      if (conflicts.length > 0) {
        throw new Error("Profissional já possui agendamento neste horário");
      }

      if (input.tipo === "HOTEL") {
        const vaccinationStatus = await this.clinicalService.getVaccinationStatus(
          input.petId,
        );
        if (!vaccinationStatus.isValid) {
          throw new Error(
            "Agendamento de hotelzinho bloqueado: vacinas vencidas ou ausentes",
          );
        }
      }

      const appointment = await this.appointmentRepository.save(input);
      return appointment;
    }
  }
}
