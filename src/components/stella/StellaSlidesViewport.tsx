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
          {"[Stella 5.0 debug]\n" +
            "studyId        : " + studyId + "\n" +
            "baseUrl        : " + baseUrl + "\n" +
            "slides         : " + totalSlides + "\n" +
            "canvas         : " + payload.canvas.width + " x " + payload.canvas.height + "\n" +
            "active         : " + (activeSlide + 1) + " / " + totalSlides + "\n" +
            "overlap issues : " + qaReports.reduce((acc, r) => acc + r.overlap_violations.length, 0) + "\n" +
            "text issues    : " + qaReports.reduce((acc, r) => acc + r.text_violations.length, 0) + "\n" +
            "non-compliant  : " + (qaReports.filter((r) => !r.whitespace_compliant).map((r) => r.slide_id).join(", ") || "none")}
        </pre>
      ) : null}

      {/* Stage — slide active unique