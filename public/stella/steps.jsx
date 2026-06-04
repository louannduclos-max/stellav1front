// Louann V1 — Wizard step components

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const {
  StepHead, WizardNav, OptCard, CheckBox, Radio,
  SlideThumb, Arrow, ArrowLeft, Check, Pin, Lock, Sparkle
} = window;

// =============================================================
// Continent + Country selector (dropdown with search)
// =============================================================
function CountrySelector({ state, dispatch }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const continents = LouannData.continents;
  const pays = LouannData.pays;

  const currentContinent = state.continent || 'EU';
  const inContinent = pays.filter(p => p.continent === currentContinent);
  const q = query.toLowerCase().trim();
  const filtered = q
    ? inContinent.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q))
    : inContinent;

  const selected = pays.find(p => p.code === state.pays);

  const pickContinent = (code) => {
    if (code === currentContinent) return;
    const firstAvail = pays.find(p => p.continent === code && p.available);
    const fallback = pays.find(p => p.continent === code);
    LouannStore.setFields(dispatch, {
      continent: code,
      pays: (firstAvail || fallback || {}).code || null
    });
    setQuery('');
  };

  const pickPays = (p) => {
    if (!p.available) return;
    LouannStore.setField(dispatch, 'pays', p.code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div>
      <label className="field-label">Continent</label>
      <div className="row gap-2 wrap">
        {continents.map(c => {
          const on = currentContinent === c.code;
          return (
            <span
              key={c.code}
              className={`pill ${on ? 'on red' : ''}`}
              onClick={() => pickContinent(c.code)}
              style={{ cursor: 'pointer' }}
            >
              {on && <Check s={12} />}
              <span style={{ fontSize: 14 }}>{c.flag}</span>
              {c.name}
            </span>
          );
        })}
      </div>

      <label className="field-label" style={{ marginTop: 16 }}>Pays de l'étude</label>
      <div className="autocomplete" style={{ position: 'relative' }}>
        <div
          className="input input-lg"
          onClick={() => setOpen(o => !o)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}
        >
          {selected ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{selected.flag}</span>
              <strong>{selected.name}</strong>
              {!selected.available && (
                <span className="t-caption" style={{ opacity: 0.6 }}>· bientôt</span>
              )}
            </span>
          ) : (
            <span style={{ color: 'var(--ink-4)' }}>Sélectionner un pays…</span>
          )}
          <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
        </div>

        {open && (
          <div className="autocomplete-list" style={{ maxHeight: 320, overflowY: 'auto' }}>
            <div style={{ padding: 8, borderBottom: '1px solid var(--ink-5)' }}>
              <input
                autoFocus
                type="text"
                className="input"
                placeholder="Rechercher un pays…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
            {filtered.length === 0 && (
              <div style={{ padding: 12, color: 'var(--ink-4)', fontSize: 13 }}>
                Aucun pays
              </div>
            )}
            {filtered.map(p => {
              const on = state.pays === p.code;
              return (
                <div
                  key={p.code}
                  className="autocomplete-item"
                  onMouseDown={() => pickPays(p)}
                  style={{
                    opacity: p.available ? 1 : 0.55,
                    cursor: p.available ? 'pointer' : 'not-allowed',
                    background: on ? 'var(--surface-2)' : undefined
                  }}
                >
                  <span style={{ fontSize: 16 }}>{p.flag}</span>
                  <span style={{ flex: 1 }}>
                    <strong>{p.name}</strong>
                    <span className="t-caption" style={{ marginLeft: 6, opacity: 0.7 }}>
                      {p.note}
                    </span>
                  </span>
                  {p.available
                    ? (on ? <Check s={12} /> : <span className="meta">choisir</span>)
                    : <span className="meta" style={{ opacity: 0.6 }}>bientôt</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selected && (
        <div className="field-help">{selected.note}</div>
      )}
    </div>
  );
}

// =============================================================
// Axes routiers picker — AI-powered (Lovable AI)
// =============================================================
function AxesRoutiersPicker({ state, dispatch }) {
  const [customInput, setCustomInput] = useState('');
  const [customType, setCustomType] = useState('autoroute');

  const selectedPays = LouannData.pays.find(p => p.code === state.pays);
  const countryName = selectedPays ? selectedPays.label : 'France';
  const targetCity = (state.villes && state.villes[0])
    || (state.villesData && state.villesData[0] && state.villesData[0].ville)
    || (countryName === 'France' ? 'Bordeaux' : countryName);

  const aiAxes = state.axesRoutiersAI || [];
  const customAxes = state.axesRoutiersCustom || [];
  const meta = state.axesRoutiersAIMeta || { city: null, loading: false, error: null };

  // Static defaults (kept for FR / Bordeaux as a fallback baseline)
  const staticAxes = LouannData.axesRoutiers.map(a => ({
    key: a.key, label: a.label, type: a.type, source: 'static'
  }));
  const aiNormalized = aiAxes.map((a, i) => ({
    key: `ai_${i}_${(a.label || '').toLowerCase().replace(/\s+/g, '_').slice(0, 40)}`,
    label: a.label, type: a.type, source: 'ai'
  }));
  const customNormalized = customAxes.map((a, i) => ({
    key: `custom_${i}_${(a.label || '').toLowerCase().replace(/\s+/g, '_').slice(0, 40)}`,
    label: a.label, type: a.type, source: 'custom'
  }));

  // Hide static defaults once we have AI suggestions (avoid Bordeaux clutter elsewhere)
  const hasAI = aiNormalized.length > 0;
  const showStatic = !hasAI && countryName === 'France';
  const allAxes = [
    ...(showStatic ? staticAxes : []),
    ...aiNormalized,
    ...customNormalized,
  ];

  const colors = {
    autoroute: '#E63946', rocade: '#FF6B35',
    nationale: '#1E3A8A', departementale: '#475569', transport: '#00A99D'
  };

  const fetchAI = async () => {
    LouannStore.setField(dispatch, 'axesRoutiersAIMeta', {
      city: targetCity, loading: true, error: null,
    });
    try {
      const res = await fetch('/api/public/suggest-axes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country: countryName, city: targetCity }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      const axes = Array.isArray(data.axes) ? data.axes : [];
      LouannStore.setFields(dispatch, {
        axesRoutiersAI: axes,
        axesRoutiers: [], // reset selection when list changes
        axesRoutiersAIMeta: { city: targetCity, loading: false, error: null },
      });
    } catch (e) {
      LouannStore.setField(dispatch, 'axesRoutiersAIMeta', {
        city: targetCity, loading: false, error: e.message || 'Erreur IA',
      });
    }
  };

  const addCustom = () => {
    const label = customInput.trim();
    if (!label) return;
    const next = [...customAxes, { label, type: customType }];
    LouannStore.setField(dispatch, 'axesRoutiersCustom', next);
    setCustomInput('');
  };

  return (
    <>
      <div className="row gap-2 wrap" style={{ marginBottom: 10, alignItems: 'center' }}>
        <button
          type="button"
          className="pill"
          onClick={fetchAI}
          disabled={meta.loading}
          style={{
            cursor: meta.loading ? 'wait' : 'pointer',
            background: meta.loading ? 'var(--ink-1)' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', fontWeight: 600, border: 'none'
          }}
        >
          {meta.loading
            ? '⏳ Analyse en cours…'
            : `✨ Suggérer les axes pour ${targetCity}`}
        </button>
        {meta.city && !meta.loading && !meta.error && hasAI && (
          <span className="t-caption" style={{ opacity: 0.7 }}>
            · {aiNormalized.length} axes générés pour {meta.city}
          </span>
        )}
        {meta.error && (
          <span className="t-caption" style={{ color: '#E63946' }}>
            · {meta.error}
          </span>
        )}
      </div>

      <div className="row gap-2 wrap">
        {allAxes.length === 0 && (
          <span className="t-caption" style={{ opacity: 0.6 }}>
            Aucun axe encore — cliquez sur « Suggérer » ou ajoutez le vôtre ci-dessous.
          </span>
        )}
        {allAxes.map(a => {
          const on = (state.axesRoutiers || []).includes(a.key);
          return (
            <span
              key={a.key}
              className={`pill ${on ? 'on red' : ''}`}
              onClick={() => LouannStore.toggleIn(dispatch, 'axesRoutiers', a.key)}
              title={a.source === 'ai' ? 'Suggéré par l\'IA' : a.source === 'custom' ? 'Ajout manuel' : ''}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: colors[a.type] || '#94A3B8', display: 'inline-block'
              }}></span>
              {on && <Check s={11} />} {a.label}
              {a.source === 'ai' && <span style={{ marginLeft: 4, opacity: 0.55, fontSize: 10 }}>✨</span>}
              {a.source === 'custom' && <span style={{ marginLeft: 4, opacity: 0.55, fontSize: 10 }}>✎</span>}
            </span>
          );
        })}
      </div>

      <div className="row gap-2" style={{ marginTop: 10, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ajouter un axe (ex: A-6 Madrid–La Coruña)"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          style={{
            flex: 1, padding: '6px 10px', border: '1px solid var(--ink-2)',
            borderRadius: 6, fontSize: 13
          }}
        />
        <select
          value={customType}
          onChange={e => setCustomType(e.target.value)}
          style={{ padding: '6px 8px', border: '1px solid var(--ink-2)', borderRadius: 6, fontSize: 13 }}
        >
          <option value="autoroute">Autoroute</option>
          <option value="rocade">Rocade</option>
          <option value="nationale">Nationale</option>
          <option value="departementale">Départementale</option>
          <option value="transport">Transport</option>
        </select>
        <button
          type="button"
          className="pill"
          onClick={addCustom}
          disabled={!customInput.trim()}
          style={{ cursor: customInput.trim() ? 'pointer' : 'not-allowed' }}
        >
          + Ajouter
        </button>
      </div>
    </>
  );
}

// =============================================================
// STEP 1 — Type d'étude (list + preview live)
// =============================================================
function BrandSummaryCard({ currentMarque }) {
  const guidance = LouannData.brandGuidance || {};
  const summary = guidance.summary;
  const reco = guidance.studyTypeRecommendation;
  if (summary) {
    return (
      <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--ink-5)', fontSize: 13 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 4 }}>Marque</div>
            <div><strong>{summary.headline || currentMarque.name}</strong></div>
            {summary.tagline && <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{summary.tagline}</div>}
            {summary.positioning && <div style={{ color: 'var(--ink-2)', fontSize: 12, marginTop: 6, lineHeight: 1.5 }}>{summary.positioning}</div>}
          </div>
          <div>
            <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 4 }}>Offres clés</div>
            <div style={{ lineHeight: 1.6 }}>
              {(summary.key_offers || []).map((a, i) => (<div key={i}>• {a}</div>))}
            </div>
          </div>
        </div>
        {reco && reco.code && (
          <div style={{ marginTop: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(228,30,30,.06)', fontSize: 12, color: 'var(--ink-2)' }}>
            <strong>Type d'étude recommandé :</strong> {reco.reason || reco.code}
          </div>
        )}
        <div style={{ borderTop: '1px dashed var(--ink-5)', paddingTop: 8, marginTop: 10, fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
          ✓ Recommandations chargées · vous restez libre de modifier tous les choix dans les étapes suivantes.
        </div>
      </div>
    );
  }
  // Fallback: legacy static card
  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--ink-5)', display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 14, fontSize: 13 }}>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 4 }}>Identité</div>
        <div><strong>{currentMarque.name}</strong></div>
        <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>{currentMarque.tagline}</div>
        <div style={{ color: 'var(--ink-3)', fontSize: 12, marginTop: 4 }}>
          🌐 {currentMarque.website} · 📍 {currentMarque.hq}
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 4 }}>Activités</div>
        <div style={{ lineHeight: 1.6 }}>
          {currentMarque.activities.map((a, i) => (<div key={i}>• {a}</div>))}
        </div>
      </div>
      <div>
        <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 4 }}>Cibles</div>
        <div style={{ lineHeight: 1.6 }}>
          {currentMarque.targets.map((t, i) => (<div key={i}>• {t}</div>))}
        </div>
      </div>
      <div style={{ gridColumn: '1 / -1', borderTop: '1px dashed var(--ink-5)', paddingTop: 8, fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
        ✓ Palette, sous-secteurs et cibles ont été préremplis. Vous pourrez les ajuster aux étapes suivantes.
      </div>
    </div>
  );
}

function Step1() {
  const { state, dispatch } = LouannStore.useWizard();
  const types = LouannData.typesEtude;
  const current = types.find(t => t.key === state.typeEtude) || types[0];

  const pal = LouannData.palettes.find(p => p.key === state.palette) || LouannData.palettes[0];
  const guidance = LouannData.brandGuidance || {};
  const brandRecoTypeCode = guidance.studyTypeRecommendation && guidance.studyTypeRecommendation.code;
  const brandRecoReason = guidance.studyTypeRecommendation && guidance.studyTypeRecommendation.reason;
  const brandName = guidance.brandName;

  const onSelect = (key) => {
    const t = types.find(x => x.key === key);
    LouannStore.setFields(dispatch, {
      typeEtude: key,
      kpiSelected: t.kpisAuto
    });
  };

  const marques = LouannData.marques;
  const currentMarque = marques.find(m => m.key === state.marque);

  const onSelectMarque = (key) => {
    const m = marques.find(x => x.key === key);
    if (!m) return;
    LouannStore.setFields(dispatch, { marque: key, ...m.defaults });
    // Brand preset (DB) — non-blocking guidance layer
    if (window.LouannBrandPreset && key !== 'custom') {
      const slug = window.LouannBrandPreset.resolveSlug(key);
      window.LouannBrandPreset.fetchBrandPreset(slug).then((payload) => {
        if (!payload) return;
        window.LouannBrandPreset.applyBrandPreset(payload);
        const g = window.LouannData.brandGuidance || {};
        const patch = {};
        // Apply DB-driven defaults for services + targets
        const services = (window.LouannData.sousSecteurs || [])
          .filter((x) => x._default).map((x) => x.key);
        const cibles = (window.LouannData.cibles || [])
          .filter((x) => x._default).map((x) => x.key);
        if (services.length) patch.sousSecteurs = services;
        if (cibles.length) patch.cibles = cibles;
        // Apply recommended study type
        if (g.studyTypeRecommendation && g.studyTypeRecommendation.code) {
          const reco = LouannData.typesEtude.find((t) => t.key === g.studyTypeRecommendation.code);
          if (reco) {
            patch.typeEtude = reco.key;
            patch.kpiSelected = reco.kpisAuto;
          }
        }
        // Apply preset defaults (KPIs, risques, zone focus, années) — winner over study-type kpisAuto
        const presetObj = payload.preset || {};
        const pickDefaults = (arr) => Array.isArray(arr)
          ? arr.filter((x) => x && x.is_default).map((x) => x.code)
          : [];
        const presetKpis     = pickDefaults(presetObj.default_kpis);
        const presetZones    = pickDefaults(presetObj.default_zone_focus);
        const presetYears    = Array.isArray(presetObj.default_reference_years)
          ? presetObj.default_reference_years
              .filter((x) => x && x.is_default)
              .map((x) => Number(x.code))
              .filter((n) => !Number.isNaN(n))
          : [];
        if (presetKpis.length)  patch.kpiSelected = presetKpis;
        if (presetZones.length) patch.zoneTypes   = presetZones;
        if (presetYears.length) patch.annees      = presetYears.sort();
        LouannStore.setFields(dispatch, patch);
      });
    }
  };

  const next = () => {
    LouannStore.markStepDone(dispatch, 1);
    LouannStore.go('/wizard/2');
  };

  return (
    <>
      <StepHead
        n={1}
        title="Quel type d'étude souhaitez-vous ?"
        sub="5 templates · nombre de slides adapté à l'étude · vous pouvez modifier les KPI à l'étape KPI."
      />
      <div className="step-body">
        {/* Sélection de marque */}
        <div>
          <label className="field-label">Pour quelle marque réalisez-vous l'étude ?</label>
          <div className="row gap-2 wrap">
            {marques.map(m => {
              const on = state.marque === m.key;
              return (
                <span
                  key={m.key}
                  className={`pill ${on ? 'on red' : ''}`}
                  onClick={() => onSelectMarque(m.key)}
                  style={{ cursor: 'pointer' }}
                >
                  {on && <Check s={12} />}
                  {m.name}
                </span>
              );
            })}
          </div>
          {currentMarque && currentMarque.key !== 'custom' && (
            <BrandSummaryCard currentMarque={currentMarque} />
          )}
          {currentMarque && currentMarque.key === 'custom' && (
            <div className="field-help">Saisie manuelle — vous renseignerez les infos client à l'étape 5.</div>
          )}
          {!currentMarque && (
            <div className="field-help">Choisissez une marque pour préremplir automatiquement palette, sous-secteurs et cibles.</div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'flex-start' }}>
          <div className="stack gap-3">
            {types.map(t => {
              const brandReco = brandRecoTypeCode && t.key === brandRecoTypeCode;
              const title = brandReco && brandName
                ? `${t.name} — Recommandé pour ${brandName}`
                : t.name;
              const desc = brandReco && brandRecoReason
                ? `${t.desc}  ·  ${brandRecoReason}`
                : t.desc;
              return (
                <OptCard
                  key={t.key}
                  on={state.typeEtude === t.key}
                  onClick={() => onSelect(t.key)}
                  title={title}
                  desc={desc}
                  reco={brandReco || (!brandRecoTypeCode && t.reco)}
                />
              );
            })}
          </div>

          <div className="live-preview">
            <div className="lp-eyebrow">Aperçu de l'étude</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {['cover', 'demo', 'persona', 'swot', 'demo', 'verdict'].map((k, i) => (
                <SlideThumb key={i} kind={k} palette={pal.primary} label={`${String(i+1).padStart(2,'0')}`} />
              ))}
            </div>
            <div style={{ marginTop: 14, textAlign: 'center' }}>
              <span className="t-caption">{current.kpis} KPI sélectionnés</span>
            </div>
          </div>
        </div>
      </div>
      <WizardNav step={1} onNext={next} />
    </>
  );
}

