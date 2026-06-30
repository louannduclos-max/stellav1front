import React, { useEffect, useMemo, useState } from "react";
import StellaSlide5_0Comp from "./StellaSlide5_0";
import { useViewportScale } from "./useViewportScale";
import { useBrandCssVars } from "./useBrandCssVars";
import { auditAllSlides } from "./qa";
import type { StellaSlides5_0Payload, StellaQAReport } from "./types";

const DEFAULT_BASE_URL =
  (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) || "http://127.0.0.1:8000";

type Props = {
  studyId: string;
  baseUrl?: string;
  debug?: boolean;
};

const btnBase: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: "6px",
  cursor: "pointer",
  color: "white",
  border: "none",
  fontSize: "14px",
  fontWeight: 500,
  transition: "background 0.15s",
};

export default function StellaSlidesViewport({ studyId, baseUrl = DEFAULT_BASE_URL, debug = false }: Props) {
  const [payload, setPayload] = useState<StellaSlides5_0Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // FIX F3+F4 — hook partagé, ref sur le viewport (pas dans le .map)
  const { ref: viewportRef, scale } = useViewportScale();

  // Injection CSS vars brand depuis la réponse slides (merge registre statique + Supabase override)
  useBrandCssVars(payload?.css_vars, payload?.brand_slug, baseUrl);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setActiveSlide(0);
    fetch(`${baseUrl}/integration/study/${studyId}/slides-5_0`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Stella slides-5_0 HTTP ${r.status}`);
        return r.json();
      })
      .then((data: StellaSlides5_0Payload) => setPayload(data))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [studyId, baseUrl]);

  const qaReports: StellaQAReport[] = useMemo(() => {
    if (!payload) return [];
    return auditAllSlides(payload.slides);
  }, [payload]);

  if (loading) {
    return <div className="stella-5-0-viewport"><p style={{ color: "#fff" }}>Chargement Stella 5.0…</p></div>;
  }
  if (error || !payload) {
    return (
      <div className="stella-5-0-viewport">
        <p className="stella-5-0-error">Erreur slides-5_0 : {error || "Aucune donnée"}</p>
      </div>
    );
  }

  const totalSlides = payload.slides.length;
  const isFirst = activeSlide === 0;
  const isLast = activeSlide === totalSlides - 1;
  const currentSlide = payload.slides[activeSlide];
  const pptxUrl = `${baseUrl}/integration/study/${studyId}/export/pptx`;
  const scaledW = `${1920 * scale}px`;

  return (
    <div className="stella-5-0-viewport" ref={viewportRef}>
      {debug ? (
        <pre className="stella-5-0-debug">
{`[Stella 5.0 debug]
studyId        : ${studyId}
baseUrl        : ${baseUrl}
slides         : ${totalSlides}
canvas         : ${payload.canvas.width} x ${payload.canvas.height}
active         : ${activeSlide + 1} / ${totalSlides}
overlap issues : ${qaReports.reduce((acc, r) => acc + r.overlap_violations.length, 0)}
text issues    : ${qaReports.reduce((acc, r) => acc + r.text_violations.length, 0)}
non-compliant  : ${qaReports.filter((r) => !r.whitespace_compliant).map((r) => r.slide_id).join(", ") || "none"}`}
        </pre>
      ) : null}

      {/* Stage — slide active uniquement */}
      <div
        className="stella-5-0-stage"
        style={{ width: scaledW, height: `${1080 * scale}px`, borderRadius: "16px 16px 0 0" }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: 1920,
            height: 1080,
          }}
        >
          <StellaSlide5_0Comp slide={currentSlide} debug={debug} />
        </div>
      </div>

      {/* Barre de navigation */}
      <div
        style={{
          width: scaledW,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "10px 16px",
          background: "#111",
          boxSizing: "border-box",
        }}
      >
        <button
          onClick={() => setActiveSlide((s) => Math.max(0, s - 1))}
          disabled={isFirst}
          style={{ ...btnBase, background: isFirst ? "#2a2a2a" : "#0066CC", cursor: isFirst ? "default" : "pointer" }}
        >
          ← Précédente
        </button>

        <span style={{ color: "#888", fontSize: "13px", minWidth: "200px", textAlign: "center" }}>
          {activeSlide + 1} / {totalSlides}
          {currentSlide?.section_id ? ` — ${currentSlide.section_id.replace(/_/g, " ")}` : ""}
        </span>

        {/* Bouton PPTX */}
        <a
          href={pptxUrl}
          download={`stella_${studyId}.pptx`}
          style={{
            ...btnBase,
            background: "#00CC66",
            textDecoration: "none",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ⬇ PPTX
        </a>

        <button
          onClick={() => setActiveSlide((s) => Math.min(totalSlides - 1, s + 1))}
          disabled={isLast}
          style={{ ...btnBase, background: isLast ? "#2a2a2a" : "#0066CC", cursor: isLast ? "default" : "pointer" }}
        >
          Suivante →
        </button>
      </div>

      {/* Vignettes */}
      <div
        style={{
          width: scaledW,
          display: "flex",
          gap: "6px",
          padding: "8px 16px",
          overflowX: "auto",
          background: "#1a1a1a",
          boxSizing: "border-box",
          borderRadius: "0 0 16px 16px",
        }}
      >
        {payload.slides.map((slide, i) => (
          <button
            key={slide.slide_id}
            onClick={() => setActiveSlide(i)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "11px",
              whiteSpace: "nowrap",
              background: i === activeSlide ? "#0066CC" : "#333",
              color: "white",
              border: "none",
              transition: "background 0.15s",
            }}
          >
            {i + 1}. {slide.section_id.replace(/_/g, " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
