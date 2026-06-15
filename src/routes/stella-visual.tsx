import { createFileRoute } from "@tanstack/react-router";
import StellaVisualRoute from "@/components/stella/StellaVisualRoute";

type Search = {
  studyId?: string;
  brand?: string;
  baseUrl?: string;
};

export const Route = createFileRoute("/stella-visual")({
  head: () => ({ meta: [{ title: "Stella Visual — Manifest" }] }),
  validateSearch: (search: Record<string, unknown>): Search => ({
    studyId: typeof search.studyId === "string" ? search.studyId : undefined,
    brand: typeof search.brand === "string" ? search.brand : undefined,
    baseUrl: typeof search.baseUrl === "string" ? search.baseUrl : undefined,
  }),
  component: StellaVisualPage,
  errorComponent: ({ error }) => (
    <div style={{ padding: 32, color: "#B00020" }}>Erreur : {error.message}</div>
  ),
  notFoundComponent: () => <div style={{ padding: 32 }}>Introuvable.</div>,
});

function StellaVisualPage() {
  const { studyId, brand, baseUrl } = Route.useSearch();
  return <StellaVisualRoute studyId={studyId} brand={brand} baseUrl={baseUrl} />;
}
