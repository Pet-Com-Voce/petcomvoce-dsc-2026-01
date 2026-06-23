import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Employee } from '../identity-access/domain/entities/employee.entity';
import { Company } from '../identity-access/domain/entities/company.entity';
import { RegisterDto, LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.employeeRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    let company: Company | undefined;
    if (dto.company_id) {
      company = await this.companyRepo.findOne({ where: { id: dto.company_id } }) || undefined;
    }

    const employee = this.employeeRepo.create({
      nome: dto.nome,
      especialidade: dto.especialidade || 'Veterinário',
      email: dto.email,
      password: hashedPassword,
      company: company,
    });

    await this.employeeRepo.save(employee);
    const payload = { sub: employee.id, email: employee.email, companyId: company?.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: employee.id, email: employee.email, nome: employee.nome, company: company }
    };
  }

  async login(dto: LoginDto) {
    const employee = await this.employeeRepo.findOne({
      where: { email: dto.email },
      relations: ['company'],
    });
    if (!employee || !employee.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(dto.password, employee.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: employee.id, email: employee.email, companyId: employee.company?.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { id: employee.id, email: employee.email, nome: employee.nome, company: employee.company }
    };
  }
}
