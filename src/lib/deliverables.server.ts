import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * file_url stores the storage path inside the private `deliverables` bucket.
 * Returns a short-lived signed URL (5 min).
 */
export async function getDeliverableSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from("deliverables")
    .createSignedUrl(path, 60 * 5);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}