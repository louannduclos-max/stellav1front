import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMasters = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const tables = [
      "sap_activities_master",
      "target_publics_master",
      "territory_modes_master",
      "service_modes_master",
    ] as const;

    const [sap, publics, territory, service] = await Promise.all(
      tables.map((t) =>
        supabase
          .from(t)
          .select("id, code, label, display_order, is_active")
          .order("display_order"),
      ),
    );

    for (const r of [sap, publics, territory, service]) {
      if (r.error) throw new Error(r.error.message);
    }

    return {
      sap_activities: sap.data ?? [],
      target_publics: publics.data ?? [],
      territory_modes: territory.data ?? [],
      service_modes: service.data ?? [],
    };
  });

const MASTER_TABLES = [
  "sap_activities_master",
  "target_publics_master",
  "territory_modes_master",
  "service_modes_master",
] as const;
type MasterTable = (typeof MASTER_TABLES)[number];

const masterInput = z.object({
  table: z.enum(MASTER_TABLES),
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(80).regex(/^[a-z0-9_-]+$/i, "minuscules, chiffres, _ ou -"),
  label: z.string().trim().min(1).max(200),
  display_order: z.number().int().min(0).max(9999).default(0),
  is_active: z.boolean().default(true),
});

export const upsertMaster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.infer<typeof masterInput>) => masterInput.parse(input))
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { table, id, ...values } = data;
    if (id) {
      const { error } = await supabase.from(table as MasterTable).update(values).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from(table as MasterTable).insert(values);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deleteMaster = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { table: MasterTable; id: string }) =>
    z.object({ table: z.enum(MASTER_TABLES), id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { error } = await supabase.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });