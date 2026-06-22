import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Supabase cowork project (utwjfsomblhupghbgvgv) — migrated from Lovable Cloud
// anon key is intentionally public (safe to commit)
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://utwjfsomblhupghbgvgv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0d2pmc29tYmxodXBnaGJndmd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTUzMTUsImV4cCI6MjA5NzY5MTMxNX0.iN1N8d5GjsUzrIWHkBXWqAn1DpZO-wbhH3nI-8UHBv4";

export const supabaseBrowser = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});
