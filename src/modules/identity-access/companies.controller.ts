import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './domain/entities/company.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Companies')
@Controller({ path: 'companies', version: '1' })
export class CompaniesController {
  constructor(
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  @Get()
  async findAll() {
    return this.companyRepo.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.companyRepo.findOne({ where: { id: Number(id) } });
  }

  @Post()
  async create(@Body() body: { name: string; document?: string }) {
    const company = this.companyRepo.create(body);
    return this.companyRepo.save(company);
  }
}
