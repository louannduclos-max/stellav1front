import React, { useEffect, useState } from "react";
import StellaSlidesViewport from "./StellaSlidesViewport";
import StellaAutoSlidesViewport from "./StellaAutoSlidesViewport";
import "./assets/chrome.css";
import { supabase } from "@/integrations/supabase/client";

// ---------------------------------------------------------------------------
// Types Supabase (inline pour éviter les imports circulaires)
// ---------------------------------------------------------------------------
type CompanyRow = {
  id: string;
  slug: string;
  display_name: string;
  name: string;
  default_language: string;
  positioning: string | null;
};

type CompanyBrandingRow = {
  primary_color: string;
  secondary_color: string | null;
  accent_color: string | null;
  background_color: string | null;
  logo_primary_url: string | null;
  brand_style: string | null;
};

type CompanyStudyPresetRow = {
  default_kpis: unknown;
  default_activity_families: unknown;
  default_target_publics: unknown;
  default_risks: unknown;
  default_commune_types: unknown;
  default_zone_focus: unknown;
  guidance: unknown;
};

type CompanyWithProfile = CompanyRow & {
  branding?: CompanyBrandingRow;
  presets?: CompanyStudyPresetRow;
};

// ---------------------------------------------------------------------------
// Hook : charge les companies + branding + presets depuis Supabase
// ---------------------------------------------------------------------------
function useCompanies() {
  const [companies, setCompanies] = useState<CompanyWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: rows, error } = await supabase
          .from("companies")
          .select("id, slug, display_name, name, default_language, positioning")
          .eq("status", "active")
          .order("display_name");
        if (error || !rows || cancelled) {
          setLoading(false);
          return;
        }

        // Charger branding + presets en parallèle
        const enriched: CompanyWithProfile[] = await Promise.all(
          rows.map(async (c) => {
            const [brandRes, presetRes] = await Promise.all([
              supabase
                .from("company_branding")
                .select("primary_color,secondary_color,accent_color,background_color,logo_primary_url,brand_style")
                .eq("company_id", c.id)
                .maybeSingle(),
              supabase
                .from("company_study_presets")
                .select("default_kpis,default_activity_families,default_target_publics,default_risks,default_commune_types,default_zone_focus,guidance")
                .eq("company_id", c.id)
                .maybeSingle(),
            ]);
            return {
              ...c,
              branding: brandRes.data ?? undefined,
              presets: presetRes.data ?? undefined,
            };
          })
        );

        if (!cancelled) {
          setCompanies(enriched);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { companies, loading };
}

// ---------------------------------------------------------------------------
// Formulaire de saisie (mode "form")
// ---------------------------------------------------------------------------
type FormValues = {
  city: string;
  country: string;
  brand_name: string;
  business_model: string;
  company_id: string;
  tenant_id: string;
};

type FormProps = {
  baseUrl: string;
  onStudyReady: (studyId: string) => void;
};

