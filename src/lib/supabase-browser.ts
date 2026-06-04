import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://knmvxeykwkcrlxwlvohi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubXZ4ZXlrd2tjcmx4d2x2b2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0NDA1OTQsImV4cCI6MjA5NTAxNjU5NH0.DGDkGSHS9IBiGOtHigRV2K28Lxb_YEreF97mU2jrLwE";

export const supabaseBrowser = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== "undefined" ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
  },
});