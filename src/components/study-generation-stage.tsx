import { useEffect, useMemo, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const SB_URL =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  "https://utwjfsomblhupghbgvgv.supabase.co";
const SB_KEY =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || "";

// Default phase labels (fallback when backend does not send `phase_label`).
// Mapping aligns with the backend progress ranges :
//  1 → 0-8%, 2 → 8-60%, 3 → 60-82%, 4 → 82-98%, 5 → 98-100%
const DEFAULT_PHASE_LABELS: Record<number, string> = {
  1: "Préparation du brief",
  2: "Analyse des paramètres & collecte des données",
  3: "Rédaction de l'étude",
  4: "Mise en page & visuels",
  5: "Finalisation",
};

function phaseFromProgress(p: number): number {
  if (p < 8) return 1;
  if (p < 60) return 2;
  if (p < 82) return 3;
  if (p < 98) return 4;
  return 5;
}

function formatEta(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  if (seconds < 60) return `~${Math.max(1, Math.ceil(seconds))} s restantes`;
  const min = Math.ceil(seconds / 60);
  return `~${min} min restante${min > 1 ? "s" : ""}`;
}

type Bubble = { id: number; x: number; y: number; size: number; hue: number; born: number };
type Burst = { id: number; x: number; y: number; hue: number };

export function StudyGenerationStage({
  progress,
  progressLabel,
  etaSeconds,
  phase: phaseProp,
  phaseTotal,
  phaseLabel,
}: {
  progress: number | null | undefined;
  progressLabel?: string | null;
  etaSeconds?: number | null;
  phase?: number | null;
  phaseTotal?: number | null;
  phaseLabel?: string | null;
}) {
  // Source of truth = backend. No local timer drives the bar / %.
  const realProgress = Math.max(0, Math.min(100, progress ?? 0));
  const total = phaseTotal && phaseTotal > 0 ? phaseTotal : 5;
  const phase = phaseProp && phaseProp > 0 ? phaseProp : phaseFromProgress(realProgress);
  const title = phaseLabel?.trim() || DEFAULT_PHASE_LABELS[phase] || "Génération en cours…";

  // Detect stalls — render a subtle shimmer when progress hasn't moved,
  // but never bump the displayed value.
  const lastChangeRef = useRef<number>(Date.now());
  const lastProgressRef = useRef<number>(realProgress);
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    if (realProgress !== lastProgressRef.current) {
      lastProgressRef.current = realProgress;
      lastChangeRef.current = Date.now();
      setStalled(false);
    }
  }, [realProgress]);
  useEffect(() => {
    const t = setInterval(() => {
      setStalled(Date.now() - lastChangeRef.current > 8000);
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const visualPhase = useMemo(() => {
    if (phase <= 1) return 1;
    if (phase >= 4) return 3;
    return phase === 2 ? 2 : 3;
  }, [phase]);

  return (
    <div className="relative rounded-xl border border-border bg-card p-6 overflow-hidden">
      <div className="text-center">
        <div className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase">
          Phase {phase} / {total}
        </div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold text-foreground">
          {title}
        </h2>
        {progressLabel ? (
          <div className="mt-1 text-sm text-muted-foreground">{progressLabel}</div>
        ) : null}
      </div>

      <div className="relative my-8 h-[260px]">
        {visualPhase === 1 && <PhaseImplosion />}
        {visualPhase === 2 && <PhaseData />}
        {visualPhase === 3 && <PhaseAssembly />}
      </div>

      <div className="mx-auto max-w-xl">
        <div className={`h-2 rounded-full bg-muted overflow-hidden ${stalled ? "animate-pulse" : ""}`}>
          <div
            className="h-full rounded-full transition-[width] duration-700 ease-out"
            style={{
              width: `${realProgress}%`,
              background: "linear-gradient(90deg, #1e40af, #3b82f6)",
            }}
          />
        </div>
        <div className="mt-2 text-center text-xs text-primary">
          {Math.round(realProgress)}% · {formatEta(etaSeconds)}
        </div>
      </div>

      {/* Bubble game overlaid on top of the entire stage */}
      <BubbleOverlay />
    </div>
  );
}

function Pill({ label, x, y, delay }: { label: string; x: string; y: string; delay: number }) {
  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background px-3 py-1 text-xs text-foreground shadow-sm"
      style={{
        left: x,
        top: y,
        animation: `sg-float 3.6s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      {label}
    </div>
  );
}

function PhaseImplosion() {
  return (
    <div className="relative h-full w-full">
      <Pill label="Zone" x="15%" y="25%" delay={0} />
      <Pill label="Période" x="80%" y="22%" delay={0.3} />
      <Pill label="Type d'étude" x="50%" y="14%" delay={0.6} />
      <Pill label="Cibles" x="50%" y="86%" delay={0.9} />
      <Pill label="Analyse" x="15%" y="72%" delay={1.2} />
      <Pill label="KPI" x="82%" y="76%" delay={1.5} />
      <div
        className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "linear-gradient(135deg, #6366f1, #3b82f6)",
          boxShadow: "0 8px 28px rgba(59,130,246,0.35)",
        }}
      />
      <style>{`@keyframes sg-float { 0%,100% { transform: translate(-50%, -50%); } 50% { transform: translate(-50%, calc(-50% - 6px)); } }`}</style>
    </div>
  );
}

function PhaseData() {
  const sources = [
    { src: "INSEE", txt: "Population & démographie", count: "2 312 lignes" },
    { src: "FILOSOFI", txt: "Revenu médian", count: "847 lignes" },
    { src: "DREES", txt: "Indicateurs santé", count: "124 lignes" },
    { src: "SIRENE", txt: "Acteurs locaux", count: "487 entreprises" },
    { src: "Apollo", txt: "Parts de marché", count: "18 acteurs" },
  ];
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-1.5">
      {sources.map((s, i) => (
        <div
          key={s.src}
          className="flex items-center gap-3 rounded-md border border-border bg-background/60 px-3 py-1.5 text-xs"
          style={{ animation: `sg-in 0.5s ease-out both`, animationDelay: `${i * 0.12}s` }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="w-20 font-semibold text-foreground">{s.src}</span>
          <span className="flex-1 text-muted-foreground">{s.txt}</span>
          <span className="text-muted-foreground">{s.count}</span>
        </div>
      ))}
      <style>{`@keyframes sg-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`}</style>
    </div>
  );
}

function PhaseAssembly() {
  const slides = [
    { rot: -10, x: -120, delay: 0 },
    { rot: -3, x: -60, delay: 0.1 },
    { rot: 2, x: 0, delay: 0.2 },
    { rot: 6, x: 60, delay: 0.3 },
    { rot: 12, x: 120, delay: 0.4 },
  ];
  return (
    <div className="relative h-full w-full">
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 h-[160px] w-[200px] rounded-lg border border-border bg-background p-3 shadow-lg"
          style={{
            transform: `translate(calc(-50% + ${s.x}px), -50%) rotate(${s.rot}deg)`,
            animation: `sg-slide 0.6s ease-out both`,
            animationDelay: `${s.delay}s`,
            zIndex: 5 - Math.abs(2 - i),
          }}
        >
          <div className="mb-2 h-2 w-3/4 rounded bg-muted" />
          <div className="mb-2 h-1.5 w-1/3 rounded bg-primary" />
          <div className="mb-3 h-1.5 w-5/6 rounded bg-muted" />
          <div className="flex h-16 items-end justify-around gap-1">
            {[40, 65, 55, 80, 70].map((h, j) => (
              <div
                key={j}
                className="w-3 rounded-sm"
                style={{ height: `${h}%`, background: "linear-gradient(to top, #14b8a6, #5eead4)" }}
              />
            ))}
          </div>
        </div>
      ))}
      <style>{`@keyframes sg-slide { from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)) rotate(0deg); } }`}</style>
    </div>
  );
}

// === Bubble Pop overlay — covers the whole stage as a filter ===
function BubbleOverlay() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const idRef = useRef(1);
  const submitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load global best
  useEffect(() => {
    let cancelled = false;
    fetch(`${SB_URL}/rest/v1/bubble_pop_global_score?id=eq.1&select=best_score`, {
      headers: { apikey: SB_KEY },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => {
        if (!cancelled && rows?.[0]) setBest(rows[0].best_score || 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Spawn at most 3 bubbles, slowly
  useEffect(() => {
    const spawn = () => {
      setBubbles((prev) => {
        if (prev.length >= 3) return prev;
        const id = idRef.current++;
        return [
          ...prev,
          {
            id,
            x: 8 + Math.random() * 84,
            y: 10 + Math.random() * 80,
            size: 40 + Math.random() * 40,
            hue: Math.floor(Math.random() * 360),
            born: Date.now(),
          },
        ];
      });
    };
    spawn();
    const interval = setInterval(spawn, 2800 + Math.random() * 1800);
    return () => clearInterval(interval);
  }, []);

  // GC old bubbles / bursts
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      setBubbles((prev) => prev.filter((b) => now - b.born < 7000));
      setBursts((prev) => prev.filter((b) => now - b.id < 700));
    }, 500);
    return () => clearInterval(t);
  }, []);

  const pop = (b: Bubble) => {
    setBubbles((prev) => prev.filter((x) => x.id !== b.id));
    setBursts((prev) => [...prev, { id: Date.now() + Math.random(), x: b.x, y: b.y, hue: b.hue }]);
    setScore((s) => {
      const n = s + 1;
      setBest((bestPrev) => {
        if (n > bestPrev) {
          if (submitTimer.current) clearTimeout(submitTimer.current);
          submitTimer.current = setTimeout(async () => {
            try {
              const { data: sess } = await supabaseBrowser.auth.getSession();
              const token = sess.session?.access_token;
              const r = await fetch(`${SB_URL}/rest/v1/rpc/submit_bubble_pop_score`, {
                method: "POST",
                headers: {
                  apikey: SB_KEY,
                  "Content-Type": "application/json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ _score: n }),
              });
              if (r.ok) {
                const v = await r.json();
                if (typeof v === "number") setBest(v);
              }
            } catch {
              /* ignore */
            }
          }, 600);
          return n;
        }
        return bestPrev;
      });
      return n;
    });
  };

  return (
    <>
      {/* Score badge top-right */}
      <div className="pointer-events-none absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-[11px] text-muted-foreground shadow-sm backdrop-blur">
        <span>🫧</span>
        <span>
          Score : <strong className="text-foreground tabular-nums">{score}</strong>
        </span>
        <span>·</span>
        <span>
          Record : <strong className="text-foreground tabular-nums">{best}</strong>
        </span>
      </div>

      {/* Bubbles layer */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {bubbles.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => pop(b)}
            aria-label="Éclater la bulle"
            className="pointer-events-auto absolute rounded-full"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              padding: 0,
              border: `1px solid hsla(${b.hue},80%,80%,0.5)`,
              cursor: "pointer",
              background: `radial-gradient(circle at 30% 30%, hsla(${b.hue},90%,85%,0.95), hsla(${b.hue},80%,55%,0.55) 60%, hsla(${b.hue},70%,45%,0.25) 100%)`,
              boxShadow: `0 4px 18px hsla(${b.hue},70%,55%,0.35), inset 0 0 12px hsla(${b.hue},90%,90%,0.6)`,
              animation: `bpg-float-${b.id % 3} ${7 + (b.id % 4)}s ease-in-out infinite`,
            }}
          />
        ))}
        {bursts.map((b) => (
          <div
            key={b.id}
            className="absolute text-base font-bold"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              transform: "translate(-50%, -50%)",
              color: `hsl(${b.hue},80%,55%)`,
              pointerEvents: "none",
              animation: "bpg-burst 0.65s ease-out forwards",
            }}
          >
            +1 ✨
          </div>
        ))}
        <style>{`
          @keyframes bpg-float-0 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(3px,-4px); } }
          @keyframes bpg-float-1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-4px,-3px); } }
          @keyframes bpg-float-2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(2px,-5px); } }
          @keyframes bpg-burst { 0% { opacity: 1; transform: translate(-50%, -50%) scale(0.8); } 100% { opacity: 0; transform: translate(-50%, -180%) scale(1.6); } }
        `}</style>
      </div>
    </>
  );
}