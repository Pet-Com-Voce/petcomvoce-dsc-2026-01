import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentType } from '../../domain/entities/appointment.entity';

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    example: '2026-06-21T10:00:00.000Z',
    description: 'Nova data e hora para o agendamento (ISO 8601)',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dataHora?: Date;

  @ApiPropertyOptional({
    example: 45,
    description: 'Nova duração em minutos',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  duracao?: number;

  @ApiPropertyOptional({
    enum: AppointmentType,
    example: AppointmentType.BANHO_TOSA,
    description: 'Novo tipo do agendamento',
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  tipo?: AppointmentType;

  @ApiPropertyOptional({
    example: 'Atualizado: prefere banho com shampoo hipoalergênico.',
    description: 'Observações atualizadas',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