// =============================================================
// STEP 2 — Où & quand (multi-villes ou multi-quartiers + multi-années)
// =============================================================
function Step2() {
  const { state, dispatch } = LouannStore.useWizard();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  const [ctxQuery, setCtxQuery] = useState('');
  const [ctxOpen, setCtxOpen] = useState(false);
  const ctxInputRef = useRef(null);
  const [googleMatches, setGoogleMatches] = useState([]);
  const [googleLoading, setGoogleLoading] = useState(false);
  const placesSessionRef = useRef(null);

  const geoMode = state.geoMode || 'villes';
  const isQuartier = geoMode === 'quartiers';
  const isAgglo = geoMode === 'agglos';
  const needsContext = isQuartier || isAgglo;

  // ---- Google Places (New) — suggestions de villes en temps réel ---------
  // Activé uniquement quand le SDK Maps est chargé (cf. Louann.html).
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2 || !window.__GMAPS_READY__ || !window.google?.maps?.importLibrary) {
      setGoogleMatches([]);
      return;
    }
    let cancelled = false;
    setGoogleLoading(true);
    const t = setTimeout(async () => {
      try {
        const places = await window.google.maps.importLibrary('places');
        if (!placesSessionRef.current) {
          placesSessionRef.current = new places.AutocompleteSessionToken();
        }
        const countryCode = state.pays || 'FR';
        const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: q,
          sessionToken: placesSessionRef.current,
          includedPrimaryTypes: ['locality', 'sublocality', 'administrative_area_level_3'],
          includedRegionCodes: [countryCode.toLowerCase()],
          language: 'fr',
        });
        if (cancelled) return;
        const mapped = (suggestions || [])
          .map((s) => {
            const p = s.placePrediction;
            if (!p) return null;
            return {
              ville: p.mainText?.text || p.text?.text || '',
              parent: p.secondaryText?.text || '',
              country: countryCode,
              dept: '',
              deptName: p.secondaryText?.text || '',
              region: '',
              placeId: p.placeId,
              source: 'google',
            };
          })
          .filter((x) => x && x.ville);
        setGoogleMatches(mapped);
      } catch (e) {
        console.warn('[places] autocomplete error', e);
        setGoogleMatches([]);
      } finally {
        if (!cancelled) setGoogleLoading(false);
      }
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, state.pays]);

  // Filter the source list according to geoMode + selected country
  const baseList = useMemo(() => {
    const country = state.pays;
    return LouannData.villes
      .filter(v => {
        if (isQuartier) return v.type === 'quartier';
        if (isAgglo)    return v.type === 'agglo';
        return v.type !== 'quartier' && v.type !== 'agglo';
      })
      .filter(v => !country || !v.country || v.country === country);
  }, [isQuartier, isAgglo, state.pays]);

  // Selected keys (we key by ville name since it's unique in our dataset)
  const selectedKeys = state.villes;
  const matches = useMemo(() => {
    const q = query.toLowerCase().trim();
    return baseList
      .filter(v => !selectedKeys.includes(v.ville))
      .filter(v => !q || v.ville.toLowerCase().includes(q) || (v.parent && v.parent.toLowerCase().includes(q)))
      .slice(0, 8);
  }, [baseList, selectedKeys, query]);

  // Suggestions Google filtrées (pas déjà sélectionnées, pas déjà dans local)
  const googleSuggestions = useMemo(() => {
    const localKeys = new Set(matches.map(v => v.ville.toLowerCase()));
    return googleMatches
      .filter(v => !selectedKeys.includes(v.ville))
      .filter(v => !localKeys.has(v.ville.toLowerCase()))
      .slice(0, 5);
  }, [googleMatches, matches, selectedKeys]);

  const add = (v) => {
    LouannStore.setFields(dispatch, {
      villes: [...state.villes, v.ville],
      villesData: [...state.villesData, v]
    });
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const remove = (name) => {
    LouannStore.setFields(dispatch, {
      villes: state.villes.filter(x => x !== name),
      villesData: state.villesData.filter(x => x.ville !== name)
    });
  };

  const switchMode = (mode) => {
    if (mode === state.geoMode) return;
    LouannStore.setFields(dispatch, {
      geoMode: mode,
      villes: [],
      villesData: []
    });
    setQuery('');
  };

  // ---- Ville(s) de contexte (uniquement en mode quartiers / agglos) ----
  const ctxBaseList = useMemo(() => {
    const country = state.pays;
    return LouannData.villes
      .filter(v => v.type !== 'quartier' && v.type !== 'agglo')
      .filter(v => !country || !v.country || v.country === country);
  }, [state.pays]);

  const ctxSelected = state.villesContexte || [];
  const ctxMatches = useMemo(() => {
    const q = ctxQuery.toLowerCase().trim();
    return ctxBaseList
      .filter(v => !ctxSelected.includes(v.ville))
      .filter(v => !q || v.ville.toLowerCase().includes(q))
      .slice(0, 8);
  }, [ctxBaseList, ctxSelected, ctxQuery]);

  const addCtx = (v) => {
    LouannStore.setFields(dispatch, {
      villesContexte: [...(state.villesContexte || []), v.ville],
      villesContexteData: [...(state.villesContexteData || []), v]
    });
    setCtxQuery('');
    setCtxOpen(false);
    ctxInputRef.current?.focus();
  };
  const removeCtx = (name) => {
    LouannStore.setFields(dispatch, {
      villesContexte: (state.villesContexte || []).filter(x => x !== name),
      villesContexteData: (state.villesContexteData || []).filter(x => x.ville !== name)
    });
  };

  const toggleAnnee = (a) => {
    const next = state.annees.includes(a)
      ? state.annees.filter(x => x !== a)
      : [...state.annees, a].sort();
    if (next.length === 0) return; // keep at least 1
    LouannStore.setField(dispatch, 'annees', next);
  };

  const next = () => {
    LouannStore.markStepDone(dispatch, 2);
    LouannStore.go('/wizard/3');
  };

  const annees = [2024, 2025, 2026, 2027];

  return (
    <>
      <StepHead
        n={2}
        title="Où & quand"
        sub="Sélectionnez une ou plusieurs zones et années. L'étude agrège les données automatiquement."
      />
      <div className="step-body">

        <CountrySelector state={state} dispatch={dispatch} />

        {/* Mode toggle */}
        <div>
          <label className="field-label">Niveau géographique</label>
          <div className="row gap-2">
            <span
              className={`pill ${geoMode === 'villes' ? 'on red' : ''}`}
              onClick={() => switchMode('villes')}
            >
              {geoMode === 'villes' && <Check s={12} />} Villes entières
            </span>
            <span
              className={`pill ${isQuartier ? 'on red' : ''}`}
              onClick={() => switchMode('quartiers')}
            >
              {isQuartier && <Check s={12} />} Quartiers seulement
            </span>
            <span
              className={`pill ${isAgglo ? 'on red' : ''}`}
              onClick={() => switchMode('agglos')}
            >
              {isAgglo && <Check s={12} />} Agglos / Métropoles / Intercos
            </span>
          </div>
          <div className="field-help">
            {isQuartier
              ? "Cible plus fine — quartiers premium, arrondissements, communes."
              : isAgglo
              ? "Périmètre EPCI — métropole, communauté urbaine, communauté d'agglomération, área metropolitana."
              : "Étude au niveau commune. Idéal pour vue marché globale."}
          </div>
        </div>

        {/* Multi-select with chips */}
        <div>
          <label className="field-label">
            {isQuartier ? 'Quartiers à inclure' : isAgglo ? 'Agglomérations / métropoles / intercommunalités à inclure' : 'Villes à inclure'}
            <span className="t-caption" style={{ marginLeft: 8, fontWeight: 400 }}>
              · {state.villes.length} sélectionné{state.villes.length > 1 ? 's' : ''}
            </span>
          </label>
          <div className="autocomplete">
            <input
              ref={inputRef}
              type="text"
              className="input input-lg"
              placeholder={(() => {
                const samples = baseList.slice(0, 3).map(v => v.ville).join(', ');
                return samples ? `Ex: ${samples}…` : (isQuartier ? "Rechercher un quartier…" : isAgglo ? "Rechercher une agglo / métropole…" : "Rechercher une ville…");
              })()}
              value={query}
              onChange={e => { setQuery(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onKeyDown={e => {
                if (e.key === 'Enter' && matches[0]) { e.preventDefault(); add(matches[0]); }
                if (e.key === 'Backspace' && !query && state.villes.length) {
                  remove(state.villes[state.villes.length - 1]);
                }
              }}
            />
            {open && matches.length > 0 && (
              <div className="autocomplete-list">
                {matches.map((v, i) => (
                  <div key={i} className="autocomplete-item" onMouseDown={() => add(v)}>
                    <span className="ico"><Pin /></span>
                    <span>
                      <strong>{v.ville}</strong>
                      <span className="t-caption" style={{ marginLeft: 6 }}>
                        {v.parent ? `${v.parent} · ` : ''}{v.dept} · {v.deptName}
                      </span>
                    </span>
                    <span className="meta">+ ajouter</span>
                  </div>
                ))}
                {googleSuggestions.length > 0 && (
                  <>
                    <div className="t-caption" style={{ padding: '6px 10px', opacity: 0.6, fontSize: 10, textTransform: 'uppercase' }}>
                      Suggestions Google
                    </div>
                    {googleSuggestions.map((v, i) => (
                      <div key={`g-${i}`} className="autocomplete-item" onMouseDown={() => add(v)}>
                        <span className="ico"><Pin /></span>
                        <span>
                          <strong>{v.ville}</strong>
                          <span className="t-caption" style={{ marginLeft: 6 }}>
                            {v.parent || 'Google Places'}
                          </span>
                        </span>
                        <span className="meta" style={{ color: '#4285F4' }}>✦ Google</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            {open && matches.length === 0 && googleSuggestions.length > 0 && (
              <div className="autocomplete-list">
                <div className="t-caption" style={{ padding: '6px 10px', opacity: 0.6, fontSize: 10, textTransform: 'uppercase' }}>
                  Suggestions Google
                </div>
                {googleSuggestions.map((v, i) => (
                  <div key={`g-${i}`} className="autocomplete-item" onMouseDown={() => add(v)}>
                    <span className="ico"><Pin /></span>
                    <span>
                      <strong>{v.ville}</strong>
                      <span className="t-caption" style={{ marginLeft: 6 }}>
                        {v.parent || 'Google Places'}
                      </span>
                    </span>
                    <span className="meta" style={{ color: '#4285F4' }}>✦ Google</span>
                  </div>
                ))}
              </div>
            )}
            {open && query && matches.length === 0 && googleSuggestions.length === 0 && !googleLoading && (
              <div className="autocomplete-list">
                <div className="autocomplete-item" style={{ opacity: 0.6, cursor: 'default' }}>
                  Aucune ville trouvée.
                </div>
              </div>
            )}
          </div>

          {/* Selected chips */}
          {state.villesData.length > 0 && (
            <div className="row gap-2 wrap" style={{ marginTop: 12 }}>
              {state.villesData.map(v => (
                <span key={v.ville} className="pill on red" style={{ paddingRight: 6 }}>
                  <Pin s={11} />
                  {v.ville}
                  {v.parent && <span style={{ opacity: 0.7, fontSize: 11, marginLeft: 4 }}>· {v.parent}</span>}
                  <button
                    onClick={() => remove(v.ville)}
                    style={{
                      marginLeft: 4, padding: 2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)', color: '#fff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, lineHeight: 1
                    }}
                    title="Retirer"
                  >✕</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ville(s) de contexte — uniquement en mode quartiers/agglos */}
        {needsContext && (
          <div>
            <label className="field-label">
              Ville(s) de contexte
              <span className="t-caption" style={{ marginLeft: 8, fontWeight: 400 }}>
                · optionnel · {(state.villesContexte || []).length} sélectionnée{(state.villesContexte || []).length > 1 ? 's' : ''}
              </span>
            </label>
            <div className="field-help" style={{ marginBottom: 8 }}>
              {isQuartier
                ? "Ajoutez la commune dont dépendent ces quartiers pour fournir le contexte global de la zone (démographie ville entière, marché communal, etc.)."
                : "Ajoutez la ou les villes-centres de cette agglo/métropole pour ancrer l'étude sur un cœur urbain identifiable."}
            </div>
            <div className="autocomplete">
              <input
                ref={ctxInputRef}
                type="text"
                className="input input-lg"
                placeholder="Rechercher une ville de contexte…"
                value={ctxQuery}
                onChange={e => { setCtxQuery(e.target.value); setCtxOpen(true); }}
                onFocus={() => setCtxOpen(true)}
                onBlur={() => setTimeout(() => setCtxOpen(false), 150)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && ctxMatches[0]) { e.preventDefault(); addCtx(ctxMatches[0]); }
                  if (e.key === 'Backspace' && !ctxQuery && (state.villesContexte || []).length) {
                    removeCtx(state.villesContexte[state.villesContexte.length - 1]);
                  }
                }}
              />
              {ctxOpen && ctxMatches.length > 0 && (
                <div className="autocomplete-list">
                  {ctxMatches.map((v, i) => (
                    <div key={i} className="autocomplete-item" onMouseDown={() => addCtx(v)}>
                      <span className="ico"><Pin /></span>
                      <span>
                        <strong>{v.ville}</strong>
                        <span className="t-caption" style={{ marginLeft: 6 }}>
                          {v.dept} · {v.deptName}
                        </span>
                      </span>
                      <span className="meta">+ ajouter</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {(state.villesContexteData || []).length > 0 && (
              <div className="row gap-2 wrap" style={{ marginTop: 12 }}>
                {(state.villesContexteData || []).map(v => (
                  <span key={v.ville} className="pill on" style={{ paddingRight: 6 }}>
                    <Pin s={11} />
                    {v.ville}
                    <button
                      onClick={() => removeCtx(v.ville)}
                      style={{
                        marginLeft: 4, padding: 2,
                        width: 18, height: 18, borderRadius: '50%',
                        background: 'rgba(255,255,255,0.2)', color: '#fff',
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, lineHeight: 1
                      }}
                      title="Retirer"
                    >✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Année multi */}
        <div>
          <label className="field-label">
            Année{state.annees.length > 1 ? 's' : ''} de référence
            <span className="t-caption" style={{ marginLeft: 8, fontWeight: 400 }}>
              · {state.annees.length} sélectionnée{state.annees.length > 1 ? 's' : ''}
            </span>
          </label>
          <div className="row gap-2 wrap">
            {annees.map(a => {
              const on = state.annees.includes(a);
              return (
                <span
                  key={a}
                  className={`pill ${on ? 'on red' : ''}`}
                  onClick={() => toggleAnnee(a)}
                  style={{ minWidth: 76, justifyContent: 'center' }}
                >
                  {on && <Check s={12} />}
                  {a}
                  {a === 2027 && <span className="t-caption" style={{ marginLeft: 4, opacity: 0.7 }}>(prosp.)</span>}
                </span>
              );
            })}
          </div>
          <div className="field-help">
            {state.annees.length > 1
              ? `Étude comparative · ${state.annees.length} timepoints · vue évolution`
              : "Étude à date unique"}
          </div>
        </div>

        {/* Critères de recherche sur la zone */}
        <div>
          <label className="field-label">Critères de recherche sur la zone</label>
          <div className="field-help" style={{ marginBottom: 10 }}>
            Indique à l'IA quelles informations rechercher et vérifier sur la zone choisie. Ce ne sont pas des filtres de livrabilité.
          </div>

          {/* Population min — seuil que l'IA va vérifier */}
          <div style={{ marginBottom: 14 }}>
            <label className="field-label" style={{ fontSize: 12 }}>
              Population minimale attendue
              <span className="t-caption" style={{ marginLeft: 6, fontWeight: 400 }}>· habitants</span>
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              className="input"
              placeholder="ex: 50000"
              value={state.minPopulation ?? ''}
              onChange={e => LouannStore.setField(dispatch, 'minPopulation', e.target.value === '' ? null : Number(e.target.value))}
            />
            <div className="field-help" style={{ fontSize: 11 }}>L'IA vérifie que la zone atteint ce seuil et le signale dans l'étude. Vide = pas de seuil.</div>
          </div>

          {/* Segments de revenus à rechercher (pas de valeur numérique) */}
          <div style={{ marginBottom: 14 }}>
            <label className="field-label" style={{ fontSize: 12 }}>Segments de revenus à rechercher</label>
            <div className="field-help" style={{ fontSize: 11, marginBottom: 8 }}>
              On ne saisit pas un revenu médian. On demande à l'IA d'identifier la présence de ces segments sur la zone.
            </div>
            <div className="chip-row" style={{ flexWrap: 'wrap' }}>
              {[
                { id: 'uhnwi',    label: 'UHNWI',            help: '≥ 30 M$ d\'actifs' },
                { id: 'hnwi',     label: 'HNWI',             help: '≥ 1 M$ d\'actifs' },
                { id: 'aisé',     label: 'Ménages aisés',    help: 'top 10% revenus' },
                { id: 'double',   label: 'Ménages bi-actifs',help: '2 revenus' },
                { id: 'moyen',    label: 'Ménages moyens',   help: 'classe médiane' },
                { id: 'modeste',  label: 'Ménages modestes', help: 'sous médiane' },
              ].map(seg => {
                const list = Array.isArray(state.incomeSegments) ? state.incomeSegments : [];
                const on = list.includes(seg.id);
                return (
                  <span
                    key={seg.id}
                    className={`chip ${on ? 'chip-on' : ''}`}
                    onClick={() => {
                      const next = on ? list.filter(x => x !== seg.id) : [...list, seg.id];
                      LouannStore.setField(dispatch, 'incomeSegments', next);
                    }}
                    title={seg.help}
                  >
                    {on && <Check s={12} />}
                    {seg.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Données démographiques à demander */}
          <div>
            <label className="field-label" style={{ fontSize: 12 }}>Données démographiques à rapporter</label>
            <div className="field-help" style={{ fontSize: 11, marginBottom: 8 }}>
              L'IA va aller chercher ces indicateurs pour la zone choisie et les afficher dans l'étude.
            </div>
            <div className="chip-row" style={{ flexWrap: 'wrap' }}>
              {[
                { id: 'pct_65',     label: '% de 65 ans et +' },
                { id: 'pct_75',     label: '% de 75 ans et +' },
                { id: 'pct_jeunes', label: '% de moins de 25 ans' },
                { id: 'pct_actifs', label: '% d\'actifs (25–64)' },
                { id: 'taille_men', label: 'Taille moyenne des ménages' },
                { id: 'evol_pop',   label: 'Évolution démographique' },
              ].map(d => {
                const list = Array.isArray(state.demoQueries) ? state.demoQueries : ['pct_65'];
                const on = list.includes(d.id);
                return (
                  <span
                    key={d.id}
                    className={`chip ${on ? 'chip-on' : ''}`}
                    onClick={() => {
                      const next = on ? list.filter(x => x !== d.id) : [...list, d.id];
                      LouannStore.setField(dispatch, 'demoQueries', next);
                    }}
                  >
                    {on && <Check s={12} />}
                    {d.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Encart légal — France SAP (V1 seul pays) */}
        <div className="legal-card">
          <div className="lab">🇫🇷 Cadre légal France · Services à la personne</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 10 }}>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 6, color: 'var(--red)', fontSize: 10 }}>Autorisations &amp; agrément</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                <strong>Agrément SAAD</strong> · délivré par l'ARS (obligatoire pour publics fragiles)<br/>
                <strong>Déclaration</strong> auprès de la DREETS (services aux actifs)<br/>
                <strong>Autorisation</strong> Conseil départemental (APA / PCH)
              </div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 6, color: 'var(--red)', fontSize: 10 }}>Fiscalité &amp; cotisations</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                <strong>TVA réduite</strong> 5,5% sur prestations SAP<br/>
                <strong>Crédit d'impôt</strong> 50% — plafond 12 000€/an<br/>
                <strong>Exonération charges</strong> sur public fragile (Art L241-10)
              </div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 6, color: 'var(--red)', fontSize: 10 }}>Conventions &amp; normes</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                <strong>IDCC 2941</strong> — Branche aide à domicile (BAD)<br/>
                <strong>NF X50-056</strong> — norme qualité services à la personne<br/>
                <strong>Cerfa 13350*05</strong> — déclaration d'activité
              </div>
            </div>
            <div>
              <div className="t-eyebrow" style={{ marginBottom: 6, color: 'var(--red)', fontSize: 10 }}>Données &amp; obligations</div>
              <div style={{ fontSize: 13, lineHeight: 1.55 }}>
                <strong>RGPD</strong> — registre RT, DPO si seniors fragiles<br/>
                <strong>Article D7231-1</strong> — liste officielle des 26 activités SAP<br/>
                <strong>Loi ASV 2015</strong> — réforme tarification &amp; CPOM
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px dashed rgba(230,57,70,0.3)', fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
            Encart inclus automatiquement dans la slide 10 « Cadre réglementaire » de l'étude.
          </div>
        </div>
      </div>
      <WizardNav
        step={2}
        onNext={next}
        nextDisabled={state.villes.length === 0 || state.annees.length === 0}
      />
    </>
  );
}

// =============================================================
// STEP 3 — Secteur & cible (pills + cible grid)
// =============================================================
function Step3() {
  const { state, dispatch } = LouannStore.useWizard();
  const [showHiddenSvc, setShowHiddenSvc] = useState(false);
  const [showHiddenTgt, setShowHiddenTgt] = useState(false);
  const guidance = LouannData.brandGuidance || {};
  const titles = guidance.sectionTitles || {};
  const helpers = guidance.helperTexts || {};
  const next = () => {
    LouannStore.markStepDone(dispatch, 3);
    LouannStore.go('/wizard/4');
  };

  const splitItems = (items, showHidden) => {
    const visible = items.filter((x) => !x._hidden);
    const hiddenItems = items.filter((x) => x._hidden);
    return { visible, hiddenItems, showHidden: showHidden && hiddenItems.length };
  };

  const svc = splitItems(LouannData.sousSecteurs, showHiddenSvc);
  const tgt = splitItems(LouannData.cibles, showHiddenTgt);
  const RecoBadge = () => (
    <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--red)', background: 'var(--red-tint, rgba(228,30,30,.08))', borderRadius: 6, padding: '2px 6px', marginLeft: 6, letterSpacing: '.5px' }}>RECO</span>
  );
  return (
    <>
      <StepHead
        n={3}
        title={titles.activities ? titles.activities : "Activité & clientèle cible"}
        sub={helpers.activities || "V1 spécialisée Services à la personne. Cochez ce que vous proposez et qui vous visez."}
      />
      <div className="step-body">
        {/* Secteur */}
        <div>
          <label className="field-label">Secteur</label>
          <div className="row gap-2 wrap">
            <span className="pill red on">
              <Lock />
              Service à la personne
            </span>
            <span className="pill disabled">Retail (bientôt)</span>
            <span className="pill disabled">F&amp;B (bientôt)</span>
            <span className="pill disabled">B2B Tech (bientôt)</span>
          </div>
          <div className="field-help" style={{ marginTop: 6 }}>
            ↳ Sous-branche active
          </div>
          <div className="row gap-2 wrap" style={{ marginTop: 4 }}>
            <span className="pill red on">
              <Lock />
              Senior care
            </span>
            <span className="pill disabled">Garde d'enfants (bientôt)</span>
            <span className="pill disabled">Handicap (bientôt)</span>
          </div>
        </div>

        {/* Sous-secteurs */}
        <div>
          <label className="field-label">{titles.activities ? `${titles.activities} · cochez ce que vous proposez` : 'Sous-secteurs · cochez ce que vous proposez'}</label>
          <div className="row gap-2 wrap">
            {svc.visible.map(ss => {
              const on = state.sousSecteurs.includes(ss.key);
              return (
                <span
                  key={ss.key}
                  className={`pill ${on ? 'on' : ''} ${ss._secondary ? 'secondary' : ''}`}
                  onClick={() => LouannStore.toggleIn(dispatch, 'sousSecteurs', ss.key)}
                  style={ss._secondary ? { opacity: 0.85 } : undefined}
                >
                  {on ? <Check s={12} /> : null}
                  {ss.label}
                  {ss._reco ? <RecoBadge /> : null}
                </span>
              );
            })}
          </div>
          {svc.hiddenItems.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button type="button" className="ghost-btn" onClick={() => setShowHiddenSvc(v => !v)} style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>
                {showHiddenSvc ? '— Masquer les options avancées' : `+ Voir ${svc.hiddenItems.length} options avancées`}
              </button>
              {showHiddenSvc && (
                <div className="row gap-2 wrap" style={{ marginTop: 6 }}>
                  {svc.hiddenItems.map(ss => {
                    const on = state.sousSecteurs.includes(ss.key);
                    return (
                      <span key={ss.key} className={`pill ${on ? 'on' : ''}`} onClick={() => LouannStore.toggleIn(dispatch, 'sousSecteurs', ss.key)} style={{ opacity: 0.8 }}>
                        {on ? <Check s={12} /> : null}
                        {ss.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="field-help">
            {state.sousSecteurs.length} sous-secteur{state.sousSecteurs.length > 1 ? 's' : ''} sélectionné{state.sousSecteurs.length > 1 ? 's' : ''}
          </div>
        </div>

        {/* Clientèle */}
        <div>
          <label className="field-label">{titles.targets ? `${titles.targets} · 1 à 4 segments` : 'Clientèle visée · 1 à 4 segments'}</label>
          {helpers.targets && <div className="field-help" style={{ marginBottom: 8 }}>{helpers.targets}</div>}
          <div className="persona-grid">
            {tgt.visible.map(c => {
              const on = state.cibles.includes(c.key);
              return (
                <OptCard
                  key={c.key}
                  on={on}
                  onClick={() => LouannStore.toggleIn(dispatch, 'cibles', c.key)}
                  title={c._reco ? `★ ${c.label}` : c.label}
                  desc={c.desc}
                  multi
                />
              );
            })}
          </div>
          {tgt.hiddenItems.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => setShowHiddenTgt(v => !v)} style={{ fontSize: 12, color: 'var(--ink-3)', textDecoration: 'underline', background: 'none', border: 0, cursor: 'pointer', padding: 0 }}>
                {showHiddenTgt ? '— Masquer les cibles avancées' : `+ Voir ${tgt.hiddenItems.length} cibles avancées`}
              </button>
              {showHiddenTgt && (
                <div className="persona-grid" style={{ marginTop: 6 }}>
                  {tgt.hiddenItems.map(c => {
                    const on = state.cibles.includes(c.key);
                    return (
                      <OptCard key={c.key} on={on} onClick={() => LouannStore.toggleIn(dispatch, 'cibles', c.key)} title={c.label} desc={c.desc} multi />
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="field-help">
            {state.cibles.length} segment{state.cibles.length > 1 ? 's' : ''} ciblé{state.cibles.length > 1 ? 's' : ''} · Louann générera {Math.max(state.cibles.length, 1)} persona{state.cibles.length > 1 ? 's' : ''} détaillé{state.cibles.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <WizardNav
        step={3}
        onNext={next}
        nextDisabled={state.sousSecteurs.length === 0 || state.cibles.length === 0}
      />
    </>
  );
}

// =============================================================
// STEP 4 — Palette (grille 6 swatches + live preview)
// =============================================================
function Step4() {
  const { state, dispatch } = LouannStore.useWizard();
  const marques = LouannData.marques || [];
  const currentMarque = marques.find(m => m.key === state.marque);
  const brandLocked = !!(currentMarque && currentMarque.key !== 'custom');
  const brandPalette = brandLocked
    ? (LouannData.palettes || []).find(p => p.key === currentMarque.palette)
    : null;

  // Si une marque est sélectionnée, force la palette de marque
  useEffect(() => {
    if (brandLocked && brandPalette && state.palette !== brandPalette.key) {
      LouannStore.setField(dispatch, 'palette', brandPalette.key);
    }
    if (brandLocked && currentMarque && !state.clientName) {
      LouannStore.setField(dispatch, 'clientName', currentMarque.name);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandLocked, brandPalette && brandPalette.key]);

  const next = () => {
    LouannStore.markStepDone(dispatch, 4);
    LouannStore.go('/wizard/5');
  };

  return (
    <>
      <StepHead
        n={4}
        title="Identité visuelle"
        sub={brandLocked
          ? `Identité gérée côté marque · ${currentMarque.name}. Aucune action requise.`
          : "6 présets éprouvés · ou couleurs personnalisées. Logo et nom client optionnels."}
      />
      <div className="step-body">
        {brandLocked ? (
          <div className="legal-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 6 }}>Marque sélectionnée</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{currentMarque.name}</div>
              {currentMarque.tagline && <div style={{ color: 'var(--ink-3)', fontSize: 12, marginBottom: 8 }}>{currentMarque.tagline}</div>}
              <div style={{ color: 'var(--ink-3)', fontSize: 12 }}>
                Logo, charte graphique et palette sont définis dans la fiche marque (administration).
                Le rapport hérite automatiquement de cette identité.
              </div>
            </div>
            {brandPalette && (
              <div>
                <div className="t-eyebrow" style={{ color: 'var(--red)', fontSize: 10, marginBottom: 6 }}>Palette appliquée</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: brandPalette.primary, border: '1px solid var(--ink-5)' }} title="Primary"></span>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: brandPalette.secondary, border: '1px solid var(--ink-5)' }} title="Secondary"></span>
                  <span style={{ width: 28, height: 28, borderRadius: 6, background: brandPalette.tertiary, border: '1px solid var(--ink-5)' }} title="Tertiary"></span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  <strong>{brandPalette.name}</strong> · {brandPalette.hex}
                </div>
                <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                  Pour modifier la charte, passez par l'admin de la marque.
                </div>
              </div>
            )}
          </div>
        ) : (
        <>
        <div>
          <label className="field-label">Choisissez une palette</label>
          <div className="palette-grid">
            {LouannData.palettes.map(p => (
              <div
                key={p.key}
                className={`pal-card ${state.palette === p.key ? 'on' : ''}`}
                onClick={() => LouannStore.setField(dispatch, 'palette', p.key)}
              >
                <div className="pal-head">
                  <span className="pal-name">{p.name}</span>
                  <Radio checked={state.palette === p.key} />
                </div>
                <div className="swatches">
                  <span className="sw" style={{ background: p.primary }}></span>
                  <span className="sw" style={{ background: p.secondary }}></span>
                  <span className="sw" style={{ background: p.tertiary, borderColor: p.tertiary === '#FFFFFF' || p.tertiary.startsWith('#F') ? 'var(--ink-5)' : 'transparent' }}></span>
                </div>
                <div className="mini-slide">
                  <div className="slide-bar lg" style={{ width: '60%', background: p.tertiary === '#F8FAF9' || p.tertiary === '#FFF' ? 'var(--ink)' : 'var(--ink)' }}></div>
                  <div className="slide-bar accent" style={{ background: p.primary, width: 30 }}></div>
                  <div className="slide-bar med" style={{ width: '85%' }}></div>
                  <div style={{ flex: 1, background: 'var(--surface-3)', borderRadius: 3 }}></div>
                </div>
                <span className="hex">{p.hex}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label className="field-label">Nom du client (cover)</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Bonadea Care, Mon agence SAP…"
              value={state.clientName}
              onChange={e => LouannStore.setField(dispatch, 'clientName', e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Logo client (optionnel)</label>
            <label className="input" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, color: state.clientLogo ? 'var(--ink)' : 'var(--ink-4)' }}>
              <input
                type="file"
                accept=".png,.svg,.jpg"
                style={{ display: 'none' }}
                onChange={e => {
                  const f = e.target.files[0];
                  if (f) LouannStore.setField(dispatch, 'clientLogo', f.name);
                }}
              />
              {state.clientLogo ? `📎 ${state.clientLogo}` : '⤴ Déposez un logo (PNG · SVG · JPG)'}
            </label>
          </div>
        </div>
        </>
        )}
      </div>
      <WizardNav step={4} onNext={next} />
    </>
  );
}

// =============================================================
// STEP 5 — KPI (catégories rail + counter)
// =============================================================
function Step5() {
  const { state, dispatch } = LouannStore.useWizard();
  const kpiCats = LouannData.kpiCategories;
  const [activeCat, setActiveCat] = useState((kpiCats[0] && kpiCats[0].key) || 'demographie');

  const kpis = LouannData.kpis;
  const cats = LouannData.kpiCategories;

  const counts = cats.reduce((acc, c) => {
    acc[c.key] = kpis.filter(k => k.cat === c.key && state.kpiSelected.includes(k.key)).length;
    return acc;
  }, {});

  const totals = cats.reduce((acc, c) => {
    acc[c.key] = kpis.filter(k => k.cat === c.key).length;
    return acc;
  }, {});

  const visible = kpis.filter(k => k.cat === activeCat);

  const toggle = (key) => LouannStore.toggleIn(dispatch, 'kpiSelected', key);

  const [submitting, setSubmitting] = useState(false);

  const next = async () => {
    if (submitting) return;
    setSubmitting(true);
    LouannStore.markStepDone(dispatch, 5);

    // Mapping catégories KPI wizard → colonnes jsonb DB
    const KPI_CAT_TO_COL = {
      market_kpis:     ['demographie', 'demande', 'economie'],
      hr_kpis:         ['rh'],
      transport_kpis:  ['mobilite'],
      competition_kpis:['concurrence'],
      synthesis_kpis:  ['reglementaire', 'risques'],
    };
    const kpiByCat = (cats) =>
      (state.kpiSelected || []).filter((key) => {
        const def = LouannData.kpis.find((k) => k.key === key);
        return def && cats.includes(def.cat);
      });

    const villes = state.villesData || [];
    const primary = villes[0] || {};
    const cityName = primary.ville || primary.name || 'Bordeaux';
    const postal = primary.codePostal || primary.cp || null;
    const typeStudy = state.typeEtude || 'complete';

    const payload = {
      city_name: cityName,
      postal_code: postal,
      study_type: typeStudy,
      included_activity_families: state.sousSecteurs || [],
      palette_key: state.palette || null,
      deliverable_format: 'pdf',
      title: `Étude ${cityName} · ${typeStudy}`,
      market_kpis:     kpiByCat(KPI_CAT_TO_COL.market_kpis),
      hr_kpis:         kpiByCat(KPI_CAT_TO_COL.hr_kpis),
      transport_kpis:  kpiByCat(KPI_CAT_TO_COL.transport_kpis),
      competition_kpis:kpiByCat(KPI_CAT_TO_COL.competition_kpis),
      synthesis_kpis:  kpiByCat(KPI_CAT_TO_COL.synthesis_kpis),
    };

    // v3.2 — typologie + company injectés via querystring iframe ou state
    try {
      const sp = new URLSearchParams(window.location.search);
      // Fallback : si l'utilisateur entre directement dans le wizard (sans
      // passer par le picker), on dérive les codes officiels depuis le type
      // d'étude choisi à l'étape 1 (state.typeEtude = FE/EM/AC/ED/MP/DD).
      const cat = state.studyCategoryCode || sp.get('category') || state.typeEtude || null;
      const sub = state.studySubtypeCode || sp.get('subtype') || state.typeEtude || null;
      const cid = state.companyId || sp.get('company_id') || null;
      if (cat) payload.study_category_code = cat;
      if (sub) payload.study_subtype_code = sub;
      if (cid) payload.company_id = cid;
    } catch (_) {}

    // Récupère le token Supabase depuis le localStorage partagé avec le parent
    function readSupabaseToken() {
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

    // v3.3 — pilotage par cases cochées (skills KPI/Gabarits)
    payload.target_publics = state.cibles || [];
    payload.commune_types = state.communeTypes || [];
    payload.zone_focus = state.zoneTypes || [];
    payload.reference_years = state.annees || [];
    payload.road_axes = [
      ...(state.axesRoutiers || []),
      ...(state.axesRoutiersCustom || []),
    ];
    payload.demographic_segments = state.segments || {};
    payload.risks = state.risks || [];

    const token = readSupabaseToken();
    if (!token) {
      alert('Session expirée. Reconnectez-vous.');
      if (window.top) window.top.location.href = '/login';
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/wizard/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.studyId) {
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      LouannStore.setField(dispatch, 'currentStudyId', body.studyId);
      LouannStore.go(`/generation?id=${body.studyId}`);
    } catch (e) {
      console.error('[wizard] submit failed', e);
      alert(`Échec de la génération : ${e.message || e}`);
      setSubmitting(false);
    }
  };

  return (
    <>
      <StepHead
        n={5}
        title="KPI à afficher dans les slides"
        sub="Préset chargé selon le type d'étude · ajustez par catégorie. Min 6, max 20 KPI."
      />
      <div className="step-body">
        <div className="kpi-shell">
          {/* Categories rail */}
          <div className="kpi-cats">
            <span className="t-eyebrow" style={{ marginBottom: 8 }}>Catégories</span>
            {cats.map(c => (
              <button
                key={c.key}
                className={`kpi-cat-btn ${activeCat === c.key ? 'on' : ''}`}
                onClick={() => setActiveCat(c.key)}
              >
                <span>{c.icon} {c.label}</span>
                <span className="count">{counts[c.key]}/{totals[c.key] || 0}</span>
              </button>
            ))}
          </div>

          {/* KPI list */}
          <div className="stack gap-3">
            <div className="row between center">
              <h3 style={{ fontFamily: 'Outfit', fontSize: 17, margin: 0 }}>
                {cats.find(c => c.key === activeCat)?.icon} {cats.find(c => c.key === activeCat)?.label}
              </h3>
              <span className="t-caption">
                {counts[activeCat]} / {kpis.filter(k => k.cat === activeCat).length} sélectionné{counts[activeCat] > 1 ? 's' : ''}
              </span>
            </div>
            <div className="kpi-list">
              {visible.map(k => {
                const on = state.kpiSelected.includes(k.key);
                return (
                  <div
                    key={k.key}
                    className={`kpi-row ${on ? 'on' : ''}`}
                    onClick={() => toggle(k.key)}
                  >
                    <CheckBox checked={on} onChange={() => toggle(k.key)} />
                    <span className="name">{k.name}</span>
                    <span className="src">{k.src}</span>
                  </div>
                );
              })}
            </div>

            {/* Sticky counter */}
            <div className="kpi-counter" style={{ marginTop: 24 }}>
              <div className="big">{state.kpiSelected.length}</div>
              <div className="lbl">KPI sélectionnés</div>
              <div className="meta">→ {state.kpiSelected.length < 6 ? 'min 6 requis' : 'prêt à générer'}</div>
            </div>
          </div>
        </div>
        {/* Volume adapté automatiquement */}
        <div style={{ marginTop: 24, padding: '16px 20px', background: '#EFF6FF', borderLeft: '4px solid #3B82F6', borderRadius: 8, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: '#3B82F6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, marginTop: 2 }}>
            i
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#1e3a8a', margin: '0 0 6px 0' }}>
              Volume adapté automatiquement à votre commune
            </p>
            <p style={{ fontSize: 13, color: '#1e40af', margin: 0, lineHeight: 1.5 }}>
              Notre IA analyse la richesse des données disponibles (concurrents identifiés, sources statistiques actives, profondeur démographique) et adapte le nombre de slides en conséquence. Une étude type contient entre 11 et 25 slides selon la quantité de data réelle, sans bourrage de contenu.
            </p>
            <p style={{ fontSize: 12, color: '#3b82f6', margin: '8px 0 0 0', fontStyle: 'italic' }}>
              Principe : précision avant volume.
            </p>
          </div>
        </div>
      </div>
      <WizardNav
        step={5}
        onNext={next}
        nextLabel={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Sparkle s={14} /> Générer mon étude
          </span>
        }
        nextDisabled={state.kpiSelected.length < 6}
      />
    </>
  );
}

// ====== EXPORT ======
// ============================================================
// STEP 6 — Récap & génération (mode auto / preset complet)
// ============================================================
function Step6Recap() {
  const { state, dispatch } = LouannStore.useWizard();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState(null);

  const villes = state.villesData || [];
  const primary = villes[0] || {};
  const cityName = primary.ville || primary.name || '—';
  const cityList = villes.length
    ? villes.map((v) => v.ville || v.name).filter(Boolean).join(', ')
    : '—';

  const sousSecteursLabels = (state.sousSecteurs || []).map((code) => {
    const x = (LouannData.sousSecteurs || []).find((s) => s.key === code);
    return x ? x.label : code;
  });
  const ciblesLabels = (state.cibles || []).map((code) => {
    const x = (LouannData.cibles || []).find((c) => c.key === code);
    return x ? x.label : code;
  });
  const guidance = LouannData.brandGuidance || {};
  const paletteLabel = (guidance.colors && guidance.colors.primary)
    ? `${state.clientName || 'Marque'} (${guidance.colors.primary})`
    : state.palette || '—';

  const submit = async () => {
    if (submitting) return;
    setErr(null);
    setSubmitting(true);
    LouannStore.markStepDone(dispatch, 6);

    const KPI_CAT_TO_COL = {
      market_kpis:     ['demographie', 'demande', 'economie'],
      hr_kpis:         ['rh'],
      transport_kpis:  ['mobilite'],
      competition_kpis:['concurrence'],
      synthesis_kpis:  ['reglementaire', 'risques'],
    };
    const kpiByCat = (cats) =>
      (state.kpiSelected || []).filter((key) => {
        const def = LouannData.kpis.find((k) => k.key === key);
        return def && cats.includes(def.cat);
      });

    const postal = primary.codePostal || primary.cp || null;
    const typeStudy = state.typeEtude || 'complete';
    const payload = {
      city_name: cityName,
      postal_code: postal,
      study_type: typeStudy,
      included_activity_families: state.sousSecteurs || [],
      palette_key: state.palette || null,
      deliverable_format: 'pdf',
      title: `Étude ${cityName} · ${typeStudy}`,
      market_kpis:     kpiByCat(KPI_CAT_TO_COL.market_kpis),
      hr_kpis:         kpiByCat(KPI_CAT_TO_COL.hr_kpis),
      transport_kpis:  kpiByCat(KPI_CAT_TO_COL.transport_kpis),
      competition_kpis:kpiByCat(KPI_CAT_TO_COL.competition_kpis),
      synthesis_kpis:  kpiByCat(KPI_CAT_TO_COL.synthesis_kpis),
    };
    // v3.3 — pilotage par cases cochées (skills KPI/Gabarits)
    payload.target_publics = state.cibles || [];
    payload.commune_types = state.communeTypes || [];
    payload.zone_focus = state.zoneTypes || [];
    payload.reference_years = state.annees || [];
    payload.road_axes = [
      ...(state.axesRoutiers || []),
      ...(state.axesRoutiersCustom || []),
    ];
    payload.demographic_segments = state.segments || {};
    payload.risks = state.risks || [];

    try {
      const sp = new URLSearchParams(window.location.search);
      const cat = state.studyCategoryCode || sp.get('category') || state.typeEtude || null;
      const sub = state.studySubtypeCode || sp.get('subtype') || state.typeEtude || null;
      const cid = state.companyId || sp.get('company_id') || null;
      if (cat) payload.study_category_code = cat;
      if (sub) payload.study_subtype_code = sub;
      if (cid) payload.company_id = cid;
    } catch (_) {}

    let token = null;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith('sb-') || !k.endsWith('-auth-token')) continue;
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.access_token) { token = parsed.access_token; break; }
      }
    } catch (_) {}
    if (!token) {
      setErr('Session expirée. Reconnectez-vous.');
      if (window.top) window.top.location.href = '/login';
      setSubmitting(false);
      return;
    }
    try {
      const res = await fetch('/api/wizard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.studyId) throw new Error(body.error || `HTTP ${res.status}`);
      LouannStore.setField(dispatch, 'currentStudyId', body.studyId);
      LouannStore.go(`/generation?id=${body.studyId}`);
    } catch (e) {
      console.error('[wizard] submit failed', e);
      setErr(e.message || String(e));
      setSubmitting(false);
    }
  };

  const goBack = () => { window.location.hash = '#/wizard/2'; };
  const goAdvanced = () => {
    // Bascule temporairement en mode manual pour permettre Step3/4/5
    LouannStore.setField(dispatch, 'presetMode', 'manual');
    window.location.hash = '#/wizard/3';
  };

  const ready = (state.villes && state.villes.length > 0)
    && state.annees && state.annees.length > 0;

  return (
    <>
      <StepHead
        n={6}
        total={6}
        title="Récap de l'étude"
        sub="Tous les paramètres sont préchargés depuis votre marque. Vérifiez puis générez."
      />
      <div className="step-body">
        <div style={{ border: '1px solid var(--ink-5)', borderRadius: 14, padding: 20, background: 'var(--surface-1)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 14 }}>
            <div><strong>📊 Type :</strong> {state.subtypeDisplayName || state.studySubtypeCode || state.typeEtude || '—'}</div>
            <div><strong>🏢 Marque :</strong> {state.companyDisplayName || state.clientName || '—'}</div>
            <div><strong>📍 Ville(s) :</strong> {cityList}</div>
            <div><strong>📅 Année(s) :</strong> {(state.annees || []).join(', ') || '—'}</div>
            <div><strong>🎨 Palette :</strong> {paletteLabel}</div>
            <div><strong>🏷️ Sous-secteurs :</strong> {sousSecteursLabels.join(', ') || '—'}</div>
            <div><strong>👥 Cibles :</strong> {ciblesLabels.join(', ') || '—'}</div>
            <div><strong>📊 KPI :</strong> {(state.kpiSelected || []).length} sélectionnés</div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px dashed var(--ink-5)' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={goAdvanced}
              style={{ fontSize: 13 }}
            >
              ▶ Modifier KPI / cibles / palette (mode avancé)
            </button>
          </div>
        </div>
        {!ready && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#FEF3C7', color: '#92400E', fontSize: 13 }}>
            ⚠ Sélectionnez au moins une ville et une année à l'étape « Où & quand ».
          </div>
        )}
        {err && (
          <div style={{ marginTop: 14, padding: 12, borderRadius: 8, background: '#FEE2E2', color: '#991B1B', fontSize: 13 }}>
            Échec de la génération : {err}
          </div>
        )}
      </div>
      <div className="wizard-nav">
        <div>
          <button className="btn btn-ghost" onClick={goBack}>
            <ArrowLeft /> Retour
          </button>
        </div>
        <div className="row center gap-3">
          <button
            className="btn btn-primary btn-lg"
            onClick={submit}
            disabled={submitting || !ready}
          >
            {submitting ? '⏳ Génération…' : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Sparkle s={14} /> Générer mon étude
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ====== EXPORT ======
Object.assign(window, { Step1, Step2, Step3, Step4, Step5, Step6: Step6Recap });
