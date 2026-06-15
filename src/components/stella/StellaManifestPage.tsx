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
      headers: { Accept: "application/json" },
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

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, minHeight: 0 }}>
        <div style={{ borderRadius: 18, background: "rgba(0,0,0,0.03)", padding: 18 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>Expected KPI</h3>
          <ul style={listStyle}>
            {slide.expected_kpis.length ? slide.expected_kpis.map((kpi) => <li key={kpi}>{kpi}</li>) : <li>Aucun KPI imposé</li>}
          </ul>
        </div>
        <div style={{ borderRadius: 18, background: "rgba(0,0,0,0.03)", padding: 18 }}>
          <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 18 }}>Slots</h3>
          <ul style={listStyle}>
            {slide.slot_keys.map((slot) => <li key={slot}>{slot}</li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function CoverHeroStatsSlide({ manifest, slide }: SlideRendererProps) {
  const study = manifest.study_data?.study;
  const brand = study?.business_context?.brand_name || manifest.resolved_brand_slug || manifest.theme.brand_slug || "Brand";
  const city = study?.geo_scope?.city || "Ville";
  const verdict = study?.verdict || "PENDING";
  const scores = manifest.study_data?.scores?.items || [];

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
      <div style={{ display: "grid", alignContent: "space-between", gap: 18 }}>
        <div>
          <p style={{ margin: 0, fontSize: 12, letterSpacing: 1.6, textTransform: "uppercase", color: "var(--stella-primary, #0066CC)" }}>{brand}</p>
          <h1 style={{ margin: "12px 0 10px 0", fontSize: 58, lineHeight: 0.95, fontWeight: 900 }}>{city}</h1>
          <p style={{ margin: 0, fontSize: 18, maxWidth: 640 }}>
            Intégration Lovable pilotée par le manifest frontend Stella. Ordre des slides, thème et composants résolus depuis une seule requête.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {scores.slice(0, 4).map((score, index) => (
            <div
              key={String((score as Record<string, unknown>).score_id || index)}
              style={{ minWidth: 140, borderRadius: 18, padding: "16px 18px", background: "#FFFFFF", boxShadow: "0 12px 24px rgba(0,0,0,0.06)" }}
            >
              <div style={{ fontSize: 12, opacity: 0.72 }}>{String((score as Record<string, unknown>).label || (score as Record<string, unknown>).name || `Score ${index + 1}`)}</div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>{String((score as Record<string, unknown>).value ?? "-")}</div>
            </div>
          ))}
        </div>
      </div>

      <aside style={{ borderRadius: 28, background: "var(--stella-primary, #0066CC)", color: "#FFFFFF", display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <div>
          <div style={{ fontSize: 14, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.85 }}>Verdict</div>
          <div style={{ fontSize: 44, fontWeight: 900, lineHeight: 1.0, margin: "10px 0 16px 0" }}>{verdict}</div>
          <div style={{ fontSize: 14, opacity: 0.9 }}>Slide {slide.slide_index} / {manifest.renderer.playlist.slides.length}</div>
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
  const firstComponentName =
    (firstResolved && (firstResolved.displayName || firstResolved.name)) || "(none)";

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