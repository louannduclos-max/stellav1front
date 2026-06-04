import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { getStudy, createStudyVersion } from "@/lib/studies.functions";
import { listDeliverables } from "@/lib/deliverables.functions";
import { generateStudy } from "@/lib/generate-study.functions";
import { AppShell, GenerationStatusBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { toast } from "sonner";
import { StudySlideViewer } from "@/components/study-slide-viewer";
import { StudyResultView } from "@/components/result/study-result-view";
import { StudyGenerationStage } from "@/components/study-generation-stage";

export const Route = createFileRoute("/_authenticated/app/studies/$id")({
  head: () => ({ meta: [{ title: "Étude — Stella" }] }),
  component: StudyDetail,
});

function formatSize(bytes: number | null | undefined) {
  if (!bytes) return "—";
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

function formatDuration(start: string | null, end: string | null) {
  if (!start || !end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0) return "—";
  const s = Math.floor(ms / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const TYPE_META: Record<string, { icon: string; label: string }> = {
  pdf: { icon: "📄", label: "PDF (vectoriel)" },
  pdf_native: { icon: "📄", label: "PDF (vectoriel)" },
  pptx: { icon: "🎨", label: "PPTX (modifiable)" },
  html: { icon: "🌐", label: "Aperçu HTML" },
  other: { icon: "🌐", label: "Aperçu HTML" },
  notice: { icon: "🔒", label: "Notice méthodologique (admin)" },
};

function StatusBanner({
  status,
  startedAt,
  errorMessage,
  onRetry,
  retrying,
}: {
  status: string | null | undefined;
  startedAt: string | null;
  errorMessage: string | null;
  onRetry: () => void;
  retrying: boolean;
}) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (status !== "processing" || !startedAt) return;
    const tick = () =>
      setElapsed(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [status, startedAt]);

  if (!status || status === "draft") return null;

  if (status === "pending") {
    return (
      <div className="rounded-md border border-border bg-muted px-4 py-3 text-sm text-muted-foreground">
        ⏳ En attente de prise en charge…
      </div>
    );
  }
  if (status === "processing") {
    return (
      <div className="rounded-md border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-300 animate-pulse">
        🔄 Génération en cours… ({elapsed}s)
      </div>
    );
  }
  if (status === "completed" || status === "done") {
    return (
      <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300">
        ✅ Étude générée — livrables disponibles ci-dessous
      </div>
    );
  }
  if (status === "failed" || status === "error") {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-center justify-between gap-3">
        <span>❌ Échec — {errorMessage || "erreur inconnue"}</span>
        <Button size="sm" variant="outline" onClick={onRetry} disabled={retrying}>
          ↻ Relancer
        </Button>
      </div>
    );
  }
  return null;
}

function StudyDetail() {
  const { id } = Route.useParams();
  const router = useRouter();
  const qc = useQueryClient();
  const fetchStudy = useServerFn(getStudy);
  const fetchDeliverables = useServerFn(listDeliverables);
  const runGenerate = useServerFn(generateStudy);
  const createVersion = useServerFn(createStudyVersion);

  const studyQ = useQuery({
    queryKey: ["study", id],
    queryFn: () => fetchStudy({ data: { id } }),
  });
  const delivQ = useQuery({
    queryKey: ["deliverables", id],
    queryFn: () => fetchDeliverables({ data: { study_id: id } }),
  });

  useEffect(() => {
    const ch = supabaseBrowser
      .channel(`study-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "studies", filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["study", id] }),
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "study_deliverables", filter: `study_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["deliverables", id] }),
      )
      .subscribe();
    return () => {
      supabaseBrowser.removeChannel(ch);
    };
  }, [id, qc]);

  const genMut = useMutation({
    mutationFn: () => runGenerate({ data: { studyId: id } }),
    onSuccess: () => {
      toast.success("🚀 Génération lancée (~5-10 min, ~0.25 €)");
      qc.invalidateQueries({ queryKey: ["study", id] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const versionMut = useMutation({
    mutationFn: () => createVersion({ data: { source_study_id: id } }),
    onSuccess: (r) => {
      toast.success(`Version ${r.version} créée`);
      router.navigate({ to: "/app/studies/$id", params: { id: r.id } });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const handleDownload = async (path: string) => {
    const { data, error } = await supabaseBrowser.storage.from("deliverables").download(path);
    if (error || !data) {
      toast.error(error?.message ?? "Fichier indisponible");
      return;
    }
    const fileName = path.split("/").pop() || "livrable";
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  if (studyQ.isLoading) return <AppShell><div className="p-6">Chargement…</div></AppShell>;
  if (studyQ.error || !studyQ.data) {
    return (
      <AppShell>
        <div className="p-6 text-destructive">
          {studyQ.error instanceof Error ? studyQ.error.message : "Étude introuvable"}
        </div>
      </AppShell>
    );
  }

  const { study, versions } = studyQ.data;
  const status = study.generation_status;
  const canLaunch =
    !status || status === "draft" || status === "pending" || status === "failed";
  const isCompleted = status === "completed" || status === "done";
  const isGenerating = status === "pending" || status === "processing";

  // When the study is completed, take over the full viewport with the
  // dedicated Cloud Design result experience.
  if (isCompleted && delivQ.data && delivQ.data.length > 0) {
    return (
      <StudyResultView
        study={{
          id: study.id,
          title: study.title,
          city_name: study.city_name,
          country_code: study.country_code,
          version_number: study.version_number,
          created_at: study.created_at,
          generation_completed_at: study.generation_completed_at,
        }}
        deliverables={delivQ.data}
      />
    );
  }

  return (
    <AppShell>
      <div className="p-6 max-w-5xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <Link to="/app/studies" className="text-sm text-muted-foreground hover:underline">
              ← Études
            </Link>
            <h1 className="text-2xl font-semibold mt-2">
              {study.title || "Étude sans titre"}{" "}
              <span className="text-base font-normal text-muted-foreground">v{study.version_number}</span>
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <GenerationStatusBadge
                status={study.generation_status}
                errorMessage={study.generation_error_message}
              />
              {(() => {
                const subtype = (study as { study_subtype_code?: string }).study_subtype_code;
                if (!subtype) return null;
                return (
                  <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium text-foreground">
                    {subtype}
                  </span>
                );
              })()}
              <span className="text-xs text-muted-foreground">
                {study.city_name} {study.country_code && `(${study.country_code})`}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => versionMut.mutate()}
              disabled={versionMut.isPending}
            >
              Nouvelle version
            </Button>
          </div>
        </div>

        <StatusBanner
          status={status}
          startedAt={study.generation_started_at}
          errorMessage={study.generation_error_message}
          onRetry={() => genMut.mutate()}
          retrying={genMut.isPending}
        />

        {isGenerating && (
          <StudyGenerationStage
            progress={(study as { progress?: number | null }).progress ?? 0}
            progressLabel={(study as { progress_label?: string | null }).progress_label ?? null}
            etaSeconds={(study as { eta_seconds?: number | null }).eta_seconds ?? null}
            phase={(study as { phase?: number | null }).phase ?? null}
            phaseTotal={(study as { phase_total?: number | null }).phase_total ?? 5}
            phaseLabel={(study as { phase_label?: string | null }).phase_label ?? null}
          />
        )}

        {canLaunch && !isGenerating && (
          <section className="rounded-md border border-border p-5 text-center space-y-3">
            <Button
              size="lg"
              onClick={() => genMut.mutate()}
              disabled={genMut.isPending}
              className="text-white shadow-md hover:opacity-95"
              style={{
                background: "linear-gradient(135deg, #E63946 0%, #C1440E 100%)",
              }}
            >
              {genMut.isPending ? "Lancement…" : "🚀 Lancer la génération de l'étude"}
            </Button>
            <div className="text-xs text-muted-foreground">
              Temps estimé : 5-10 min · Coût : ~0.25 €
            </div>
          </section>
        )}

        {isCompleted && (
          <section className="border border-border rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium">Prévisualisation des slides</h2>
              <span className="text-xs text-muted-foreground">
                {delivQ.data?.length ?? 0} livrable(s)
              </span>
            </div>
            {!delivQ.data?.length && (
              <div className="text-sm text-muted-foreground">Aucun livrable pour le moment.</div>
            )}
            {!!delivQ.data?.length && (
              <StudySlideViewer
                deliverables={delivQ.data.filter((d) => d.type !== "notice")}
              />
            )}

            {(() => {
              const notice = delivQ.data?.find((d) => d.type === "notice");
              if (!notice) return null;
              return (
                <div className="mt-4 rounded-md border-2 border-destructive/40 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-destructive">🔒</span>
                    <span className="inline-flex items-center rounded-full bg-destructive/15 text-destructive text-[10px] font-medium px-2 py-0.5 uppercase tracking-wide">
                      Admin uniquement
                    </span>
                  </div>
                  <div className="font-medium text-sm">Notice méthodologique</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Sources, méthode de calcul et limites par slide. Usage interne FLEXIBIA —
                    ne pas transmettre au client.
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(notice.file_url)}
                  >
                    📥 Télécharger notice.pdf
                    <span className="ml-2 text-muted-foreground">
                      {formatSize(notice.file_size)}
                    </span>
                  </Button>
                </div>
              );
            })()}

            {!!delivQ.data?.length && (
              <details className="mt-4">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:underline">
                  Voir tous les fichiers générés ({delivQ.data.length})
                </summary>
                <ul className="grid gap-2 sm:grid-cols-2 mt-3">
                  {delivQ.data.map((d) => {
                    const meta = TYPE_META[d.type] ?? { icon: "📁", label: d.type };
                    return (
                      <li
                        key={d.id}
                        className="rounded-md border border-border p-2 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-medium flex items-center gap-1.5">
                            <span>{meta.icon}</span>
                            <span>{meta.label}</span>
                            <span className="text-muted-foreground">{formatSize(d.file_size)}</span>
                          </div>
                          <div className="text-muted-foreground truncate">
                            {d.file_name || d.file_url}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => handleDownload(d.file_url)}>
                          📥
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
          </section>
        )}

        {isCompleted && (
          <section className="border border-border rounded-md p-4">
            <h2 className="font-medium mb-2">Métriques de génération</h2>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Durée totale</dt>
              <dd>{formatDuration(study.generation_started_at, study.generation_completed_at)}</dd>
              <dt className="text-muted-foreground">Démarrée</dt>
              <dd>{study.generation_started_at ? new Date(study.generation_started_at).toLocaleString("fr-FR") : "—"}</dd>
              <dt className="text-muted-foreground">Terminée</dt>
              <dd>{study.generation_completed_at ? new Date(study.generation_completed_at).toLocaleString("fr-FR") : "—"}</dd>
            </dl>
          </section>
        )}

        <section className="border border-border rounded-md p-4">
          <h2 className="font-medium mb-2">Historique des versions</h2>
          <ul className="text-sm divide-y divide-border">
            {versions.map((v) => (
              <li key={v.id} className="py-2 flex items-center justify-between">
                <Link
                  to="/app/studies/$id"
                  params={{ id: v.id }}
                  className={v.id === study.id ? "font-medium" : "hover:underline"}
                >
                  v{v.version_number} — {v.title || "Sans titre"}
                </Link>
                <div className="flex items-center gap-2">
                  <GenerationStatusBadge status={v.generation_status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(v.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}