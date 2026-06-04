import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";

const searchSchema = z.object({
  category: z.string().optional(),
  subtype: z.string().optional(),
  company_id: z.string().optional(),
  subtype_label: z.string().optional(),
  category_label: z.string().optional(),
  company_name: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/app/studies/new")({
  head: () => ({ meta: [{ title: "Nouvelle étude — Stella" }] }),
  validateSearch: searchSchema,
  component: NewStudyPage,
});

function NewStudyPage() {
  const search = Route.useSearch();
  const qs = new URLSearchParams();
  if (search.category) qs.set("category", search.category);
  if (search.subtype) qs.set("subtype", search.subtype);
  if (search.company_id) qs.set("company_id", search.company_id);
  if (search.subtype_label) qs.set("subtype_label", search.subtype_label);
  if (search.category_label) qs.set("category_label", search.category_label);
  if (search.company_name) qs.set("company_name", search.company_name);
  // Démarre directement à l'étape "Où & quand" quand une marque est choisie.
  const startStep = search.company_id ? 2 : 1;
  const src = `/stella/Louann.html?${qs.toString()}#/wizard/${startStep}`;

  return (
    <div className="fixed inset-0 bg-background z-40">
      <div className="absolute top-3 left-3 z-50">
        <Link
          to="/app/studies"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-white/90 border border-border text-sm font-medium shadow hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux études
        </Link>
      </div>
      <iframe
        src={src}
        title="Nouvelle étude"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
      />
    </div>
  );
}