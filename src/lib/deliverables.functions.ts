import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { getDeliverableSignedUrl } from "./deliverables.server";

export const listDeliverables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ study_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("study_deliverables")
      .select("id, type, file_url, file_name, file_size, mime_type, generated_at")
      .eq("study_id", data.study_id)
      .order("generated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ deliverable_id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ context, data }) => {
    const { supabase } = context;
    // RLS check: user must be able to read the deliverable row
    const { data: row, error } = await supabase
      .from("study_deliverables")
      .select("id, file_url, file_name")
      .eq("id", data.deliverable_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Livrable introuvable");
    const url = await getDeliverableSignedUrl(row.file_url);
    return { url, file_name: row.file_name };
  });