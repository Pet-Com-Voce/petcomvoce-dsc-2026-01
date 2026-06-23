import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Employee } from '../types';
import { listEmployees, createEmployee } from '../api';
import { ActionMenu } from '../components/ActionMenu';
import type { ToastType } from '../types';

interface EmployeesPageProps {
  addToast: (msg: string, type?: ToastType) => void;
}

export function EmployeesPage({ addToast }: EmployeesPageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('Veterinário(a)');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEmployees();
      setEmployees(data);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao carregar funcionários', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !especialidade) return;
    try {
      const newEmp = await createEmployee({ nome, especialidade });
      setEmployees(prev => [...prev, newEmp]);
      setShowCreate(false);
      setNome(''); setEspecialidade('Veterinário(a)');
      addToast('Funcionário cadastrado com sucesso!', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erro ao cadastrar', 'error');
    }
  }

  const stats = useMemo(() => ({
    total: employees.length,
    vets: employees.filter(e => e.especialidade === 'Veterinário(a)').length,
    attendants: employees.filter(e => e.especialidade === 'Atendente').length,
    others: employees.filter(e => !['Veterinário(a)', 'Atendente'].includes(e.especialidade)).length,
  }), [employees]);

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-card-header">
            <span className="stat-card-label">Total</span>
            <span className="stat-card-icon">👥</span>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">funcionários ativos</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-card-header">
            <span className="stat-card-label">Veterinários</span>
            <span className="stat-card-icon">🩺</span>
          </div>
          <div className="stat-card-value">{stats.vets}</div>
          <div className="stat-card-sub">especialistas médicos</div>
        </div>
        <div className="stat-card active">
          <div className="stat-card-header">
            <span className="stat-card-label">Atendentes</span>
            <span className="stat-card-icon">🛎️</span>
          </div>
          <div className="stat-card-value">{stats.attendants}</div>
          <div className="stat-card-sub">recepção e apoio</div>
        </div>
        <div className="stat-card done">
          <div className="stat-card-header">
            <span className="stat-card-label">Outros</span>
            <span className="stat-card-icon">💼</span>
          </div>
          <div className="stat-card-value">{stats.others}</div>
          <div className="stat-card-sub">banho, tosa, gerência</div>
        </div>
      </div>

      <div className="panel" style={{ minHeight: 400 }}>
        <div className="panel-header">
          <span className="panel-title">Gerenciamento de Funcionários</span>
          <div className="filter-tabs"></div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ marginLeft: 8, padding: '0 14px', height: 32, fontSize: 12 }}>+ Novo</button>
          <button className="btn btn-ghost" onClick={load} title="Recarregar" style={{ padding: '0 10px', height: 32, fontSize: 16 }}>🔄</button>
        </div>

      {loading ? (
        <div style={{ padding: 20 }}>Carregando...</div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">👥</div>
          <div className="empty-state-title">Nenhum funcionário cadastrado</div>
          <div className="empty-state-desc">Clique em "+ Novo Funcionário" para começar.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Especialidade</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id}>
                  <td className="td-muted">#{e.id}</td>
                  <td style={{ fontWeight: 600 }}>{e.nome}</td>
                  <td><span className="badge CONFIRMADO">{e.especialidade}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu
                      id={e.id}
                      onEdit={() => addToast('Edição em breve', 'info')}
                      onDelete={() => addToast('Remoção em breve', 'info')}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>

      {showCreate && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowCreate(false); }}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Novo Funcionário</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome Completo</label>
                  <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Especialidade</label>
                  <select className="form-control" value={especialidade} onChange={e => setEspecialidade(e.target.value)} required>
                    <option value="Veterinário(a)">Veterinário(a)</option>
                    <option value="Atendente">Atendente</option>
                    <option value="Banhista/Tosador">Banhista/Tosador</option>
                    <option value="Gerente">Gerente</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
