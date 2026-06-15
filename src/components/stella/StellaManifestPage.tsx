import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_BASE_URL =
  (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) ||
  "http://127.0.0.1:8000";

export type StellaFrontendManifest = {
  study_id?: string;
  resolved_brand_slug?: string | null;
  theme: {
    brand_slug?: string | null;
    css: { variables: Record<string, string> };
    font_family?: string | null;
    palette?: Record<string, string>;
  };
  brand_profile?: {
    priority_kpis?: string[];
    [key: string]: unknown;
  } | null;
  renderer: {
    component_map: {
      items: Array<{
        section_id: string;
        component: string;
        frontend_component: string;
        fallback_component?: string | null;
        frontend_fallback_component?: string | null;
        props_required: string[];
      }>;
    };
    playlist: {
      study_id?: string | null;
      slides: Array<{
        slide_index: number;
        slide_id: string;
        section_id: string;
        title: string;
        component: string;
        fallback_component?: string | null;
        layout: string;
        visual_anchor: string;
        expected_kpis: string[];
        slot_keys: string[];
      }>;
    };
  };
  lovable_config: { payload?: { metrics?: Array<Record<string, unknown>> } };
  study_data?: {
    study: {
      study_id: string;
      verdict?: string | null;
      geo_scope?: { city?: string | null; country?: string | null };
      business_context?: { brand_name?: string | null };
    };
    metrics?: { items?: Array<Record<string, unknown>>; by_id?: Record<string, Record<string, unknown>> };
    scores?: { items?: Array<Record<string, unknown>>; by_id?: Record<string, Record<string, unknown>> };
    sources?: { items?: Array<Record<string, unknown>> };
    microzones?: Record<string, unknown> | null;
    qa?: { items?: Array<Record<string, unknown>> };
  };
};

export type StellaManifestPageProps = {
  studyId: string;
  brandSlug?: string;
  baseUrl?: string;
};

type SlideRendererProps = {
  manifest: StellaFrontendManifest;
  slide: StellaFrontendManifest["renderer"]["playlist"]["slides"][number];
};

const slideShellStyle: React.CSSProperties = {
  width: "100%",
  aspectRatio: "16 / 9",
  background: "#FFFFFF",
  borderRadius: 24,
  padding: 32,
  boxShadow: "0 16px 48px rgba(0,0,0,0.08)",
  display: "grid",
  gap: 20,
  overflow: "hidden",
};

const titleStyle: React.CSSProperties = { fontSize: 34, lineHeight: 1.05, fontWeight: 800, margin: 0 };
const metaStyle: React.CSSProperties = { fontSize: 13, opacity: 0.72, display: "flex", flexWrap: "wrap", gap: 10 };
const listStyle: React.CSSProperties = { margin: 0, paddingLeft: 18, fontSize: 15, lineHeight: 1.45 };

type AnyRec = Record<string, unknown>;

function pickString(rec: AnyRec | undefined, ...keys: string[]): string | undefined {
  if (!rec) return undefined;
  for (const k of keys) {
    const v = rec[k];
    if (typeof v === "string" && v.length) return v;
    if (typeof v === "number") return String(v);
  }
  return undefined;
}

function pickNumberLike(rec: AnyRec | undefined, ...keys: string[]): string | undefined {
  if (!rec) return undefined;
  for (const k of keys) {
    const v = rec[k];
    if (v === null || v === undefined) continue;
    if (typeof v === "number") return Number.isFinite(v) ? String(v) : undefined;
    if (typeof v === "string" && v.length) return v;
  }
  return undefined;
}

type ResolvedKpi = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  source?: string;
};

function resolveKpi(manifest: StellaFrontendManifest, id: string): ResolvedKpi | null {
  const byId = manifest.study_data?.metrics?.by_id || {};
  const items = manifest.study_data?.metrics?.items || [];
  const raw =
    (byId[id] as AnyRec | undefined) ||
    (items.find((m) => (m as AnyRec).metric_id === id || (m as AnyRec).id === id) as AnyRec | undefined);
  if (!raw) {
    return { id, label: id, value: "—" };
  }
  const label =
    pickString(raw, "label", "name", "title", "metric_label", "display_name") || id;
  const value =
    pickNumberLike(raw, "value", "display_value", "current_value", "score", "amount") ?? "—";
  const unit = pickString(raw, "unit", "unit_label", "suffix");
  const delta = pickNumberLike(raw, "delta", "trend", "variation", "change");
  const source = pickString(raw, "source", "provider", "source_id");
  return { id, label, value, unit, delta, source };
}

