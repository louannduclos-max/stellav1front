import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  listPresetMasters,
  upsertPresetMaster,
  deletePresetMaster,
  getCompanyPreset,
  upsertCompanyPreset,
} from "@/lib/presets.functions";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/presets")({
  head: () => ({ meta: [{ title: "Presets d'étude — Stella Admin" }] }),
  component: AdminPresetsPage,
});

type MasterRow = {
  id: string;
  code: string;
  label: string;
  display_order: number;
  is_active: boolean;
  general_circle?: string | null;
  kpi_group?: string | null;
};

type PresetItem = {
  code: string;
  label: string;
  order?: number;
  is_default?: boolean;
  general_circle?: string | null;
  group?: string;
};

const MASTER_LABELS: Record<string, string> = {
  study_types_master: "Types d'étude",
  target_publics_master: "Cibles",
  sap_activities_master: "Services / Activités",
  zone_focus_master: "Zones focus",
  commune_types_master: "Types de communes",
  kpi_master: "KPI",
  risks_master: "Risques",
};

const KPI_GROUPS = [
  { code: "demographie", label: "Démographie" },
  { code: "demande", label: "Demande SAP" },
  { code: "rh", label: "RH & Recrutement" },
  { code: "concurrence", label: "Concurrence" },
  { code: "risques", label: "Risques" },
  { code: "mobilite", label: "Mobilité" },
  { code: "economie", label: "Économie" },
  { code: "reglementaire", label: "Réglementaire" },
];

function AdminPresetsPage() {
  const fetchMe = useServerFn(getCurrentProfile);
  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });
  if (meQ.isLoading) return <div className="p-6">Chargement…</div>;
  if (meQ.data && meQ.data.role !== "admin") throw redirect({ to: "/app/studies" });

  return (
    <>
      <div className="p-6 space-y-4 max-w-6xl">
        <header>
          <h1 className="text-2xl font-semibold">Presets d'étude par marque</h1>
          <p className="text-sm text-muted-foreground">
            Configurez les valeurs par défaut chargées au lancement d'une étude pour chaque marque.
          </p>
        </header>
        <Tabs defaultValue="preset">
          <TabsList>
            <TabsTrigger value="preset">Preset par marque</TabsTrigger>
            <TabsTrigger value="masters">Référentiels</TabsTrigger>
          </TabsList>
          <TabsContent value="preset" className="mt-4">
            <PresetEditor />
          </TabsContent>
          <TabsContent value="masters" className="mt-4">
            <MastersEditor />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// =============== PRESET EDITOR ===============
function PresetEditor() {
  const fetchMasters = useServerFn(listPresetMasters);
  const fetchPreset = useServerFn(getCompanyPreset);
  const savePreset = useServerFn(upsertCompanyPreset);
  const qc = useQueryClient();

  const mastersQ = useQuery({ queryKey: ["preset-masters"], queryFn: () => fetchMasters() });
  const [companyId, setCompanyId] = useState<string>("");

  useEffect(() => {
    const list = mastersQ.data?.companies ?? [];
    if (!companyId && list.length) {
      const inter = list.find((c) => c.slug === "interdomicilio");
      setCompanyId(inter?.id ?? list[0].id);
    }
  }, [mastersQ.data, companyId]);

  const presetQ = useQuery({
    queryKey: ["company-preset", companyId],
    queryFn: () => fetchPreset({ data: { company_id: companyId } }),
    enabled: !!companyId,
  });

  const [studyType, setStudyType] = useState<string>("");
  const [targets, setTargets] = useState<PresetItem[]>([]);
  const [services, setServices] = useState<PresetItem[]>([]);
  const [zones, setZones] = useState<PresetItem[]>([]);
  const [communes, setCommunes] = useState<PresetItem[]>([]);
  const [kpis, setKpis] = useState<PresetItem[]>([]);
  const [risks, setRisks] = useState<PresetItem[]>([]);
  const [years, setYears] = useState<number[]>([2024, 2025, 2026]);
  const [note, setNote] = useState<string>("");
  const [guidance, setGuidance] = useState<Record<string, unknown>>({});
  const [loaded, setLoaded] = useState<string>("");

  // Load preset into local state when company changes
  useEffect(() => {
    if (!companyId || presetQ.isLoading) return;
    if (loaded === companyId) return;
    const p = presetQ.data?.preset;
    setStudyType(p?.default_study_type ?? "");
    setTargets((p?.default_target_publics as PresetItem[]) ?? []);
    setServices((p?.default_activity_families as PresetItem[]) ?? []);
    setZones((p?.default_zone_focus as PresetItem[]) ?? []);
    setCommunes((p?.default_commune_types as PresetItem[]) ?? []);
    setKpis((p?.default_kpis as PresetItem[]) ?? []);
    setRisks((p?.default_risks as PresetItem[]) ?? []);
    setYears((p?.default_reference_years as number[]) ?? [2024, 2025, 2026]);
    setNote(p?.justification_note ?? "");
    setGuidance(((p as { guidance?: Record<string, unknown> } | undefined)?.guidance) ?? {});
    setLoaded(companyId);
  }, [companyId, presetQ.data, presetQ.isLoading, loaded]);

  const saveMut = useMutation({
    mutationFn: () =>
      savePreset({
        data: {
          company_id: companyId,
          default_study_type: studyType || null,
          default_target_publics: targets,
          default_activity_families: services,
          default_zone_focus: zones,
          default_commune_types: communes,
          default_kpis: kpis,
          default_risks: risks,
          default_reference_years: years,
          justification_note: note || null,
          is_active: true,
          guidance,
        },
      }),
    onSuccess: () => {
      toast.success("Preset enregistré");
      qc.invalidateQueries({ queryKey: ["company-preset", companyId] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  if (mastersQ.isLoading) return <div>Chargement…</div>;
  const m = mastersQ.data!;

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="flex-1 max-w-sm">
          <Label>Marque</Label>
          <Select
            value={companyId}
            onValueChange={(v) => {
              setCompanyId(v);
              setLoaded("");
            }}
          >
            <SelectTrigger><SelectValue placeholder="Choisir une marque…" /></SelectTrigger>
            <SelectContent>
              {m.companies.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.display_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => saveMut.mutate()} disabled={!companyId || saveMut.isPending}>
          {saveMut.isPending ? "Enregistrement…" : "Enregistrer le preset"}
        </Button>
      </div>

      {!companyId ? null : presetQ.isLoading ? (
        <div>Chargement du preset…</div>
      ) : (
        <div className="space-y-6">
          <Section title="Type d'étude par défaut">
            <Select value={studyType} onValueChange={setStudyType}>
              <SelectTrigger className="max-w-sm">
                <SelectValue placeholder="Choisir…" />
              </SelectTrigger>
              <SelectContent>
                {m.study_types.map((s) => (
                  <SelectItem key={s.code} value={s.code}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Section>

          <PickerSection
            title="Cibles"
            options={m.target_publics}
            value={targets}
            onChange={setTargets}
            withCircle
          />
          <PickerSection
            title="Services / Activités"
            options={m.sap_activities}
            value={services}
            onChange={setServices}
          />
          <PickerSection
            title="Zones focus"
            options={m.zone_focus}
            value={zones}
            onChange={setZones}
            withCircle
          />
          <PickerSection
            title="Types de communes"
            options={m.commune_types}
            value={communes}
            onChange={setCommunes}
            withCircle
          />

          <Section title="KPI par défaut">
            <div className="space-y-3">
              {KPI_GROUPS.map((g) => {
                const groupKpis = m.kpis.filter((k) => k.kpi_group === g.code);
                if (!groupKpis.length) return null;
                return (
                  <div key={g.code} className="border border-border rounded-md p-3">
                    <div className="font-medium text-sm mb-2">{g.label}</div>
                    <div className="grid grid-cols-2 gap-2">
                      {groupKpis.map((k) => {
                        const checked = kpis.some((x) => x.code === k.code && x.is_default);
                        const inList = kpis.some((x) => x.code === k.code);
                        return (
                          <label key={k.code} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(v) => {
                                setKpis((prev) => {
                                  if (!inList) {
                                    return [
                                      ...prev,
                                      { code: k.code, label: k.label, group: g.code, is_default: !!v, order: prev.length + 1 },
                                    ];
                                  }
                                  return prev.map((x) =>
                                    x.code === k.code ? { ...x, is_default: !!v } : x,
                                  );
                                });
                              }}
                            />
                            {k.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          <PickerSection
            title="Risques"
            options={m.risks}
            value={risks}
            onChange={setRisks}
          />

          <Section title="Années de référence">
            <div className="flex gap-2">
              {years.map((y, i) => (
                <Input
                  key={i}
                  type="number"
                  className="w-24"
                  value={y}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    setYears((prev) => prev.map((x, idx) => (idx === i ? (isNaN(v) ? x : v) : x)));
                  }}
                />
              ))}
            </div>
          </Section>

          <Section title="Justification (affichée en haut du wizard)">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
              placeholder="Pourquoi ce preset est spécifique à cette marque…"
            />
          </Section>

          <Section title="Résumé de marque (affiché dans le wizard client)">
            <SummaryCardEditor guidance={guidance} setGuidance={setGuidance} />
          </Section>
        </div>
      )}
    </div>
  );
}

function SummaryCardEditor({
  guidance,
  setGuidance,
}: {
  guidance: Record<string, unknown>;
  setGuidance: (g: Record<string, unknown>) => void;
}) {
  const sc = (guidance.summary_card as {
    headline?: string;
    tagline?: string;
    positioning?: string;
    key_offers?: string[];
  }) ?? {};
  const update = (patch: Partial<typeof sc>) =>
    setGuidance({ ...guidance, summary_card: { ...sc, ...patch } });
  return (
    <div className="space-y-2">
      <Input
        value={sc.headline ?? ""}
        onChange={(e) => update({ headline: e.target.value })}
        placeholder="Headline (ex: Interdomicilio)"
      />
      <Input
        value={sc.tagline ?? ""}
        onChange={(e) => update({ tagline: e.target.value })}
        placeholder="Tagline (ex: Réseau multi-services à domicile)"
      />
      <Textarea
        value={sc.positioning ?? ""}
        onChange={(e) => update({ positioning: e.target.value })}
        rows={3}
        placeholder="Positionnement — phrase complète affichée dans le wizard"
      />
      <Input
        value={(sc.key_offers ?? []).join(", ")}
        onChange={(e) =>
          update({
            key_offers: e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        placeholder="Offres clés séparées par des virgules"
      />
      <p className="text-xs text-muted-foreground">
        Les recommandations, options secondaires/masquées et textes d'aide se règlent en cochant
        chaque item dans les sections ci-dessus. Édition visuelle avancée à venir.
      </p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold uppercase text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}

function PickerSection({
  title,
  options,
  value,
  onChange,
  withCircle,
}: {
  title: string;
  options: MasterRow[];
  value: PresetItem[];
  onChange: (v: PresetItem[]) => void;
  withCircle?: boolean;
}) {
  const valMap = useMemo(() => new Map(value.map((v) => [v.code, v])), [value]);
  const toggle = (opt: MasterRow) => {
    if (valMap.has(opt.code)) {
      onChange(value.filter((v) => v.code !== opt.code));
    } else {
      onChange([
        ...value,
        {
          code: opt.code,
          label: opt.label,
          order: value.length + 1,
          is_default: true,
          general_circle: opt.general_circle ?? null,
        },
      ]);
    }
  };
  const updateItem = (code: string, patch: Partial<PresetItem>) => {
    onChange(value.map((v) => (v.code === code ? { ...v, ...patch } : v)));
  };
  const move = (code: string, dir: -1 | 1) => {
    const idx = value.findIndex((v) => v.code === code);
    if (idx < 0) return;
    const j = idx + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange(next.map((x, i) => ({ ...x, order: i + 1 })));
  };

  return (
    <Section title={title}>
      <div className="border border-border rounded-md divide-y">
        <div className="p-3">
          <div className="text-xs text-muted-foreground mb-2">Cocher pour inclure dans le preset :</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {options.map((o) => (
              <label key={o.code} className="flex items-center gap-2 text-sm">
                <Checkbox checked={valMap.has(o.code)} onCheckedChange={() => toggle(o)} />
                {o.label}
              </label>
            ))}
          </div>
        </div>
        {value.length > 0 && (
          <div className="p-3 bg-muted/30">
            <div className="text-xs text-muted-foreground mb-2">Items sélectionnés (ordre + pré-cochage) :</div>
            <div className="space-y-1">
              {value.map((v, i) => (
                <div key={v.code} className="flex items-center gap-2 text-sm bg-background p-2 rounded border border-border">
                  <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                  <span className="flex-1 font-medium">{v.label}</span>
                  {withCircle && (
                    <Input
                      value={v.general_circle ?? ""}
                      onChange={(e) => updateItem(v.code, { general_circle: e.target.value })}
                      placeholder="cercle général"
                      className="h-8 max-w-[200px]"
                    />
                  )}
                  <label className="flex items-center gap-1 text-xs">
                    <Checkbox
                      checked={!!v.is_default}
                      onCheckedChange={(c) => updateItem(v.code, { is_default: !!c })}
                    />
                    pré-coché
                  </label>
                  <Button type="button" size="sm" variant="ghost" onClick={() => move(v.code, -1)}>↑</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => move(v.code, 1)}>↓</Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => onChange(value.filter((x) => x.code !== v.code))}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}

// =============== MASTERS EDITOR ===============
function MastersEditor() {
  const fetchMasters = useServerFn(listPresetMasters);
  const upsert = useServerFn(upsertPresetMaster);
  const del = useServerFn(deletePresetMaster);
  const qc = useQueryClient();
  const mastersQ = useQuery({ queryKey: ["preset-masters"], queryFn: () => fetchMasters() });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["preset-masters"] });

  if (mastersQ.isLoading) return <div>Chargement…</div>;
  const m = mastersQ.data!;

  const sections: Array<{ table: string; rows: MasterRow[]; circle?: boolean; group?: boolean }> = [
    { table: "study_types_master", rows: m.study_types },
    { table: "zone_focus_master", rows: m.zone_focus, circle: true },
    { table: "commune_types_master", rows: m.commune_types, circle: true },
    { table: "kpi_master", rows: m.kpis, group: true },
    { table: "risks_master", rows: m.risks },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Ces tables alimentent toutes les marques. Les cibles (target_publics) et services (sap_activities) sont éditables depuis "Tables référentielles".
      </p>
      {sections.map((s) => (
        <MasterTable
          key={s.table}
          table={s.table}
          rows={s.rows}
          withCircle={s.circle}
          withGroup={s.group}
          onChange={invalidate}
          upsert={upsert}
          del={del}
        />
      ))}
    </div>
  );
}

function MasterTable({
  table,
  rows,
  withCircle,
  withGroup,
  onChange,
  upsert,
  del,
}: {
  table: string;
  rows: MasterRow[];
  withCircle?: boolean;
  withGroup?: boolean;
  onChange: () => void;
  upsert: ReturnType<typeof useServerFn<typeof upsertPresetMaster>>;
  del: ReturnType<typeof useServerFn<typeof deletePresetMaster>>;
}) {
  const [draft, setDraft] = useState({ code: "", label: "", general_circle: "", kpi_group: "demographie", display_order: 0 });

  const handleAdd = async () => {
    try {
      await upsert({
        data: {
          table: table as Parameters<typeof upsert>[0]["data"]["table"],
          code: draft.code,
          label: draft.label,
          general_circle: withCircle ? draft.general_circle || null : null,
          kpi_group: withGroup ? draft.kpi_group : null,
          display_order: draft.display_order,
          is_active: true,
        },
      });
      setDraft({ code: "", label: "", general_circle: "", kpi_group: "demographie", display_order: 0 });
      toast.success("Ajouté");
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet élément ?")) return;
    try {
      await del({ data: { table: table as Parameters<typeof del>[0]["data"]["table"], id } });
      onChange();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  return (
    <div className="border border-border rounded-md">
      <div className="px-3 py-2 bg-muted/30 font-medium text-sm">{MASTER_LABELS[table] ?? table}</div>
      <div className="divide-y">
        {rows.map((r) => (
          <div key={r.id} className="px-3 py-2 flex items-center gap-2 text-sm">
            <span className="w-12 text-xs text-muted-foreground">{r.display_order}</span>
            <span className="font-mono text-xs text-muted-foreground w-40 truncate">{r.code}</span>
            <span className="flex-1">{r.label}</span>
            {withCircle && <span className="text-xs text-muted-foreground italic">{r.general_circle}</span>}
            {withGroup && <span className="text-xs uppercase text-muted-foreground">{r.kpi_group}</span>}
            <Button size="sm" variant="ghost" onClick={() => handleDelete(r.id)}>
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
      <div className="px-3 py-2 border-t bg-muted/20 flex items-center gap-2">
        <Input
          placeholder="code"
          value={draft.code}
          onChange={(e) => setDraft({ ...draft, code: e.target.value })}
          className="h-8 max-w-[140px] font-mono text-xs"
        />
        <Input
          placeholder="libellé"
          value={draft.label}
          onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          className="h-8 flex-1"
        />
        {withCircle && (
          <Input
            placeholder="cercle général"
            value={draft.general_circle}
            onChange={(e) => setDraft({ ...draft, general_circle: e.target.value })}
            className="h-8 max-w-[180px]"
          />
        )}
        {withGroup && (
          <Select value={draft.kpi_group} onValueChange={(v) => setDraft({ ...draft, kpi_group: v })}>
            <SelectTrigger className="h-8 max-w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {KPI_GROUPS.map((g) => (
                <SelectItem key={g.code} value={g.code}>{g.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Input
          type="number"
          placeholder="ordre"
          value={draft.display_order}
          onChange={(e) => setDraft({ ...draft, display_order: parseInt(e.target.value || "0", 10) })}
          className="h-8 w-20"
        />
        <Button size="sm" onClick={handleAdd} disabled={!draft.code || !draft.label}>
          <Plus className="h-3 w-3 mr-1" />Ajouter
        </Button>
      </div>
    </div>
  );
}