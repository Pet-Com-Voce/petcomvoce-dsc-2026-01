import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto, ApiResponse } from './types';

// In development: VITE_API_URL is empty → requests go through Vite proxy (no CORS).
// In production: set VITE_API_URL=https://api.petcomvoce.com.br in your build env.
const BASE_URL = import.meta.env.VITE_API_URL ?? '';
const API = `${BASE_URL}/api/v1`;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = { 'Content-Type': 'application/json', ...options?.headers };
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    const msg = Array.isArray(body.message) ? body.message.join(', ') : body.message;
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export async function login(dto: any): Promise<any> {
  const res = await request<ApiResponse<any>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (res.data?.access_token) {
    localStorage.setItem('token', res.data.access_token);
  }
  return res.data;
}

export async function register(dto: any): Promise<any> {
  const res = await request<ApiResponse<any>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  if (res.data?.access_token) {
    localStorage.setItem('token', res.data.access_token);
  }
  return res.data;
}

// ─── Health ───────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch(`${BASE_URL}/health`);
  const body = await res.json();
  return body.data ?? body;
}

// ─── Appointments ─────────────────────────────────────────────────────────────
export async function listAppointments(): Promise<Appointment[]> {
  const res = await request<ApiResponse<Appointment[]>>('/appointments');
  return res.data;
}

export async function getAppointment(id: number): Promise<Appointment> {
  const res = await request<ApiResponse<Appointment>>(`/appointments/${id}`);
  return res.data;
}

export async function createAppointment(dto: CreateAppointmentDto): Promise<Appointment> {
  const res = await request<ApiResponse<Appointment>>('/appointments', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function updateAppointment(id: number, dto: UpdateAppointmentDto): Promise<Appointment> {
  const res = await request<ApiResponse<Appointment>>(`/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(dto),
  });
  return res.data;
}

export async function checkinAppointment(id: number): Promise<Appointment> {
  const res = await request<ApiResponse<Appointment>>(`/appointments/${id}/status`, {
    method: 'PATCH',
  });
  return res.data;
}

export async function deleteAppointment(id: number): Promise<void> {
  await request<void>(`/appointments/${id}`, { method: 'DELETE' });
}

// ─── Pets ─────────────────────────────────────────────────────────────────────
export async function listPets(): Promise<import('./types').Pet[]> {
  const res = await request<ApiResponse<import('./types').Pet[]>>('/pets');
  return res.data;
}

export async function createPet(dto: Omit<import('./types').Pet, 'id'>): Promise<import('./types').Pet> {
  const res = await request<ApiResponse<import('./types').Pet>>('/pets', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

// ─── Employees ────────────────────────────────────────────────────────────────
export async function listEmployees(): Promise<import('./types').Employee[]> {
  const res = await request<ApiResponse<import('./types').Employee[]>>('/employees');
  return res.data;
}

export async function createEmployee(dto: Omit<import('./types').Employee, 'id'>): Promise<import('./types').Employee> {
  const res = await request<ApiResponse<import('./types').Employee>>('/employees', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return res.data;
}

// ─── Companies ────────────────────────────────────────────────────────────────
export async function listCompanies(): Promise<{id: number, name: string}[]> {
  const res = await request<ApiResponse<{id: number, name: string}[]>>('/companies');
  // Handle case where controller returns the array directly vs {data: ...}
  return Array.isArray(res) ? res : res.data;
}