function resolveHeroKpiIds(
  manifest: StellaFrontendManifest,
  slide?: StellaFrontendManifest["renderer"]["playlist"]["slides"][number],
  max = 6,
): string[] {
  const ordered: string[] = [];
  const push = (id?: string | null) => {
    if (!id) return;
    if (ordered.includes(id)) return;
    ordered.push(id);
  };
  (slide?.expected_kpis || []).forEach(push);
  (manifest.brand_profile?.priority_kpis || []).forEach(push);
  const byId = manifest.study_data?.metrics?.by_id || {};
  Object.keys(byId).forEach(push);
  (manifest.study_data?.metrics?.items || []).forEach((m) => {
    push(pickString(m as AnyRec, "metric_id", "id"));
  });
  return ordered.slice(0, max);
}

function KpiCard({ kpi, accent }: { kpi: ResolvedKpi; accent?: boolean }) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: "16px 18px",
        background: accent ? "var(--stella-primary, #0066CC)" : "#FFFFFF",
        color: accent ? "#FFFFFF" : "inherit",
        boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
        display: "grid",
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, opacity: 0.8, textTransform: "uppercase", letterSpacing: 0.6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {kpi.label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{kpi.value}</div>
        {kpi.unit ? <div style={{ fontSize: 14, opacity: 0.85 }}>{kpi.unit}</div> : null}
      </div>
      {kpi.delta ? (
        <div style={{ fontSize: 12, opacity: 0.85 }}>Δ {kpi.delta}</div>
      ) : null}
      <div style={{ fontSize: 10, opacity: 0.55 }}>{kpi.id}{kpi.source ? ` · ${kpi.source}` : ""}</div>
    </div>
  );
}

function applyCssVariables(variables: Record<string, string>) {
  if (typeof document === "undefined") return;
  Object.entries(variables).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}

