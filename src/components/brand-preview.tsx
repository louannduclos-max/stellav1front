import { FileText, Sparkles, TrendingUp } from "lucide-react";

function isHex(v: string) {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function readable(bg: string): string {
  if (!isHex(bg)) return "#0B0B12";
  const r = parseInt(bg.slice(1, 3), 16);
  const g = parseInt(bg.slice(3, 5), 16);
  const b = parseInt(bg.slice(5, 7), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150 ? "#0B0B12" : "#FFFFFF";
}

export interface BrandPreviewProps {
  primary: string;
  secondary: string;
  accent: string;
  name?: string;
}

export function BrandPreview({ primary, secondary, accent, name = "Aperçu marque" }: BrandPreviewProps) {
  const p = isHex(primary) ? primary : "#1E3A8A";
  const s = isHex(secondary) ? secondary : "#15803D";
  const a = isHex(accent) ? accent : "#0EA5E9";
  const onP = readable(p);
  const onS = readable(s);
  const onA = readable(a);

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
      {/* Mini palette bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-6 w-6 rounded-md border border-border" style={{ background: p }} />
          <span className="font-mono">{p.toUpperCase()}</span>
          <span className="text-muted-foreground">primaire</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="h-6 w-6 rounded-md border border-border" style={{ background: s }} />
          <span className="font-mono">{s.toUpperCase()}</span>
          <span className="text-muted-foreground">secondaire</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="h-6 w-6 rounded-md border border-border" style={{ background: a }} />
          <span className="font-mono">{a.toUpperCase()}</span>
          <span className="text-muted-foreground">accent</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mini slide */}
        <div className="rounded-lg overflow-hidden border border-border shadow-sm bg-white">
          <div className="px-4 py-3 flex items-center justify-between" style={{ background: p, color: onP }}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full" style={{ background: a }} />
              {name}
            </div>
            <span className="text-[10px] opacity-80">Étude · Aperçu</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="text-sm font-semibold" style={{ color: p }}>Analyse de marché — synthèse</div>
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-muted" />
              <div className="h-1.5 w-5/6 rounded-full bg-muted" />
              <div className="h-1.5 w-3/4 rounded-full bg-muted" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
                style={{ background: a, color: onA }}
              >
                <Sparkles className="h-3 w-3" /> Insight
              </span>
              <span
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full"
                style={{ background: s, color: onS }}
              >
                <TrendingUp className="h-3 w-3" /> +18%
              </span>
            </div>
          </div>
        </div>

        {/* Mini cards */}
        <div className="grid grid-cols-1 gap-3">
          <div className="rounded-lg border bg-white p-3" style={{ borderColor: p }}>
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="h-7 w-7 rounded-md inline-flex items-center justify-center"
                style={{ background: p, color: onP }}
              >
                <FileText className="h-3.5 w-3.5" />
              </span>
              <div className="text-xs font-semibold" style={{ color: p }}>Livrable PDF</div>
            </div>
            <div className="text-[11px] text-muted-foreground">Mise en page aux couleurs de votre marque.</div>
          </div>
          <div className="rounded-lg border bg-white p-3 flex items-center justify-between" style={{ borderColor: "transparent" }}>
            <div>
              <div className="text-xs font-semibold mb-0.5">Bouton primaire</div>
              <div className="text-[11px] text-muted-foreground">Rendu sur le wizard et le livrable.</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs font-semibold px-3 py-1.5 rounded-md shadow-sm"
                style={{ background: p, color: onP }}
              >
                Action
              </button>
              <button
                type="button"
                className="text-xs font-semibold px-3 py-1.5 rounded-md border"
                style={{ borderColor: p, color: p, background: "white" }}
              >
                Secondaire
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Aperçu indicatif des 3 couleurs avant enregistrement.
      </p>
    </div>
  );
}