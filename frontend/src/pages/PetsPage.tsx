import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Pet } from '../types';
import { listPets, createPet } from '../api';
import { ActionMenu } from '../components/ActionMenu';
import type { ToastType } from '../types';

interface PetsPageProps {
  addToast: (msg: string, type?: ToastType) => void;
}

export function PetsPage({ addToast }: PetsPageProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState('Cachorro');
  const [raca, setRaca] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPets();
      setPets(data);
    } catch (e: unknown) {
      addToast(e instanceof Error ? e.message : 'Erro ao carregar pets', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!nome || !especie || !raca) return;
    try {
      const newPet = await createPet({ nome, especie, raca });
      setPets(prev => [...prev, newPet]);
      setShowCreate(false);
      setNome(''); setEspecie('Cachorro'); setRaca('');
      addToast('Pet cadastrado com sucesso!', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Erro ao cadastrar', 'error');
    }
  }

  const stats = useMemo(() => ({
    total: pets.length,
    dogs: pets.filter(p => p.especie === 'Cachorro').length,
    cats: pets.filter(p => p.especie === 'Gato').length,
    others: pets.filter(p => !['Cachorro', 'Gato'].includes(p.especie)).length,
  }), [pets]);

  return (
    <>
      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-card-header">
            <span className="stat-card-label">Total</span>
            <span className="stat-card-icon">🐾</span>
          </div>
          <div className="stat-card-value">{stats.total}</div>
          <div className="stat-card-sub">pets cadastrados</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-card-header">
            <span className="stat-card-label">Cachorros</span>
            <span className="stat-card-icon">🐶</span>
          </div>
          <div className="stat-card-value">{stats.dogs}</div>
          <div className="stat-card-sub">registrados</div>
        </div>
        <div className="stat-card active">
          <div className="stat-card-header">
            <span className="stat-card-label">Gatos</span>
            <span className="stat-card-icon">🐱</span>
          </div>
          <div className="stat-card-value">{stats.cats}</div>
          <div className="stat-card-sub">registrados</div>
        </div>
        <div className="stat-card done">
          <div className="stat-card-header">
            <span className="stat-card-label">Outros</span>
            <span className="stat-card-icon">🦜</span>
          </div>
          <div className="stat-card-value">{stats.others}</div>
          <div className="stat-card-sub">diversos</div>
        </div>
      </div>

      <div className="panel" style={{ minHeight: 400 }}>
        <div className="panel-header">
          <span className="panel-title">Gerenciamento de Pets</span>
          <div className="filter-tabs"></div>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ marginLeft: 8, padding: '0 14px', height: 32, fontSize: 12 }}>+ Novo</button>
          <button className="btn btn-ghost" onClick={load} title="Recarregar" style={{ padding: '0 10px', height: 32, fontSize: 16 }}>🔄</button>
        </div>

      {loading ? (
        <div style={{ padding: 20 }}>Carregando...</div>
      ) : pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🐾</div>
          <div className="empty-state-title">Nenhum pet cadastrado</div>
          <div className="empty-state-desc">Clique em "+ Novo Pet" para começar.</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nome</th>
                <th>Espécie</th>
                <th>Raça</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {pets.map(p => (
                <tr key={p.id}>
                  <td className="td-muted">#{p.id}</td>
                  <td style={{ fontWeight: 600 }}>{p.nome}</td>
                  <td>{p.especie}</td>
                  <td>{p.raca}</td>
                  <td style={{ textAlign: 'right' }}>
                    <ActionMenu
                      id={p.id}
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
              <h2 className="modal-title">Novo Pet</h2>
              <button className="modal-close" onClick={() => setShowCreate(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Espécie</label>
                  <select className="form-control" value={especie} onChange={e => setEspecie(e.target.value)} required>
                    <option value="Cachorro">Cachorro</option>
                    <option value="Gato">Gato</option>
                    <option value="Pássaro">Pássaro</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Raça</label>
                  <input className="form-control" value={raca} onChange={e => setRaca(e.target.value)} required />
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
