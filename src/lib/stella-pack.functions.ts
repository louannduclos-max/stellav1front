import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { StellaPack } from "@/types/stella-pack";

const InputSchema = z.object({ id: z.string().min(1).max(255) });

export const getStellaPack = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<StellaPack> => {
    const base = process.env.STELLA_API_URL ?? "http://127.0.0.1:8000";
    const url = `${base.replace(/\/$/, "")}/integration/study/${encodeURIComponent(data.id)}/lovable-pack`;

    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) {
      throw new Error(`Stella pack fetch failed (${res.status}) for ${data.id}`);
    }
    return (await res.json()) as StellaPack;
  });