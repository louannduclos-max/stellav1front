import React, { useEffect, useMemo, useRef, useState } from "react";
import StellaSlide5_0Comp from "./StellaSlide5_0";
import { auditAllSlides } from "./qa";
import type { StellaSlides5_0Payload, StellaQAReport } from "./types";

const DEFAULT_BASE_URL =
  (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) || "http://127.0.0.1:8000";

type Props = {
  studyId: string;
  baseUrl?: string;
  debug?: boolean;
};

function useViewportScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function recompute() {
      if (!ref.current) return;
      const parentWidth = ref.current.clientWidth || window.innerWidth;
      const next = Math.min(1, (parentWidth - 80) / 1920);
      setScale(next);
    }
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [ref]);
  return scale;
}

export default function StellaSlidesViewport({ studyId, baseUrl = DEFAULT_BASE_URL, debug = false }: Props) {
  const [payload, setPayload] = useState<StellaSlides5_0Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scale = useViewportScale(stageRef);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
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

  return (
    <div className="stella-5-0-viewport" ref={stageRef}>
      {debug ? (
        <pre className="stella-5-0-debug">
{`[Stella 5.0 debug]
studyId        : ${studyId}
baseUrl        : ${baseUrl}
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