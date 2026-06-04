// Louann V1 — Shared components

const { useState, useEffect, useRef, useMemo, useCallback } = React;

window.openStudyWizard = function openStudyWizard() {
  const path = '/app/studies/new';
  try {
    window.parent.postMessage({ type: 'stella:navigate', path }, window.location.origin);
  } catch (e) {}
  setTimeout(() => {
    window.parent.location.href = path;
  }, 30);
};

// ====== BRAND / LOGO ======
function Brand({ size = 22 }) {
  return (
    <span className="brand" style={{ fontSize: size }}>
      louann
      <span className="brand-dot" style={{ width: size / 3, height: size / 3 }}></span>
    </span>
  );
}

// ====== TOP NAV ======
function TopNav({ variant = 'landing' }) {
  return (
    <nav className="topnav">
      <div className="container topnav-inner">
        <a onClick={() => LouannStore.go('/')} style={{ cursor: 'pointer' }}>
          <Brand />
        </a>
        {variant === 'landing' && (
          <div className="topnav-menu">
            <span className="lnk">Produit</span>
            <span className="lnk" onClick={() => LouannStore.go('/example')}>Exemple</span>
            <span className="lnk">Tarifs</span>
            <button className="btn btn-primary btn-sm" onClick={window.openStudyWizard}>
              Commencer
              <Arrow />
            </button>
          </div>
        )}
        {variant === 'wizard' && (
          <div className="topnav-menu">
            <span className="lnk" style={{ color: 'var(--ink-3)', fontSize: 12 }}>Sauvegarde automatique</span>
            <button className="btn btn-text btn-sm" onClick={() => {
              if (confirm('Quitter le wizard ? Vos réponses sont sauvegardées.')) LouannStore.go('/');
            }}>Quitter ✕</button>
          </div>
        )}
        {variant === 'result' && (
          <div className="topnav-menu">
            <button className="btn btn-text btn-sm" onClick={() => LouannStore.go('/wizard/1')}>
              ← Retour au wizard
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ====== ICONS (SVG inline) ======
const Arrow = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowLeft = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Check = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M3 7l3 3 5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Spark = ({ s = 16 }) => (
  <svg width={s} height={s} viewBox="0 0 16 16" fill="none">
    <path d="M8 1v4M8 11v4M1 8h4M11 8h4M3.5 3.5l2.5 2.5M10 10l2.5 2.5M3.5 12.5L6 10M10 6l2.5-2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);
const Pin = ({ s = 14 }) => (
  <svg width={s} height={s} viewBox="0 0 14 14" fill="none">
    <path d="M7 1c-2.8 0-5 2.2-5 5 0 3.5 5 7 5 7s5-3.5 5-7c0-2.8-2.2-5-5-5z M7 6.5a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const Lock = ({ s = 12 }) => (
  <svg width={s} height={s} viewBox="0 0 12 12" fill="none">
    <rect x="2" y="5.5" width="8" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    <path d="M4 5.5V4a2 2 0 014 0v1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);
const Sparkle = ({ s = 18 }) => (
  <svg width={s} height={s} viewBox="0 0 18 18" fill="none">
    <path d="M9 1l1.7 5.3L16 8l-5.3 1.7L9 15l-1.7-5.3L2 8l5.3-1.7L9 1z" fill="currentColor" />
  </svg>
);

// ====== FOOTER ======
function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© 2026 Ouicare</span>
        <div className="footer-links">
          <a href="#">CGU</a>
          <a href="#">Mentions légales</a>
          <a href="mailto:louann.duclos@ouicare.com">louann.duclos@ouicare.com</a>
        </div>
      </div>
    </footer>
  );
}

// ====== SLIDE THUMBNAIL ======
function SlideThumb({ kind = 'cover', palette = '#E63946', label }) {
  const color = palette;
  const renderBody = () => {
    switch (kind) {
      case 'cover':
        return (
          <>
            <div className="slide-bar lg" style={{ width: '75%' }}></div>
            <div className="slide-bar accent" style={{ background: color, width: 30 }}></div>
            <div className="slide-bar med" style={{ width: '55%' }}></div>
            <div className="slide-blk" style={{ flex: 1 }}></div>
          </>
        );
      case 'demo':
        return (
          <>
            <div className="slide-bar lg" style={{ width: '60%' }}></div>
            <div className="slide-bar accent" style={{ background: color, width: 24 }}></div>
            <div className="slide-chart">
              {[40, 65, 55, 80, 70, 90].map((h, i) =>
                <div key={i} className="col" style={{ height: `${h}%`, background: `linear-gradient(to top, ${color} 0%, ${color}50 100%)` }}></div>
              )}
            </div>
          </>
        );
      case 'swot':
        return (
          <>
            <div className="slide-bar lg" style={{ width: '50%' }}></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, flex: 1 }}>
              <div style={{ background: 'var(--surface-3)', borderRadius: 4 }}></div>
              <div style={{ background: 'var(--surface-3)', borderRadius: 4 }}></div>
              <div style={{ background: 'var(--surface-3)', borderRadius: 4 }}></div>
              <div style={{ background: 'var(--surface-3)', borderRadius: 4 }}></div>
            </div>
          </>
        );
      case 'verdict':
        return (
          <>
            <div className="slide-bar lg" style={{ width: '70%' }}></div>
            <div className="slide-bar accent" style={{ background: color, width: 40 }}></div>
            <div className="slide-bar med" style={{ width: '85%' }}></div>
            <div className="slide-bar med" style={{ width: '70%' }}></div>
            <div className="slide-bar med" style={{ width: '60%' }}></div>
          </>
        );
      default:
        return (
          <>
            <div className="slide-bar lg" style={{ width: '55%' }}></div>
            <div className="slide-bar accent" style={{ background: color }}></div>
            <div className="slide-bar med" style={{ width: '80%' }}></div>
            <div className="slide-blk" style={{ flex: 1 }}></div>
          </>
        );
    }
  };
  return (
    <div className="thumb-slide">
      {label && <span className="label">{label}</span>}
      {renderBody()}
    </div>
  );
}

// ====== CHECK / RADIO ======
function CheckBox({ checked, onChange }) {
  return (
    <span
      className={`checkbox ${checked ? 'on' : ''}`}
      onClick={(e) => { e.stopPropagation(); onChange && onChange(!checked); }}
    />
  );
}
function Radio({ checked }) {
  return <span className={`radio ${checked ? 'on' : ''}`}></span>;
}

// ====== OPT CARD ======
function OptCard({ on, onClick, title, desc, reco, multi = false }) {
  return (
    <div className={`opt-card ${on ? 'on' : ''}`} onClick={onClick}>
      {multi ? <CheckBox checked={on} /> : <Radio checked={on} />}
      <div className="opt-body">
        <div className="opt-title">
          {title}
          {reco && <span className="reco-tag">Recommandé</span>}
        </div>
        {desc && <div className="opt-desc">{desc}</div>}
      </div>
    </div>
  );
}

// ====== SECTION SCAFFOLD ======
function Section({ eyebrow, title, sub, children, className = '' }) {
  return (
    <section className={`section ${className}`}>
      <div className="container">
        {(eyebrow || title) && (
          <div className="section-head">
            {eyebrow && <div className="section-eyebrow">{eyebrow}</div>}
            {title && <h2>{title}</h2>}
            {sub && <p className="section-sub">{sub}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// ====== STEP HEAD (wizard) ======
function StepHead({ n, total = 6, title, sub }) {
  return (
    <div className="step-head fade-in">
      <div className="step-eyebrow">Étape {n} / {total}</div>
      <h2>{title}</h2>
      {sub && <p className="sub">{sub}</p>}
    </div>
  );
}

// ====== WIZARD NAV FOOTER ======
function WizardNav({ step, total = 5, onNext, nextLabel = 'Continuer', nextDisabled = false }) {
  const prev = () => step > 1 && LouannStore.go(`/wizard/${step - 1}`);
  return (
    <div className="wizard-nav">
      <div>
        {step > 1 && (
          <button className="btn btn-ghost" onClick={prev}>
            <ArrowLeft /> Retour
          </button>
        )}
      </div>
      <div className="row center gap-3">
        <span className="t-caption mono">{step} / {total}</span>
        <button
          className="btn btn-primary btn-lg"
          onClick={onNext}
          disabled={nextDisabled}
          aria-disabled={nextDisabled}
        >
          {nextLabel}
          <Arrow />
        </button>
      </div>
    </div>
  );
}

// ====== USE LOCAL STORAGE LISTENER for reveal-on-scroll ======
function useRevealOnScroll(deps = []) {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, deps);
}

// ====== EXPORT GLOBAL ======
Object.assign(window, {
  Brand, TopNav, Footer,
  Arrow, ArrowLeft, Check, Spark, Pin, Lock, Sparkle,
  SlideThumb, CheckBox, Radio, OptCard,
  Section, StepHead, WizardNav,
  useRevealOnScroll
});
