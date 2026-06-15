import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useStellaPack } from "@/hooks/useStellaPack";
import { BrandStyleInjector } from "@/components/stella/BrandStyleInjector";
import { KpiList } from "@/components/stella/KpiList";
import { StudyPreview } from "@/components/stella/StudyPreview";

export const Route = createFileRoute("/study/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Étude ${params.id} — Stella` }],
  }),
  component: StudyPage,
  errorComponent: StudyError,
  notFoundComponent: () => <div className="p-8">Étude introuvable.</div>,
});

function StudyPage() {
  const { id } = Route.useParams();
  const { data: pack, isLoading, error } = useStellaPack(id);

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Chargement du pack…</div>;
  }
  if (error || !pack) {
    return (
      <div className="p-8 text-destructive">
        Erreur de chargement : {error instanceof Error ? error.message : "inconnue"}
      </div>
    );
  }

  const metrics = pack.lovable_config?.payload?.metrics;
  const previewSrc = pack.data_endpoints?.preview_html;
  const vars = pack.css?.variables;

  return (
    <>
      <BrandStyleInjector vars={vars} />
      <main className="mx-auto max-w-6xl space-y-8 p-6 md:p-10">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Étude</p>
          <h1
            className="text-3xl font-semibold"
            style={{
              color: "var(--stella-primary, hsl(var(--foreground)))",
              fontFamily: "var(--stella-font, inherit)",
            }}
          >
            {id}
          </h1>
        </header>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">KPI</h2>
          <KpiList metrics={metrics} />
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Aperçu</h2>
          <StudyPreview src={previewSrc} title={`Aperçu étude ${id}`} />
        </section>
      </main>
    </>
  );
}

function StudyError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="p-8 space-y-3">
      <p className="text-destructive">Erreur : {error.message}</p>
      <button
        className="rounded border px-3 py-1 text-sm"
        onClick={() => {
          reset();
          router.invalidate();
        }}
      >
        Réessayer
      </button>
    </div>
  );
}