import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import {
  listCrmLogs,
  createCrmLog,
  updateCrmLog,
  deleteCrmLog,
  CRM_CATEGORIES,
  CRM_SEVERITIES,
  CRM_STATUSES,
} from "@/lib/crm.functions";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { listCompanies } from "@/lib/companies.functions";
import { listStudies } from "@/lib/studies.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/crm")({
  head: () => ({ meta: [{ title: "CRM interne — Stella" }] }),
  component: CrmPage,
});

const CATEGORY_LABEL: Record<string, string> = {
  probleme: "Problème",
  fonctionne_bien: "Fonctionne bien",
  ne_fonctionne_pas: "Ne fonctionne pas",
  amelioration: "Amélioration",
  blocage: "Blocage",
  remarque_client: "Remarque client",
  remarque_interne: "Remarque interne",
};

const SEVERITY_COLOR: Record<string, string> = {
  faible: "bg-muted text-muted-foreground",
  moyen: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  eleve: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  critique: "bg-destructive/15 text-destructive",
};

const STATUS_COLOR: Record<string, string> = {
  ouvert: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  en_cours: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  resolu: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  archive: "bg-muted text-muted-foreground",
};

function CrmPage() {
  const qc = useQueryClient();
  const fetchMe = useServerFn(getCurrentProfile);
  const fetchLogs = useServerFn(listCrmLogs);
  const fetchCompanies = useServerFn(listCompanies);
  const fetchStudies = useServerFn(listStudies);
  const createFn = useServerFn(createCrmLog);
  const updateFn = useServerFn(updateCrmLog);
  const deleteFn = useServerFn(deleteCrmLog);

  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });

  const [category, setCategory] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const logsQ = useQuery({
    queryKey: ["crm-logs"],
    queryFn: () => fetchLogs({ data: {} }),
    enabled: !!meQ.data && meQ.data.role !== null,
  });
  const companiesQ = useQuery({ queryKey: ["companies"], queryFn: () => fetchCompanies(), enabled: !!meQ.data });
  const studiesQ = useQuery({ queryKey: ["studies"], queryFn: () => fetchStudies(), enabled: !!meQ.data });

  const updateMut = useMutation({
    mutationFn: (v: { id: string; status?: string; severity?: string }) =>
      updateFn({ data: v as never }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-logs"] });
      toast.success("Mis à jour");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-logs"] });
      toast.success("Supprimé");
      setDeleteId(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  const filtered = useMemo(() => {
    let rows = logsQ.data ?? [];
    if (category) rows = rows.filter((r) => r.category === category);
    if (severity) rows = rows.filter((r) => r.severity === severity);
    if (status) rows = rows.filter((r) => r.status === status);
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(s) ||
          (r.description ?? "").toLowerCase().includes(s),
      );
    }
    return rows;
  }, [logsQ.data, category, severity, status, search]);

  if (meQ.isLoading) return <AppShell><div className="p-6">Chargement…</div></AppShell>;
  if (meQ.data && meQ.data.role !== "admin" && meQ.data.role !== "consultant") {
    throw redirect({ to: "/app/studies" });
  }

  const isAdmin = meQ.data?.role === "admin";

  const open = filtered.filter((r) => r.status === "ouvert" || r.status === "en_cours").length;
  const resolved = filtered.filter((r) => r.status === "resolu").length;

  return (
    <AppShell>
      <div className="p-6 space-y-4">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">CRM interne</h1>
            <p className="text-sm text-muted-foreground">
              Suivi qualité et production — {open} ouvert(s), {resolved} résolu(s)
            </p>
          </div>
          <Button onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nouveau retour
          </Button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 p-3 border border-border rounded-md bg-card">
          <Input
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:col-span-2"
          />
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Toutes catégories</option>
            {CRM_CATEGORIES.map((c) => (<option key={c} value={c}>{CATEGORY_LABEL[c]}</option>))}
          </select>
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={severity} onChange={(e) => setSeverity(e.target.value)}>
            <option value="">Toutes sévérités</option>
            {CRM_SEVERITIES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
          <select className="border border-input rounded-md px-2 text-sm bg-background" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tous statuts</option>
            {CRM_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>

        <div className="border border-border rounded-md overflow-x-auto bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Titre</th>
                <th className="text-left px-3 py-2">Catégorie</th>
                <th className="text-left px-3 py-2">Sévérité</th>
                <th className="text-left px-3 py-2">Statut</th>
                <th className="text-left px-3 py-2">Étude / Entreprise</th>
                <th className="text-left px-3 py-2">Auteur</th>
                <th className="text-left px-3 py-2">Créé</th>
                <th className="text-right px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logsQ.isLoading && (
                <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={8}>Chargement…</td></tr>
              )}
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-border align-top">
                  <td className="px-3 py-2">
                    <div className="font-medium">{r.title}</div>
                    {r.description && (
                      <div className="text-xs text-muted-foreground line-clamp-2 max-w-md">{r.description}</div>
                    )}
                  </td>
                  <td className="px-3 py-2"><Badge variant="outline">{CATEGORY_LABEL[r.category]}</Badge></td>
                  <td className="px-3 py-2">
                    <select
                      className={`px-2 py-0.5 rounded text-xs font-medium border-0 ${SEVERITY_COLOR[r.severity]}`}
                      value={r.severity}
                      onChange={(e) => updateMut.mutate({ id: r.id, severity: e.target.value })}
                    >
                      {CRM_SEVERITIES.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <select
                      className={`px-2 py-0.5 rounded text-xs font-medium border-0 ${STATUS_COLOR[r.status]}`}
                      value={r.status}
                      onChange={(e) => updateMut.mutate({ id: r.id, status: e.target.value })}
                    >
                      {CRM_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">
                    {r.study_id && (
                      <div>
                        Étude:{" "}
                        <Link to="/app/studies/$id" params={{ id: r.study_id }} className="hover:underline text-foreground">
                          {r.study_title || r.study_id.slice(0, 8)}
                        </Link>
                      </div>
                    )}
                    {r.company_name && <div>Entreprise: {r.company_name}</div>}
                    {!r.study_id && !r.company_name && "—"}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">{r.author_name}</td>
                  <td className="px-3 py-2 text-muted-foreground text-xs">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {isAdmin && (
                      <Button size="icon" variant="ghost" onClick={() => setDeleteId(r.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!logsQ.isLoading && filtered.length === 0 && (
                <tr><td className="px-3 py-6 text-center text-muted-foreground" colSpan={8}>Aucun retour pour le moment.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateCrmDialog
        open={openCreate}
        onOpenChange={setOpenCreate}
        companies={companiesQ.data ?? []}
        studies={studiesQ.data ?? []}
        onSubmit={async (payload) => {
          try {
            await createFn({ data: payload });
            toast.success("Retour ajouté");
            qc.invalidateQueries({ queryKey: ["crm-logs"] });
            setOpenCreate(false);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Erreur");
          }
        }}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce retour ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est définitive.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMut.mutate(deleteId)}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function CreateCrmDialog({
  open,
  onOpenChange,
  companies,
  studies,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  companies: { id: string; display_name: string }[];
  studies: { id: string; title: string | null }[];
  onSubmit: (payload: {
    title: string;
    description?: string;
    category: typeof CRM_CATEGORIES[number];
    severity: typeof CRM_SEVERITIES[number];
    status: typeof CRM_STATUSES[number];
    company_id?: string | null;
    study_id?: string | null;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<typeof CRM_CATEGORIES[number]>("probleme");
  const [severity, setSeverity] = useState<typeof CRM_SEVERITIES[number]>("moyen");
  const [statusV, setStatusV] = useState<typeof CRM_STATUSES[number]>("ouvert");
  const [companyId, setCompanyId] = useState("");
  const [studyId, setStudyId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setTitle(""); setDescription(""); setCategory("probleme"); setSeverity("moyen"); setStatusV("ouvert"); setCompanyId(""); setStudyId("");
  };

  const handle = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      severity,
      status: statusV,
      company_id: companyId || null,
      study_id: studyId || null,
    });
    setSubmitting(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nouveau retour CRM</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Titre *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={255} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={5000} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label>Catégorie</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={category} onChange={(e) => setCategory(e.target.value as typeof CRM_CATEGORIES[number])}>
                {CRM_CATEGORIES.map((c) => (<option key={c} value={c}>{CATEGORY_LABEL[c]}</option>))}
              </select>
            </div>
            <div>
              <Label>Sévérité</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={severity} onChange={(e) => setSeverity(e.target.value as typeof CRM_SEVERITIES[number])}>
                {CRM_SEVERITIES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <Label>Statut</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={statusV} onChange={(e) => setStatusV(e.target.value as typeof CRM_STATUSES[number])}>
                {CRM_STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Entreprise (optionnel)</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                <option value="">—</option>
                {companies.map((c) => (<option key={c.id} value={c.id}>{c.display_name}</option>))}
              </select>
            </div>
            <div>
              <Label>Étude (optionnel)</Label>
              <select className="w-full border border-input rounded-md px-2 py-1.5 text-sm bg-background" value={studyId} onChange={(e) => setStudyId(e.target.value)}>
                <option value="">—</option>
                {studies.slice(0, 100).map((s) => (
                  <option key={s.id} value={s.id}>{s.title || s.id.slice(0, 8)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handle} disabled={submitting || !title.trim()}>
            {submitting ? "Enregistrement…" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}