function useStellaManifest({ studyId, brandSlug, baseUrl = DEFAULT_BASE_URL }: StellaManifestPageProps) {
  const [manifest, setManifest] = useState<StellaFrontendManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchUrl, setFetchUrl] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    const qs = new URLSearchParams();
    if (brandSlug) qs.set("brand_slug", brandSlug);

    setLoading(true);
    setError(null);

    const url = `${baseUrl}/integration/study/${studyId}/frontend-manifest?${qs.toString()}`;
    setFetchUrl(url);
    fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Stella manifest HTTP ${response.status}`);
        return response.json();
      })
      .then((data: StellaFrontendManifest) => {
        setManifest(data);
        applyCssVariables(data.theme?.css?.variables || {});
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [studyId, brandSlug, baseUrl]);

  return { manifest, loading, error, fetchUrl };
}

function GenericSlide({ manifest, slide }: SlideRendererProps) {
  const city = manifest.study_data?.study?.geo_scope?.city || "Ville";
  const country = manifest.study_data?.study?.geo_scope?.country || "";
  const verdict = manifest.study_data?.study?.verdict || "PENDING";
  const kpiIds = resolveHeroKpiIds(manifest, slide, 6);
  const kpis = kpiIds.map((id) => resolveKpi(manifest, id)).filter(Boolean) as ResolvedKpi[];

  return (
    <section
      style={{
        ...slideShellStyle,
        borderTop: `10px solid var(--stella-primary, #0066CC)`,
        fontFamily: "var(--stella-font, Arial, sans-serif)",
        color: "var(--stella-text, #2C2C2C)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <p style={{ margin: "0 0 10px 0", fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "var(--stella-primary, #0066CC)" }}>
            Stella · {slide.section_id}
          </p>
          <h2 style={titleStyle}>{slide.title}</h2>
        </div>
        <div style={{ minWidth: 120, textAlign: "center", borderRadius: 18, padding: "14px 16px", background: "rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Verdict</div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{verdict}</div>
        </div>
      </div>

      <div style={metaStyle}>
        <span>#{slide.slide_index}</span>
        <span>{city}{country ? ` · ${country}` : ""}</span>
        <span>{slide.layout}</span>
        <span>{slide.visual_anchor}</span>
      </div>

      {kpis.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.min(kpis.length, 3)}, minmax(0, 1fr))`,
            gap: 14,
            minHeight: 0,
          }}
        >
          {kpis.map((kpi) => <KpiCard key={kpi.id} kpi={kpi} />)}
        </div>
      ) : (
        <div style={{ borderRadius: 18, background: "rgba(0,0,0,0.03)", padding: 18, fontSize: 14, opacity: 0.7 }}>
          Aucun KPI résolvable pour cette slide ({slide.expected_kpis.join(", ") || "expected_kpis vide"}).
        </div>
      )}

      {slide.slot_keys.length ? (
        <div style={{ fontSize: 11, opacity: 0.55 }}>
          Slots : {slide.slot_keys.join(" · ")}
        </div>
      ) : null}
    </section>
  );
}

function CoverHeroStatsSlide({ manifest, slide }: SlideRendererProps) {
  const study = manifest.study_data?.study;
  const brand = study?.business_context?.brand_name || manifest.resolved_brand_slug || manifest.theme.brand_slug || "Brand";
  const city = study?.geo_scope?.city || "Ville";
  const country = study?.geo_scope?.country || "";
  const verdict = study?.verdict || "PENDING";
  const scoresItems = manifest.study_data?.scores?.items || [];
  const globalScore = (() => {
    const byId = manifest.study_data?.scores?.by_id || {};
    const candidate =
      (byId["global"] as AnyRec | undefined) ||
      (byId["overall"] as AnyRec | undefined) ||
      (scoresItems.find((s) => {
        const id = pickString(s as AnyRec, "score_id", "id", "key") || "";
        return /global|overall|total/i.test(id);
      }) as AnyRec | undefined) ||
      (scoresItems[0] as AnyRec | undefined);
    if (!candidate) return null;
    return {
      label: pickString(candidate, "label", "name") || "Score global",
      value: pickNumberLike(candidate, "value", "score", "display_value") || "—",
      unit: pickString(candidate, "unit"),
    };
  })();

  const heroKpiIds = resolveHeroKpiIds(manifest, slide, 6);
  const heroKpis = heroKpiIds.map((id) => resolveKpi(manifest, id)).filter(Boolean) as ResolvedKpi[];
  const gridCols = heroKpis.length >= 6 ? 3 : heroKpis.length >= 4 ? 2 : Math.max(1, heroKpis.length);

  return (
    <section
      style={{
        ...slideShellStyle,
        gridTemplateColumns: "7fr 3fr",
        alignItems: "stretch",
        fontFamily: "var(--stella-font, Arial, sans-serif)",
        color: "var(--stella-text, #2C2C2C)",
        background: "linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(245,248,255,1) 100%)",
      }}
    >
      <div style={{ display: "grid", alignContent: "space-between", gap: 18, minWidth: 0 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "var(--stella-primary, #0066CC)" }}>
            {brand}{country ? ` · ${country}` : ""}
          </p>
          <h1 style={{ margin: "10px 0 6px 0", fontSize: 48, lineHeight: 0.98, fontWeight: 900 }}>{city}</h1>
          <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>{slide.title}</p>
        </div>

        {heroKpis.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              gap: 12,
            }}
          >
            {heroKpis.map((kpi, i) => <KpiCard key={kpi.id} kpi={kpi} accent={i === 0} />)}
          </div>
        ) : (
          <div style={{ padding: 16, background: "rgba(0,0,0,0.04)", borderRadius: 14, fontSize: 13, opacity: 0.7 }}>
            Aucun KPI hero disponible (metrics.by_id et brand_profile.priority_kpis vides).
          </div>
        )}
      </div>

      <aside
        style={{
          borderRadius: 24,
          background: "rgba(0,0,0,0.04)",
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          padding: 18,
          gap: 12,
          minWidth: 0,
        }}
      >
        <div style={{ borderRadius: 16, padding: 14, background: "#FFFFFF", boxShadow: "0 8px 18px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>Verdict</div>
          <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>{verdict}</div>
        </div>
        {globalScore ? (
          <div style={{ borderRadius: 16, padding: 14, background: "#FFFFFF", boxShadow: "0 8px 18px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 1 }}>{globalScore.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{globalScore.value}</div>
              {globalScore.unit ? <div style={{ fontSize: 13, opacity: 0.7 }}>{globalScore.unit}</div> : null}
            </div>
          </div>
        ) : null}
        <div style={{ alignSelf: "end", fontSize: 11, opacity: 0.55 }}>
          Slide {slide.slide_index} / {manifest.renderer.playlist.slides.length}
        </div>
      </aside>
    </section>
  );
}

const slideRegistry: Record<string, React.ComponentType<SlideRendererProps>> = {
  StellaCoverHeroStatsV1: CoverHeroStatsSlide,
};

function resolveComponent(manifest: StellaFrontendManifest, slide: StellaFrontendManifest["renderer"]["playlist"]["slides"][number]) {
  const mapped = manifest.renderer.component_map.items.find(
    (item) => item.section_id === slide.section_id || item.component === slide.component,
  );
  return (mapped && slideRegistry[mapped.frontend_component]) || GenericSlide;
}

export default function StellaManifestPage(props: StellaManifestPageProps) {
  const { manifest, loading, error, fetchUrl } = useStellaManifest(props);
  const slides = useMemo(() => manifest?.renderer.playlist.slides || [], [manifest]);

  const firstSlide = slides[0];
  const firstResolved = manifest && firstSlide ? resolveComponent(manifest, firstSlide) : null;
  const firstComponentName = firstResolved
    ? ((firstResolved as { displayName?: string; name?: string }).displayName ||
        (firstResolved as { displayName?: string; name?: string }).name ||
        "(anonymous)")
    : "(none)";

  const debugBox = (
    <pre
      style={{
        margin: 0,
        padding: 16,
        background: "#111827",
        color: "#E5E7EB",
        borderRadius: 12,
        fontSize: 12,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap",
        wordBreak: "break-all",
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
      }}
    >
{`[Stella debug]
studyId   : ${props.studyId}
brandSlug : ${props.brandSlug ?? "(none)"}
baseUrl   : ${props.baseUrl ?? DEFAULT_BASE_URL}
fetchUrl  : ${fetchUrl}
loading   : ${loading}
error     : ${error ?? "null"}
slides    : ${slides.length}
first.slide_id : ${firstSlide?.slide_id ?? "(none)"}
first.component (manifest) : ${firstSlide?.component ?? "(none)"}
first.resolved frontend component : ${firstComponentName}`}
    </pre>
  );

  if (loading) {
    return (
      <main style={{ padding: 24, display: "grid", gap: 16 }}>
        {debugBox}
        <div style={{ padding: 32, fontFamily: "Arial, sans-serif" }}>Chargement du manifest Stella…</div>
      </main>
    );
  }
  if (error || !manifest) {
    return (
      <main style={{ padding: 24, display: "grid", gap: 16 }}>
        {debugBox}
        <div style={{ padding: 32, color: "#B00020", fontFamily: "Arial, sans-serif" }}>
          Erreur manifest Stella: {error || "Manifest indisponible"}
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, background: "linear-gradient(180deg, #F7F9FC 0%, #EEF3FA 100%)", display: "grid", gap: 28 }}>
      {debugBox}
      {slides
        .slice()
        .sort((a, b) => a.slide_index - b.slide_index)
        .map((slide) => {
          const Component = resolveComponent(manifest, slide);
          return <Component key={slide.slide_id} manifest={manifest} slide={slide} />;
        })}
      {slides.length === 0 && (
        <div style={{ padding: 32, color: "#B00020", fontFamily: "Arial, sans-serif" }}>
          Le manifest est arrivé mais ne contient aucune slide (playlist.slides vide).
        </div>
      )}
    </main>
  );
}