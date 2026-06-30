import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://utwjfsomblhupghbgvgv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

if (!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn("[supabase-browser] VITE_SUPABASE_PUBLISHABLE_KEY manquant — ajouter dans CF Pages env vars");
}

export const supabaseBrowser = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
