import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { listStudiesAdmin, listStudyFilters } from "@/lib/studies.functions";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { AppShell, GenerationStatusBadge } from "@/components/app-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/studies")({
  head: () => ({ meta: [{ title: "Études — Stella Admin" }] }),
  component: AdminStudiesPage,
});

function fmtDuration(s: number | null) {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  return `${(s / 3600).toFixed(1)} h`;
}

function AdminStudiesPage() {
  const fetchMe = useServerFn(getCurrentProfile);
  const fetchStudies = useServerFn(listStudiesAdmin);
  const fetchFilters = useServerFn(listStudyFilters);

  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [studyType, setStudyType] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 50;

  const filtersQ = useQuery({
    queryKey: ["study-filters"],
    queryFn: () => fetchFilters(),
    enabled: meQ.data?.role === "admin",
  });

  const params = useMemo(
    () => ({
      search: search || undefined,
      status: status || undefined,
      company_id: companyId || undefined,
      study_type: studyType || undefined,
      created_by: createdBy || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
      page,
      page_size: pageSize,
    }),
    [search, status, companyId, studyType, createdBy, from, to, page],
  );

  const listQ = useQuery({
    queryKey: ["admin-studies", params],
    queryFn: () => fetchStudies({ data: params }),
    enabled: meQ.data?.role === "admin",
  });

  if (meQ.isLoading) return <AppShell><div className="p-6">Chargement…</div></AppShell>;
  if (meQ.data && meQ.data.role !== "admin") throw redirect({ to: "/app/studies" });

  const total = listQ.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const reset = () => {
    setSearch(""); setStatus(""); setCompanyId(""); setStudyType(""); setCreatedBy(""); setFrom(""); setTo(""); setPage(0);
  };

  return (
    <AppShell>
      <div className="p-6 space-y-4">
        <header className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Toutes les études</h1>
            <p className="text-sm text-muted-foreground">{total} étude(s) — page {page + 1} / {totalPages}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 p-3 border border-border rounded-md bg-card">
          <Input
            placeholder="Rechercher un titre…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="md:col-span-2"
          />
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <option value="">Tous statuts</option>
            <option value="pending">En attente</option>
            <option value="processing">En cours</option>
            <option value="done">Terminée</option>
            <option value="error">Erreur</option>
          </select>
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={companyId} onChange={(e) => { setCompanyId(e.target.value); setPage(0); }}>
            <option value="">Toutes entreprises</option>
            {filtersQ.data?.companies.map((c) => (
              <option key={c.id} value={c.id}>{c.display_name}</option>
            ))}
          </select>
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={studyType} onChange={(e) => { setStudyType(e.target.value); setPage(0); }}>
            <option value="">Tous types</option>
            {filtersQ.data?.types.map((t) => (<option key={t} value={t}>{t}</option>))}
          </select>
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={createdBy} onChange={(e) => { setCreatedBy(e.target.value); setPage(0); }}>
            <option value="">Tous consultants</option>
            {filtersQ.data?.authors.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name || p.email}</option>
            ))}
          </select>
          <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} />
          <Input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} />
          <Button variant="outline" size="sm" onClick={reset}>Réinitialiser</Button>
        </div>

        <div className="border border-border rounded-md overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Titre</th>
                <th className="text-left px-3 py-2">Entreprise</th>
                <th className="text-left px-3 py-2">Type</th>
                <th className="text-left px-3 py-2">Statut</th>
                <th className="text-left px-3 py-2">Créée</th>
                <th className="text-left px-3 py-2">Terminée</th>
                <th className="text-left px-3 py-2">Durée</th>
                <th className="text-left px-3 py-2">Ver.</th>
                <th className="text-left px-3 py-2">Consultant</th>
              </tr>
            </thead>
            <tbody>
              {listQ.isLoading && (
                <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={9}>Chargement…</td></tr>
              )}
              {listQ.data?.rows.map((r) => (
                <tr key={r.id} className="border-t border-border hover:bg-accent/30">
                  <td className="px-3 py-2">
                    <Link to="/app/studies/$id" params={{ id: r.id }} className="font-medium hover:underline">
                      {r.title || "Sans titre"}
                    </Link>
                    <div className="text-[10px] text-muted-foreground font-mono">{r.id.slice(0, 8)}</div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{r.company_name || "—"}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.study_type || "—"}</td>
                  <td className="px-3 py-2"><GenerationStatusBadge status={r.generation_status} /></td>
                  <td className="px-3 py-2 text-muted-foreground">{new Date(r.created_at).toLocaleDateString("fr-FR")}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {r.generation_completed_at ? new Date(r.generation_completed_at).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{fmtDuration(r.duration_s)}</td>
                  <td className="px-3 py-2 text-muted-foreground">v{r.version_number}</td>
                  <td className="px-3 py-2 text-muted-foreground">{r.author_name || "—"}</td>
                </tr>
              ))}
              {listQ.data && listQ.data.rows.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={9}>Aucune étude ne correspond aux filtres.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">{total} résultats</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>← Précédent</Button>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant →</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}