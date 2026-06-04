import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_STATUS = new Set(["processing", "completed", "done", "failed", "error"]);

// Map incoming status -> DB value (front uses "processing" | "done" | "error")
function normalizeStatus(s: string): "processing" | "done" | "error" {
  if (s === "processing") return "processing";
  if (s === "completed" || s === "done") return "done";
  return "error";
}

type FileSlot = { field: string; type: string; ext: string; mime: string; basename?: string };
const FILE_SLOTS: FileSlot[] = [
  { field: "file_pdf", type: "pdf_native", ext: "pdf", mime: "application/pdf" },
  { field: "file_pptx", type: "pptx", ext: "pptx",
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" },
  { field: "file_html", type: "other", ext: "html", mime: "text/html" },
  { field: "file_notice", type: "notice", ext: "pdf", mime: "application/pdf", basename: "notice" },
];

function checkBearer(request: Request, secret: string): boolean {
  const h = request.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h);
  if (!m) return false;
  const got = Buffer.from(m[1].trim());
  const exp = Buffer.from(secret);
  return got.length === exp.length && timingSafeEqual(got, exp);
}

export const Route = createFileRoute("/api/public/generation-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.GENERATION_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Webhook secret not configured", { status: 500 });
        }
        if (!checkBearer(request, secret)) {
          return new Response("Unauthorized", { status: 401 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("Expected multipart/form-data", { status: 400 });
        }

        const study_id = String(form.get("study_id") ?? "").trim();
        const rawStatus = String(form.get("status") ?? "").trim();
        const error_message = form.get("error_message");
        const cost_eur = form.get("cost_eur");
        const duration_sec = form.get("duration_sec");

        if (!UUID_RE.test(study_id)) {
          return new Response("Invalid study_id", { status: 400 });
        }
        if (!ALLOWED_STATUS.has(rawStatus)) {
          return new Response("Invalid status", { status: 400 });
        }
        const status = normalizeStatus(rawStatus);

        const update: Record<string, unknown> = { generation_status: status };
        if (status === "processing") {
          update.generation_started_at = new Date().toISOString();
          update.generation_completed_at = null;
          update.generation_error_message = null;
        } else if (status === "done") {
          update.generation_completed_at = new Date().toISOString();
          update.generation_error_message = null;
          update.progress = 100;
          update.eta_seconds = 0;
        } else {
          update.generation_completed_at = new Date().toISOString();
          update.generation_error_message =
            (typeof error_message === "string" && error_message.slice(0, 2000)) ||
            "Erreur inconnue";
        }
        void cost_eur;
        void duration_sec;

        // Real-progress fields — only set when explicitly provided by the
        // backend so we never accidentally reset progress to 0.
        const intField = (key: string): number | undefined => {
          const raw = form.get(key);
          if (raw == null) return undefined;
          const n = parseInt(String(raw), 10);
          return Number.isFinite(n) ? n : undefined;
        };
        const strField = (key: string, max = 500): string | undefined => {
          const raw = form.get(key);
          if (raw == null || typeof raw !== "string") return undefined;
          const s = raw.trim();
          return s ? s.slice(0, max) : undefined;
        };
        const progress = intField("progress");
        if (progress !== undefined) {
          update.progress = Math.max(0, Math.min(100, progress));
        }
        const eta = intField("eta_seconds");
        if (eta !== undefined) update.eta_seconds = Math.max(0, eta);
        const phase = intField("phase");
        if (phase !== undefined) update.phase = Math.max(1, Math.min(99, phase));
        const phaseTotal = intField("phase_total");
        if (phaseTotal !== undefined) update.phase_total = Math.max(1, phaseTotal);
        const progressLabel = strField("progress_label");
        if (progressLabel) update.progress_label = progressLabel;
        const phaseLabel = strField("phase_label");
        if (phaseLabel) update.phase_label = phaseLabel;

        const { error: upErr } = await supabaseAdmin
          .from("studies")
          .update(update as never)
          .eq("id", study_id);
        if (upErr) return new Response(upErr.message, { status: 500 });

        // Upload each provided file to the `deliverables` bucket and record it
        const inserted: string[] = [];
        for (const slot of FILE_SLOTS) {
          const entry = form.get(slot.field);
          if (!entry || typeof entry === "string") continue;
          const file = entry as File;
          if (!file.size) continue;
          const baseName = slot.basename ?? "etude";
          const path = `${study_id}/${baseName}.${slot.ext}`;
          const buf = Buffer.from(await file.arrayBuffer());
          const mime = file.type || slot.mime;

          const { error: upFileErr } = await supabaseAdmin.storage
            .from("deliverables")
            .upload(path, buf, { contentType: mime, upsert: true });
          if (upFileErr) {
            return new Response(
              `Upload failed for ${slot.field}: ${upFileErr.message}`,
              { status: 500 },
            );
          }

          const { error: insErr } = await supabaseAdmin
            .from("study_deliverables")
            .insert({
              study_id,
              type: slot.type,
              file_url: path,
              file_name: file.name || `${baseName}.${slot.ext}`,
              file_size: file.size,
              mime_type: mime,
            } as never);
          if (insErr) {
            return new Response(
              `DB insert failed for ${slot.field}: ${insErr.message}`,
              { status: 500 },
            );
          }
          inserted.push(slot.type);
        }

        return new Response(JSON.stringify({ ok: true, inserted }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});