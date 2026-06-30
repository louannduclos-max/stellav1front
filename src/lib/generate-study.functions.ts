import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Déclenche la génération d'une étude déjà créée par le wizard.
 * Délègue le travail lourd au backend Render via webhook signé.
 *
 * Front:
 *   import { generateStudy } from "@/lib/generate-study.functions";
 *   const res = await generateStudy({ data: { studyId } });
 *   // -> { studyId, generation_status: "pending" }
 */
export const generateStudy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ studyId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const studyId = data.studyId;

    // 1. Charger l'étude (RLS filtre déjà; on garde le double-check)
    const { data: study, error: studyErr } = await supabase
      .from("studies")
      .select("*")
      .eq("id", studyId)
      .maybeSingle();
    if (studyErr) throw new Error(studyErr.message);
    if (!study) {
      throw new Response("Étude introuvable", { status: 404 });
    }

    // 2. Autorisation explicite (admin OU owner)
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const isAdmin = me?.role === "admin";
    const isOwner = study.user_id === userId || study.created_by === userId;
    if (!isAdmin && !isOwner) {
      throw new Response("Accès refusé à cette étude", { status: 403 });
    }

    // 3. Anti double-lancement
    if (study.generation_status === "processing") {
      throw new Response("Une génération est déjà en cours pour cette étude", {
        status: 409,
      });
    }

    // 4. Validations minimales
    const missing: string[] = [];
    if (!study.city_name) missing.push("city_name");
    if (!study.study_type) missing.push("study_type");
    const families = Array.isArray(study.included_activity_families)
      ? study.included_activity_families
      : [];
    if (families.length === 0 && !study.study_type) {
      missing.push("included_activity_families");
    }
    if (missing.length > 0) {
      throw new Response(
        `Champs manquants pour lancer la génération : ${missing.join(", ")}`,
        { status: 400 },
      );
    }
    const deliverableFormat = study.deliverable_format ?? "pdf";

    // 5. Enrichissement INSEE / lat / lon via geo.api.gouv.fr
    let code_insee: string | null = null;
    let lat: number | null = null;
    let lon: number | null = null;
    try {
      const params = new URLSearchParams({
        nom: String(study.city_name),
        fields: "code,nom,codeDepartement,centre",
        limit: "1",
      });
      if (study.postal_code) params.set("codePostal", String(study.postal_code));
      const geoRes = await fetch(
        `https://geo.api.gouv.fr/communes?${params.toString()}`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (geoRes.ok) {
        const arr = (await geoRes.json()) as Array<{
          code?: string;
          centre?: { coordinates?: [number, number] };
        }>;
        const commune = arr?.[0];
        code_insee = commune?.code ?? null;
        lat = commune?.centre?.coordinates?.[1] ?? null;
        lon = commune?.centre?.coordinates?.[0] ?? null;
      }
    } catch (e) {
      console.error("[generateStudy] geo.api.gouv.fr lookup failed", e);
    }
    if (!code_insee || lat == null || lon == null) {
      throw new Response(
        `Impossible de résoudre la commune ${study.city_name}`,
        { status: 422 },
      );
    }

    // 6. client_name via companies.display_name (fallback title)
    let clientName = study.title ?? "Client";
    if (study.company_id) {
      const { data: company } = await supabase
        .from("companies")
        .select("display_name, name")
        .eq("id", study.company_id)
        .maybeSingle();
      if (company) {
        clientName = company.display_name || company.name || clientName;
      }
    }

    // 7. Marquer pending (admin client: on assume que l'auth est déjà OK)
    {
      const { error: upErr } = await supabaseAdmin
        .from("studies")
        .update({
          generation_status: "pending",
          generation_error_message: null,
        })
        .eq("id", studyId);
      if (upErr) throw new Error(upErr.message);
    }

    // 8. Appel Render
    const RENDER_BACKEND_URL = process.env.RENDER_BACKEND_URL;
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
    if (!RENDER_BACKEND_URL || !WEBHOOK_SECRET) {
      await supabaseAdmin
        .from("studies")
        .update({
          generation_status: "failed",
          generation_error_message:
            "Configuration backend manquante (RENDER_BACKEND_URL / WEBHOOK_SECRET)",
        })
        .eq("id", studyId);
      throw new Response("Backend de génération non configuré", { status: 500 });
    }

    const studyData = {
      city_name: study.city_name,
      postal_code: study.postal_code,
      code_insee,
      lat,
      lon,
      study_type: study.study_type,
      included_activity_families: families,
      client_name: clientName,
      palette_key: "bonadea_care",
      deliverable_format: deliverableFormat,
      language: "fr",
      title: study.title,
      study_objective: study.study_objective,
      radius_km: 5,
    };

    // Fire-and-forget : on envoie la requête à Render sans attendre la réponse.
    // Raison : Render Free démarre en ~50s (cold start) alors que CF Pages Workers
    // ont un timeout mur de ~30s. Avec keepalive:true la requête persiste après le
    // return. Render reçoit le payload dès qu'il est prêt et envoie ses callbacks
    // de progression via FRONT_WEBHOOK_URL.
    void fetch(`${RENDER_BACKEND_URL}/generate-study`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WEBHOOK_SECRET}`,
      },
      body: JSON.stringify({ study_id: studyId, study_data: studyData }),
      keepalive: true,
    }).then(async (r) => {
      if (!r.ok) {
        const txt = await r.text().catch(() => "");
        await supabaseAdmin
          .from("studies")
          .update({
            generation_status: "failed",
            generation_error_message: `Backend HTTP ${r.status}: ${txt.slice(0, 500)}`,
          })
          .eq("id", studyId);
      }
    }).catch(async (e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      await supabaseAdmin
        .from("studies")
        .update({
          generation_status: "failed",
          generation_error_message: `Backend injoignable: ${msg.slice(0, 500)}`,
        })
        .eq("id", studyId);
    });

    return { studyId, generation_status: "pending" as const };
  });