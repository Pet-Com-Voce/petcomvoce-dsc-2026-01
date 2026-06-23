import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Employee } from "../../../identity-access/domain/entities/employee.entity";
import { Pet } from "../../../identity-access/domain/entities/pet.entity";

export enum AppointmentType {
  HOTEL = "HOTEL",
  CONSULTA = "CONSULTA",
  BANHO_TOSA = "BANHO_TOSA",
  VACINA = "VACINA",
}

export enum AppointmentStatus {
  PENDENTE = "PENDENTE",
  CONFIRMADO = "CONFIRMADO",
  EM_ANDAMENTO = "EM_ANDAMENTO",
  CANCELADO = "CANCELADO",
  CONCLUIDO = "CONCLUIDO",
}

@Entity("appointments")
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "timestamptz" })
  dataHora: Date;

  @Column({ type: "int" })
  duracao: number;

  @Column({ type: "enum", enum: AppointmentType })
  tipo: AppointmentType;

  @Column({
    type: "enum",
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDENTE,
  })
  status: AppointmentStatus;

  @ManyToOne(() => Pet)
  pet: Pet;

  @Column({ type: "int" })
  petId: number;

  @ManyToOne(() => Employee)
  funcionario: Employee;

  @Column({ type: "int" })
  funcionarioId: number;

  @Column({ type: "text", nullable: true })
  observacoes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;
}
