import { useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

import { listMyAllowedCompanies } from "@/lib/permissions.functions";
import { getCompany, listCompanyChildren } from "@/lib/companies.functions";
import { listStudyCategories, listStudySubtypes } from "@/lib/study-types.functions";
import { createStudyFromWizard } from "@/lib/wizard.functions";
import type { WizardPayload } from "@/lib/wizard.functions";
import { WIZARD_CATALOG } from "@/lib/wizard/catalog";

const COUNTRIES = (WIZARD_CATALOG.pays as Array<any>)
  .filter((p) => p.available)
  .map((p) => ({ code: p.code as string, name: p.name as string, flag: p.flag as string }));

const COMMUNE_TYPES = (WIZARD_CATALOG.communeTypes as Array<any>).map((t) => ({
  code: t.key as string,
  label: t.label as string,
  desc: t.desc as string | undefined,
}));

const ZONE_TYPES = (WIZARD_CATALOG.zoneTypes as Array<any>).map((t) => ({
  code: t.key as string,
  label: t.label as string,
  desc: t.desc as string | undefined,
  icon: t.icon as string | undefined,
}));

// KPI catalog grouped by category — synthesis = demo/demande/rh/mobilite, competition = concurrence/economie/regl/risques
const SYNTHESIS_GROUPS = ["demographie", "demande", "rh", "mobilite"] as const;
const COMPETITION_GROUPS = ["concurrence", "economie", "reglementaire", "risques"] as const;

type CatalogKpi = { code: string; label: string; cat: string; src?: string };
const ALL_KPIS: CatalogKpi[] = (WIZARD_CATALOG.kpis as Array<any>).map((k) => ({
  code: k.key as string,
  label: k.name as string,
  cat: k.cat as string,
  src: k.src as string | undefined,
}));
const KPI_CATEGORIES = (WIZARD_CATALOG.kpiCategories as Array<any>) as Array<{
  key: string;
  label: string;
  icon: string;
}>;
const SYNTHESIS_KPIS = ALL_KPIS.filter((k) => SYNTHESIS_GROUPS.includes(k.cat as any));
const COMPETITION_KPIS = ALL_KPIS.filter((k) => COMPETITION_GROUPS.includes(k.cat as any));

// City suggestions (autocomplete) by country
const CITIES_BY_COUNTRY: Record<string, string[]> = (() => {
  const map: Record<string, Set<string>> = {};
  for (const v of WIZARD_CATALOG.villes as Array<any>) {
    const c = v.country as string;
    if (!map[c]) map[c] = new Set();
    map[c].add(v.ville as string);
  }
  return Object.fromEntries(Object.entries(map).map(([c, s]) => [c, Array.from(s).sort()]));
})();

const STEPS = [
  { n: 1, title: "Marque & étude" },
  { n: 2, title: "Où" },
  { n: 3, title: "Activités" },
  { n: 4, title: "Cibles" },
  { n: 5, title: "KPIs" },
  { n: 6, title: "Récap" },
] as const;

type State = { step: number; data: WizardPayload };

const EMPTY: WizardPayload = {
  company_id: "",
  study_category_code: "",
  study_subtype_code: "",
  title: "",
  country_code: "FR",
  city_name: "",
  postal_code: "",
  commune_types: [],
  zone_focus: "",
  included_activity_families: [],
  main_target_public: [],
  competition_kpis: [],
  synthesis_kpis: [],
  study_objective: "",
};

type Action =
  | { type: "setStep"; step: number }
  | { type: "patch"; patch: Partial<WizardPayload> };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "setStep":
      return { ...state, step: action.step };
    case "patch":
      return { ...state, data: { ...state.data, ...action.patch } };
  }
}

function Stepper({ current, primary }: { current: number; primary: string }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2">
      {STEPS.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        return (
          <div key={s.n} className="flex items-center gap-2 flex-shrink-0">
            <div
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center text-xs font-semibold border",
                done && "text-white border-transparent",
                active && "text-white border-transparent",
                !done && !active && "bg-muted text-muted-foreground border-border",
              )}
              style={done || active ? { backgroundColor: primary } : undefined}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : s.n}
            </div>
            <span
              className={cn(
                "text-xs whitespace-nowrap",
                active ? "font-semibold" : "text-muted-foreground",
              )}
            >
              {s.title}
            </span>
            {i < STEPS.length - 1 && <div className="w-6 h-px bg-border mx-1" />}
          </div>
        );
      })}
    </div>
  );
}

export function WizardShell({
  initialCompanyId,
  initialCategory,
  initialSubtype,
}: {
  initialCompanyId?: string;
  initialCategory?: string;
  initialSubtype?: string;
}) {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, {
    step: initialCompanyId ? 2 : 1,
    data: {
      ...EMPTY,
      company_id: initialCompanyId ?? "",
      study_category_code: initialCategory ?? "",
      study_subtype_code: initialSubtype ?? "",
    },
  });

  const companiesFn = useServerFn(listMyAllowedCompanies);
  const categoriesFn = useServerFn(listStudyCategories);
  const subtypesFn = useServerFn(listStudySubtypes);
  const companyFn = useServerFn(getCompany);
  const childrenFn = useServerFn(listCompanyChildren);

  const companiesQ = useQuery({ queryKey: ["wizard.companies"], queryFn: () => companiesFn() });
  const categoriesQ = useQuery({ queryKey: ["wizard.categories"], queryFn: () => categoriesFn() });
  const subtypesQ = useQuery({ queryKey: ["wizard.subtypes"], queryFn: () => subtypesFn() });

  const selectedCompany = useMemo(
    () => companiesQ.data?.find((c) => c.id === state.data.company_id),
    [companiesQ.data, state.data.company_id],
  );

  const companyDetailQ = useQuery({
    queryKey: ["wizard.company", state.data.company_id],
    queryFn: () => companyFn({ data: { id: state.data.company_id } }),
    enabled: !!state.data.company_id,
  });

  const companyChildrenQ = useQuery({
    queryKey: ["wizard.companyChildren", state.data.company_id],
    queryFn: () => childrenFn({ data: { id: state.data.company_id } }),
    enabled: !!state.data.company_id,
  });

  const branding = (companyDetailQ.data as any)?.company_branding;
  const primary: string =
    (Array.isArray(branding) ? branding[0]?.primary_color : branding?.primary_color) ?? "#1E3A8A";
  const accent: string =
    (Array.isArray(branding) ? branding[0]?.accent_color : branding?.accent_color) ?? primary;

  useEffect(() => {
    const children = companyChildrenQ.data;
    if (!children) return;
    dispatch({
      type: "patch",
      patch: {
        included_activity_families: (children.activities ?? []).map((a: any) => ({
          code: a.activity_code,
          label: a.activity_label,
        })),
        main_target_public: (children.targets ?? []).map((t: any) => ({
          code: t.public_code,
          label: t.public_label,
        })),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyChildrenQ.data]);

  useEffect(() => {
    if (state.data.title) return;
    if (!selectedCompany || !state.data.city_name) return;
    dispatch({
      type: "patch",
      patch: { title: `${selectedCompany.display_name} — ${state.data.city_name}` },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany?.id, state.data.city_name]);

  const submitFn = useServerFn(createStudyFromWizard);
  const submitMut = useMutation({
    mutationFn: () => submitFn({ data: state.data }),
    onSuccess: ({ id }) => {
      toast.success("Étude créée !");
      navigate({ to: "/app/studies/$id", params: { id } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erreur création"),
  });

  const goNext = () => dispatch({ type: "setStep", step: Math.min(6, state.step + 1) });
  const goBack = () => dispatch({ type: "setStep", step: Math.max(1, state.step - 1) });

  const canNext = useMemo(() => {
    const d = state.data;
    switch (state.step) {
      case 1:
        return !!d.company_id && !!d.study_category_code && !!d.study_subtype_code;
      case 2:
        return !!d.country_code && !!d.city_name.trim();
      case 3:
        return d.included_activity_families.length > 0;
      case 4:
        return d.main_target_public.length > 0;
      case 5:
        return true;
      case 6:
        return !!d.title.trim();
      default:
        return false;
    }
  }, [state]);

  return (
    <div
      className="min-h-screen bg-background"
      style={
        {
          ["--wizard-primary" as any]: primary,
          ["--wizard-accent" as any]: accent,
        } as React.CSSProperties
      }
    >
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        <Stepper current={state.step} primary={primary} />

        <Card className="p-6">
          {state.step === 1 && (
            <Step1
              data={state.data}
              dispatch={dispatch}
              companies={companiesQ.data ?? []}
              categories={categoriesQ.data ?? []}
              subtypes={subtypesQ.data ?? []}
              loading={companiesQ.isLoading || categoriesQ.isLoading}
              primary={primary}
              selectedCompany={selectedCompany}
            />
          )}
          {state.step === 2 && <Step2 data={state.data} dispatch={dispatch} primary={primary} />}
          {state.step === 3 && <Step3 data={state.data} dispatch={dispatch} primary={primary} />}
          {state.step === 4 && <Step4 data={state.data} dispatch={dispatch} primary={primary} />}
          {state.step === 5 && <Step5 data={state.data} dispatch={dispatch} primary={primary} />}
          {state.step === 6 && (
            <Step6
              data={state.data}
              dispatch={dispatch}
              selectedCompany={selectedCompany}
              categories={categoriesQ.data ?? []}
              subtypes={subtypesQ.data ?? []}
            />
          )}
        </Card>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={goBack}
            disabled={state.step === 1 || submitMut.isPending}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Précédent
          </Button>
          {state.step < 6 ? (
            <Button
              onClick={goNext}
              disabled={!canNext}
              style={{ backgroundColor: primary, color: "white" }}
            >
              Suivant <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={() => submitMut.mutate()}
              disabled={!canNext || submitMut.isPending}
              style={{ backgroundColor: primary, color: "white" }}
            >
              {submitMut.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Lancer l'étude
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step1({
  data,
  dispatch,
  companies,
  categories,
  subtypes,
  loading,
  primary,
  selectedCompany,
}: {
  data: WizardPayload;
  dispatch: React.Dispatch<Action>;
  companies: { id: string; display_name: string }[];
  categories: any[];
  subtypes: any[];
  loading: boolean;
  primary: string;
  selectedCompany?: { id: string; display_name: string };
}) {
  const filteredSubtypes = subtypes.filter((s) => s.category_code === data.study_category_code);
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-1">Pour quelle marque réalisez-vous l'étude ?</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Les activités, cibles et couleurs seront pré-remplies depuis la marque.
        </p>
        {loading ? (
          <div className="text-sm text-muted-foreground">Chargement des marques…</div>
        ) : companies.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            Aucune marque accessible. Demandez à un admin de vous donner les permissions.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {companies.map((c) => {
              const selected = c.id === data.company_id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => dispatch({ type: "patch", patch: { company_id: c.id } })}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm font-medium transition",
                    selected
                      ? "text-white border-transparent shadow"
                      : "bg-card hover:bg-accent border-border",
                  )}
                  style={selected ? { backgroundColor: primary } : undefined}
                >
                  {selected && <Check className="h-3.5 w-3.5 inline mr-1" />}
                  {c.display_name}
                </button>
              );
            })}
          </div>
        )}
        {selectedCompany && (
          <div
            className="mt-3 text-xs text-muted-foreground p-3 rounded-md"
            style={{ backgroundColor: `${primary}10` }}
          >
            Marque sélectionnée : <strong>{selectedCompany.display_name}</strong>
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Catégorie d'étude</Label>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const selected = cat.code === data.study_category_code;
            return (
              <button
                key={cat.code}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "patch",
                    patch: { study_category_code: cat.code, study_subtype_code: "" },
                  })
                }
                className={cn(
                  "px-4 py-2 rounded-md border text-sm transition",
                  selected
                    ? "text-white border-transparent"
                    : "bg-card hover:bg-accent border-border",
                )}
                style={selected ? { backgroundColor: primary } : undefined}
              >
                {cat.icon_emoji && <span className="mr-1">{cat.icon_emoji}</span>}
                {cat.display_name}
              </button>
            );
          })}
          {categories.length === 0 && (
            <span className="text-sm text-muted-foreground">
              Aucune catégorie d'étude configurée.
            </span>
          )}
        </div>
      </div>

      {data.study_category_code && (
        <div>
          <Label className="mb-2 block">Type précis</Label>
          <div className="grid sm:grid-cols-2 gap-2">
            {filteredSubtypes.map((s) => {
              const selected = s.code === data.study_subtype_code;
              return (
                <button
                  key={s.code}
                  type="button"
                  onClick={() =>
                    dispatch({ type: "patch", patch: { study_subtype_code: s.code } })
                  }
                  className={cn(
                    "text-left px-4 py-3 rounded-md border transition",
                    selected
                      ? "border-transparent text-white"
                      : "bg-card hover:bg-accent border-border",
                  )}
                  style={selected ? { backgroundColor: primary } : undefined}
                >
                  <div className="text-sm font-medium">{s.display_name}</div>
                  {s.description && (
                    <div
                      className={cn(
                        "text-xs mt-0.5",
                        selected ? "text-white/85" : "text-muted-foreground",
                      )}
                    >
                      {s.description}
                    </div>
                  )}
                </button>
              );
            })}
            {filteredSubtypes.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Aucun sous-type pour cette catégorie.
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({
  data,
  dispatch,
  primary,
}: {
  data: WizardPayload;
  dispatch: React.Dispatch<Action>;
  primary: string;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Où voulez-vous étudier ?</h2>
      <div>
        <Label className="mb-2 block">Pays</Label>
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => {
            const selected = data.country_code === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => dispatch({ type: "patch", patch: { country_code: c.code } })}
                className={cn(
                  "px-3 py-2 rounded-md border text-sm transition",
                  selected
                    ? "text-white border-transparent"
                    : "bg-card hover:bg-accent border-border",
                )}
                style={selected ? { backgroundColor: primary } : undefined}
              >
                <span className="mr-1">{c.flag}</span>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input
            id="city"
            list="wizard-city-suggestions"
            value={data.city_name}
            onChange={(e) => dispatch({ type: "patch", patch: { city_name: e.target.value } })}
            placeholder="Ex: Bordeaux"
          />
          <datalist id="wizard-city-suggestions">
            {(CITIES_BY_COUNTRY[data.country_code] ?? []).map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
        </div>
        <div>
          <Label htmlFor="postal">Code postal (optionnel)</Label>
          <Input
            id="postal"
            value={data.postal_code ?? ""}
            onChange={(e) =>
              dispatch({ type: "patch", patch: { postal_code: e.target.value } })
            }
            placeholder="33000"
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Type(s) de commune ciblé(s)</Label>
        <div className="flex flex-wrap gap-2">
          {COMMUNE_TYPES.map((t) => {
            const selected = data.commune_types.includes(t.code);
            return (
              <button
                key={t.code}
                type="button"
                onClick={() =>
                  dispatch({
                    type: "patch",
                    patch: {
                      commune_types: selected
                        ? data.commune_types.filter((x) => x !== t.code)
                        : [...data.commune_types, t.code],
                    },
                  })
                }
                title={t.desc}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-sm transition",
                  selected
                    ? "text-white border-transparent"
                    : "bg-card hover:bg-accent border-border",
                )}
                style={selected ? { backgroundColor: primary } : undefined}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Périmètre géographique</Label>
        <div className="flex flex-wrap gap-2">
          {ZONE_TYPES.map((z) => {
            const selected = (data.zone_focus ?? "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .includes(z.code);
            return (
              <button
                key={z.code}
                type="button"
                onClick={() => {
                  const current = (data.zone_focus ?? "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const next = selected
                    ? current.filter((x) => x !== z.code)
                    : [...current, z.code];
                  dispatch({ type: "patch", patch: { zone_focus: next.join(",") } });
                }}
                title={z.desc}
                className={cn(
                  "px-3 py-1.5 rounded-md border text-sm transition",
                  selected
                    ? "text-white border-transparent"
                    : "bg-card hover:bg-accent border-border",
                )}
                style={selected ? { backgroundColor: primary } : undefined}
              >
                {z.icon && <span className="mr-1">{z.icon}</span>}
                {z.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label htmlFor="zone">Précisions de zone (optionnel)</Label>
        <Input
          id="zone"
          value={data.zone_focus ?? ""}
          onChange={(e) => dispatch({ type: "patch", patch: { zone_focus: e.target.value } })}
          placeholder="Ex: agglomération bordelaise, rive droite…"
        />
      </div>
    </div>
  );
}

function Step3({
  data,
  dispatch,
  primary,
}: {
  data: WizardPayload;
  dispatch: React.Dispatch<Action>;
  primary: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Activités SAP à couvrir</h2>
        <p className="text-sm text-muted-foreground">
          Pré-cochées depuis la marque. Décochez celles non pertinentes pour cette étude.
        </p>
      </div>
      {data.included_activity_families.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Aucune activité enregistrée sur la marque. Ajoutez-en depuis Admin → Marques.
        </div>
      ) : (
        <div className="space-y-2">
          {data.included_activity_families.map((a) => (
            <label
              key={a.code}
              className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-accent cursor-pointer"
            >
              <Checkbox
                checked
                onCheckedChange={() =>
                  dispatch({
                    type: "patch",
                    patch: {
                      included_activity_families: data.included_activity_families.filter(
                        (x) => x.code !== a.code,
                      ),
                    },
                  })
                }
                style={{ backgroundColor: primary, borderColor: primary }}
              />
              <span className="text-sm">{a.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{a.code}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function Step4({
  data,
  dispatch,
  primary,
}: {
  data: WizardPayload;
  dispatch: React.Dispatch<Action>;
  primary: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Publics cibles</h2>
        <p className="text-sm text-muted-foreground">
          Pré-cochés depuis la marque. Affinez selon le contexte de l'étude.
        </p>
      </div>
      {data.main_target_public.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          Aucun public cible enregistré sur la marque.
        </div>
      ) : (
        <div className="space-y-2">
          {data.main_target_public.map((t) => (
            <label
              key={t.code}
              className="flex items-center gap-3 p-3 rounded-md border border-border hover:bg-accent cursor-pointer"
            >
              <Checkbox
                checked
                onCheckedChange={() =>
                  dispatch({
                    type: "patch",
                    patch: {
                      main_target_public: data.main_target_public.filter((x) => x.code !== t.code),
                    },
                  })
                }
                style={{ backgroundColor: primary, borderColor: primary }}
              />
              <span className="text-sm">{t.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{t.code}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function KpiGroup({
  title,
  options,
  selected,
  onToggle,
  primary,
}: {
  title: string;
  options: { code: string; label: string }[];
  selected: { code: string; label: string }[];
  onToggle: (next: { code: string; label: string }[]) => void;
  primary: string;
}) {
  return (
    <div>
      <Label className="mb-2 block">{title}</Label>
      <div className="grid sm:grid-cols-2 gap-2">
        {options.map((opt) => {
          const isSel = selected.some((s) => s.code === opt.code);
          return (
            <label
              key={opt.code}
              className="flex items-center gap-2 p-2 rounded-md border border-border hover:bg-accent cursor-pointer text-sm"
            >
              <Checkbox
                checked={isSel}
                onCheckedChange={() =>
                  onToggle(isSel ? selected.filter((s) => s.code !== opt.code) : [...selected, opt])
                }
                style={isSel ? { backgroundColor: primary, borderColor: primary } : undefined}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Step5({
  data,
  dispatch,
  primary,
}: {
  data: WizardPayload;
  dispatch: React.Dispatch<Action>;
  primary: string;
}) {
  const synthCats = KPI_CATEGORIES.filter((c) => SYNTHESIS_GROUPS.includes(c.key as any));
  const compCats = KPI_CATEGORIES.filter((c) => COMPETITION_GROUPS.includes(c.key as any));
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">KPIs à inclure dans l'étude</h2>
        <p className="text-sm text-muted-foreground">
          Catalogue complet ({ALL_KPIS.length} KPIs). Tous facultatifs.
        </p>
      </div>
      <div className="space-y-5">
        {synthCats.map((cat) => {
          const opts = SYNTHESIS_KPIS.filter((k) => k.cat === cat.key).map((k) => ({
            code: k.code,
            label: k.label,
          }));
          if (opts.length === 0) return null;
          return (
            <KpiGroup
              key={cat.key}
              title={`${cat.icon} ${cat.label}`}
              options={opts}
              selected={data.synthesis_kpis}
              onToggle={(next) => dispatch({ type: "patch", patch: { synthesis_kpis: next } })}
              primary={primary}
            />
          );
        })}
        {compCats.map((cat) => {
          const opts = COMPETITION_KPIS.filter((k) => k.cat === cat.key).map((k) => ({
            code: k.code,
            label: k.label,
          }));
          if (opts.length === 0) return null;
          return (
            <KpiGroup
              key={cat.key}
              title={`${cat.icon} ${cat.label}`}
              options={opts}
              selected={data.competition_kpis}
              onToggle={(next) => dispatch({ type: "patch", patch: { competition_kpis: next } })}
              primary={primary}
            />
          );
        })}
      </div>
    </div>
  );
}

function Step6({
  data,
  dispatch,
  selectedCompany,
  categories,
  subtypes,
}: {
  data: WizardPayload;
  dispatch: React.Dispatch<Action>;
  selectedCompany?: { id: string; display_name: string };
  categories: any[];
  subtypes: any[];
}) {
  const cat = categories.find((c) => c.code === data.study_category_code);
  const sub = subtypes.find((s) => s.code === data.study_subtype_code);
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Récapitulatif</h2>

      <div>
        <Label htmlFor="title">Titre de l'étude</Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })}
          placeholder="Titre"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Row label="Marque" value={selectedCompany?.display_name} />
        <Row label="Catégorie" value={cat?.display_name} />
        <Row label="Type" value={sub?.display_name} />
        <Row label="Pays" value={data.country_code} />
        <Row label="Ville" value={data.city_name} />
        <Row label="CP" value={data.postal_code} />
        <Row label="Communes" value={data.commune_types.join(", ") || "—"} />
        <Row label="Zone" value={data.zone_focus || "—"} />
        <Row
          label="Activités"
          value={`${data.included_activity_families.length} sélectionnée(s)`}
        />
        <Row label="Cibles" value={`${data.main_target_public.length} sélectionnée(s)`} />
        <Row
          label="KPIs"
          value={`${data.synthesis_kpis.length + data.competition_kpis.length} sélectionné(s)`}
        />
      </div>

      <div>
        <Label htmlFor="objective">Objectif de l'étude (optionnel)</Label>
        <Textarea
          id="objective"
          value={data.study_objective ?? ""}
          onChange={(e) =>
            dispatch({ type: "patch", patch: { study_objective: e.target.value } })
          }
          placeholder="Quelques lignes pour cadrer la mission…"
          rows={3}
        />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}