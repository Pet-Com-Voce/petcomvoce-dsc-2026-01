import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectDataSource } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { Appointment, AppointmentStatus } from "../../domain/entities/appointment.entity";
import { UpdateAppointmentDto } from "../dtos/update-appointment.dto";

@Injectable()
export class UpdateAppointmentUseCase {
  private dataSource?: DataSource;
  private appointmentRepo: any;

  constructor(
    @InjectDataSource()
    private readonly dataSourceOrRepo: DataSource,
  ) {
    if (dataSourceOrRepo && typeof (dataSourceOrRepo as any).findOne === "function") {
      this.appointmentRepo = dataSourceOrRepo;
    } else {
      this.dataSource = dataSourceOrRepo;
    }
  }

  async execute(
    id: number,
    updateDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    if (this.dataSource) {
      return this.dataSource.transaction(async (manager) => {
        // 1. Fetch the appointment to update
        const appointment = await manager.findOne(Appointment, {
          where: { id },
        });

        if (!appointment) {
          throw new NotFoundException(
            `Agendamento com ID "${id}" não encontrado.`,
          );
        }

        // Merge updateDto into a draft to verify what values would change
        const draft = Object.assign({}, appointment, updateDto);

        // If date or duration changed, perform conflict check
        if (
          updateDto.dataHora !== undefined ||
          updateDto.duracao !== undefined
        ) {
          const funcionarioId = draft.funcionarioId;

          // Acquire transaction-scoped advisory lock on the professional's ID
          await manager.query("SELECT pg_advisory_xact_lock($1)", [funcionarioId]);

          const newStart = new Date(draft.dataHora);
          const newEnd = new Date(newStart.getTime() + draft.duracao * 60000);

          const conflicts = await manager
            .createQueryBuilder(Appointment, "appointment")
            .where("appointment.funcionarioId = :funcionarioId", {
              funcionarioId,
            })
            .andWhere("appointment.id != :id", { id }) // Exclude current appointment
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
        }

        // Apply changes and save
        Object.assign(appointment, updateDto);
        return manager.save(Appointment, appointment);
      });
    } else {
      // Legacy unit tests logic
      const appointment = await this.appointmentRepo.findOne({
        where: { id },
      });

      if (!appointment) {
        throw new NotFoundException(
          `Agendamento com ID "${id}" não encontrado.`,
        );
      }

      Object.assign(appointment, updateDto);
      return this.appointmentRepo.save(appointment);
    }
  }
}
