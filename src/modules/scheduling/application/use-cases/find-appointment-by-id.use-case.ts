import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment } from "../../domain/entities/appointment.entity";

@Injectable()
export class FindAppointmentByIdUseCase {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async execute(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: ["pet", "funcionario"],
    });

    if (!appointment) {
      throw new NotFoundException(
        `Agendamento com ID "${id}" não encontrado.`,
      );
    }

    return appointment;
  }
}
