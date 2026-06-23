import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CheckinAppointmentUseCase } from './application/use-cases/checkin-appointment.use-case';
import { FindAppointmentByIdUseCase } from './application/use-cases/find-appointment-by-id.use-case';
import { ListAppointmentsUseCase } from './application/use-cases/list-appointments.use-case';
import { UpdateAppointmentUseCase } from './application/use-cases/update-appointment.use-case';
import { DeleteAppointmentUseCase } from './application/use-cases/delete-appointment.use-case';
import { CreateAppointmentUseCase } from './application/use-cases/create-appointment.use-case';
import { UpdateAppointmentDto } from './application/dtos/update-appointment.dto';
import { CreateAppointmentDto } from './application/dtos/create.dto';
import { AppointmentResponseDto } from './application/dtos/response.dto';

@ApiTags('appointments')
@Controller({ path: 'appointments', version: '1' })
export class AppointmentsController {
  constructor(
    private readonly checkinUseCase: CheckinAppointmentUseCase,
    private readonly findByIdUseCase: FindAppointmentByIdUseCase,
    private readonly listUseCase: ListAppointmentsUseCase,
    private readonly updateUseCase: UpdateAppointmentUseCase,
    private readonly deleteUseCase: DeleteAppointmentUseCase,
    private readonly createUseCase: CreateAppointmentUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar novo agendamento' })
  @ApiBody({ type: CreateAppointmentDto })
  @ApiResponse({
    status: 201,
    description: 'Agendamento criado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito de horário para o profissional',
  })
  @ApiResponse({
    status: 422,
    description: 'Regra de negócio violada (ex: vacinas vencidas para hotelzinho)',
  })
  create(@Body() createDto: CreateAppointmentDto) {
    return this.createUseCase.execute(createDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Listar todos os agendamentos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de agendamentos retornada com sucesso',
    type: [AppointmentResponseDto],
  })
  findAll() {
    return this.listUseCase.execute();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID do agendamento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Agendamento encontrado',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findByIdUseCase.execute(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Realizar check-in no agendamento',
    description:
      'Transiciona o agendamento para EM_ANDAMENTO. Requer orçamento aprovado (RN02).',
  })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID do agendamento', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Check-in realizado — status alterado para EM_ANDAMENTO',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Status atual não permite check-in',
  })
  @ApiResponse({
    status: 422,
    description: 'Orçamento não aprovado',
  })
  checkin(@Param('id', ParseIntPipe) id: number) {
    return this.checkinUseCase.execute(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar dados do agendamento' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID do agendamento', example: 1 })
  @ApiBody({ type: UpdateAppointmentDto })
  @ApiResponse({
    status: 200,
    description: 'Agendamento atualizado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  @ApiResponse({ status: 409, description: 'Conflito de horário' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateAppointmentDto,
  ) {
    return this.updateUseCase.execute(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover agendamento (soft delete)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID do agendamento', example: 1 })
  @ApiResponse({
    status: 204,
    description: 'Agendamento removido com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Agendamento não encontrado' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.deleteUseCase.execute(id);
  }
}
