import { useState, useEffect } from 'react';
import '../mobile.css';
import { login, register, listCompanies } from '../api';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nome, setNome] = useState('');
  const [companyId, setCompanyId] = useState<number | ''>('');
  const [companies, setCompanies] = useState<{id: number, name: string}[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isRegistering) {
      listCompanies().then(data => setCompanies(data || [])).catch(console.error);
    }
  }, [isRegistering]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await register({ nome, email, password, company_id: companyId || undefined });
      } else {
        await login({ email, password });
      }
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Erro ao autenticar');
    }
  };

  return (
    <div className="mobile-screen-container">
      {/* Decorative Glows */}
      <div className="glow glow-top-left"></div>
      <div className="glow glow-bottom-right"></div>

      <main className="mobile-main">
        {/* Logo Area */}
        <div className="login-logo-area">
          <div className="login-logo-icon">
            <span className="icon">🐾</span>
          </div>
          <h1 className="login-title">Pet Com Você</h1>
          <p className="login-subtitle">Gestão Profissional para Clínicas Veterinárias</p>
        </div>

        {/* Login Form Panel */}
        <div className="glass-panel">
          {error && <div style={{ color: 'var(--red)', marginBottom: '16px', fontSize: '13px', textAlign: 'center' }}>{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            {isRegistering && (
              <>
                <div className="form-group-mobile">
                  <label>Nome Completo</label>
                  <div className="input-with-icon">
                    <span className="icon-left">👤</span>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group-mobile">
                  <label>Clínica</label>
                  <div className="input-with-icon">
                    <span className="icon-left">🏥</span>
                    <select
                      className="form-control"
                      value={companyId}
                      onChange={e => setCompanyId(Number(e.target.value) || '')}
                      style={{ paddingLeft: '40px', backgroundColor: 'var(--bg-surface)', border: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-primary)', width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', appearance: 'none' }}
                      required
                    >
                      <option value="" disabled>Selecione uma clínica</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}
            <div className="form-group-mobile">
              <label>E-mail Corporativo</label>
              <div className="input-with-icon">
                <span className="icon-left">✉️</span>
                <input
                  type="email"
                  placeholder="contato@clinica.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="form-group-mobile">
              <label>Senha</label>
              <div className="input-with-icon">
                <span className="icon-left">🔒</span>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {!isRegistering && (
              <div className="forgot-password">
                <button type="button">Esqueci minha senha</button>
              </div>
            )}

            <button type="submit" className="login-btn" style={{ marginTop: isRegistering ? '16px' : '0' }}>
              {isRegistering ? 'Criar Conta' : 'Entrar'} <span className="icon-right">➔</span>
            </button>
          </form>

          <div className="login-footer">
            <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
              {isRegistering ? 'Já tenho uma conta' : 'Solicitar acesso para minha clínica'}
            </button>
          </div>
        </div>
      </main>

      <footer className="mobile-footer-text">
        Pet Com Você v2.4.1 • Ambiente Seguro
      </footer>
    </div>
  );
}
