import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("pets")
export class Pet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'Pet Sem Nome' })
  nome: string;

  @Column({ default: 'Cachorro' })
  especie: string;

  @Column({ default: 'SRD' })
  raca: string;
}
