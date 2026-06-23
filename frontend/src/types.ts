// ─── API Types ────────────────────────────────────────────────────────────────

export type AppointmentType = 'HOTEL' | 'CONSULTA' | 'BANHO_TOSA' | 'VACINA';
export type AppointmentStatus =
  | 'PENDENTE'
  | 'CONFIRMADO'
  | 'EM_ANDAMENTO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export interface Appointment {
  id: number;
  dataHora: string;
  duracao: number;
  tipo: AppointmentType;
  status: AppointmentStatus;
  petId: number;
  funcionarioId: number;
  observacoes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDto {
  petId: number;
  funcionarioId: number;
  tipo: AppointmentType;
  dataHora: string;
  duracao: number;
  observacoes?: string;
}

export interface UpdateAppointmentDto {
  dataHora?: string;
  duracao?: number;
  tipo?: AppointmentType;
  observacoes?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: { timestamp: string };
}

export interface ApiError {
  error: string;
  message: string | string[];
  statusCode: number;
}

export interface Pet {
  id: number;
  nome: string;
  especie: string;
  raca: string;
}

export interface Employee {
  id: number;
  nome: string;
  especialidade: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
