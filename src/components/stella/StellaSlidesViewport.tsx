import React, { useEffect, useMemo, useState } from "react";
import StellaSlide5_0Comp from "./StellaSlide5_0";
import { useViewportScale } from "./useViewportScale";
import { useBrandCssVars } from "./useBrandCssVars";
import { auditAllSlides } from "./qa";
import type { StellaSlides5_0Payload, StellaQAReport } from "./types";

// Sprint 14e-fix2 : VITE_STELLA_PUBLIC_URL est définie sur CF Pages avec
// http://127.0.0.1:8000 (constaté au network : 503 + mixed content) — une
// valeur localhost/http inlinée au build casse la prod. Garde-fou : on
// n'accepte la variable que si elle est https et non-locale.
const _envUrl = import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined;
const _envUrlValid =
  _envUrl && _envUrl.startsWith("https://") && !/localhost|127\.0\.0\.1/.test(_envUrl);
const DEFAULT_BASE_URL = _envUrlValid
  ? (_envUrl as string)
  : "https://stella-backend-mtap.onrender.com";

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

export default function StellaSlidesViewport({ studyId, baseUrl, debug = false }: Props) {
  // Sprint 14e-fix : la route passe baseUrl="" quand le param est absent —
  // une chaîne vide écrasait le défaut → fetch relatif → Failed to fetch.
  const apiBase = (baseUrl && baseUrl.trim()) || DEFAULT_BASE_URL;
  const [payload, setPayload] = useState<StellaSlides5_0Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // FIX F3+F4 -- hook partage, ref sur le viewport (pas dans le .map)
  const { ref: viewportRef, scale } = useViewportScale();

  // Injection CSS vars brand
  useBrandCssVars(payload?.css_vars, payload?.brand_slug, apiBase);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setActiveSlide(0);
    fetch(apiBase + "/integration/study/" + studyId + "/slides-5_0", {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Stella slides-5_0 HTTP " + r.status);
        return r.json();
      })
      .then((data: StellaSlides5_0Payload) => setPayload(data))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [studyId, apiBase]);

  const qaReports: StellaQAReport[] = useMemo(() => {
    if (!payload) return [];
    return auditAllSlides(payload.slides);
  }, [payload]);

  if (loading) {
    return <div className="stella-5-0-viewport"><p style={{ color: "#fff" }}>Chargement Stella 5.0...</p></div>;
  }
  if (error || !payload) {
    return (
      <div className="stella-5-0-viewport">
        <p className="stella-5-0-error">{"Erreur slides-5_0 : " + (error || "Aucune donnee")}</p>
      </div>
    );
  }

  const totalSlides = payload.slides.length;
  const isFirst = activeSlide === 0;
  const isLast = activeSlide === totalSlides - 1;
  const currentSlide = payload.slides[activeSlide];
  const pptxUrl = apiBase + "/integration/study/" + studyId + "/export/pptx";
  const scaledW = (1920 * scale) + "px";

  return (
    <div className="stella-5-0-viewport" ref={viewportRef}>
      {debug ? (
        <pre className="stella-5-0-debug">
          {"[Stella 5.0 debug]\n" +
            "studyId        : " + studyId + "\n" +
            "baseUrl        : " + apiBase + "\n" +
            "slides         : " + totalSlides + "\n" +
            "canvas         : " + payload.canvas.width + " x " + payload.canvas.height + "\n" +
            "active         : " + (activeSlide + 1) + " / " + totalSlides + "\n" +
            "overlap issues : " + qaReports.reduce((acc, r) => acc + r.overlap_violations.length, 0) + "\n" +
            "text issues    : " + qaReports.reduce((acc, r) => acc + r.text_violations.length, 0) + "\n" +
            "non-compliant  : " + (qaReports.filter((r) => !r.whitespace_compliant).map((r) => r.slide_id).join(", ") || "none")}
        </pre>
      ) : null}

      {/* Stage - slide active uniquement */}
      <div
        className="stella-5-0-stage"
        style={{
          width: scaledW,
          height: (1080 * scale) + "px",
        }}
      >
        <div
          style={{
            transform: "scale(" + scale + ")",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: scaledW,
          marginTop: "12px",
          gap: "8px",
        }}
      >
        <button
          style={{ ...btnBase, background: isFirst ? "#555" : "#4f46e5" }}
          disabled={isFirst}
          onClick={() => setActiveSlide((p) => Math.max(0, p - 1))}
        >
          Precedent
        </button>
        <span style={{ color: "#fff", fontSize: "13px" }}>
          {activeSlide + 1} / {totalSlides}
        </span>
        <button
          style={{ ...btnBase, background: isLast ? "#555" : "#4f46e5" }}
          disabled={isLast}
          onClick={() => setActiveSlide((p) => Math.min(totalSlides - 1, p + 1))}
        >
          Suivant
        </button>
        <a
          href={pptxUrl}
          download
          style={{ ...btnBase, background: "#059669", textDecoration: "none", marginLeft: "auto" }}
        >
          Telecharger PPTX
        </a>
      </div>
    </div>
  );
}
