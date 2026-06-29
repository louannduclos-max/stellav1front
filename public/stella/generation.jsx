// Louann V1 — Generation transition page
// 5 frames animées · auto-progression vers /result

const { useState, useEffect } = React;
const { TopNav, Arrow, Check } = window;

function Generation() {
  const { state } = LouannStore.useWizard();
  const [phase, setPhase] = useState(0); // 0=submit, 1=implosion, 2=data, 3=assembly, 4=reveal
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  const studyId = state.currentStudyId || null;

  // Auto-progression — boucle entre phase 1..3 tant qu'on n'a pas reçu 'completed'
  useEffect(() => {
    let mounted = true;
    const seq = [1, 2, 3]; // boucle visuelle pendant l'attente
    let i = 0;
    setPhase(1);
    const interval = setInterval(() => {
      if (!mounted) return;
      i = (i + 1) % seq.length;
      setPhase(seq[i]);
    }, 2200);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // Progress bar — asymptote vers 95% tant que pas terminé
  useEffect(() => {
    let raf;
    const start = Date.now();
    const total = 5 * 60 * 1000; // 5 min cible visuelle
    const tick = () => {
      const elapsed = Date.now() - start;
      // courbe qui plafonne à ~95% pour laisser place au vrai 100% côté status
      const pct = 1 - Math.exp(-elapsed / total);
      setProgress(Math.min(pct * 100, 95));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Polling statut réel
  useEffect(() => {
    if (!studyId) {
      setErrorMsg('Aucune étude en cours. Retour au wizard.');
      const t = setTimeout(() => LouannStore.go('/'), 2500);
      return () => clearTimeout(t);
    }
    function readToken() {
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (!k || !k.startsWith('sb-') || !k.endsWith('-auth-token')) continue;
          const raw = localStorage.getItem(k);
          if (!raw) continue;
          const parsed = JSON.parse(raw);
          if (parsed && parsed.access_token) return parsed.access_token;
        }
      } catch (_) {}
      return null;
    }
    const SB_URL = (window.__SUPABASE_URL__) || 'https://utwjfsomblhupghbgvgv.supabase.co';
    const SB_KEY = (window.__SUPABASE_ANON__) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0d2pmc29tYmxodXBnaGJndmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTUzMTUsImV4cCI6MjA5NzY5MTMxNX0.iN1N8d5GjsUzrIWHkBXWqAn1DpZO-wbhH3nI-8UHBv4';
    const token = readToken();
    if (!token) {
      setErrorMsg('Session expirée. Reconnexion nécessaire.');
      const t = setTimeout(() => { if (window.top) window.top.location.href = '/login'; }, 1500);
      return () => clearTimeout(t);
    }
    let cancelled = false;
    let timer = null;
    const poll = async () => {
      try {
        const r = await fetch(
          `${SB_URL}/rest/v1/studies?id=eq.${studyId}&select=generation_status,generation_error_message`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${token}` } }
        );
        if (r.ok) {
          const rows = await r.json();
          const row = rows && rows[0];
          if (row) {
            const s = row.generation_status;
            if (s === 'completed' || s === 'done') {
              setPhase(4);
              setProgress(100);
              setTimeout(() => {
                // Redirige vers le viewer Stella (navigation slide-par-slide + export PPTX)
                const target = `/stella-visual?studyId=${studyId}`;
                if (window.top) window.top.location.href = target;
                else window.location.href = target;
              }, 1200);
              return;
            }
            if (s === 'failed' || s === 'error') {
              setErrorMsg(row.generation_error_message || 'Erreur de génération');
              return;
            }
          }
        }
      } catch (e) {
        console.warn('[generation] poll error', e);
      }
      if (!cancelled) timer = setTimeout(poll, 5000);
    };
    poll();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, [studyId]);

  const villes = state.villesData || [];
  const primaryVille = villes[0]?.ville || 'Bordeaux';
  const pal = LouannData.palettes.find(p => p.key === state.palette) || LouannData.palettes[0];
  const stellaPayload = (window.LouannBrandPreset && window.LouannBrandPreset.toStellaPayload)
    ? window.LouannBrandPreset.toStellaPayload(state)
    : null;
  // Trace dev : utile pour vérifier le mapping côté console.
  useEffect(() => {
    if (stellaPayload) console.info('[stella-payload]', stellaPayload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phaseTitles = [
    "Préparation de l'étude…",
    "Analyse de vos paramètres",
    "Collecte des données sources",
    "Composition des slides",
    "✓ Étude prête"
  ];

  return (
    <div className="fade-in">
      <TopNav variant="wizard" />
      <div className="generation">
        <div className="gen-stage">
          <div className="gen-status">
            <span className="mono">PHASE {phase + 1} / 5</span>
          </div>
          <h1 className="gen-title">
            {phaseTitles[phase]}
          </h1>

          <div className="gen-canvas">
            {phase === 0 && <PhaseSubmit />}
            {phase === 1 && <PhaseImplosion state={state} />}
            {phase === 2 && <PhaseData ville={primaryVille} villesCount={villes.length} />}
            {phase === 3 && <PhaseAssembly palette={pal} />}
            {phase === 4 && <PhaseReveal />}
          </div>

          <div className="gen-progress">
            <div style={{ width: `${progress}%` }}></div>
          </div>
          <div className="gen-percent">
            {Math.round(progress)}% · ~{Math.max(0, Math.round((100 - progress) / 10))}s
          </div>

          <BubblePopGame />
        </div>

        <div className="gen-skip">
          {studyId && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (window.top) window.top.location.href = `/app/studies/${studyId}`;
                else window.location.href = `/app/studies/${studyId}`;
              }}
            >
              Ouvrir la fiche étude <Arrow />
            </button>
          )}
        </div>
        {errorMsg && (
          <div style={{ marginTop: 18, padding: 12, borderRadius: 10, background: '#fef2f2', color: '#b91c1c', fontSize: 13, maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            {errorMsg}
          </div>
        )}
        {stellaPayload && stellaPayload.brand_slug && (
          <div style={{ marginTop: 24, padding: 14, borderRadius: 12, border: '1px solid var(--ink-5)', background: 'var(--surface-2)', fontSize: 12, color: 'var(--ink-3)', maxWidth: 720, marginLeft: 'auto', marginRight: 'auto' }}>
            <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 6 }}>
              Configuration transmise au moteur Stella
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div><strong>Marque :</strong> {stellaPayload.brand_name || stellaPayload.brand_slug}</div>
              <div><strong>Type d'étude :</strong> {stellaPayload.study_type}
                {stellaPayload.study_type_matches_brand_reco && <span style={{ marginLeft: 6, color: 'var(--red)' }}>✓ reco marque</span>}
              </div>
              <div><strong>Services :</strong> {(stellaPayload.selections.services || []).length}</div>
              <div><strong>Cibles :</strong> {(stellaPayload.selections.targets || []).length}</div>
              <div><strong>KPI :</strong> {(stellaPayload.selections.kpis || []).length}</div>
              <div><strong>Zones focus :</strong> {(stellaPayload.selections.zone_focus || []).length}</div>
            </div>
            <div style={{ marginTop: 8, fontStyle: 'italic' }}>
              {stellaPayload.brand_guidance_applied
                ? `✓ Configuration alignée sur la recommandation ${stellaPayload.brand_name || ''}`
                : '↺ Configuration personnalisée (hors recommandation marque)'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// === PHASE 0 — Submit ===
function PhaseSubmit() {
  return (
    <div className="fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          border: '3px solid var(--red-soft)',
          borderTopColor: 'var(--red)',
          margin: '0 auto',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

// === PHASE 1 — Implosion : pills du wizard convergent au centre ===
function PhaseImplosion({ state }) {
  const villes = state.villesData || [];
  const villeLabel = villes.length === 0 ? 'Bordeaux'
    : villes.length === 1 ? villes[0].ville
    : `${villes[0].ville} +${villes.length - 1}`;
  const anneeLabel = state.annees.length === 1 ? `${state.annees[0]}` : `${state.annees.length} ans`;
  const typeName = LouannData.typesEtude.find(t => t.key === state.typeEtude)?.name || 'Analyse complète';
  const palName = LouannData.palettes.find(p => p.key === state.palette)?.name || 'FLEXIBIA';

  const items = [
    { txt: villeLabel, x: '10%', y: '15%' },
    { txt: anneeLabel, x: '75%', y: '20%' },
    { txt: typeName.split(' ')[0], x: '8%', y: '65%' },
    { txt: `${state.kpiSelected.length} KPI`, x: '78%', y: '70%' },
    { txt: palName, x: '40%', y: '8%' },
    { txt: `${state.cibles.length} cibles`, x: '45%', y: '80%' }
  ];

  const [imploded, setImploded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setImploded(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {items.map((it, i) => (
        <div
          key={i}
          className={`float-pill ${imploded ? 'imploding' : ''}`}
          style={{ left: it.x, top: it.y, animationDelay: `${i * 0.08}s` }}
        >
          {it.txt}
        </div>
      ))}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 60, height: 60,
        borderRadius: '50%',
        background: 'var(--red-grad)',
        boxShadow: 'var(--shadow-red)',
        opacity: imploded ? 1 : 0,
        transition: 'opacity 0.6s'
      }}></div>
    </div>
  );
}

// === PHASE 2 — Données : stream de sources ===
function PhaseData({ ville, villesCount = 1 }) {
  const zoneSuffix = villesCount > 1 ? ` · +${villesCount - 1} zones` : '';
  const sources = [
    { src: 'INSEE 2024', txt: `Population senior · ${ville}${zoneSuffix}`, count: '2 312 lignes' },
    { src: 'FILOSOFI', txt: 'Revenu médian foyers seniors', count: '847 lignes' },
    { src: 'DREES', txt: 'Taux dépendance GIR 1-4', count: '124 lignes' },
    { src: 'SIRENE', txt: 'Acteurs SAP locaux', count: '487 entreprises' },
    { src: 'Apollo', txt: 'Top acteurs · parts marché', count: '18 acteurs analysés' },
    { src: 'DARES', txt: 'Heures SAP/an · saisonnalité', count: '36 mois de données' }
  ];

  return (
    <div className="gen-data-stream">
      {sources.map((s, i) => (
        <div
          key={i}
          className="gen-data-line done"
          style={{ animationDelay: `${i * 0.18}s` }}
        >
          <span className="dot"></span>
          <span style={{ width: 100, color: 'var(--ink-2)', fontWeight: 600 }}>{s.src}</span>
          <span style={{ flex: 1, color: 'var(--ink)' }}>{s.txt}</span>
          <span style={{ color: 'var(--ink-3)' }}>{s.count}</span>
        </div>
      ))}
    </div>
  );
}

// === PHASE 3 — Assembly : slides s'empilent ===
function PhaseAssembly({ palette }) {
  return (
    <div className="gen-cascade">
      {[
        { rot: -10, x: -120, y: -10, delay: 0 },
        { rot: -3, x: -60, y: 0, delay: 0.15 },
        { rot: 2, x: 0, y: -10, delay: 0.3 },
        { rot: 6, x: 60, y: 0, delay: 0.45 },
        { rot: 12, x: 120, y: -10, delay: 0.6 }
      ].map((s, i) => (
        <div
          key={i}
          className="gen-slide"
          style={{
            transform: `translate(calc(-50% + ${s.x}px), calc(-50% + ${s.y}px)) rotate(${s.rot}deg)`,
            animationDelay: `${s.delay}s`,
            zIndex: 5 - Math.abs(2 - i)
          }}
        >
          <div className="slide-bar lg" style={{ width: '70%' }}></div>
          <div className="slide-bar accent" style={{ background: palette.primary, width: 24 }}></div>
          <div className="slide-bar med" style={{ width: '85%' }}></div>
          <div className="slide-chart" style={{ flex: 1 }}>
            {[40, 65, 55, 80, 70].map((h, i) =>
              <div key={i} className="col" style={{ height: `${h}%`, background: `linear-gradient(to top, ${palette.primary} 0%, ${palette.primary}40 100%)` }}></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// === PHASE 4 — Reveal ===
function PhaseReveal() {
  return (
    <div className="gen-reveal">
      <div className="check-circle">
        <Check s={36} />
      </div>
      <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 18, color: 'var(--ink)' }}>
        Étude générée
      </div>
      <div className="t-caption">Redirection vers le résultat…</div>
    </div>
  );
}

window.Generation = Generation;

// === Mini-jeu anti-attente : bulles flottantes à éclater ===
function BubblePopGame() {
  const [bubbles, setBubbles] = useState([]);
  const [bursts, setBursts] = useState([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const idRef = React.useRef(1);
  const submitTimerRef = React.useRef(null);

  const SB_URL = (window.__SUPABASE_URL__) || 'https://utwjfsomblhupghbgvgv.supabase.co';
  const SB_KEY = (window.__SUPABASE_ANON__) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0d2pmc29tYmxodXBnaGJndmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTUzMTUsImV4cCI6MjA5NzY5MTMxNX0.iN1N8d5GjsUzrIWHkBXWqAn1DpZO-wbhH3nI-8UHBv4';

  // Charge le record global
  useEffect(() => {
    let cancelled = false;
    fetch(`${SB_URL}/rest/v1/bubble_pop_global_score?id=eq.1&select=best_score`, {
      headers: { apikey: SB_KEY }
    })
      .then(r => r.ok ? r.json() : [])
      .then(rows => { if (!cancelled && rows && rows[0]) setBest(rows[0].best_score || 0); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Spawn doux (max 3 bulles, intervalle long)
  useEffect(() => {
    const spawn = () => {
      setBubbles(prev => {
        if (prev.length >= 3) return prev;
        const id = idRef.current++;
        return [...prev, {
          id,
          x: 8 + Math.random() * 84,
          y: 12 + Math.random() * 76,
          size: 36 + Math.random() * 44,
          hue: Math.floor(Math.random() * 360),
          born: Date.now()
        }];
      });
    };
    spawn();
    const interval = setInterval(spawn, 2800 + Math.random() * 1800);
    return () => clearInterval(interval);
  }, []);

  // Nettoyage des bulles trop vieilles et des bursts
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setBubbles(prev => prev.filter(b => now - b.born < 6500));
      setBursts(prev => prev.filter(b => now - b.id < 700));
    }, 500);
    return () => clearInterval(t);
  }, []);

  const pop = (b) => {
    setBubbles(prev => prev.filter(x => x.id !== b.id));
    const burstId = Date.now() + Math.random();
    setBursts(prev => [...prev, { id: burstId, x: b.x, y: b.y, hue: b.hue }]);
    setScore(s => {
      const n = s + 1;
      setBest(bestPrev => {
        if (n > bestPrev) {
          if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
          submitTimerRef.current = setTimeout(() => {
            fetch(`${SB_URL}/rest/v1/rpc/submit_bubble_pop_score`, {
              method: 'POST',
              headers: {
                apikey: SB_KEY,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ _score: n })
            })
              .then(r => r.ok ? r.json() : null)
              .then(v => { if (typeof v === 'number') setBest(v); })
              .catch(() => {});
          }, 600);
          return n;
        }
        return bestPrev;
      });
      return n;
    });
  };

  return (
    <div style={{
      marginTop: 24,
      maxWidth: 720,
      marginLeft: 'auto',
      marginRight: 'auto',
      borderRadius: 12,
      border: '1px solid var(--ink-5)',
      background: 'var(--surface-2)',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 14px',
        borderBottom: '1px solid var(--ink-5)',
        fontSize: 12,
        color: 'var(--ink-2)'
      }}>
        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>🫧 En attendant… éclate les bulles</span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          Score : <strong style={{ color: 'var(--ink)' }}>{score}</strong>
          {' · '}
          Record : <strong style={{ color: 'var(--ink)' }}>{best}</strong>
        </span>
      </div>
      <div style={{ position: 'relative', width: '100%', height: 240, background: 'linear-gradient(180deg, rgba(0,0,0,0.02), transparent)' }}>
        {bubbles.map(b => (
          <button
            key={b.id}
            type="button"
            onClick={() => pop(b)}
            aria-label="Éclater la bulle"
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              border: `1px solid hsla(${b.hue},80%,80%,0.5)`,
              borderRadius: '50%',
              padding: 0,
              cursor: 'pointer',
              background: `radial-gradient(circle at 30% 30%, hsla(${b.hue},90%,85%,0.95), hsla(${b.hue},80%,55%,0.55) 60%, hsla(${b.hue},70%,45%,0.25) 100%)`,
              boxShadow: `0 4px 18px hsla(${b.hue},70%,55%,0.35), inset 0 0 12px hsla(${b.hue},90%,90%,0.6)`,
              animation: `bpg-float-${b.id % 3} ${7 + (b.id % 4)}s ease-in-out infinite`
            }}
          />
        ))}
        {bursts.map(b => (
          <div key={b.id} style={{
            position: 'absolute',
            left: `${b.x}%`,
            top: `${b.y}%`,
            transform: 'translate(-50%, -50%)',
            color: `hsl(${b.hue},80%,55%)`,
            fontWeight: 700,
            fontSize: 16,
            pointerEvents: 'none',
            animation: 'bpg-burst 0.65s ease-out forwards'
          }}>+1 ✨</div>
        ))}
        <style>{`
          @keyframes bpg-float-0 { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(calc(-50% + 3px), calc(-50% - 4px)); } }
          @keyframes bpg-float-1 { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(calc(-50% - 4px), calc(-50% - 3px)); } }
          @keyframes bpg-float-2 { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(calc(-50% + 2px), calc(-50% - 5px)); } }
          @keyframes bpg-burst { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); } 100% { opacity: 0; transform: translate(-50%, -180%) scale(1.6); } }
        `}</style>
      </div>
    </div>
  );
}
