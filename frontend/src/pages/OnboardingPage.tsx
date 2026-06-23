import { useState } from 'react';
import '../mobile.css';

const STEPS = [
  {
    id: 'gestao',
    title: 'Gestão Inteligente',
    description: 'Controle total sobre sua clínica em uma única plataforma integrada.',
    icon: '📊',
    elements: ['📈', '💡']
  },
  {
    id: 'equipe',
    title: 'Equipe Sincronizada',
    description: 'Comunicação fluida e gestão de turnos para todos os funcionários.',
    icon: '👥',
    elements: ['📅', '✨']
  },
  {
    id: 'pets',
    title: 'Prontuários e Pets',
    description: 'Acesse o histórico completo de cada pet em segundos, de qualquer lugar.',
    icon: '🐾',
    elements: ['✔️', '☁️']
  }
];

export function OnboardingPage({ onComplete }: { onComplete: () => void }) {
  const [stepIndex, setStepIndex] = useState(0);

  const step = STEPS[stepIndex];

  const finishOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  return (
    <div className="mobile-screen-container onboarding-container">
      {/* Decorative Glow */}
      <div className="glow glow-center"></div>

      <main className="mobile-main onboarding-main">
        {/* Illustration Canvas */}
        <div className="illustration-canvas">
          <div className="glass-card-mock">
            <div className="mock-header">
              <div className="mock-icon">{step.icon}</div>
              <div className="mock-lines">
                <div className="mock-line short"></div>
                <div className="mock-line long"></div>
              </div>
            </div>
            <div className="mock-body">
              <div className="mock-item"><span className="mock-item-icon">💉</span><div className="mock-line full"></div></div>
              <div className="mock-item"><span className="mock-item-icon">🩺</span><div className="mock-line med"></div></div>
              <div className="mock-item"><span className="mock-item-icon">💊</span><div className="mock-line long"></div></div>
            </div>
          </div>
          
          {/* Floating elements */}
          <div className="floating-el float-1">{step.elements[0]}</div>
          <div className="floating-el float-2">{step.elements[1]}</div>
        </div>

        {/* Content Area */}
        <div className="onboarding-content">
          <h1 className="onboarding-title">{step.title}</h1>
          <p className="onboarding-desc">{step.description}</p>

          <div className="progress-dots">
            {STEPS.map((s, i) => (
              <div key={s.id} className={`dot ${i === stepIndex ? 'active' : ''}`}></div>
            ))}
          </div>

          <div className="onboarding-actions">
            <button className="btn-skip" onClick={finishOnboarding}>Pular</button>
            <button className="btn-next" onClick={handleNext}>
              Próximo <span className="icon-right">➔</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
