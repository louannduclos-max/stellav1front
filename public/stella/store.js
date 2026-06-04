// Louann V1 — Store + simple hash router
// React Context + reducer + localStorage

(function () {
  const LS_KEY = 'louann.wizard.v2';

  const DEFAULT_STATE = {
    marque: null,
    continent: 'EU',
    pays: 'FR',
    typeEtude: 'complete',
    geoMode: 'villes',           // 'villes' | 'quartiers'
    villes: [],                   // array of selected ville keys (or quartier keys when geoMode='quartiers')
    villesData: [],               // array of full ville/quartier objects
    annees: [2026],               // multi-year
    sousSecteurs: ['menage_entretien', 'aide_domicile_pa'],
    cibles: ['familles_actives', 'senior_autonome'],
    segments: { p65: 38, p75: 42, p85: 20 },
    zoneTypes: ['ville'],
    communeTypes: ['urbaine_dense'],
    axesRoutiers: [],
    axesRoutiersAI: [],          // axes suggérés par l'IA pour la ville en cours
    axesRoutiersCustom: [],      // axes ajoutés manuellement
    axesRoutiersAIMeta: { city: null, loading: false, error: null },
    quartiers: ['Caudéran', 'Chartrons'],
    quartiersCustom: [],
    budget: [800, 1600],
    palette: 'flexibia',
    paletteCustom: { primary: '#E63946', secondary: '#C1440E' },
    clientName: '',
    clientLogo: null,
    kpiSelected: ['pop_senior_65', 'evol_demo_2020_2030', 'densite_gerontologique', 'revenu_median_seniors', 'taux_penetration_sap', 'nb_heures_sap_an', 'top_services_demandes', 'turnover_secteur', 'salaire_moyen_brut', 'nb_acteurs_sap', 'top5_parts_marche', 'volume_marche_local'],
    // v3.2 — typologie + company préchargées via querystring iframe
    studyCategoryCode: null,
    studySubtypeCode: null,
    companyId: null,
    // v3.2-bis — wizard simplifié (auto = 2 étapes, manual = legacy 5 étapes)
    presetMode: null,          // null | 'auto' | 'manual'
    presetLoaded: false,
    companyDisplayName: null,
    subtypeDisplayName: null,
    categoryDisplayName: null,
    completedSteps: []
  };

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const base = raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
      // Lecture du querystring iframe — toujours prioritaire (nouvelle étude)
      try {
        const sp = new URLSearchParams(window.location.search);
        const cid = sp.get('company_id');
        const cat = sp.get('category');
        const sub = sp.get('subtype');
        const subLabel = sp.get('subtype_label');
        const catLabel = sp.get('category_label');
        const compName = sp.get('company_name');
        if (cid) {
          // Si la company change, on reset le wizard pour repartir propre.
          if (base.companyId && base.companyId !== cid) {
            return {
              ...DEFAULT_STATE,
              companyId: cid,
              studyCategoryCode: cat || null,
              studySubtypeCode: sub || null,
              subtypeDisplayName: subLabel || null,
              categoryDisplayName: catLabel || null,
              companyDisplayName: compName || null,
              presetMode: 'auto',
              presetLoaded: false,
            };
          }
          base.companyId = cid;
          base.presetMode = base.presetMode || 'auto';
        }
        if (cat) base.studyCategoryCode = cat;
        if (sub) base.studySubtypeCode = sub;
        if (subLabel) base.subtypeDisplayName = subLabel;
        if (catLabel) base.categoryDisplayName = catLabel;
        if (compName) base.companyDisplayName = compName;
      } catch (_) {}
      return base;
    } catch (e) {
      return { ...DEFAULT_STATE };
    }
  }

  function save(state) {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function reducer(state, action) {
    switch (action.type) {
      case 'SET': return { ...state, ...action.payload };
      case 'TOGGLE_IN_ARRAY': {
        const arr = state[action.key] || [];
        const next = arr.includes(action.value)
          ? arr.filter(v => v !== action.value)
          : [...arr, action.value];
        return { ...state, [action.key]: next };
      }
      case 'MARK_DONE': {
        const set = new Set(state.completedSteps);
        set.add(action.step);
        return { ...state, completedSteps: Array.from(set) };
      }
      case 'RESET':
        return { ...DEFAULT_STATE };
      default: return state;
    }
  }

  // ====== STORE CONTEXT ======
  const WizardContext = React.createContext(null);

  function WizardProvider({ children }) {
    const [state, dispatch] = React.useReducer(reducer, null, load);

    React.useEffect(() => { save(state); }, [state]);

    // Auto-redirect : en mode auto, l'étape 3 (Secteur&cible) est skippée → bascule directe au récap.
    React.useEffect(() => {
      const onHash = () => {
        if (state.presetMode !== 'auto') return;
        const h = window.location.hash;
        if (h === '#/wizard/3' || h === '#/wizard/4' || h === '#/wizard/5') {
          window.location.replace('#/wizard/6');
        }
        if (h === '#/wizard/1') {
          window.location.replace('#/wizard/2');
        }
      };
      onHash();
      window.addEventListener('hashchange', onHash);
      return () => window.removeEventListener('hashchange', onHash);
    }, [state.presetMode]);

    // Autoload preset depuis company_id (une seule fois)
    React.useEffect(() => {
      if (!state.companyId || state.presetLoaded) return;
      if (!window.LouannBrandPreset) return;
      let cancelled = false;
      (async () => {
        try {
          const payload = await window.LouannBrandPreset.fetchBrandPresetById(
            state.companyId,
            { category: state.studyCategoryCode, subtype: state.studySubtypeCode },
          );
          if (cancelled) return;
          if (!payload) {
            // Pas de preset → wizard manuel (legacy 5 étapes)
            dispatch({ type: 'SET', payload: { presetMode: 'manual', presetLoaded: true } });
            if (window.location.hash.startsWith('#/wizard/')) {
              window.location.replace('#/wizard/1');
            }
            return;
          }
          window.LouannBrandPreset.applyBrandPreset(payload);
          const patch = { presetLoaded: true };
          const preset = payload.preset || {};
          const hasPreset = !!preset && (
            (preset.default_kpis && preset.default_kpis.length) ||
            (preset.default_activity_families && preset.default_activity_families.length) ||
            (preset.default_target_publics && preset.default_target_publics.length)
          );
          patch.presetMode = hasPreset ? 'auto' : 'manual';
          if (!hasPreset && window.location.hash.startsWith('#/wizard/')) {
            setTimeout(() => window.location.replace('#/wizard/1'), 0);
          }
          // Brand display
          patch.companyDisplayName = (payload.company && payload.company.name) || null;
          patch.clientName = patch.companyDisplayName || '';
          const g = (payload.preset && payload.preset.guidance) || {};
          if (payload.branding && payload.branding.logo_primary_url) {
            patch.clientLogo = payload.branding.logo_primary_url;
          }
          // Services + cibles par défaut
          const services = (window.LouannData.sousSecteurs || [])
            .filter((x) => x._default).map((x) => x.key);
          const cibles = (window.LouannData.cibles || [])
            .filter((x) => x._default).map((x) => x.key);
          if (services.length) patch.sousSecteurs = services;
          if (cibles.length) patch.cibles = cibles;
          // KPI preset
          const pickDefaults = (arr) => Array.isArray(arr)
            ? arr.filter((x) => x && (x.is_default || x.default)).map((x) => x.code || x.key)
            : [];
          const presetKpis = pickDefaults(preset.default_kpis);
          if (presetKpis.length) patch.kpiSelected = presetKpis;
          const presetYears = pickDefaults(preset.default_reference_years).map((y) => parseInt(y, 10)).filter(Boolean);
          if (presetYears.length) patch.annees = presetYears;
          // Recommended study type → typeEtude
          if (g.study_type_recommendation && g.study_type_recommendation.code) {
            patch.typeEtude = g.study_type_recommendation.code;
          }
          // Palette (utilise primary_color comme key approximative)
          // brand-preset.js a déjà hydraté brandGuidance.colors ; on garde palette state actuelle.
          dispatch({ type: 'SET', payload: patch });
        } catch (e) {
          console.warn('[wizard] autoload preset failed', e);
          if (!cancelled) {
            dispatch({ type: 'SET', payload: { presetMode: 'manual', presetLoaded: true } });
          }
        }
      })();
      return () => { cancelled = true; };
    }, [state.companyId, state.presetLoaded]);

    const value = React.useMemo(() => ({ state, dispatch }), [state]);
    return React.createElement(WizardContext.Provider, { value }, children);
  }

  function useWizard() {
    const ctx = React.useContext(WizardContext);
    if (!ctx) throw new Error('useWizard must be inside WizardProvider');
    return ctx;
  }

  // Helpers
  function setField(dispatch, key, value) {
    dispatch({ type: 'SET', payload: { [key]: value } });
  }
  function setFields(dispatch, payload) {
    dispatch({ type: 'SET', payload });
  }
  function toggleIn(dispatch, key, value) {
    dispatch({ type: 'TOGGLE_IN_ARRAY', key, value });
  }
  function markStepDone(dispatch, step) {
    dispatch({ type: 'MARK_DONE', step });
  }

  // ====== HASH ROUTER ======
  function parseHash() {
    const h = window.location.hash.replace(/^#/, '') || '/';
    // Strip query string before splitting ('/generation?id=XXX' → '/generation')
    const hClean = h.split('?')[0];
    const parts = hClean.split('/').filter(Boolean);
    if (parts.length === 0) return { name: 'landing' };
    if (parts[0] === 'wizard') {
      const step = parseInt(parts[1] || '1', 10);
      return { name: 'wizard', step: Math.min(Math.max(step, 1), 6) };
    }
    if (parts[0] === 'generation') return { name: 'generation' };
    if (parts[0] === 'result') return { name: 'result' };
    if (parts[0] === 'example') return { name: 'example' };
    return { name: 'landing' };
  }

  function useRoute() {
    const [route, setRoute] = React.useState(parseHash());
    React.useEffect(() => {
      const fn = () => {
        setRoute(parseHash());
        window.scrollTo({ top: 0, behavior: 'auto' });
      };
      window.addEventListener('hashchange', fn);
      return () => window.removeEventListener('hashchange', fn);
    }, []);
    return route;
  }

  function go(path) {
    window.location.hash = path;
  }

  // ====== EXPORT ======
  window.LouannStore = {
    WizardProvider, useWizard, setField, setFields, toggleIn, markStepDone,
    useRoute, go, DEFAULT_STATE
  };
})();
