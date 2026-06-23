import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Appointment } from "../../domain/entities/appointment.entity";

@Injectable()
export class ListAppointmentsUseCase {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
  ) {}

  async execute(): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      relations: ["pet", "funcionario"],
      order: { dataHora: "DESC" },
    });
  }
}
