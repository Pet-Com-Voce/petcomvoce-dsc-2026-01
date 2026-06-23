import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AppointmentType } from '../../domain/entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    example: 1,
    description: 'ID do pet a ser atendido',
  })
  @IsInt()
  @Min(1)
  petId: number;

  @ApiProperty({
    example: 1,
    description: 'ID do funcionário responsável pelo atendimento',
  })
  @IsInt()
  @Min(1)
  funcionarioId: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTA,
    description: 'Tipo do agendamento',
  })
  @IsEnum(AppointmentType)
  tipo: AppointmentType;

  @ApiProperty({
    example: '2026-06-20T14:00:00.000Z',
    description: 'Data e hora do agendamento (ISO 8601)',
  })
  @Type(() => Date)
  @IsDate()
  dataHora: Date;

  @ApiProperty({
    example: 30,
    description: 'Duração do atendimento em minutos',
  })
  @IsInt()
  @Min(1)
  duracao: number;

  @ApiPropertyOptional({
    example: 'Pet com histórico de ansiedade. Usar abordagem calma.',
    description: 'Observações adicionais para o atendimento',
  })
  @IsOptional()
  @IsString()
  observacoes?: string;
}
