import { useState, useCallback } from 'react';
import type { Toast, ToastType } from './types';

let counter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = String(++counter);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const TIPO_LABELS: Record<string, string> = {
  HOTEL:      '🏨 Hotel',
  CONSULTA:   '🩺 Consulta',
  BANHO_TOSA: '✂️ Banho & Tosa',
  VACINA:     '💉 Vacina',
};

export const STATUS_LABELS: Record<string, string> = {
  PENDENTE:    'Pendente',
  CONFIRMADO:  'Confirmado',
  EM_ANDAMENTO:'Em Andamento',
  CONCLUIDO:   'Concluído',
  CANCELADO:   'Cancelado',
};

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function toLocalDatetimeInput(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
