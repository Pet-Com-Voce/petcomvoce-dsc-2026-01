import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("tutors")
export class Tutor {
  @PrimaryGeneratedColumn()
  id: number;
}
