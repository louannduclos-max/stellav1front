import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import { WizardShell } from "@/components/wizard/WizardShell";

const searchSchema = z.object({
  category: z.string().optional(),
  subtype: z.string().optional(),
  company_id: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/app/studies/new")({
  head: () => ({ meta: [{ title: "Nouvelle étude — Stella" }] }),
  validateSearch: searchSchema,
  component: NewStudyPage,
});

function NewStudyPage() {
  const search = Route.useSearch();
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 pt-4">
        <Link
          to="/app/studies"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux études
        </Link>
      </div>
      <WizardShell
        initialCompanyId={search.company_id}
        initialCategory={search.category}
        initialSubtype={search.subtype}
      />
    </div>
  );
}