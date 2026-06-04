import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Liste des permissions entreprise pour un utilisateur donné (admin uniquement).
 */
export const listUserCompanyPermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (me?.role !== "admin") throw new Error("Accès admin requis");

    const { data: rows, error } = await supabase
      .from("user_company_permissions")
      .select("id, company_id, created_at, companies:company_id(display_name)")
      .eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return (rows ?? []).map((r: any) => ({
      id: r.id,
      company_id: r.company_id,
      company_name: r.companies?.display_name ?? null,
      created_at: r.created_at,
    }));
  });

/**
 * Remplace la liste de permissions d'un utilisateur par celle fournie
 * (admin uniquement).
 */
export const setUserCompanyPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        company_ids: z.array(z.string().uuid()).max(200),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    if (me?.role !== "admin") throw new Error("Accès admin requis");

    // Récupère l'existant
    const { data: existing, error: exErr } = await supabase
      .from("user_company_permissions")
      .select("id, company_id")
      .eq("user_id", data.user_id);
    if (exErr) throw new Error(exErr.message);

    const existingIds = new Set((existing ?? []).map((r) => r.company_id));
    const targetIds = new Set(data.company_ids);

    const toAdd = data.company_ids.filter((id) => !existingIds.has(id));
    const toRemove = (existing ?? [])
      .filter((r) => !targetIds.has(r.company_id))
      .map((r) => r.id);

    if (toRemove.length > 0) {
      const { error } = await supabase
        .from("user_company_permissions")
        .delete()
        .in("id", toRemove);
      if (error) throw new Error(error.message);
    }
    if (toAdd.length > 0) {
      const { error } = await supabase
        .from("user_company_permissions")
        .insert(
          toAdd.map((company_id) => ({
            user_id: data.user_id,
            company_id,
            granted_by: userId,
          })),
        );
      if (error) throw new Error(error.message);
    }
    return { ok: true, added: toAdd.length, removed: toRemove.length };
  });

/**
 * Liste des entreprises auxquelles l'utilisateur courant a accès.
 * Les admins reçoivent toutes les entreprises actives.
 */
export const listMyAllowedCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (me?.role === "admin") {
      const { data, error } = await supabase
        .from("companies")
        .select("id, display_name")
        .order("display_name");
      if (error) throw new Error(error.message);
      return data ?? [];
    }

    const { data: perms, error: pErr } = await supabase
      .from("user_company_permissions")
      .select("companies:company_id(id, display_name)")
      .eq("user_id", userId);
    if (pErr) throw new Error(pErr.message);
    return (perms ?? [])
      .map((p: any) => p.companies)
      .filter(Boolean)
      .sort((a: any, b: any) =>
        (a.display_name ?? "").localeCompare(b.display_name ?? ""),
      ) as { id: string; display_name: string }[];
  });