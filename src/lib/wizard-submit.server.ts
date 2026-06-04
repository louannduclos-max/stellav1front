import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PayloadSchema = z.object({
  city_name: z.string().min(1).max(255),
  postal_code: z.string().max(20).nullable().optional(),
  study_type: z.string().min(1).max(100),
  included_activity_families: z.array(z.string().max(100)).default([]),
  palette_key: z.string().max(100).nullable().optional(),
  deliverable_format: z.string().max(50).optional(),
  title: z.string().max(255).optional(),
  market_kpis: z.array(z.string()).default([]),
  hr_kpis: z.array(z.string()).default([]),
  transport_kpis: z.array(z.string()).default([]),
  competition_kpis: z.array(z.string()).default([]),
  synthesis_kpis: z.array(z.string()).default([]),
  // v3.2 — typologie d'étude
  study_category_code: z.string().max(50).nullable().optional(),
  study_subtype_code: z.string().max(80).nullable().optional(),
  // v3.2 — company sélectionnée explicitement dans le picker
  company_id: z.string().uuid().nullable().optional(),
  // v3.3 — pilotage par cases cochées (skills KPI & Gabarits)
  target_publics: z.array(z.string().max(100)).default([]),
  commune_types: z.array(z.string().max(100)).default([]),
  zone_focus: z.array(z.string().max(100)).default([]),
  reference_years: z.array(z.union([z.number(), z.string()])).default([]),
  road_axes: z.array(z.string().max(255)).default([]),
  demographic_segments: z.record(z.string(), z.union([z.number(), z.string()])).default({}),
  risks: z.array(z.string().max(100)).default([]),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const PALETTE_MAP: Record<string, string> = {
  highkey: "high_key",
  high_key: "high_key",
  bonadea: "bonadea_care",
  bonadea_care: "bonadea_care",
  flexibia: "flexibia",
  corporate: "corporate_blue",
  corporate_blue: "corporate_blue",
  medical: "medical_green",
  medical_green: "medical_green",
  luxury: "luxury_gold",
  luxury_gold: "luxury_gold",
};

function normalizePalette(input: string | null | undefined): string {
  if (!input) return "bonadea_care";
  return PALETTE_MAP[input] || input;
}

export async function handleWizardSubmit(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return json({ error: "Non authentifié" }, 401);

  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData.user) {
    return json({ error: "Session invalide" }, 401);
  }
  const userId = userData.user.id;

  let parsed;
  try {
    const body = await request.json();
    parsed = PayloadSchema.parse(body);
  } catch (e) {
    return json({ error: `Payload invalide: ${(e as Error).message}` }, 400);
  }

  const { data: me } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  const isAdmin = me?.role === "admin";

  let companyId: string | null = null;
  // 1. company_id explicite (picker v3.2) → vérifier l'accès
  if (parsed.company_id) {
    if (isAdmin) {
      companyId = parsed.company_id;
    } else {
      const { data: ok } = await supabaseAdmin
        .from("user_company_permissions")
        .select("company_id")
        .eq("user_id", userId)
        .eq("company_id", parsed.company_id)
        .maybeSingle();
      if (ok?.company_id) companyId = ok.company_id;
    }
  }
  // 2. Fallback : permission utilisateur unique
  if (!companyId) {
    const { data: perm } = await supabaseAdmin
      .from("user_company_permissions")
      .select("company_id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    if (perm?.company_id) companyId = perm.company_id;
  }
  // 3. Fallback admin : première company active
  if (!companyId && isAdmin) {
    const { data: anyCompany } = await supabaseAdmin
      .from("companies")
      .select("id")
      .eq("status", "active")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (anyCompany?.id) companyId = anyCompany.id;
  }
  if (!companyId) {
    return json(
      {
        error:
          "Aucune marque associée à votre compte. Demandez à un administrateur de vous attribuer une marque.",
      },
      403,
    );
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    return json({ error: "Configuration backend manquante" }, 500);
  }

  const authedClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const title =
    parsed.title?.slice(0, 255) || `Étude ${parsed.city_name} · ${parsed.study_type}`;

  const { data: inserted, error: insertErr } = await authedClient
    .from("studies")
    .insert({
      title,
      company_id: companyId,
      user_id: userId,
      created_by: userId,
      version_number: 1,
      status: "draft",
      city_name: parsed.city_name,
      postal_code: parsed.postal_code ?? null,
      study_type: parsed.study_type,
      included_activity_families: parsed.included_activity_families,
      palette_key: normalizePalette(parsed.palette_key),
      deliverable_format: parsed.deliverable_format ?? "pdf",
      market_kpis: parsed.market_kpis,
      hr_kpis: parsed.hr_kpis,
      transport_kpis: parsed.transport_kpis,
      competition_kpis: parsed.competition_kpis,
      synthesis_kpis: parsed.synthesis_kpis,
      study_category_code: parsed.study_category_code ?? null,
      study_subtype_code: parsed.study_subtype_code ?? null,
      main_target_public: parsed.target_publics,
      commune_types: parsed.commune_types,
      zone_focus: parsed.zone_focus,
      risks: parsed.risks,
      reference_years: parsed.reference_years,
      road_axes: parsed.road_axes,
      demographic_segments: parsed.demographic_segments,
    })
    .select("id")
    .single();
  if (insertErr || !inserted) {
    return json({ error: `Création étude échouée: ${insertErr?.message}` }, 500);
  }
  const studyId = inserted.id;

  let code_insee: string | null = null;
  let lat: number | null = null;
  let lon: number | null = null;
  let countryCode: string | null = null;
  try {
    const params = new URLSearchParams({
      nom: parsed.city_name,
      fields: "code,nom,centre",
      limit: "1",
    });
    if (parsed.postal_code) params.set("codePostal", parsed.postal_code);
    const geoRes = await fetch(`https://geo.api.gouv.fr/communes?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (geoRes.ok) {
      const arr = (await geoRes.json()) as Array<{
        code?: string;
        centre?: { coordinates?: [number, number] };
      }>;
      const c = arr?.[0];
      code_insee = c?.code ?? null;
      lat = c?.centre?.coordinates?.[1] ?? null;
      lon = c?.centre?.coordinates?.[0] ?? null;
      if (code_insee) countryCode = "FR";
    }
  } catch (e) {
    console.error("[wizard/submit] geo lookup failed", e);
  }

  // Fallback international : si la commune n'existe pas dans geo.api.gouv.fr
  // (ville étrangère type Madrid, Barcelone, etc.), on utilise Google Geocoding
  // via le connector Lovable. On synthétise un pseudo code_insee pour respecter
  // le contrat du worker downstream.
  if (!code_insee || lat == null || lon == null) {
    try {
      const lovableKey = process.env.LOVABLE_API_KEY;
      const gmapsKey = process.env.GOOGLE_MAPS_API_KEY;
      if (lovableKey && gmapsKey) {
        const q = parsed.postal_code
          ? `${parsed.city_name} ${parsed.postal_code}`
          : parsed.city_name;
        const gRes = await fetch(
          `https://connector-gateway.lovable.dev/google_maps/maps/api/geocode/json?address=${encodeURIComponent(q)}`,
          {
            headers: {
              Authorization: `Bearer ${lovableKey}`,
              "X-Connection-Api-Key": gmapsKey,
            },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (gRes.ok) {
          const data = (await gRes.json()) as {
            results?: Array<{
              geometry?: { location?: { lat?: number; lng?: number } };
              address_components?: Array<{ short_name?: string; types?: string[] }>;
            }>;
          };
          const r = data.results?.[0];
          const loc = r?.geometry?.location;
          if (loc?.lat != null && loc?.lng != null) {
            lat = loc.lat;
            lon = loc.lng;
            const country = r?.address_components?.find((c) =>
              c.types?.includes("country"),
            )?.short_name || "XX";
            countryCode = country;
            const slug = parsed.city_name
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toUpperCase()
              .replace(/[^A-Z0-9]+/g, "-")
              .replace(/^-|-$/g, "")
              .slice(0, 40);
            code_insee = `${country}-${slug}`;
          }
        }
      }
    } catch (e) {
      console.error("[wizard/submit] google geocode fallback failed", e);
    }
  }

  if (!code_insee || lat == null || lon == null) {
    await supabaseAdmin
      .from("studies")
      .update({
        generation_status: "failed",
        generation_error_message: `Commune introuvable: ${parsed.city_name}`,
      })
      .eq("id", studyId);
    return json({ studyId, error: `Commune introuvable: ${parsed.city_name}` }, 422);
  }

  let clientName = title;
  let clientLogoUrl: string | null = null;
  const { data: company } = await supabaseAdmin
    .from("companies")
    .select("display_name, name")
    .eq("id", companyId)
    .maybeSingle();
  if (company) clientName = company.display_name || company.name || clientName;
  const { data: branding } = await supabaseAdmin
    .from("company_branding")
    .select("logo_primary_url")
    .eq("company_id", companyId)
    .maybeSingle();
  if (branding?.logo_primary_url) clientLogoUrl = branding.logo_primary_url;

  await supabaseAdmin
    .from("studies")
    .update({
      generation_status: "pending",
      generation_started_at: new Date().toISOString(),
      generation_error_message: null,
    })
    .eq("id", studyId);

  const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL;
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!RENDER_BACKEND_URL || !WEBHOOK_SECRET) {
    await supabaseAdmin
      .from("studies")
      .update({
        generation_status: "failed",
        generation_error_message:
          "Configuration backend manquante (RENDER_BACKEND_URL / WEBHOOK_SECRET)",
      })
      .eq("id", studyId);
    return json({ studyId, error: "Backend de génération non configuré" }, 500);
  }

  // v3.3 — enrichissement des sélections avec labels/groupes/ordres depuis les masters.
  // Permet à Claude (skills KPI/Gabarits) d'utiliser display_order, kpi_group et libellés
  // sans avoir à re-requêter la BDD.
  type MasterRow = { code: string; label: string; display_order?: number; kpi_group?: string };
  const enrichWithMaster = async (
    table: "kpi_master" | "target_publics_master" | "commune_types_master" | "zone_focus_master" | "risks_master" | "sap_activities_master",
    codes: string[],
  ) => {
    if (!codes.length) return [] as MasterRow[];
    const { data } = (await (supabaseAdmin.from(table) as unknown as {
      select: (cols: string) => { in: (col: string, vals: string[]) => Promise<{ data: MasterRow[] | null }> };
    })
      .select("code,label,display_order" + (table === "kpi_master" ? ",kpi_group" : ""))
      .in("code", codes));
    const rows = data ?? [];
    const map = new Map(rows.map((r) => [r.code, r]));
    return codes
      .map((c) => map.get(c) ?? ({ code: c, label: c, display_order: 999 } as MasterRow))
      .sort((a, b) => (a.display_order ?? 999) - (b.display_order ?? 999));
  };

  const allKpiCodes = [
    ...parsed.market_kpis,
    ...parsed.hr_kpis,
    ...parsed.transport_kpis,
    ...parsed.competition_kpis,
    ...parsed.synthesis_kpis,
  ];
  const [
    kpiEnriched,
    targetsEnriched,
    communeTypesEnriched,
    zoneFocusEnriched,
    risksEnriched,
    activitiesEnriched,
  ] = await Promise.all([
    enrichWithMaster("kpi_master", allKpiCodes),
    enrichWithMaster("target_publics_master", parsed.target_publics),
    enrichWithMaster("commune_types_master", parsed.commune_types),
    enrichWithMaster("zone_focus_master", parsed.zone_focus),
    enrichWithMaster("risks_master", parsed.risks),
    enrichWithMaster("sap_activities_master", parsed.included_activity_families),
  ]);

  // Famille d'étude (FE/EM/AC/ED/MP/DD) déduite du study_category_code (1ʳᵉ-2ᵈᵉ lettres).
  const studyFamilyCode = (parsed.study_category_code ?? "").split("-")[0]?.toUpperCase() || null;

  const studyData = {
    city_name: parsed.city_name,
    postal_code: parsed.postal_code ?? null,
    code_insee,
    country_code: countryCode,
    lat,
    lon,
    study_type: parsed.study_type,
    study_category_code: parsed.study_category_code ?? null,
    study_subtype_code: parsed.study_subtype_code ?? null,
    study_family_code: studyFamilyCode,
    company_id: companyId,
    included_activity_families: parsed.included_activity_families,
    included_activity_families_enriched: activitiesEnriched,
    client_name: clientName,
    client_logo_url: clientLogoUrl,
    palette_key: normalizePalette(parsed.palette_key),
    deliverable_format: parsed.deliverable_format ?? "pdf",
    language: "fr",
    title,
    radius_km: 5,
    kpis: {
      market: parsed.market_kpis,
      hr: parsed.hr_kpis,
      transport: parsed.transport_kpis,
      competition: parsed.competition_kpis,
      synthesis: parsed.synthesis_kpis,
    },
    // v3.3 — KPI enrichis (code, label, kpi_group, display_order) pour le skill PILOTAGE_PAR_KPI
    kpis_enriched: kpiEnriched,
    kpi_selected: [
      ...parsed.market_kpis,
      ...parsed.hr_kpis,
      ...parsed.transport_kpis,
      ...parsed.competition_kpis,
      ...parsed.synthesis_kpis,
    ],
    analysis_axes: {
      demography: parsed.market_kpis.length > 0,
      hr: parsed.hr_kpis.length > 0,
      transport: parsed.transport_kpis.length > 0,
      competition: parsed.competition_kpis.length > 0,
      synthesis: parsed.synthesis_kpis.length > 0,
    },
    // v3.3 — toutes les autres sélections du wizard, enrichies des libellés masters
    target_publics: targetsEnriched,
    commune_types: communeTypesEnriched,
    zone_focus: zoneFocusEnriched,
    risks: risksEnriched,
    reference_years: parsed.reference_years,
    road_axes: parsed.road_axes,
    demographic_segments: parsed.demographic_segments,
  };

  try {
    const renderRes = await fetch(`${RENDER_BACKEND_URL}/generate-study`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ study_id: studyId, study_data: studyData }),
      signal: AbortSignal.timeout(15000),
    });
    if (!renderRes.ok) {
      const txt = await renderRes.text().catch(() => "");
      const msg = `Backend HTTP ${renderRes.status}: ${txt.slice(0, 300)}`;
      await supabaseAdmin
        .from("studies")
        .update({ generation_status: "failed", generation_error_message: msg })
        .eq("id", studyId);
      return json({ studyId, error: msg }, 502);
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabaseAdmin
      .from("studies")
      .update({
        generation_status: "failed",
        generation_error_message: `Backend injoignable: ${msg.slice(0, 300)}`,
      })
      .eq("id", studyId);
    return json({ studyId, error: `Backend injoignable: ${msg}` }, 502);
  }

  return json({ studyId, status: "pending" }, 200);
}