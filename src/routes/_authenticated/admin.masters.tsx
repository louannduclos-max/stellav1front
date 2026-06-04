import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listMasters, upsertMaster, deleteMaster } from "@/lib/masters.functions";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/masters")({
  head: () => ({ meta: [{ title: "Tables référentielles — Stella Admin" }] }),
  component: AdminMastersPage,
});

type MasterTable = "sap_activities_master" | "target_publics_master" | "territory_modes_master" | "service_modes_master";
type MasterKey = "sap_activities" | "target_publics" | "territory_modes" | "service_modes";
type Row = { id: string; code: string; label: string; display_order: number; is_active: boolean };

const SECTIONS: { title: string; key: MasterKey; table: MasterTable; description: string }[] = [
  { title: "Activités SAP", key: "sap_activities", table: "sap_activities_master", description: "Activités de service à la personne proposées au formulaire marque." },
  { title: "Publics cibles", key: "target_publics", table: "target_publics_master", description: "Publics cibles proposés aux marques et aux études." },
  { title: "Modes de territoire", key: "territory_modes", table: "territory_modes_master", description: "Modes de définition du territoire d'étude." },
  { title: "Modes de service", key: "service_modes", table: "service_modes_master", description: "Modes de délivrance des prestations." },
];

function AdminMastersPage() {
  const fetchMasters = useServerFn(listMasters);
  const fetchMe = useServerFn(getCurrentProfile);
  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });
  const mQ = useQuery({
    queryKey: ["masters"],
    queryFn: () => fetchMasters(),
    enabled: meQ.data?.role === "admin",
  });

  if (meQ.isLoading) return <AppShell><div className="p-6">Chargement…</div></AppShell>;
  if (meQ.data && meQ.data.role !== "admin") {
    throw redirect({ to: "/app/studies" });
  }

  return (
    <AppShell>
      <div className="p-6 max-w-5xl space-y-8">
        <header>
          <h1 className="text-2xl font-semibold">Tables référentielles</h1>
          <p className="text-sm text-muted-foreground">
            Gérez les valeurs métier proposées dans les formulaires marque et étude.
          </p>
        </header>
        {SECTIONS.map((s) => (
          <MasterSection
            key={s.key}
            title={s.title}
            description={s.description}
            table={s.table}
            rows={(mQ.data?.[s.key] ?? []) as Row[]}
            loading={mQ.isLoading}
          />
        ))}
      </div>
    </AppShell>
  );
}

function MasterSection({
  title,
  description,
  table,
  rows,
  loading,
}: {
  title: string;
  description: string;
  table: MasterTable;
  rows: Row[];
  loading: boolean;
}) {
  const qc = useQueryClient();
  const save = useServerFn(upsertMaster);
  const del = useServerFn(deleteMaster);

  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"display_order" | "label" | "code">("display_order");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["masters"] });

  const toggleM = useMutation({
    mutationFn: (r: Row) =>
      save({ data: { table, id: r.id, code: r.code, label: r.label, display_order: r.display_order, is_active: !r.is_active } }),
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { table, id } }),
    onSuccess: () => { toast.success("Supprimé"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = rows
    .filter((r) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return r.label.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "label") return a.label.localeCompare(b.label);
      if (sortBy === "code") return a.code.localeCompare(b.code);
      return a.display_order - b.display_order;
    });

  return (
    <section className="border border-border rounded-md">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter
        </Button>
      </header>
      <div className="p-4 flex items-center gap-2 border-b border-border">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Rechercher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-sm" />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="display_order">Ordre</option>
          <option value="label">Libellé</option>
          <option value="code">Code</option>
        </select>
      </div>
      <ul className="divide-y divide-border">
        {loading && <li className="px-4 py-3 text-sm text-muted-foreground">Chargement…</li>}
        {!loading && filtered.length === 0 && (
          <li className="px-4 py-6 text-sm text-center text-muted-foreground">Aucune entrée</li>
        )}
        {filtered.map((r) => (
          <li key={r.id} className="px-4 py-2 flex items-center gap-3 text-sm">
            <span className="w-10 text-xs text-muted-foreground tabular-nums">{r.display_order}</span>
            <span className="flex-1 font-medium">{r.label}</span>
            <code className="text-xs text-muted-foreground">{r.code}</code>
            {!r.is_active && <Badge variant="secondary">Inactif</Badge>}
            <Switch checked={r.is_active} onCheckedChange={() => toggleM.mutate(r)} aria-label="Actif" />
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditing(r)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => { if (confirm(`Supprimer « ${r.label} » ?`)) delM.mutate(r.id); }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      {editing !== null && (
        <MasterDialog
          table={table}
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={invalidate}
        />
      )}
    </section>
  );
}

function MasterDialog({
  table,
  initial,
  onClose,
  onSaved,
}: {
  table: MasterTable;
  initial: Row | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const save = useServerFn(upsertMaster);
  const [code, setCode] = useState(initial?.code ?? "");
  const [label, setLabel] = useState(initial?.label ?? "");
  const [displayOrder, setDisplayOrder] = useState(initial?.display_order ?? 0);
  const [isActive, setIsActive] = useState(initial?.is_active ?? true);

  const m = useMutation({
    mutationFn: () =>
      save({
        data: {
          table,
          id: initial?.id,
          code: code.trim(),
          label: label.trim(),
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
        },
      }),
    onSuccess: () => { toast.success("Enregistré"); onSaved(); onClose(); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier l'entrée" : "Nouvelle entrée"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Libellé *</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} maxLength={200} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Code technique *</Label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "_"))}
              maxLength={80}
              placeholder="ex: aide_dom"
              disabled={!!initial}
            />
            {initial && <p className="text-[10px] text-muted-foreground">Le code n'est pas modifiable après création.</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Ordre d'affichage</Label>
              <Input type="number" value={displayOrder} onChange={(e) => setDisplayOrder(Number(e.target.value))} min={0} max={9999} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Statut</Label>
              <div className="flex items-center gap-2 h-10">
                <Switch checked={isActive} onCheckedChange={setIsActive} />
                <span className="text-sm">{isActive ? "Actif" : "Inactif"}</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={() => m.mutate()} disabled={m.isPending || !code.trim() || !label.trim()}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}