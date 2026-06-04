import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminDashboard } from "@/lib/dashboard.functions";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { cancelStudyGeneration } from "@/lib/studies.functions";
import { AppShell, GenerationStatusBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/_authenticated/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Stella Admin" }] }),
  component: AdminDashboardPage,
});

const STATUS_COLORS: Record<string, string> = {
  Terminées: "hsl(var(--chart-1))",
  "En cours": "hsl(var(--chart-2))",
  "En attente": "hsl(var(--chart-3))",
  Erreur: "hsl(var(--destructive))",
};

function fmtDuration(s: number) {
  if (!s) return "—";
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)} min`;
  return `${(s / 3600).toFixed(1)} h`;
}

function KpiCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function AdminDashboardPage() {
  const fetchMe = useServerFn(getCurrentProfile);
  const fetchDash = useServerFn(getAdminDashboard);
  const cancelFn = useServerFn(cancelStudyGeneration);
  const queryClient = useQueryClient();
  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Étude annulée");
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-studies"] });
    },
    onError: (e: Error) => toast.error(e.message || "Annulation impossible"),
  });
  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });
  const dashQ = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => fetchDash(),
    enabled: !!meQ.data,
  });

  if (meQ.isLoading) return <AppShell><div className="p-6">Chargement…</div></AppShell>;
  if (meQ.data && meQ.data.role !== "admin") throw redirect({ to: "/app/studies" });

  return (
    <AppShell>
      <div className="p-6 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble de l'activité Stella.</p>
        </header>

        {dashQ.isLoading && <div className="text-muted-foreground">Chargement des indicateurs…</div>}
        {dashQ.error && (
          <div className="text-destructive text-sm">
            {dashQ.error instanceof Error ? dashQ.error.message : "Erreur"}
          </div>
        )}

        {dashQ.data && (
          <>
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Études totales" value={dashQ.data.kpis.total} />
              <KpiCard label="Terminées" value={dashQ.data.kpis.done} hint={`${dashQ.data.kpis.successRate}% de réussite`} />
              <KpiCard label="En cours" value={dashQ.data.kpis.processing} />
              <KpiCard label="En erreur" value={dashQ.data.kpis.error} />
              <KpiCard label="Temps moyen" value={fmtDuration(dashQ.data.kpis.avgDuration)} />
              <KpiCard label="Temps médian" value={fmtDuration(dashQ.data.kpis.medDuration)} />
              <KpiCard label="CRM ouverts" value={dashQ.data.crm.open} />
              <KpiCard label="CRM résolus" value={dashQ.data.crm.resolved} hint={`Résolution moy. ${fmtDuration(dashQ.data.crm.avgResolution)}`} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-1">
                <CardHeader><CardTitle className="text-sm">Répartition par statut</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dashQ.data.charts.byStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                        {dashQ.data.charts.byStatus.map((s) => (
                          <Cell key={s.name} fill={STATUS_COLORS[s.name] || "hsl(var(--muted))"} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader><CardTitle className="text-sm">Études par entreprise (top 8)</CardTitle></CardHeader>
                <CardContent style={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashQ.data.charts.byCompany}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" fontSize={11} tickLine={false} />
                      <YAxis fontSize={11} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3">
                <CardHeader><CardTitle className="text-sm">Volumétrie 30 derniers jours</CardTitle></CardHeader>
                <CardContent style={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashQ.data.charts.days}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" fontSize={11} tickLine={false} />
                      <YAxis fontSize={11} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Études récentes</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left px-3 py-2">Titre</th>
                        <th className="text-left px-3 py-2">Entreprise</th>
                        <th className="text-left px-3 py-2">Auteur</th>
                        <th className="text-left px-3 py-2">Statut</th>
                        <th className="text-left px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashQ.data.recent.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-3 py-2">
                            <Link to="/app/studies/$id" params={{ id: r.id }} className="hover:underline font-medium">
                              {r.title || "Sans titre"}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{r.company}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              {r.author}
                              {r.author_is_admin && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/30">
                                  ADMIN
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2"><GenerationStatusBadge status={r.generation_status} /></td>
                          <td className="px-3 py-2 text-right">
                            {(r.generation_status === "pending" || r.generation_status === "processing") && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={cancelMut.isPending}
                                onClick={() => {
                                  if (confirm("Annuler la génération de cette étude ?")) cancelMut.mutate(r.id);
                                }}
                              >
                                Annuler
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {dashQ.data.recent.length === 0 && (
                        <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>Aucune étude.</td></tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Études bloquées / en erreur</CardTitle></CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                      <tr>
                        <th className="text-left px-3 py-2">Titre</th>
                        <th className="text-left px-3 py-2">Entreprise</th>
                        <th className="text-left px-3 py-2">Auteur</th>
                        <th className="text-left px-3 py-2">Statut</th>
                        <th className="text-left px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashQ.data.blocked.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="px-3 py-2">
                            <Link to="/app/studies/$id" params={{ id: r.id }} className="hover:underline font-medium">
                              {r.title || "Sans titre"}
                            </Link>
                          </td>
                          <td className="px-3 py-2 text-muted-foreground">{r.company}</td>
                          <td className="px-3 py-2 text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              {r.author}
                              {r.author_is_admin && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/30">
                                  ADMIN
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-3 py-2"><GenerationStatusBadge status={r.generation_status} /></td>
                          <td className="px-3 py-2 text-right">
                            {(r.generation_status === "pending" || r.generation_status === "processing") && (
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={cancelMut.isPending}
                                onClick={() => {
                                  if (confirm("Annuler la génération de cette étude ?")) cancelMut.mutate(r.id);
                                }}
                              >
                                Annuler
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {dashQ.data.blocked.length === 0 && (
                        <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>Rien à signaler. ✅</td></tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}