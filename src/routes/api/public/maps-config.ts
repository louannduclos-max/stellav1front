import { createFileRoute } from "@tanstack/react-router";

// Endpoint public retournant la clé navigateur Google Maps (Lovable connector).
// Cette clé est référer-restreinte par Lovable (*.lovable.app) — il est donc
// safe de l'exposer côté browser à des appelants depuis nos domaines.
// Pas de PII, pas de secrets serveur exposés.
export const Route = createFileRoute("/api/public/maps-config")({
  server: {
    handlers: {
      GET: async () => {
        const browserKey = process.env.GOOGLE_MAPS_BROWSER_KEY || "";
        const trackingId = process.env.GOOGLE_MAPS_TRACKING_ID || "";
        return new Response(
          JSON.stringify({ browserKey, trackingId }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=300",
            },
          },
        );
      },
    },
  },
});