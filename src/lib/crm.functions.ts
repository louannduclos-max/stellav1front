import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const CRM_CATEGORIES = [
  "probleme",
  "fonctionne_bien",
  "ne_fonctionne_pas",
  "amelioration",
  "blocage",
  "remarque_client",
  "remarque_interne",
] as const;

export const CRM_SEVERITIES = ["faible", "moyen", "eleve", "critique"] as const;
export const CRM_STATUSES = ["ouvert", "en_cours", "resolu", "archive"] as const;

export const listCrmLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        study_id: z.string().uuid().optional(),
        company_id: z.string().uuid().optional(),
      })
      .optional()
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    let q = supabase
      .from("internal_crm_logs")
      .select(
        "id, study_id, company_id, category, title, description, severity, status, resolved_at, created_by, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (data?.study_id) q = q.eq("study_id", data.study_id);
    if (data?.company_id) q = q.eq("company_id", data.company_id);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const ids = Array.from(new Set((rows ?? []).map((r) => r.created_by).filter(Boolean))) as string[];
    const companyIds = Array.from(
      new Set((rows ?? []).map((r) => r.company_id).filter(Boolean)),
    ) as string[];
    const studyIds = Array.from(
      new Set((rows ?? []).map((r) => r.study_id).filter(Boolean)),
    ) as string[];

    const [profilesRes, companiesRes, studiesRes] = await Promise.all([
      ids.length
        ? supabase.from("profiles").select("id, email, full_name").in("id", ids)
        : Promise.resolve({ data: [] }),
      companyIds.length
        ? supabase.from("companies").select("id, display_name").in("id", companyIds)
        : Promise.resolve({ data: [] }),
      studyIds.length
        ? supabase.from("studies").select("id, title").in("id", studyIds)
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const companyMap = new Map((companiesRes.data ?? []).map((c) => [c.id, c.display_name]));
    const studyMap = new Map((studiesRes.data ?? []).map((s) => [s.id, s.title]));

    return (rows ?? []).map((r) => ({
      ...r,
      author_name:
        (r.created_by && (profileMap.get(r.created_by)?.full_name || profileMap.get(r.created_by)?.email)) ||
        "—",
      company_name: r.company_id ? companyMap.get(r.company_id) ?? null : null,
      study_title: r.study_id ? studyMap.get(r.study_id) ?? null : null,
    }));
  });

export const createCrmLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        study_id: z.string().uuid().nullable().optional(),
        company_id: z.string().uuid().nullable().optional(),
        category: z.enum(CRM_CATEGORIES),
        title: z.string().trim().min(1).max(255),
        description: z.string().max(5000).optional(),
        severity: z.enum(CRM_SEVERITIES).default("moyen"),
        status: z.enum(CRM_STATUSES).default("ouvert"),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("internal_crm_logs")
      .insert({
        study_id: data.study_id ?? null,
        company_id: data.company_id ?? null,
        category: data.category,
        title: data.title,
        description: data.description ?? null,
        severity: data.severity,
        status: data.status,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const updateCrmLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(CRM_STATUSES).optional(),
        severity: z.enum(CRM_SEVERITIES).optional(),
        title: z.string().trim().min(1).max(255).optional(),
        description: z.string().max(5000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const patch: Record<string, unknown> = {};
    if (data.status !== undefined) {
      patch.status = data.status;
      patch.resolved_at = data.status === "resolu" ? new Date().toISOString() : null;
    }
    if (data.severity !== undefined) patch.severity = data.severity;
    if (data.title !== undefined) patch.title = data.title;
    if (data.description !== undefined) patch.description = data.description;
    const { error } = await supabase
      .from("internal_crm_logs")
      .update(patch as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteCrmLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from("internal_crm_logs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });