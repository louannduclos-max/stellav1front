import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listStudies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("studies")
      .select(
        "id, title, status, generation_status, version_number, parent_study_id, country_code, city_name, created_at, updated_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listStudiesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        search: z.string().max(200).optional(),
        status: z.string().max(40).optional(),
        company_id: z.string().uuid().optional(),
        study_type: z.string().max(80).optional(),
        created_by: z.string().uuid().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        page: z.number().int().min(0).default(0),
        page_size: z.number().int().min(1).max(200).default(50),
      })
      .partial()
      .parse(input ?? {}),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const page = data.page ?? 0;
    const pageSize = data.page_size ?? 50;
    let q = supabase
      .from("studies")
      .select(
        "id, title, status, generation_status, generation_started_at, generation_completed_at, version_number, study_type, country_code, city_name, company_id, created_by, created_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (data.search) q = q.ilike("title", `%${data.search}%`);
    if (data.status) q = q.eq("generation_status", data.status);
    if (data.company_id) q = q.eq("company_id", data.company_id);
    if (data.study_type) q = q.eq("study_type", data.study_type);
    if (data.created_by) q = q.eq("created_by", data.created_by);
    if (data.from) q = q.gte("created_at", data.from);
    if (data.to) q = q.lte("created_at", data.to);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);

    const companyIds = Array.from(
      new Set((rows ?? []).map((r) => r.company_id).filter(Boolean)),
    ) as string[];
    const userIds = Array.from(
      new Set((rows ?? []).map((r) => r.created_by).filter(Boolean)),
    ) as string[];

    const [companiesRes, profilesRes] = await Promise.all([
      companyIds.length
        ? supabase.from("companies").select("id, display_name").in("id", companyIds)
        : Promise.resolve({ data: [] }),
      userIds.length
        ? supabase.from("profiles").select("id, email, full_name").in("id", userIds)
        : Promise.resolve({ data: [] }),
    ]);

    const companyMap = new Map((companiesRes.data ?? []).map((c) => [c.id, c.display_name]));
    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));

    return {
      total: count ?? 0,
      page,
      pageSize,
      rows: (rows ?? []).map((r) => {
        const dur =
          r.generation_started_at && r.generation_completed_at
            ? Math.round(
                (new Date(r.generation_completed_at).getTime() -
                  new Date(r.generation_started_at).getTime()) /
                  1000,
              )
            : null;
        const p = r.created_by ? profileMap.get(r.created_by) : null;
        return {
          ...r,
          duration_s: dur,
          company_name: r.company_id ? companyMap.get(r.company_id) ?? null : null,
          author_name: p ? p.full_name || p.email : null,
        };
      }),
    };
  });

export const listStudyFilters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [companies, types, authors] = await Promise.all([
      supabase.from("companies").select("id, display_name").order("display_name"),
      supabase.from("studies").select("study_type"),
      supabase.from("profiles").select("id, email, full_name").order("email"),
    ]);
    const typeSet = Array.from(
      new Set(((types.data ?? []) as { study_type: string | null }[]).map((r) => r.study_type).filter(Boolean)),
    ) as string[];
    return {
      companies: companies.data ?? [],
      types: typeSet,
      authors: authors.data ?? [],
    };
  });

export const getStudy = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: study, error } = await supabase
      .from("studies")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!study) throw new Error("Étude introuvable");

    // Version history: all studies sharing the same root (parent chain)
    const rootId = study.parent_study_id ?? study.id;
    const { data: versions } = await supabase
      .from("studies")
      .select("id, version_number, generation_status, created_at, title")
      .or(`id.eq.${rootId},parent_study_id.eq.${rootId}`)
      .order("version_number", { ascending: true });

    return { study, versions: versions ?? [] };
  });

