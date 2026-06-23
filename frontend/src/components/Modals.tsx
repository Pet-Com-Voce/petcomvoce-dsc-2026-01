import { useState, useEffect } from 'react';
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto, Pet, Employee } from '../types';
import { listPets, listEmployees } from '../api';
import { toLocalDatetimeInput } from '../utils';

interface AppointmentModalProps {
  mode: 'create' | 'edit';
  initial?: Appointment;
  onSubmit: (dto: CreateAppointmentDto | UpdateAppointmentDto) => Promise<void>;
  onClose: () => void;
}

const TIPOS = ['HOTEL', 'CONSULTA', 'BANHO_TOSA', 'VACINA'] as const;

export function AppointmentModal({ mode, initial, onSubmit, onClose }: AppointmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [petId, setPetId] = useState(String(initial?.petId ?? ''));
  const [funcionarioId, setFuncionarioId] = useState(String(initial?.funcionarioId ?? ''));
  const [tipo, setTipo] = useState(initial?.tipo ?? 'CONSULTA');
  const [dataHora, setDataHora] = useState(toLocalDatetimeInput(initial?.dataHora));
  const [duracao, setDuracao] = useState(String(initial?.duracao ?? '30'));
  const [observacoes, setObservacoes] = useState(initial?.observacoes ?? '');

  const [pets, setPets] = useState<Pet[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    listPets().then(setPets).catch(console.error);
    listEmployees().then(setEmployees).catch(console.error);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!petId || !funcionarioId || !dataHora || !duracao) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const dto: CreateAppointmentDto = {
        petId: Number(petId),
        funcionarioId: Number(funcionarioId),
        tipo,
        dataHora: new Date(dataHora).toISOString(),
        duracao: Number(duracao),
        ...(observacoes.trim() && { observacoes: observacoes.trim() }),
      };
      await onSubmit(mode === 'edit' ? { ...dto } : dto);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-header">
          <span style={{ fontSize: 20 }}>{mode === 'create' ? '📅' : '✏️'}</span>
          <h2 className="modal-title" id="modal-title">
            {mode === 'create' ? 'Novo Agendamento' : 'Editar Agendamento'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-banner">⚠️ {error}</div>}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="petId">
                  Pet <span className="required">*</span>
                </label>
                <select
                  id="petId"
                  className="form-control"
                  value={petId}
                  onChange={e => setPetId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione um Pet</option>
                  {pets.map(p => (
                    <option key={p.id} value={p.id}>{p.nome} ({p.especie} - {p.raca})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="funcionarioId">
                  Funcionário <span className="required">*</span>
                </label>
                <select
                  id="funcionarioId"
                  className="form-control"
                  value={funcionarioId}
                  onChange={e => setFuncionarioId(e.target.value)}
                  required
                >
                  <option value="" disabled>Selecione um Funcionário</option>
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.nome} ({e.especialidade})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="tipo">
                  Tipo <span className="required">*</span>
                </label>
                <select
                  id="tipo"
                  className="form-control"
                  value={tipo}
                  onChange={e => setTipo(e.target.value as typeof tipo)}
                >
                  {TIPOS.map(t => (
                    <option key={t} value={t}>
                      {{ HOTEL: '🏨 Hotel', CONSULTA: '🩺 Consulta', BANHO_TOSA: '✂️ Banho & Tosa', VACINA: '💉 Vacina' }[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="duracao">
                  Duração (min) <span className="required">*</span>
                </label>
                <input
                  id="duracao"
                  type="number"
                  min={1}
                  className="form-control"
                  placeholder="30"
                  value={duracao}
                  onChange={e => setDuracao(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dataHora">
                Data e Hora <span className="required">*</span>
              </label>
              <input
                id="dataHora"
                type="datetime-local"
                className="form-control"
                value={dataHora}
                onChange={e => setDataHora(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                className="form-control"
                rows={3}
                placeholder="Informações adicionais sobre o atendimento..."
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                style={{ resize: 'vertical', minHeight: 72 }}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-appointment-btn">
              {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Salvando…</> : mode === 'create' ? '✓ Criar' : '✓ Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({ title, message, confirmLabel = 'Confirmar', danger = false, onConfirm, onClose }: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    try { await onConfirm(); onClose(); }
    catch { /* errors handled upstream */ }
    finally { setLoading(false); }
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="confirm-icon">{danger ? '🗑️' : '❓'}</div>
          <p className="confirm-text">{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={handle}
            disabled={loading}
            id="confirm-action-btn"
          >
            {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Aguarde…</> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
