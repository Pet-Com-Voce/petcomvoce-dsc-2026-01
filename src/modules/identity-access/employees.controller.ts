import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './domain/entities/employee.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Employees')
@Controller({ path: 'employees', version: '1' })
export class EmployeesController {
  constructor(
    @InjectRepository(Employee)
    private empRepo: Repository<Employee>,
  ) {}

  @Get()
  async findAll() {
    return this.empRepo.find();
  }

  @Post()
  async create(@Body() body: { nome: string; especialidade: string }) {
    const emp = this.empRepo.create(body);
    return this.empRepo.save(emp);
  }
}
