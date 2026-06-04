// Louann V1 — Wizard shell with sidebar progression

const { TopNav, Check } = window;

function WizardShell({ step }) {
  const { state } = LouannStore.useWizard();
  const isAuto = state.presetMode === 'auto';
  const allSteps = [
    { n: 1, name: "Type d'étude", icon: '①' },
    { n: 2, name: "Où & quand", icon: '②' },
    { n: 3, name: "Secteur & cible", icon: '③' },
    { n: 4, name: "Préset visuel", icon: '④' },
    { n: 5, name: "KPI à afficher", icon: '⑤' },
    { n: 6, name: "Récap & génération", icon: '⑥' },
  ];
  // En mode auto : on n'affiche que "Où & quand" + "Récap"
  const steps = isAuto
    ? [
        { n: 2, name: "Où & quand", icon: '①' },
        { n: 6, name: "Récap & génération", icon: '②' },
      ]
    : allSteps.slice(0, 5);

  const completedSet = new Set(state.completedSteps || []);
  const total = steps.length;
  const currentIdx = Math.max(0, steps.findIndex((s) => s.n === step)) + 1;

  const Step1 = window.Step1;
  const Step2 = window.Step2;
  const Step3 = window.Step3;
  const Step4 = window.Step4;
  const Step5 = window.Step5;
  const Step6 = window.Step6;

  const subtypeLabel = state.subtypeDisplayName || state.studySubtypeCode;
  const companyLabel = state.companyDisplayName || state.clientName;

  return (
    <div className="fade-in">
      <TopNav variant="wizard" />
      {isAuto && (
        <div style={{ padding: '8px 24px', background: 'var(--surface-2)', borderBottom: '1px solid var(--ink-5)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
          <a
            href="/app/studies/new"
            target="_top"
            style={{ color: 'var(--ink-3)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            ← Changer le type
          </a>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          {subtypeLabel && <span>📊 <strong>{subtypeLabel}</strong></span>}
          {companyLabel && (
            <>
              <span style={{ color: 'var(--ink-4)' }}>·</span>
              <span>🏢 <strong>{companyLabel}</strong></span>
            </>
          )}
        </div>
      )}
      <div className="wizard">
        <aside className="wizard-sidebar">
          <div>
            <div className="row between center" style={{ marginBottom: 12 }}>
              <span className="t-eyebrow">Progression</span>
              <span className="wizard-counter">{currentIdx} / {total}</span>
            </div>
            <div className="wizard-progress-bar">
              <div style={{ width: `${(currentIdx / total) * 100}%` }}></div>
            </div>
          </div>

          <div className="wizard-steps">
            {steps.map(s => {
              const isActive = s.n === step;
              const isDone = completedSet.has(s.n) && !isActive;
              return (
                <div
                  key={s.n}
                  className={`wstep ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                  onClick={() => LouannStore.go(`/wizard/${s.n}`)}
                >
                  <span className="wstep-ico">
                    {isDone ? <Check s={16} /> : s.n}
                  </span>
                  <span>{s.name}</span>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px dashed var(--border-2)' }}>
            <div className="t-caption" style={{ fontSize: 11, marginBottom: 6 }}>
              💾 Sauvegarde automatique
            </div>
            <div className="t-caption" style={{ fontSize: 11 }}>
              localStorage · vos réponses persistent
            </div>
          </div>
        </aside>

        <main className="wizard-main" style={{ position: 'relative' }}>
          <div className="wizard-content">
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            {step === 4 && <Step4 />}
            {step === 5 && <Step5 />}
            {step === 6 && Step6 && <Step6 />}
          </div>
        </main>
      </div>
    </div>
  );
}

window.WizardShell = WizardShell;
