// Louann V2 — Brand preset loader
// Bridges static LouannData with the admin-managed brand preset (DB).
// Non-blocking: on failure, falls back to LouannData.

(function () {
  // Map Louann static marque keys -> DB company slug
  const SLUG_MAP = {
    interdom: 'interdomicilio',
    ouicare: 'ouicare',
    bonadea: 'bonadea-care',
  };

  const cache = {};

  async function fetchBrandPreset(slug, opts = {}) {
    const qs = new URLSearchParams();
    if (opts.category) qs.set('category', opts.category);
    if (opts.subtype) qs.set('subtype', opts.subtype);
    const key = qs.toString() ? `${slug}?${qs.toString()}` : slug;
    if (cache[key]) return cache[key];
    try {
      const url = qs.toString()
        ? `/api/public/brand-preset/${slug}?${qs.toString()}`
        : `/api/public/brand-preset/${slug}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cache[key] = data;
      return data;
    } catch (e) {
      console.warn('[brand-preset] fetch failed', slug, e);
      return null;
    }
  }

  async function fetchBrandPresetById(companyId, opts = {}) {
    if (!companyId) return null;
    return fetchBrandPreset(companyId, opts);
  }

  function resolveSlug(marqueKey) {
    return SLUG_MAP[marqueKey] || marqueKey;
  }

  // Apply the DB preset to LouannData (mutates window.LouannData).
  // - Replaces sousSecteurs catalog by DB sap_activities, reordered:
  //   recommended -> default -> secondary -> hidden (hidden gated).
  // - Replaces cibles catalog by DB target_publics, same ordering.
  // - Stores brand summary + helpers on LouannData.brandGuidance.
  function applyBrandPreset(payload) {
    if (!payload || !payload.catalog) return;
    const g = (payload.preset && payload.preset.guidance) || {};
    const presetTargets = (payload.preset && payload.preset.default_target_publics) || [];
    const presetServices = (payload.preset && payload.preset.default_activity_families) || [];
    const recoSvc = (g.recommended && g.recommended.activities) || [];
    const recoTgt = (g.recommended && g.recommended.targets) || [];
    const secSvc = (g.secondary && g.secondary.activities) || [];
    const secTgt = (g.secondary && g.secondary.targets) || [];
    const hidSvc = (g.hidden && g.hidden.activities) || [];
    const hidTgt = (g.hidden && g.hidden.targets) || [];

    const orderedServices = orderCatalog(
      payload.catalog.sap_activities,
      presetServices,
      recoSvc, secSvc, hidSvc
    ).map((x) => ({
      key: x.code,
      label: x.label,
      _reco: recoSvc.includes(x.code),
      _secondary: secSvc.includes(x.code),
      _hidden: hidSvc.includes(x.code),
      _default: defaultsHas(presetServices, x.code),
    }));

    const orderedTargets = orderCatalog(
      payload.catalog.target_publics,
      presetTargets,
      recoTgt, secTgt, hidTgt
    ).map((x) => ({
      key: x.code,
      label: x.label,
      age: '—',
      desc: descFor(x.code, presetTargets),
      _reco: recoTgt.includes(x.code),
      _secondary: secTgt.includes(x.code),
      _hidden: hidTgt.includes(x.code),
      _default: defaultsHas(presetTargets, x.code),
    }));

    window.LouannData.sousSecteurs = orderedServices;
    window.LouannData.cibles = orderedTargets;
    applyKpisCatalog(payload.catalog.kpis);
    window.LouannData.brandGuidance = {
      summary: g.summary_card || null,
      sectionTitles: g.section_titles || {},
      helperTexts: g.helper_texts || {},
      studyTypeRecommendation: g.study_type_recommendation || null,
      brandName: payload.company && payload.company.name,
      colors: payload.branding
        ? {
            primary: payload.branding.primary_color || null,
            secondary: payload.branding.secondary_color || null,
            accent: payload.branding.accent_color || null,
            background: payload.branding.background_color || null,
            text: payload.branding.text_color || null,
          }
        : null,
      logo: (payload.branding && payload.branding.logo_primary_url) || null,
      brandStyle: (payload.branding && payload.branding.brand_style) || null,
    };
  }

  // Remplace LouannData.kpis & LouannData.kpiCategories par la version live
  // de la table kpi_master (admin), pour garantir que le client voit
  // exactement les KPI disponibles côté admin.
  function applyKpisCatalog(dbKpis) {
    if (!Array.isArray(dbKpis) || dbKpis.length === 0) return;
    const GROUP_META = {
      demographie:   { label: 'Démographie',      icon: '📊' },
      demande:       { label: 'Demande SAP',      icon: '💼' },
      rh:            { label: 'RH & Recrutement', icon: '👥' },
      mobilite:      { label: 'Mobilité',         icon: '🚗' },
      economie:      { label: 'Économie',         icon: '💰' },
      concurrence:   { label: 'Concurrence',      icon: '🏢' },
      reglementaire: { label: 'Réglementaire',    icon: '⚖' },
      risques:       { label: 'Risques',          icon: '⚠' },
    };
    const staticByCode = new Map(
      (window.LouannData.kpis || []).map((k) => [k.key, k])
    );
    window.LouannData.kpis = dbKpis.map((k) => {
      const prev = staticByCode.get(k.code);
      return {
        key: k.code,
        cat: k.kpi_group,
        name: k.label,
        src: (prev && prev.src) || 'admin master',
        principal: prev ? prev.principal : false,
      };
    });
    const seenGroups = [];
    dbKpis.forEach((k) => {
      if (!seenGroups.includes(k.kpi_group)) seenGroups.push(k.kpi_group);
    });
    window.LouannData.kpiCategories = seenGroups.map((g) => ({
      key: g,
      label: (GROUP_META[g] && GROUP_META[g].label) || g,
      icon: (GROUP_META[g] && GROUP_META[g].icon) || '•',
    }));
  }

  function defaultsHas(list, code) {
    return list.some((x) => x.code === code && x.is_default);
  }

  function descFor(code, presetTargets) {
    const hit = presetTargets.find((x) => x.code === code);
    return (hit && hit.general_circle) || '';
  }

  function orderCatalog(catalog, presetItems, reco, secondary, hidden) {
    const byCode = new Map(catalog.map((c) => [c.code, c]));
    const seen = new Set();
    const out = [];
    const push = (code) => {
      if (!byCode.has(code) || seen.has(code)) return;
      seen.add(code);
      out.push(byCode.get(code));
    };
    // 1. Recommended in declared order
    reco.forEach(push);
    // 2. Other defaults (preset is_default) in preset order
    presetItems
      .filter((x) => x.is_default && !reco.includes(x.code))
      .forEach((x) => push(x.code));
    // 3. Remaining catalog, excluding hidden
    catalog
      .filter((c) => !hidden.includes(c.code))
      .forEach((c) => push(c.code));
    // 4. Hidden at the end
    hidden.forEach(push);
    return out;
  }

  function applyDefaultsToState(setFields) {
    const services = (window.LouannData.sousSecteurs || [])
      .filter((x) => x._default)
      .map((x) => x.key);
    const cibles = (window.LouannData.cibles || [])
      .filter((x) => x._default)
      .map((x) => x.key);
    setFields({ sousSecteurs: services, cibles });
  }

  // Normalise l'état wizard en payload "Stella-ready".
  // - utilise les codes DB pour services / cibles
  // - calcule brand_guidance_applied = true si l'utilisateur suit les défauts marque
  function toStellaPayload(state) {
    const g = (window.LouannData && window.LouannData.brandGuidance) || {};
    const slug = state.marque && state.marque !== 'custom'
      ? resolveSlug(state.marque)
      : null;
    const defaultServices = (window.LouannData.sousSecteurs || [])
      .filter((x) => x._default).map((x) => x.key).sort();
    const defaultTargets = (window.LouannData.cibles || [])
      .filter((x) => x._default).map((x) => x.key).sort();
    const sameSet = (a, b) =>
      a.length === b.length && a.every((x, i) => x === b[i]);
    const guidanceApplied = !!slug
      && sameSet([...(state.sousSecteurs || [])].sort(), defaultServices)
      && sameSet([...(state.cibles || [])].sort(), defaultTargets);
    const recoType = g.studyTypeRecommendation && g.studyTypeRecommendation.code;
    return {
      brand_slug: slug,
      brand_name: g.brandName || null,
      brand_guidance_applied: guidanceApplied,
      brand_colors: g.colors || null,
      brand_logo: g.logo || null,
      brand_style: g.brandStyle || null,
      study_type: state.typeEtude || null,
      study_type_matches_brand_reco: !!recoType && state.typeEtude === recoType,
      territory: {
        country: state.pays || null,
        cities: state.villesData || [],
        years: state.annees || [],
      },
      selections: {
        services: state.sousSecteurs || [],
        targets: state.cibles || [],
        zone_focus: state.zoneTypes || [],
        kpis: state.kpiSelected || [],
      },
      client: {
        name: state.clientName || null,
        palette: state.palette || null,
        logo: state.clientLogo || null,
      },
    };
  }

  window.LouannBrandPreset = {
    resolveSlug,
    fetchBrandPreset,
    fetchBrandPresetById,
    applyBrandPreset,
    applyDefaultsToState,
    toStellaPayload,
  };
})();