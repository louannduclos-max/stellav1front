import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const InputSchema = z.object({
  country: z.string().min(1).max(120),
  city: z.string().min(1).max(200),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/suggest-axes")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const parsed = InputSchema.safeParse(body);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Invalid input" }),
              { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }
          const { country, city } = parsed.data;

          const apiKey = process.env.LOVABLE_API_KEY;
          if (!apiKey) {
            return new Response(
              JSON.stringify({ error: "AI gateway not configured" }),
              { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const system = `Tu es un expert en accessibilité routière et transports urbains. À partir d'un pays et d'une ville, tu fournis la liste des AXES MAJEURS structurants pour une étude de zone de chalandise dans le domaine des services à la personne (livraison/déplacements équipes terrain). Inclus :
- Autoroutes principales desservant la zone (avec leur n°)
- Rocade / périphérique si applicable
- Routes nationales structurantes
- Lignes de tram / métro / transport en commun majeures
Tu réponds UNIQUEMENT via l'outil suggest_axes. Maximum 12 axes. Sois précis et factuel.`;

          const res = await fetch(
            "https://ai.gateway.lovable.dev/v1/chat/completions",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: [
                  { role: "system", content: system },
                  { role: "user", content: `Pays : ${country}\nVille : ${city}` },
                ],
                tools: [
                  {
                    type: "function",
                    function: {
                      name: "suggest_axes",
                      description: "Renvoie les axes routiers et transports majeurs.",
                      parameters: {
                        type: "object",
                        properties: {
                          axes: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                label: { type: "string", description: "Nom de l'axe, ex: A10 — Paris–Bordeaux, ou Tram L1" },
                                type: {
                                  type: "string",
                                  enum: ["autoroute", "rocade", "nationale", "departementale", "transport"],
                                },
                              },
                              required: ["label", "type"],
                              additionalProperties: false,
                            },
                            minItems: 1,
                            maxItems: 12,
                          },
                        },
                        required: ["axes"],
                        additionalProperties: false,
                      },
                    },
                  },
                ],
                tool_choice: { type: "function", function: { name: "suggest_axes" } },
              }),
            },
          );

          if (!res.ok) {
            const t = await res.text();
            console.error("AI gateway error", res.status, t);
            const status = res.status === 429 || res.status === 402 ? res.status : 502;
            return new Response(
              JSON.stringify({ error: `AI error ${res.status}` }),
              { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
            );
          }

          const data = await res.json();
          const call = data?.choices?.[0]?.message?.tool_calls?.[0];
          const args = call?.function?.arguments
            ? JSON.parse(call.function.arguments)
            : null;
          const axes = Array.isArray(args?.axes) ? args.axes : [];

          return new Response(JSON.stringify({ axes }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (e) {
          console.error("suggest-axes failed", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
