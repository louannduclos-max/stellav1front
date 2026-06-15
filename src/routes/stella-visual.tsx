import { createFileRoute } from "@tanstack/react-router";
import StellaManifestPage from "@/components/stella/StellaManifestPage";

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
  return (
    <div style={{ minHeight: "100vh", background: "#EEF3FA" }} data-testid="stella-visual-route">
      <StellaManifestPage
        studyId={studyId ?? "std_demo_replace_me"}
        brandSlug={brand ?? "o2"}
        baseUrl={baseUrl ?? (import.meta.env.VITE_STELLA_PUBLIC_URL as string | undefined) ?? "http://127.0.0.1:8000"}
      />
    </div>
  );
}