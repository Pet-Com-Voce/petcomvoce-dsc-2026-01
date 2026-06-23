import { useState, useEffect } from 'react';
import { checkHealth } from '../api';
import type { ToastType } from '../types';

interface DashboardPageProps {
  addToast: (msg: string, type?: ToastType) => void;
}

interface HealthData {
  status: string;
  timestamp: string;
  version: string;
  environment: string;
}

export function DashboardPage({ addToast }: DashboardPageProps) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    checkHealth()
      .then(data => setHealth(data as HealthData))
      .catch(() => setHealth(null))
      .finally(() => setHealthLoading(false));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ── Welcome banner ────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,212,170,0.12) 0%, rgba(139,92,246,0.12) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: 32, top: '50%', transform: 'translateY(-50%)',
          fontSize: 80, opacity: 0.12, pointerEvents: 'none', userSelect: 'none',
        }}>🐾</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>
          Bem-vindo ao Pet Com Você 🐾
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.6 }}>
          Sistema integrado de gestão para pet shops e clínicas veterinárias.
          Acesse os módulos pelo menu lateral.
        </p>
      </div>

      {/* ── Module cards ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {[
          { icon: '📅', label: 'Agendamentos', desc: 'Gerencie consultas, banho & tosa, hotel e vacinas', color: 'var(--teal)', bg: 'var(--teal-dim)' },
          { icon: '🐾', label: 'Pets', desc: 'Cadastro e histórico dos animais atendidos', color: 'var(--purple)', bg: 'var(--purple-dim)' },
          { icon: '👤', label: 'Tutores', desc: 'Clientes e responsáveis pelos pets', color: 'var(--blue)', bg: 'var(--blue-dim)' },
          { icon: '🩺', label: 'Clínico', desc: 'Prontuários médicos e vacinas', color: 'var(--green)', bg: 'var(--green-dim)' },
          { icon: '👥', label: 'Funcionários', desc: 'Equipe de veterinários e atendentes', color: 'var(--amber)', bg: 'var(--amber-dim)' },
          { icon: '📊', label: 'Relatórios', desc: 'Análises e métricas de desempenho', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
        ].map(m => (
          <div key={m.label} className="panel" style={{ padding: 20, cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-sm)',
              background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, marginBottom: 12,
            }}>{m.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{m.desc}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
