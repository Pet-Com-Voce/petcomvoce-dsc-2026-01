import { useState, useEffect, useCallback } from 'react';
import './index.css';
import { checkHealth } from './api';
import { useToast } from './utils';
import { ToastContainer } from './components/Toast';
import { DashboardPage } from './pages/DashboardPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { PetsPage } from './pages/PetsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { ConfirmModal } from './components/Modals';

type Page = 'login' | 'onboarding' | 'dashboard' | 'appointments' | 'pets' | 'employees';

type ApiStatus = 'checking' | 'online' | 'offline';

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard',    icon: '🏠', label: 'Dashboard' },
  { id: 'appointments', icon: '📅', label: 'Agendamentos' },
  { id: 'pets',         icon: '🐾', label: 'Pets' },
  { id: 'employees',    icon: '👥', label: 'Funcionários' },
];

const COMING_SOON = [
  { icon: '👤', label: 'Tutores' },
  { icon: '🩺', label: 'Clínico' },
];

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [showLogout, setShowLogout] = useState(false);
  const [search, setSearch] = useState('');
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking');
  const { toasts, addToast, removeToast } = useToast();

  const pingApi = useCallback(async () => {
    try {
      await checkHealth();
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
    }
  }, []);

  useEffect(() => {
    pingApi();
    const interval = setInterval(pingApi, 30_000);
    return () => clearInterval(interval);
  }, [pingApi]);

  if (page === 'login') {
    return <LoginPage onLogin={() => {
      const hasCompleted = localStorage.getItem('onboarding_completed');
      if (hasCompleted) {
        setPage('dashboard');
      } else {
        setPage('onboarding');
      }
    }} />;
  }
  if (page === 'onboarding') return <OnboardingPage onComplete={() => setPage('dashboard')} />;

  return (
    <div className="app-layout">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🐾</div>
          <div className="sidebar-logo-text">
            Pet Com Você
            <span>Gestão Integrada</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              className={`nav-item ${page === item.id ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
              id={`nav-${item.id}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="nav-section-label" style={{ marginTop: 8 }}>Em Breve</div>
          {COMING_SOON.map(item => (
            <button
              key={item.label}
              className="nav-item"
              disabled
              style={{ opacity: 0.4, cursor: 'not-allowed' }}
            >
              <span className="nav-item-icon">{item.icon}</span>
              {item.label}
              <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 6px', borderRadius: 4 }}>Em breve</span>
            </button>
          ))}

          <div style={{ flex: 1 }} />

          <button
            className="nav-item"
            style={{ color: 'var(--red)', background: 'transparent' }}
            onClick={() => setShowLogout(true)}
          >
            <span className="nav-item-icon">🚪</span>
            Sair
          </button>
        </nav>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="main-area">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <header className="top-header">
          <span className="page-title">
            {NAV_ITEMS.find(i => i.id === page)?.label ?? 'Pet Com Você'}
          </span>
          <div className="header-spacer" />
          <div className="search-bar">
            <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>🔍</span>
            <input
              type="search"
              placeholder="Buscar agendamento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              id="global-search"
            />
          </div>
          <button
            className="header-btn primary"
            onClick={() => setPage('appointments')}
            id="header-new-btn"
          >
            + Novo Agendamento
          </button>
        </header>

        {/* ── Page content ──────────────────────────────────────────────── */}
        <main className="page-content">
          {page === 'dashboard' && <DashboardPage addToast={addToast} />}
          {page === 'appointments' && <AppointmentsPage addToast={addToast} />}
          {page === 'pets' && <PetsPage addToast={addToast} />}
          {page === 'employees' && <EmployeesPage addToast={addToast} />}
        </main>
      </div>

      {/* ── Toasts ──────────────────────────────────────────────────────── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showLogout && (
        <ConfirmModal
          title="Sair do Sistema"
          message="Tem certeza que deseja sair? Você precisará fazer login novamente."
          confirmLabel="Sair"
          danger
          onConfirm={async () => {
            localStorage.removeItem('token');
            setPage('login');
            setShowLogout(false);
          }}
          onClose={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}
