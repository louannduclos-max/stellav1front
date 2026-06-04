import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const companyInput = z.object({
  name: z.string().trim().min(1).max(200),
  display_name: z.string().trim().min(1).max(200),
  slug: z.string().trim().min(1).max(120).regex(/^[a-z0-9-]+$/, "minuscules, chiffres, tirets"),
  actor_type: z
    .enum([
      "private_company",
      "public_actor",
      "association",
      "franchise_network",
      "integrated_network",
      "local_independent",
      "platform_intermediary",
    ])
    .default("private_company"),
  positioning: z
    .enum(["generalist", "specialist", "premium", "proximity", "network_volume"])
    .nullable()
    .optional(),
  group_name: z.string().trim().max(200).nullable().optional(),
  short_description: z.string().trim().max(500).nullable().optional(),
  long_description: z.string().trim().max(4000).nullable().optional(),
  website_url: z.string().trim().max(500).nullable().optional(),
  internal_notes: z.string().trim().max(4000).nullable().optional(),
  default_language: z.string().trim().max(10).default("fr-FR"),
  status: z.enum(["active", "archived"]).default("active"),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "#RRGGBB").default("#1E3A8A"),
  secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "#RRGGBB")
    .nullable()
    .optional(),
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "#RRGGBB")
    .nullable()
    .optional(),
});

export const listCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("companies")
      .select("id, name, display_name, slug, actor_type, positioning, group_name, short_description, website_url, status, updated_at, company_branding(primary_color, secondary_color, accent_color)")
      .order("display_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getCompany = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: c, error } = await supabase
      .from("companies")
      .select("*, company_branding(primary_color, secondary_color, accent_color)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return c;
  });

export const upsertCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id?: string; values: z.infer<typeof companyInput> }) =>
    z.object({ id: z.string().uuid().optional(), values: companyInput }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { primary_color, secondary_color, accent_color, ...companyFields } = data.values;
    let companyId = data.id;
    if (companyId) {
      const { error } = await supabase.from("companies").update(companyFields).eq("id", companyId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabase
        .from("companies")
        .insert({ ...companyFields, created_by: userId })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      companyId = created.id;
    }
    // Upsert branding (primary color)
    const { data: existing } = await supabase
      .from("company_branding")
      .select("id")
      .eq("company_id", companyId)
      .maybeSingle();
    if (existing) {
      const { error } = await supabase
        .from("company_branding")
        .update({
          primary_color,
          secondary_color: secondary_color ?? null,
          accent_color: accent_color ?? null,
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("company_branding")
        .insert({
          company_id: companyId,
          primary_color,
          secondary_color: secondary_color ?? null,
          accent_color: accent_color ?? null,
        });
      if (error) throw new Error(error.message);
    }
    return { id: companyId };
  });

export const deleteCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    await supabase.from("company_branding").delete().eq("company_id", data.id);
    await supabase.from("company_activity_families").delete().eq("company_id", data.id);
    await supabase.from("company_target_publics").delete().eq("company_id", data.id);
    const { error } = await supabase.from("companies").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --- Activities / targets sub-lists --- */

export const listCompanyChildren = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const [acts, tgts] = await Promise.all([
      supabase
        .from("company_activity_families")
        .select("id, activity_code, activity_label, display_order, is_active")
        .eq("company_id", data.id)
        .order("display_order"),
      supabase
        .from("company_target_publics")
        .select("id, public_code, public_label, is_default")
        .eq("company_id", data.id),
    ]);
    if (acts.error) throw new Error(acts.error.message);
    if (tgts.error) throw new Error(tgts.error.message);
    return { activities: acts.data ?? [], targets: tgts.data ?? [] };
  });

export const addCompanyActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string; code: string; label: string }) =>
    z
      .object({
        company_id: z.string().uuid(),
        code: z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/i),
        label: z.string().trim().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("company_activity_families").insert({
      company_id: data.company_id,
      activity_code: data.code,
      activity_label: data.label,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeCompanyActivity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("company_activity_families").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addCompanyTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string; code: string; label: string }) =>
    z
      .object({
        company_id: z.string().uuid(),
        code: z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/i),
        label: z.string().trim().min(1).max(200),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("company_target_publics").insert({
      company_id: data.company_id,
      public_code: data.code,
      public_label: data.label,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeCompanyTarget = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("company_target_publics").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --- Bulk set from master codes (multi-select UX) --- */

export const setCompanyActivities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string; codes: string[] }) =>
    z
      .object({
        company_id: z.string().uuid(),
        codes: z.array(z.string().trim().min(1).max(80)).max(100),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    // Look up labels from master
    const { data: master, error: mErr } = await supabase
      .from("sap_activities_master")
      .select("code, label, display_order")
      .in("code", data.codes.length ? data.codes : ["__none__"]);
    if (mErr) throw new Error(mErr.message);
    // Replace existing rows
    const { error: delErr } = await supabase
      .from("company_activity_families")
      .delete()
      .eq("company_id", data.company_id);
    if (delErr) throw new Error(delErr.message);
    if (data.codes.length === 0) return { ok: true };
    const rows = (master ?? []).map((m, i) => ({
      company_id: data.company_id,
      activity_code: m.code,
      activity_label: m.label,
      display_order: m.display_order ?? i,
      is_active: true,
    }));
    const { error } = await supabase.from("company_activity_families").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setCompanyTargets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { company_id: string; codes: string[] }) =>
    z
      .object({
        company_id: z.string().uuid(),
        codes: z.array(z.string().trim().min(1).max(80)).max(100),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: master, error: mErr } = await supabase
      .from("target_publics_master")
      .select("code, label")
      .in("code", data.codes.length ? data.codes : ["__none__"]);
    if (mErr) throw new Error(mErr.message);
    const { error: delErr } = await supabase
      .from("company_target_publics")
      .delete()
      .eq("company_id", data.company_id);
    if (delErr) throw new Error(delErr.message);
    if (data.codes.length === 0) return { ok: true };
    const rows = (master ?? []).map((m) => ({
      company_id: data.company_id,
      public_code: m.code,
      public_label: m.label,
      is_default: true,
    }));
    const { error } = await supabase.from("company_target_publics").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
