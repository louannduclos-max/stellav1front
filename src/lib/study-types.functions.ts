import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listStudyCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("study_categories_master")
      .select("code, display_name, description, icon_emoji, sort_order")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listStudySubtypes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("study_subtypes_master")
      .select("code, category_code, display_name, description, is_recommended, sort_order, backend_prompt_id")
      .order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });