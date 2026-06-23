import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '../types';
import {
  listAppointments,
  createAppointment,
  updateAppointment,
  checkinAppointment,
  deleteAppointment,
} from '../api';
import { formatDate, formatDuration } from '../utils';
import { ActionMenu, StatusBadge, TypeChip } from '../components/ActionMenu';
import { AppointmentModal, ConfirmModal } from '../components/Modals';
import type { ToastType } from '../types';

const STATUS_FILTERS = ['Todos', 'PENDENTE', 'CONFIRMADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO'] as const;
const PAGE_SIZE = 8;

interface AppointmentsPageProps {
  addToast: (msg: string, type?: ToastType) => void;
}

export function AppointmentsPage({ addToast }: AppointmentsPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [page, setPage] = useState(1);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<Appointment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null);
  const [checkinTarget, setCheckinTarget] = useState<Appointment | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listAppointments();
      setAppointments(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ─── Filtered + paginated ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchStatus = statusFilter === 'Todos' || a.status === statusFilter;
      const matchSearch = !search ||
        String(a.id).includes(search) ||
        String(a.petId).includes(search) ||
        String(a.funcionarioId).includes(search) ||
        a.tipo.toLowerCase().includes(search.toLowerCase()) ||
        (a.observacoes ?? '').toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [appointments, statusFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page on filter change
  useEffect(() => setPage(1), [statusFilter, search]);

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      appointments.length,
    pending:    appointments.filter(a => a.status === 'PENDENTE').length,
    active:     appointments.filter(a => a.status === 'EM_ANDAMENTO').length,
    done:       appointments.filter(a => a.status === 'CONCLUIDO').length,
    confirmed:  appointments.filter(a => a.status === 'CONFIRMADO').length,
    cancelled:  appointments.filter(a => a.status === 'CANCELADO').length,
  }), [appointments]);

  // ─── Actions ───────────────────────────────────────────────────────────────
  async function handleCreate(dto: CreateAppointmentDto | UpdateAppointmentDto) {
    const result = await createAppointment(dto as CreateAppointmentDto);
    setAppointments(prev => [result, ...prev]);
    addToast('Agendamento criado com sucesso!', 'success');
  }

  async function handleEdit(dto: CreateAppointmentDto | UpdateAppointmentDto) {
    if (!editTarget) return;
    const result = await updateAppointment(editTarget.id, dto as UpdateAppointmentDto);
    setAppointments(prev => prev.map(a => a.id === result.id ? result : a));
    addToast('Agendamento atualizado!', 'success');
  }

  async function handleCheckin() {
    if (!checkinTarget) return;
    try {
      const result = await checkinAppointment(checkinTarget.id);
      setAppointments(prev => prev.map(a => a.id === result.id ? result : a));
      addToast('Check-in realizado — status: Em Andamento', 'success');
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro no check-in', 'error');
      throw e;
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAppointment(deleteTarget.id);
      setAppointments(prev => prev.filter(a => a.id !== deleteTarget.id));
      addToast('Agendamento removido.', 'info');
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao remover', 'error');
      throw e;
    }
  }

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-card-header">
            <span className="stat-card-label">Total</span>
            <span className="stat-card-icon">📋</span>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">agendamentos cadastrados</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-card-header">
            <span className="stat-card-label">Pendentes</span>
            <span className="stat-card-icon">🕐</span>
          </div>
          <div className="stat-card-value">{stats.pending}</div>
          <div className="stat-card-sub">aguardando confirmação</div>
        </div>
        <div className="stat-card active">
          <div className="stat-card-header">
            <span className="stat-card-label">Em Andamento</span>
            <span className="stat-card-icon">⚡</span>
          </div>
          <div className="stat-card-value">{stats.active}</div>
          <div className="stat-card-sub">atendimentos ativos</div>
        </div>
        <div className="stat-card done">
          <div className="stat-card-header">
            <span className="stat-card-label">Concluídos</span>
            <span className="stat-card-icon">✅</span>
          </div>
          <div className="stat-card-value">{stats.done}</div>
          <div className="stat-card-sub">atendimentos finalizados</div>
        </div>
      </div>

      {/* ── Table panel ───────────────────────────────────────────────────── */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Agendamentos</span>
          <div className="filter-tabs">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                className={`filter-tab ${statusFilter === f ? 'active' : ''}`}
                onClick={() => setStatusFilter(f)}
                id={`filter-${f}`}
              >
                {f === 'Todos' ? 'Todos' : f === 'PENDENTE' ? 'Pendentes' : f === 'CONFIRMADO' ? 'Confirmados'
                  : f === 'EM_ANDAMENTO' ? 'Em Andamento' : f === 'CONCLUIDO' ? 'Concluídos' : 'Cancelados'}
                {f !== 'Todos' && (
                  <span style={{ marginLeft: 4, color: 'var(--text-muted)', fontSize: 10 }}>
                    ({appointments.filter(a => a.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            id="new-appointment-btn"
            onClick={() => setShowCreate(true)}
            style={{ marginLeft: 8, padding: '0 14px', height: 32, fontSize: 12 }}
          >
            + Novo
          </button>
          <button
            className="btn btn-ghost"
            onClick={load}
            title="Recarregar"
            style={{ padding: '0 10px', height: 32, fontSize: 16 }}
          >
            🔄
          </button>
        </div>

        {error && (
          <div style={{ padding: '12px 20px' }}>
            <div className="error-banner">⚠️ {error} — <span style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={load}>Tentar novamente</span></div>
          </div>
        )}

        {loading ? (
          <div className="loading-overlay"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🐾</div>
            <div className="empty-state-title">Nenhum agendamento encontrado</div>
            <div className="empty-state-desc">
              {search || statusFilter !== 'Todos'
                ? 'Tente ajustar os filtros ou a busca.'
                : 'Clique em "+ Novo" para criar o primeiro agendamento.'}
            </div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Pet</th>
                  <th>Funcionário</th>
                  <th>Data &amp; Hora</th>
                  <th>Duração</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(a => (
                  <tr key={a.id}>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 12 }}>#{a.id}</td>
                    <td><TypeChip tipo={a.tipo} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🐾</span>
                        <span>Pet #{a.petId}</span>
                      </div>
                    </td>
                    <td className="td-muted">Func. #{a.funcionarioId}</td>
                    <td>{formatDate(a.dataHora)}</td>
                    <td className="td-muted">{formatDuration(a.duracao)}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td>
                      <ActionMenu
                        id={a.id}
                        appointment={a}
                        onCheckin={() => setCheckinTarget(a)}
                        onEdit={() => setEditTarget(a)}
                        onDelete={() => setDeleteTarget(a)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="pagination">
            <span>
              Mostrando {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1} title="Primeira">«</button>
              <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Anterior">‹</button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return p <= totalPages ? (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                ) : null;
              })}
              <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Próxima">›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Última">»</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showCreate && (
        <AppointmentModal mode="create" onSubmit={handleCreate} onClose={() => setShowCreate(false)} />
      )}
      {editTarget && (
        <AppointmentModal mode="edit" initial={editTarget} onSubmit={handleEdit} onClose={() => setEditTarget(null)} />
      )}
      {checkinTarget && (
        <ConfirmModal
          title="Realizar Check-in"
          message={`Confirmar check-in do agendamento #${checkinTarget.id}? O status será alterado para "Em Andamento". O orçamento deve estar aprovado.`}
          confirmLabel="✅ Confirmar Check-in"
          onConfirm={handleCheckin}
          onClose={() => setCheckinTarget(null)}
        />
      )}
      {deleteTarget && (
        <ConfirmModal
          title="Remover Agendamento"
          message={`Tem certeza que deseja remover o agendamento #${deleteTarget.id}? Esta ação não pode ser desfeita.`}
          confirmLabel="🗑️ Remover"
          danger
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
