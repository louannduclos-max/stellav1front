import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { z } from "zod";
import { listStudies } from "@/lib/studies.functions";
import { AppShell, GenerationStatusBadge } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StudyCategoryPicker, type PickedSubtype } from "@/components/study-category-picker";
import { CompanyPicker, type PickedCompany } from "@/components/company-picker";

export const Route = createFileRoute("/_authenticated/app/studies")({
  head: () => ({ meta: [{ title: "Études — Stella" }] }),
  validateSearch: z.object({
    picker: z.union([z.literal("1"), z.literal("true"), z.boolean()]).optional(),
  }),
  component: StudiesRoute,
});

function StudiesRoute() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname.replace(/\/+$/, ""),
  });

  if (pathname.startsWith("/app/studies/")) {
    return <Outlet />;
  }

  return <StudiesPage />;
}

function StudiesPage() {
  const fetchStudies = useServerFn(listStudies);
  const navigate = useNavigate();
  const search = Route.useSearch();
  const { data, isLoading, error } = useQuery({
    queryKey: ["studies"],
    queryFn: () => fetchStudies(),
  });

  const [catOpen, setCatOpen] = useState<boolean>(Boolean(search.picker));
  const [picked, setPicked] = useState<PickedSubtype | null>(null);

  function onSubtypePicked(s: PickedSubtype) {
    setPicked(s);
    setCatOpen(false);
  }

  function onCompanyPicked(c: PickedCompany) {
    if (!picked) return;
    const qs = new URLSearchParams({
      category: picked.category_code,
      subtype: picked.subtype_code,
      company_id: c.company_id,
      subtype_label: picked.subtype_label,
      category_label: picked.category_label,
      company_name: c.display_name ?? "",
    });
    setPicked(null);
    // Le wizard legacy vit dans une iframe `/stella/Louann.html` — on ouvre la
    // nouvelle route qui héberge cet iframe avec les params préchargés.
    navigate({ to: "/app/studies/new", search: Object.fromEntries(qs) as never });
  }

  return (
    <AppShell>
      <div className="p-6 max-w-6xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Études</h1>
            <p className="text-sm text-muted-foreground">
              Toutes les études auxquelles vous avez accès.
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate({ to: "/app/studies/new", search: {} as never })}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
          >
            <Plus className="h-4 w-4 mr-1" /> Nouvelle étude
          </Button>
        </header>
        {isLoading && <div className="text-muted-foreground">Chargement…</div>}
        {error && (
          <div className="text-destructive text-sm">
            {error instanceof Error ? error.message : "Erreur"}
          </div>
        )}
        {data && data.length === 0 && (
          <div className="text-muted-foreground border border-dashed rounded-md p-8 text-center">
            Aucune étude pour le moment. Cliquez sur « Nouvelle étude » pour commencer.
          </div>
        )}
        {data && data.length > 0 && (
          <div className="border border-border rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Titre</th>
                  <th className="text-left px-3 py-2">Ville</th>
                  <th className="text-left px-3 py-2">Version</th>
                  <th className="text-left px-3 py-2">Statut</th>
                  <th className="text-left px-3 py-2">Créée le</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-border hover:bg-accent/40 cursor-pointer"
                    onClick={() => navigate({ to: "/app/studies/$id", params: { id: s.id } })}
                  >
                    <td className="px-3 py-2">
                      <Link
                        to="/app/studies/$id"
                        params={{ id: s.id }}
                        className="font-medium hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {s.title || "Sans titre"}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {s.city_name || "—"} {s.country_code ? `(${s.country_code})` : ""}
                    </td>
                    <td className="px-3 py-2">v{s.version_number}</td>
                    <td className="px-3 py-2">
                      <GenerationStatusBadge status={s.generation_status} />
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {new Date(s.created_at).toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <StudyCategoryPicker
        open={catOpen}
        onClose={() => setCatOpen(false)}
        onPick={onSubtypePicked}
      />
      <CompanyPicker
        open={picked !== null}
        subtypeLabel={picked?.subtype_label ?? ""}
        onClose={() => setPicked(null)}
        onPick={onCompanyPicked}
      />
    </AppShell>
  );
}