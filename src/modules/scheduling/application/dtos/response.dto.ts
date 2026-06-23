import { ApiProperty } from '@nestjs/swagger';
import {
  AppointmentStatus,
  AppointmentType,
} from '../../domain/entities/appointment.entity';

export class AppointmentResponseDto {
  @ApiProperty({ example: 1, description: 'ID único do agendamento' })
  id: number;

  @ApiProperty({
    example: '2026-06-20T14:00:00.000Z',
    description: 'Data e hora do agendamento',
  })
  dataHora: Date;

  @ApiProperty({
    example: 30,
    description: 'Duração em minutos',
  })
  duracao: number;

  @ApiProperty({
    enum: AppointmentType,
    example: AppointmentType.CONSULTA,
    description: 'Tipo do agendamento',
  })
  tipo: AppointmentType;

  @ApiProperty({
    enum: AppointmentStatus,
    example: AppointmentStatus.PENDENTE,
    description: 'Status atual do agendamento',
  })
  status: AppointmentStatus;

  @ApiProperty({ example: 1, description: 'ID do pet' })
  petId: number;

  @ApiProperty({ example: 1, description: 'ID do funcionário' })
  funcionarioId: number;

  @ApiProperty({
    example: 'Pet com histórico de ansiedade.',
    nullable: true,
    description: 'Observações sobre o atendimento',
  })
  observacoes: string | null;

  @ApiProperty({ example: '2026-06-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-15T10:00:00.000Z' })
  updatedAt: Date;
}
