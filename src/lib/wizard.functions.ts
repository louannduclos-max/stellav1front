import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const codeLabel = z.object({
  code: z.string().min(1).max(120),
  label: z.string().min(1).max(240),
});

const payloadSchema = z.object({
  // Step 1
  company_id: z.string().uuid(),
  study_category_code: z.string().min(1).max(80),
  study_subtype_code: z.string().min(1).max(80),
  title: z.string().min(1).max(255),
  // Step 2
  country_code: z.string().min(2).max(8),
  city_name: z.string().min(1).max(160),
  postal_code: z.string().max(20).optional().nullable(),
  commune_types: z.array(z.string().min(1).max(80)).max(10).default([]),
  zone_focus: z.string().max(500).optional().nullable(),
  // Step 3
  included_activity_families: z.array(codeLabel).max(40).default([]),
  // Step 4
  main_target_public: z.array(codeLabel).max(40).default([]),
  // Step 5
  competition_kpis: z.array(codeLabel).max(40).default([]),
  synthesis_kpis: z.array(codeLabel).max(40).default([]),
  study_objective: z.string().max(2000).optional().nullable(),
});

export type WizardPayload = z.infer<typeof payloadSchema>;

export const createStudyFromWizard = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => payloadSchema.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;

    // Permission check: admin OR explicit user_company_permissions row.
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
      if (!perm) throw new Error("Accès refusé à cette marque.");
    }

    const { data: row, error } = await supabase
      .from("studies")
      .insert({
        title: data.title,
        company_id: data.company_id,
        country_code: data.country_code,
        city_name: data.city_name,
        postal_code: data.postal_code ?? null,
        study_objective: data.study_objective ?? null,
        study_category_code: data.study_category_code,
        study_subtype_code: data.study_subtype_code,
        user_id: userId,
        created_by: userId,
        version_number: 1,
        included_activity_families: data.included_activity_families,
        main_target_public: data.main_target_public,
        competition_kpis: data.competition_kpis,
        synthesis_kpis: data.synthesis_kpis,
        commune_types: data.commune_types,
        zone_focus: data.zone_focus ? [data.zone_focus] : [],
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });