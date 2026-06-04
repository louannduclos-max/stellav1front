import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  listCompanies,
  getCompany,
  upsertCompany,
  deleteCompany,
  listCompanyChildren,
  setCompanyActivities,
  setCompanyTargets,
} from "@/lib/companies.functions";
import { listMasters } from "@/lib/masters.functions";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { AppShell } from "@/components/app-shell";
import { BrandPreview } from "@/components/brand-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/companies")({
  head: () => ({ meta: [{ title: "Marques — Stella Admin" }] }),
  component: AdminCompaniesPage,
});

type ActorType =
  | "private_company"
  | "public_actor"
  | "association"
  | "franchise_network"
  | "integrated_network"
  | "local_independent"
  | "platform_intermediary";

type Positioning = "" | "generalist" | "specialist" | "premium" | "proximity" | "network_volume";

type CompanyForm = {
  name: string;
  display_name: string;
  slug: string;
  slug_touched: boolean;
  actor_type: ActorType;
  positioning: Positioning;
  group_name: string;
  short_description: string;
  long_description: string;
  website_url: string;
  internal_notes: string;
  default_language: string;
  status: "active" | "archived";
  primary_color: string;
  secondary_color: string;
  accent_color: string;
};

const ACTOR_OPTIONS: { value: ActorType; label: string }[] = [
  { value: "association", label: "Association" },
  { value: "private_company", label: "Entreprise privée" },
  { value: "franchise_network", label: "Franchise" },
  { value: "integrated_network", label: "Réseau intégré" },
  { value: "local_independent", label: "Acteur local indépendant" },
  { value: "public_actor", label: "Structure publique" },
  { value: "platform_intermediary", label: "Plateforme / intermédiaire" },
];

const POSITIONING_OPTIONS: { value: Exclude<Positioning, "">; label: string }[] = [
  { value: "generalist", label: "Généraliste" },
  { value: "specialist", label: "Spécialiste" },
  { value: "premium", label: "Premium" },
  { value: "proximity", label: "Proximité" },
  { value: "network_volume", label: "Réseau / volume" },
];

function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

const emptyForm: CompanyForm = {
  name: "",
  display_name: "",
  slug: "",
  slug_touched: false,
  actor_type: "private_company",
  positioning: "",
  group_name: "",
  short_description: "",
  long_description: "",
  website_url: "",
  internal_notes: "",
  default_language: "fr-FR",
  status: "active",
  primary_color: "#1E3A8A",
  secondary_color: "",
  accent_color: "",
};

function AdminCompaniesPage() {
  const fetchMe = useServerFn(getCurrentProfile);
  const fetchList = useServerFn(listCompanies);
  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });
  const listQ = useQuery({
    queryKey: ["companies"],
    queryFn: () => fetchList(),
    enabled: meQ.data?.role === "admin",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  if (meQ.isLoading) return <AppShell><div className="p-6">Chargement…</div></AppShell>;
  if (meQ.data && meQ.data.role !== "admin") throw redirect({ to: "/app/studies" });

  return (
    <AppShell>
      <div className="p-6 max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Marques</h1>
            <p className="text-sm text-muted-foreground">
              Configurez les marques et leurs informations pour préremplir les études.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nouvelle marque
          </Button>
        </header>

        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2">Marque</th>
                <th className="px-3 py-2">Slug</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Positionnement</th>
                <th className="px-3 py-2">Statut</th>
                <th className="px-3 py-2 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {listQ.data?.map((c) => {
                const color = (c.company_branding as { primary_color?: string }[] | null)?.[0]?.primary_color ?? "#1E3A8A";
                return (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full border border-border"
                          style={{ background: color }}
                        />
                        <span className="font-medium">{c.display_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2"><code className="text-xs text-muted-foreground">{c.slug}</code></td>
                    <td className="px-3 py-2 text-xs">
                      {ACTOR_OPTIONS.find((o) => o.value === c.actor_type)?.label ?? c.actor_type}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      {POSITIONING_OPTIONS.find((o) => o.value === c.positioning)?.label ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-xs">{c.status}</td>
                    <td className="px-3 py-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditingId(c.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {listQ.data && listQ.data.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">Aucune marque. Créez-en une.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(creating || editingId) && (
        <CompanyDialog
          id={editingId ?? undefined}
          onClose={() => { setCreating(false); setEditingId(null); }}
        />
      )}
    </AppShell>
  );
}

function CompanyDialog({ id, onClose }: { id?: string; onClose: () => void }) {
  const qc = useQueryClient();
  const fetchOne = useServerFn(getCompany);
  const save = useServerFn(upsertCompany);
  const del = useServerFn(deleteCompany);

  const oneQ = useQuery({
    queryKey: ["company", id],
    queryFn: () => fetchOne({ data: { id: id! } }),
    enabled: !!id,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
  });

  const [form, setForm] = useState<CompanyForm>(emptyForm);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!id || !oneQ.data || initialized) return;
    const c = oneQ.data as Record<string, unknown>;
    const brandingRaw = c.company_branding;
    const brandingArr = Array.isArray(brandingRaw)
      ? (brandingRaw as { primary_color?: string; secondary_color?: string | null; accent_color?: string | null }[])
      : brandingRaw
        ? [brandingRaw as { primary_color?: string; secondary_color?: string | null; accent_color?: string | null }]
        : [];
    const slugStr = (c.slug as string) ?? "";
    setForm({
      name: (c.name as string) ?? "",
      display_name: (c.display_name as string) ?? "",
      slug: slugStr,
      slug_touched: !!slugStr,
      actor_type: ((c.actor_type as ActorType) ?? "private_company"),
      positioning: ((c.positioning as Positioning) ?? ""),
      group_name: (c.group_name as string) ?? "",
      short_description: (c.short_description as string) ?? "",
      long_description: (c.long_description as string) ?? "",
      website_url: (c.website_url as string) ?? "",
      internal_notes: (c.internal_notes as string) ?? "",
      default_language: (c.default_language as string) ?? "fr-FR",
      status: ((c.status as CompanyForm["status"]) ?? "active"),
      primary_color: brandingArr[0]?.primary_color ?? "#1E3A8A",
      secondary_color: brandingArr[0]?.secondary_color ?? "",
      accent_color: brandingArr[0]?.accent_color ?? "",
    });
    setInitialized(true);
  }, [id, oneQ.data, initialized]);

  const saveM = useMutation({
    mutationFn: () =>
      save({
        data: {
          id,
          values: {
            name: form.name,
            display_name: form.display_name,
            slug: form.slug,
            actor_type: form.actor_type,
            positioning: form.positioning ? form.positioning : null,
            group_name: form.group_name || null,
            short_description: form.short_description || null,
            long_description: form.long_description || null,
            website_url: form.website_url || null,
            internal_notes: form.internal_notes || null,
            default_language: form.default_language,
            status: form.status,
            primary_color: form.primary_color,
            secondary_color: form.secondary_color || null,
            accent_color: form.accent_color || null,
          },
        },
      }),
    onSuccess: () => {
      toast.success("Marque enregistrée");
      qc.invalidateQueries({ queryKey: ["companies"] });
      qc.invalidateQueries({ queryKey: ["company", id] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const delM = useMutation({
    mutationFn: () => del({ data: { id: id! } }),
    onSuccess: () => {
      toast.success("Marque supprimée");
      qc.invalidateQueries({ queryKey: ["companies"] });
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const onNameChange = (v: string) => {
    setForm((f) => ({
      ...f,
      name: v,
      slug: f.slug_touched ? f.slug : slugify(v),
    }));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{id ? "Modifier la marque" : "Nouvelle marque"}</DialogTitle>
        </DialogHeader>

        {id && !initialized ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Chargement…</div>
        ) : (
        <>
        <div className="grid grid-cols-2 gap-4 py-2">
          <Field label="Nom interne *">
            <Input value={form.name} onChange={(e) => onNameChange(e.target.value)} maxLength={200} />
          </Field>
          <Field label="Nom d'affichage *">
            <Input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} maxLength={200} />
          </Field>
          <Field label="Slug URL (auto)">
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  slug_touched: true,
                })
              }
              placeholder="bonadea-care"
              maxLength={120}
            />
          </Field>
          <Field label="Type d'acteur *">
            <Select value={form.actor_type} onValueChange={(v) => setForm({ ...form, actor_type: v as ActorType })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTOR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Positionnement">
            <Select
              value={form.positioning || "__none__"}
              onValueChange={(v) => setForm({ ...form, positioning: (v === "__none__" ? "" : v) as Positioning })}
            >
              <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Non défini —</SelectItem>
                {POSITIONING_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Groupe / réseau">
            <Input value={form.group_name} onChange={(e) => setForm({ ...form, group_name: e.target.value })} maxLength={200} />
          </Field>
          <Field label="Site web">
            <Input value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://…" maxLength={500} />
          </Field>
          <Field label="Couleur primaire">
            <div className="flex items-center gap-2">
              <input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} className="h-10 w-14 rounded border border-border" />
              <Input value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} maxLength={7} />
            </div>
          </Field>
          <Field label="Couleur secondaire">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.secondary_color || "#ffffff"}
                onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                className="h-10 w-14 rounded border border-border"
              />
              <Input
                value={form.secondary_color}
                onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                placeholder="#RRGGBB (optionnel)"
                maxLength={7}
              />
              {form.secondary_color && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setForm({ ...form, secondary_color: "" })}
                >
                  Effacer
                </button>
              )}
            </div>
          </Field>
          <Field label="Couleur d'accent">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.accent_color || "#ffffff"}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                className="h-10 w-14 rounded border border-border"
              />
              <Input
                value={form.accent_color}
                onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                placeholder="#RRGGBB (optionnel)"
                maxLength={7}
              />
              {form.accent_color && (
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setForm({ ...form, accent_color: "" })}
                >
                  Effacer
                </button>
              )}
            </div>
          </Field>
          <Field label="Aperçu en temps réel" className="col-span-2">
            <BrandPreview
              primary={form.primary_color || "#1E3A8A"}
              secondary={form.secondary_color || "#15803D"}
              accent={form.accent_color || "#0EA5E9"}
              name={form.name || "Nom de la marque"}
            />
          </Field>
          <Field label="Langue par défaut">
            <Input value={form.default_language} onChange={(e) => setForm({ ...form, default_language: e.target.value })} maxLength={10} />
          </Field>
          <Field label="Statut">
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as CompanyForm["status"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archivée</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description courte" className="col-span-2">
            <Textarea value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} maxLength={500} rows={2} />
          </Field>
          <Field label="Description longue" className="col-span-2">
            <Textarea value={form.long_description} onChange={(e) => setForm({ ...form, long_description: e.target.value })} maxLength={4000} rows={3} />
          </Field>
          <Field label="Notes internes" className="col-span-2">
            <Textarea value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} maxLength={4000} rows={2} />
          </Field>
        </div>

        {id ? (
          <ChildrenEditor companyId={id} />
        ) : (
          <p className="text-xs text-muted-foreground border-t border-border pt-4 mt-2">
            Enregistrez la marque pour gérer ses activités et publics cibles.
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {id && (
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Supprimer définitivement cette marque ?")) delM.mutate();
              }}
              disabled={delM.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Supprimer
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button onClick={() => saveM.mutate()} disabled={saveM.isPending || !form.name || !form.display_name || !form.slug}>
            Enregistrer
          </Button>
        </DialogFooter>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function ChildrenEditor({ companyId }: { companyId: string }) {
  const qc = useQueryClient();
  const fetchKids = useServerFn(listCompanyChildren);
  const setActs = useServerFn(setCompanyActivities);
  const setTgts = useServerFn(setCompanyTargets);
  const fetchMasters = useServerFn(listMasters);

  const q = useQuery({
    queryKey: ["company-children", companyId],
    queryFn: () => fetchKids({ data: { id: companyId } }),
  });
  const mastersQ = useQuery({ queryKey: ["masters-active"], queryFn: () => fetchMasters() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["company-children", companyId] });

  const activityOptions =
    mastersQ.data?.sap_activities.filter((a) => a.is_active).map((a) => ({ value: a.code, label: a.label })) ?? [];
  const targetOptions =
    mastersQ.data?.target_publics.filter((t) => t.is_active).map((t) => ({ value: t.code, label: t.label })) ?? [];

  const selectedActivities = q.data?.activities.map((a) => a.activity_code) ?? [];
  const selectedTargets = q.data?.targets.map((t) => t.public_code) ?? [];

  const setActM = useMutation({
    mutationFn: (codes: string[]) => setActs({ data: { company_id: companyId, codes } }),
    onSuccess: () => { toast.success("Activités mises à jour"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const setTgtM = useMutation({
    mutationFn: (codes: string[]) => setTgts({ data: { company_id: companyId, codes } }),
    onSuccess: () => { toast.success("Publics cibles mis à jour"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const loading = q.isLoading || mastersQ.isLoading;

  return (
    <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 mt-2">
      <section>
        <Label className="text-xs">Activités</Label>
        {loading ? (
          <div className="text-xs text-muted-foreground mt-2">Chargement…</div>
        ) : activityOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">
            Aucune activité disponible.{" "}
            <Link to="/admin/masters" className="underline">Gérez les activités dans les référentiels</Link>.
          </p>
        ) : (
          <div className="mt-1.5">
            <MultiSelect
              options={activityOptions}
              value={selectedActivities}
              onChange={(codes) => setActM.mutate(codes)}
              placeholder="Sélectionner une ou plusieurs activités"
              searchPlaceholder="Rechercher une activité…"
              disabled={setActM.isPending}
            />
          </div>
        )}
      </section>
      <section>
        <Label className="text-xs">Publics cibles</Label>
        {loading ? (
          <div className="text-xs text-muted-foreground mt-2">Chargement…</div>
        ) : targetOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground mt-2">
            Aucun public cible disponible.{" "}
            <Link to="/admin/masters" className="underline">Gérez les publics cibles dans les référentiels</Link>.
          </p>
        ) : (
          <div className="mt-1.5">
            <MultiSelect
              options={targetOptions}
              value={selectedTargets}
              onChange={(codes) => setTgtM.mutate(codes)}
              placeholder="Sélectionner un ou plusieurs publics cibles"
              searchPlaceholder="Rechercher un public cible…"
              disabled={setTgtM.isPending}
            />
          </div>
        )}
      </section>
    </div>
  );
}