export const createStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(255),
        company_id: z.string().uuid(),
        country_code: z.string().max(8).optional(),
        city_name: z.string().max(255).optional(),
        study_objective: z.string().max(2000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    // Vérifier que l'utilisateur a la permission de créer une étude pour cette marque
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (me?.role !== "admin") {
      const { data: perm } = await supabase
        .from("user_company_permissions")
        .select("id")
        .eq("user_id", userId)
        .eq("company_id", data.company_id)
        .maybeSingle();
      if (!perm) {
        throw new Error(
          "Vous n'avez pas la permission de créer une étude pour cette entreprise.",
        );
      }
    }
    // Préremplir l'étude depuis le preset de la marque (s'il existe)
    // sinon retomber sur les activités/publics directement attachés à la marque.
    const [presetRes, actsRes, tgtsRes] = await Promise.all([
      supabase
        .from("company_study_presets")
        .select("*")
        .eq("company_id", data.company_id)
        .maybeSingle(),
      supabase
        .from("company_activity_families")
        .select("activity_code, activity_label")
        .eq("company_id", data.company_id)
        .eq("is_active", true)
        .order("display_order"),
      supabase
        .from("company_target_publics")
        .select("public_code, public_label")
        .eq("company_id", data.company_id),
    ]);

    const preset = presetRes.data;
    type PresetItem = { code: string; label: string; is_default?: boolean; group?: string; general_circle?: string | null };
    const onlyDefault = (arr: unknown): PresetItem[] =>
      Array.isArray(arr) ? (arr as PresetItem[]).filter((x) => x?.is_default) : [];

    const included_activity_families = preset
      ? onlyDefault(preset.default_activity_families)
      : (actsRes.data ?? []).map((a) => ({ code: a.activity_code, label: a.activity_label }));
    const main_target_public = preset
      ? onlyDefault(preset.default_target_publics)
      : (tgtsRes.data ?? []).map((t) => ({ code: t.public_code, label: t.public_label }));

    // KPI dispatch by group
    const defaultKpis = preset ? onlyDefault(preset.default_kpis) : [];
    const byGroup = (g: string) => defaultKpis.filter((k) => k.group === g);
    const synthesis_kpis = byGroup("demographie");
    const market_kpis = [...byGroup("demande"), ...byGroup("economie")];
    const hr_kpis = byGroup("rh");
    const competition_kpis = byGroup("concurrence");
    const transport_kpis = byGroup("mobilite");

    const study_type = preset?.default_study_type ?? null;

    const { data: row, error } = await supabase
      .from("studies")
      .insert({
        title: data.title,
        company_id: data.company_id,
        country_code: data.country_code ?? null,
        city_name: data.city_name ?? null,
        study_objective: data.study_objective ?? null,
        user_id: userId,
        created_by: userId,
        version_number: 1,
        study_type,
        included_activity_families,
        main_target_public,
        synthesis_kpis,
        market_kpis,
        hr_kpis,
        competition_kpis,
        transport_kpis,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const createStudyVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ source_study_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    const { data: source, error: srcErr } = await supabase
      .from("studies")
      .select("*")
      .eq("id", data.source_study_id)
      .maybeSingle();
    if (srcErr) throw new Error(srcErr.message);
    if (!source) throw new Error("Étude source introuvable");

    const rootId = source.parent_study_id ?? source.id;

    // Find max version in the chain
    const { data: existing } = await supabase
      .from("studies")
      .select("version_number")
      .or(`id.eq.${rootId},parent_study_id.eq.${rootId}`);
    const nextVersion =
      (existing ?? []).reduce((m, r) => Math.max(m, r.version_number ?? 1), 1) + 1;

    // Clone payload (strip identity / status fields)
    const {
      id: _id,
      created_at: _ca,
      updated_at: _ua,
      generation_status: _gs,
      generation_started_at: _gsa,
      generation_completed_at: _gca,
      generation_error_message: _gem,
      version_number: _vn,
      parent_study_id: _ps,
      status: _st,
      ...payload
    } = source as Record<string, unknown>;

    const { data: row, error } = await supabase
      .from("studies")
      .insert({
        ...payload,
        user_id: userId,
        created_by: userId,
        parent_study_id: rootId,
        version_number: nextVersion,
        status: "draft",
        generation_status: "pending",
        generation_started_at: null,
        generation_completed_at: null,
        generation_error_message: null,
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, version: nextVersion };
  });

export const cancelStudyGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Admin check via user_roles
    const { data: roleRow } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden");

    const { error } = await supabase
      .from("studies")
      .update({
        generation_status: "cancelled",
        generation_completed_at: new Date().toISOString(),
      } as never)
      .eq("id", data.id)
      .in("generation_status", ["pending", "processing"]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
