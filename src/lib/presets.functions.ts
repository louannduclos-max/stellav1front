import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Types ----------
export type PresetItem = {
  code: string;
  label: string;
  order?: number;
  is_default?: boolean;
  general_circle?: string | null;
  group?: string;
};

// ---------- Masters used by the preset editor ----------
export const listPresetMasters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [studyTypes, zones, communes, kpis, risks, targets, sap, companies] = await Promise.all([
      supabase.from("study_types_master").select("*").order("display_order"),
      supabase.from("zone_focus_master").select("*").order("display_order"),
      supabase.from("commune_types_master").select("*").order("display_order"),
      supabase.from("kpi_master").select("*").order("kpi_group").order("display_order"),
      supabase.from("risks_master").select("*").order("display_order"),
      supabase.from("target_publics_master").select("*").order("display_order"),
      supabase.from("sap_activities_master").select("*").order("display_order"),
      supabase.from("companies").select("id, display_name, slug").order("display_name"),
    ]);
    for (const r of [studyTypes, zones, communes, kpis, risks, targets, sap, companies]) {
      if (r.error) throw new Error(r.error.message);
    }
    return {
      study_types: studyTypes.data ?? [],
      zone_focus: zones.data ?? [],
      commune_types: communes.data ?? [],
      kpis: kpis.data ?? [],
      risks: risks.data ?? [],
      target_publics: targets.data ?? [],
      sap_activities: sap.data ?? [],
      companies: companies.data ?? [],
    };
  });

// ---------- Generic master CRUD for the new tables ----------
const PRESET_MASTER_TABLES = [
  "study_types_master",
  "zone_focus_master",
  "commune_types_master",
  "kpi_master",
  "risks_master",
] as const;

type PresetMasterTable = (typeof PRESET_MASTER_TABLES)[number];

const upsertPresetMasterInput = z.object({
  table: z.enum(PRESET_MASTER_TABLES),
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/i),
  label: z.string().trim().min(1).max(200),
  general_circle: z.string().trim().max(200).optional().nullable(),
  kpi_group: z.string().trim().max(80).optional().nullable(),
  display_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const upsertPresetMaster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof upsertPresetMasterInput>) =>
    upsertPresetMasterInput.parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { table, id, general_circle, kpi_group, ...base } = data;
    const payload: Record<string, unknown> = { ...base };
    if (table === "zone_focus_master" || table === "commune_types_master") {
      payload.general_circle = general_circle ?? null;
    }
    if (table === "kpi_master") {
      if (!kpi_group) throw new Error("kpi_group requis pour un KPI");
      payload.kpi_group = kpi_group;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase.from(table) as any;
    if (id) {
      const { error } = await client.update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await client.insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deletePresetMaster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: PresetMasterTable; id: string }) =>
    z.object({ table: z.enum(PRESET_MASTER_TABLES), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Company preset ----------
export const getCompanyPreset = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string }) =>
    z.object({ company_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: row, error } = await supabase
      .from("company_study_presets")
      .select("*")
      .eq("company_id", data.company_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { preset: row };
  });

const presetItemSchema = z.object({
  code: z.string(),
  label: z.string(),
  order: z.number().optional(),
  is_default: z.boolean().optional(),
  general_circle: z.string().nullable().optional(),
  group: z.string().optional(),
});

const upsertPresetInput = z.object({
  company_id: z.string().uuid(),
  default_study_type: z.string().nullable().optional(),
  default_target_publics: z.array(presetItemSchema).default([]),
  default_activity_families: z.array(presetItemSchema).default([]),
  default_zone_focus: z.array(presetItemSchema).default([]),
  default_commune_types: z.array(presetItemSchema).default([]),
  default_kpis: z.array(presetItemSchema).default([]),
  default_risks: z.array(presetItemSchema).default([]),
  default_reference_years: z.array(z.number().int()).default([]),
  justification_note: z.string().max(4000).nullable().optional(),
  is_active: z.boolean().default(true),
  guidance: z.record(z.string(), z.unknown()).optional(),
});

export const upsertCompanyPreset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof upsertPresetInput>) => upsertPresetInput.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("company_study_presets")
      .upsert(
        {
          company_id: data.company_id,
          default_study_type: data.default_study_type ?? null,
          default_target_publics: data.default_target_publics,
          default_activity_families: data.default_activity_families,
          default_zone_focus: data.default_zone_focus,
          default_commune_types: data.default_commune_types,
          default_kpis: data.default_kpis,
          default_risks: data.default_risks,
          default_reference_years: data.default_reference_years,
          justification_note: data.justification_note ?? null,
          is_active: data.is_active,
          guidance: (data.guidance ?? {}) as never,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "company_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });