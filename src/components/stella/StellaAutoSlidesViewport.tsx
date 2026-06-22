import React, { useEffect, useMemo, useState } from "react";
import StellaSlide5_0Comp from "./StellaSlide5_0";
import { useViewportScale } from "./useViewportScale";
import { useBrandCssVars } from "./useBrandCssVars";
import { auditAllSlides } from "./qa";
import type { StellaSlides5_0Payload, StellaQAReport } from "./types";

const DEFAULT_BASE_URL =
  (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) || "http://127.0.0.1:8000";

type Props = {
  baseUrl?: string;
  debug?: boolean;
};

export default function StellaAutoSlidesViewport({ baseUrl = DEFAULT_BASE_URL, debug = false }: Props) {
  const [payload, setPayload] = useState<StellaSlides5_0Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // FIX F3+F4 — hook partagé, ref sur le viewport (pas dans le .map)
  const { ref: viewportRef, scale } = useViewportScale();

  // Injection CSS vars brand depuis la réponse slides
  useBrandCssVars(payload?.css_vars, payload?.brand_slug, baseUrl);

  const url = `${baseUrl}/integration/auto-slides-5_0`;

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Stella auto-slides-5_0 HTTP ${r.status}`);
        return r.json();
      })
      .then((data: StellaSlides5_0Payload) => setPayload(data))
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  const qaReports: StellaQAReport[] = useMemo(() => {
    if (!payload) return [];
    return auditAllSlides(payload.slides);
  }, [payload]);

  if (loading) {
    return <div className="stella-5-0-viewport"><p style={{ color: "#fff" }}>Chargement Stella 5.0 (auto)…</p></div>;
  }
  if (error || !payload) {
    return (
      <div className="stella-5-0-viewport">
        <p className="stella-5-0-error">Erreur auto-slides-5_0 : {error || "Aucune donnée"}</p>
      </div>
    );
  }

  return (
    <div className="stella-5-0-viewport" ref={viewportRef}>
      {debug ? (
        <pre className="stella-5-0-debug">
{`[Stella 5.0 debug — auto]
mode           : auto
baseUrl        : ${baseUrl}
fetchUrl       : ${url}
slides         : ${payload.slides.length}
canvas         : ${payload.canvas.width} x ${payload.canvas.height}
overlap issues : ${qaReports.reduce((acc, r) => acc + r.overlap_violations.length, 0)}
text issues    : ${qaReports.reduce((acc, r) => acc + r.text_violations.length, 0)}
non-compliant  : ${qaReports.filter((r) => !r.whitespace_compliant).map((r) => r.slide_id).join(", ") || "none"}`}
        </pre>
      ) : null}

      {payload.slides.map((slide) => (
        <div
          key={slide.slide_id}
          className="stella-5-0-stage"
          style={{
            width: `${1920 * scale}px`,
            height: `${1080 * scale}px`,
          }}
        >
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              width: 1920,
              height: 1080,
            }}
          >
            <StellaSlide5_0Comp slide={slide} debug={debug} />
          </div>
        </div>
      ))}
    </div>
  );
}