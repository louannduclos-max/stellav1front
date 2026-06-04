import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=60",
};

export const Route = createFileRoute("/api/public/brand-preset/$slug")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      GET: async ({ params, request }) => {
        const raw = (params.slug || "").slice(0, 80);
        const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const isUuid = uuidRe.test(raw);
        if (!isUuid && !/^[a-z0-9_-]+$/.test(raw.toLowerCase())) {
          return json({ error: "Invalid slug" }, 400);
        }

        // Query params : category + subtype pour sélectionner le preset approprié
        let categoryCode: string | null = null;
        let subtypeCode: string | null = null;
        try {
          const u = new URL(request.url);
          const c = u.searchParams.get("category");
          const s = u.searchParams.get("subtype");
          if (c && /^[a-z0-9_]+$/i.test(c) && c.length <= 50) categoryCode = c;
          if (s && /^[a-z0-9_]+$/i.test(s) && s.length <= 80) subtypeCode = s;
        } catch (_) {}

        const companyQuery = supabaseAdmin
          .from("companies")
          .select("id, slug, name, display_name, short_description, positioning");
        const { data: company, error: ce } = await (isUuid
          ? companyQuery.eq("id", raw).maybeSingle()
          : companyQuery.eq("slug", raw.toLowerCase()).maybeSingle());
        if (ce) return json({ error: ce.message }, 500);
        if (!company) return json({ error: "Unknown brand" }, 404);

        const [allPresetsR, branding, targets, sap, kpis, risks, zones, communes, studyTypes] =
          await Promise.all([
            supabaseAdmin
              .from("company_study_presets")
              .select(
                "default_study_type, default_target_publics, default_activity_families, default_zone_focus, default_commune_types, default_kpis, default_risks, default_reference_years, guidance, study_category_code, study_subtype_code, analysis_axes, preferred_tools, brief_overrides",
              )
              .eq("company_id", company.id)
              .eq("is_active", true),
            supabaseAdmin
              .from("company_branding")
              .select(
                "primary_color, secondary_color, accent_color, background_color, text_color, brand_style, logo_primary_url",
              )
              .eq("company_id", company.id)
              .maybeSingle(),
            supabaseAdmin
              .from("target_publics_master")
              .select("code, label, display_order")
              .eq("is_active", true)
              .order("display_order"),
            supabaseAdmin
              .from("sap_activities_master")
              .select("code, label, display_order")
              .eq("is_active", true)
              .order("display_order"),
            supabaseAdmin
              .from("kpi_master")
              .select("code, label, kpi_group, display_order")
              .eq("is_active", true)
              .order("display_order"),
            supabaseAdmin
              .from("risks_master")
              .select("code, label, display_order")
              .eq("is_active", true)
              .order("display_order"),
            supabaseAdmin
              .from("zone_focus_master")
              .select("code, label, general_circle, display_order")
              .eq("is_active", true)
              .order("display_order"),
            supabaseAdmin
              .from("commune_types_master")
              .select("code, label, general_circle, display_order")
              .eq("is_active", true)
              .order("display_order"),
            supabaseAdmin
              .from("study_types_master")
              .select("code, label, display_order")
              .eq("is_active", true)
              .order("display_order"),
          ]);

        const allPresets = (allPresetsR.data ?? []) as Array<{
          study_category_code: string | null;
          study_subtype_code: string | null;
          [k: string]: unknown;
        }>;
        // Préfère un preset (category + subtype), puis (category seul), puis générique.
        let selectedPreset = null as (typeof allPresets)[number] | null;
        if (categoryCode) {
          if (subtypeCode) {
            selectedPreset =
              allPresets.find(
                (p) =>
                  p.study_category_code === categoryCode &&
                  p.study_subtype_code === subtypeCode,
              ) ?? null;
          }
          if (!selectedPreset) {
            selectedPreset =
              allPresets.find(
                (p) =>
                  p.study_category_code === categoryCode &&
                  p.study_subtype_code == null,
              ) ?? null;
          }
        }
        if (!selectedPreset) {
          selectedPreset =
            allPresets.find(
              (p) => p.study_category_code == null && p.study_subtype_code == null,
            ) ??
            allPresets[0] ??
            null;
        }
        // Map des presets par catégorie (exposé pour info / UI)
        const presetsByCategory: Record<string, unknown> = {};
        for (const p of allPresets) {
          if (p.study_category_code) presetsByCategory[p.study_category_code] = p;
        }

        return json(
          {
            company: {
              slug: company.slug,
              name: company.display_name || company.name,
              short_description: company.short_description,
              positioning: company.positioning,
            },
            branding: branding.data ?? null,
            preset: selectedPreset,
            presets_by_category: presetsByCategory,
            catalog: {
              study_types: studyTypes.data ?? [],
              target_publics: targets.data ?? [],
              sap_activities: sap.data ?? [],
              kpis: kpis.data ?? [],
              risks: risks.data ?? [],
              zone_focus: zones.data ?? [],
              commune_types: communes.data ?? [],
            },
          },
          200,
        );
      },
    },
  },
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}