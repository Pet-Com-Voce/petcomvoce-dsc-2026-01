import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Employee } from "./domain/entities/employee.entity";
import { Company } from "./domain/entities/company.entity";
import { Pet } from "./domain/entities/pet.entity";
import { Tutor } from "./domain/entities/tutor.entity";
import { PetsController } from "./pets.controller";
import { EmployeesController } from "./employees.controller";
import { CompaniesController } from "./companies.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Tutor, Pet, Employee, Company])],
  controllers: [PetsController, EmployeesController, CompaniesController]
})
export class IdentityAccessModule {}