function StellaInputForm({ baseUrl, onStudyReady }: FormProps) {
  const { companies, loading: companiesLoading } = useCompanies();
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithProfile | null>(null);

  const [values, setValues] = useState<FormValues>({
    city: "",
    country: "FR",
    brand_name: "O2",
    business_model: "franchise",
    company_id: "",
    tenant_id: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "polling" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quand une company est sélectionnée → pré-remplir les champs
  function handleCompanyChange(companyId: string) {
    const company = companies.find((c) => c.id === companyId) ?? null;
    setSelectedCompany(company);
    if (company) {
      setValues((v) => ({
        ...v,
        company_id: company.id,
        tenant_id: company.slug,
        brand_name: company.display_name || company.name,
        country: company.default_language?.toUpperCase() === "ES" ? "ES" : "FR",
      }));
    } else {
      setValues((v) => ({ ...v, company_id: "", tenant_id: "" }));
    }
  }

  const set =
    (k: keyof FormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [k]: e.target.value }));

  async function pollUntilReady(studyId: string, maxAttempts = 60) {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const res = await fetch(`${baseUrl}/integration/study/${studyId}/status`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (!res.ok) throw new Error(`Polling HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "ready" || data.status === "published") return;
      if (data.status === "qa_failed") throw new Error("QA échouée — voir logs backend");
    }
    throw new Error("Timeout : génération de l'étude > 3 minutes");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.city.trim()) {
      setErrorMsg("La ville est obligatoire.");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    try {
      // Construire brand_profile_override depuis les données Supabase de la company sélectionnée
      const brand_profile_override = selectedCompany
        ? {
            ...(selectedCompany.branding ?? {}),
            ...(selectedCompany.presets ?? {}),
            positioning: selectedCompany.positioning,
          }
        : undefined;

      // Dériver service_scope depuis les activités par défaut de la company (ou défaut générique)
      const rawFamilies = (selectedCompany?.presets?.default_activity_families as Array<{activity_code?: string}> | null) ?? [];
      const service_scope = rawFamilies.length > 0
        ? rawFamilies.map((f) => f.activity_code ?? "").filter(Boolean)
        : ["seniors", "menage"];

      // Segments cibles
      const rawPublics = (selectedCompany?.presets?.default_target_publics as Array<{public_code?: string}> | null) ?? [];
      const target_segments = rawPublics.length > 0
        ? rawPublics.map((p) => p.public_code ?? "").filter(Boolean)
        : ["seniors", "familles"];

      const payload = {
        country: values.country,
        language: values.country === "ES" ? "es" : "fr",
        city: values.city,
        // Multi-tenant
        tenant_id: values.tenant_id || undefined,
        company_id: values.company_id || undefined,
        brand_profile_override: brand_profile_override || undefined,
        business_context: {
          brand_name: values.brand_name || "Interdomicilio",
          business_model: values.business_model || "franchise",
          service_scope,
          positioning_mode: (selectedCompany?.positioning ?? "premium"),
          target_customer_segments: target_segments,
        },
      };

      const res = await fetch(`${baseUrl}/integration/ensure-study`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`ensure-study HTTP ${res.status}`);
      const { study_id, status: initialStatus } = await res.json();

      // Skip polling si la pipeline synchrone a déjà terminé
      if (initialStatus !== "ready" && initialStatus !== "published") {
        setStatus("polling");
        await pollUntilReady(study_id);
      }

      onStudyReady(study_id);
    } catch (err: unknown) {
      setErrorMsg(String(err));
      setStatus("error");
    }
  }

  const busy = status === "loading" || status === "polling";

  return (
    <div className="stella-5-0-viewport" style={{ justifyContent: "center" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: "48px 56px",
          minWidth: 480,
          maxWidth: 580,
          color: "#fff",
          fontFamily: "Inter, 'IBM Plex Sans', sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            color: "#64748B",
            marginBottom: 8,
            textTransform: "uppercase",
          }}
        >
          STELLA 5.0
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 32px", color: "#E2E8F0" }}>
          Générer une étude locale
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Company picker — chargé depuis Supabase */}
          <label style={labelStyle}>
            Filiale / Marque
            <select
              style={inputStyle}
              value={values.company_id}
              onChange={(e) => handleCompanyChange(e.target.value)}
              disabled={busy || companiesLoading}
            >
              <option value="">
                {companiesLoading ? "Chargement des filiales…" : "— Saisie manuelle —"}
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.display_name || c.name}
                </option>
              ))}
            </select>
          </label>

          <label style={labelStyle}>
            Ville *
            <input
              style={inputStyle}
              type="text"
              placeholder="ex: Auray, Valencia, Lyon…"
              value={values.city}
              onChange={set("city")}
              disabled={busy}
              required
            />
          </label>

          <label style={labelStyle}>
            Pays
            <select style={inputStyle} value={values.country} onChange={set("country")} disabled={busy}>
              <option value="FR">France (FR)</option>
              <option value="ES">Espagne (ES)</option>
            </select>
          </label>

          {/* Marque et modèle — pré-remplis si company sélectionnée, éditables sinon */}
          <label style={labelStyle}>
            Nom de marque
            <input
              style={inputStyle}
              type="text"
              placeholder="ex: O2, Interdomicilio"
              value={values.brand_name}
              onChange={set("brand_name")}
              disabled={busy}
            />
          </label>

          <label style={labelStyle}>
            Modèle économique
            <select
              style={inputStyle}
              value={values.business_model}
              onChange={set("business_model")}
              disabled={busy}
            >
              <option value="franchise">Franchise</option>
              <option value="succursale">Succursale</option>
              <option value="partenariat">Partenariat</option>
            </select>
          </label>

          {/* Indicateur de profil chargé */}
          {selectedCompany?.branding && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#64748B" }}>
              {selectedCompany.branding.primary_color && (
                <span
                  style={{
                    width: 12, height: 12, borderRadius: "50%",
                    background: selectedCompany.branding.primary_color,
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
              )}
              Profil chargé · {selectedCompany.display_name}
              {Array.isArray(selectedCompany.presets?.default_kpis) && (
                <span>· {(selectedCompany.presets.default_kpis as unknown[]).length} KPIs</span>
              )}
            </div>
          )}

          {errorMsg ? (
            <p className="stella-5-0-error" style={{ margin: 0 }}>
              {errorMsg}
            </p>
          ) : null}

          {status === "polling" ? (
            <p style={{ color: "#94A3B8", fontSize: 14, margin: 0 }}>
              ⏳ Génération en cours — vérification toutes les 3s…
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            style={{
              marginTop: 8,
              padding: "14px 28px",
              borderRadius: 8,
              border: "none",
              background: busy ? "#334155" : "#1A5BA0",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {busy ? "Génération…" : "Générer l'étude"}
          </button>
        </form>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontSize: 14,
  fontWeight: 500,
  color: "#94A3B8",
};

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.06)",
  color: "#E2E8F0",
  fontSize: 15,
  outline: "none",
  fontFamily: "inherit",
};

// ---------------------------------------------------------------------------
// Route principale
// ---------------------------------------------------------------------------
export default function StellaVisualRoute() {
  const [search, setSearch] = React.useState<string | null>(null);
  const [resolvedStudyId, setResolvedStudyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSearch(window.location.search);
  }, []);

  if (search === null) {
    return (
      <div className="stella-5-0-viewport">
        <p style={{ color: "#fff" }}>Chargement Stella 5.0…</p>
      </div>
    );
  }

  const params = new URLSearchParams(search);
  const auto = params.get("auto") === "1";
  const studyIdParam = params.get("studyId") || "";
  // Sprint 14e3 — LE fallback localhost qui cassait la prod était ICI :
  // la route passait baseUrl=http://127.0.0.1:8000 aux viewports (preuve
  // network : 503 sur 127.0.0.1). Fallback prod + env acceptée si https.
  const _envUrl = import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined;
  const _envOk =
    _envUrl && _envUrl.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(_envUrl);
  const baseUrl =
    params.get("baseUrl") ||
    (_envOk ? (_envUrl as string) : "https://stella-backend-mtap.onrender.com");
  const debug = params.get("debug") === "1";

  // Mode auto (DEFAULT_PAYLOAD, rétrocompatible)
  if (auto) {
    return <StellaAutoSlidesViewport baseUrl={baseUrl} debug={debug} />;
  }

  // study_id fourni en URL → affichage direct (lien partageable)
  const effectiveStudyId = resolvedStudyId || studyIdParam;
  if (effectiveStudyId) {
    return <StellaSlidesViewport studyId={effectiveStudyId} baseUrl={baseUrl} debug={debug} />;
  }

  // Mode formulaire (flow utilisateur réel)
  return (
    <StellaInputForm
      baseUrl={baseUrl}
      onStudyReady={(id) => {
        // Met à jour l'URL pour que le lien soit partageable
        const url = new URL(window.location.href);
        url.searchParams.set("studyId", id);
        window.history.replaceState({}, "", url.toString());
        setResolvedStudyId(id);
      }}
    />
  );
}
