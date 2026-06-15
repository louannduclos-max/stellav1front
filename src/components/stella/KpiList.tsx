import type { StellaMetric } from "@/types/stella-pack";

interface Props {
  metrics?: StellaMetric[];
}

export function KpiList({ metrics }: Props) {
  if (!metrics || metrics.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun KPI disponible.</p>;
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {metrics.map((m, i) => {
        const key = m.key ?? m.id ?? String(i);
        const label = m.label ?? m.name ?? key;
        return (
          <li
            key={key}
            className="rounded-lg border bg-card p-4 shadow-sm"
            style={{ borderColor: "var(--stella-primary, hsl(var(--border)))" }}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{label}</span>
              {m.optional ? (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                  optional
                </span>
              ) : null}
            </div>
            {m.value !== undefined && m.value !== null ? (
              <div className="mt-2 text-2xl font-semibold">
                {String(m.value)}
                {m.unit ? <span className="ml-1 text-sm font-normal text-muted-foreground">{m.unit}</span> : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}