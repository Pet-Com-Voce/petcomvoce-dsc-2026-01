import { Controller, Get, Post, Body } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pet } from './domain/entities/pet.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Pets')
@Controller({ path: 'pets', version: '1' })
export class PetsController {
  constructor(
    @InjectRepository(Pet)
    private petRepo: Repository<Pet>,
  ) {}

  @Get()
  async findAll() {
    return this.petRepo.find();
  }

  @Post()
  async create(@Body() body: { nome: string; especie: string; raca: string }) {
    const pet = this.petRepo.create(body);
    return this.petRepo.save(pet);
  }
}
