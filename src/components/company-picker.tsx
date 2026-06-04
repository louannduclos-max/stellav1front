import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { listCompanies } from "@/lib/companies.functions";
import { Building2, Plus } from "lucide-react";

export type PickedCompany = {
  company_id: string;
  display_name: string;
};

interface Props {
  open: boolean;
  subtypeLabel: string;
  onClose: () => void;
  onPick: (c: PickedCompany) => void;
}

export function CompanyPicker({ open, subtypeLabel, onClose, onPick }: Props) {
  const fetchCompanies = useServerFn(listCompanies);
  const q = useQuery({ queryKey: ["companies-picker"], queryFn: () => fetchCompanies(), enabled: open });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pour quelle marque ?</DialogTitle>
          <DialogDescription>
            Étude sélectionnée : <span className="font-medium text-foreground">{subtypeLabel}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {q.isLoading && <div className="text-sm text-muted-foreground col-span-3">Chargement…</div>}
          {q.data?.map((c) => (
            <button
              key={c.id}
              onClick={() => onPick({ company_id: c.id, display_name: c.display_name })}
              className="text-left rounded-xl border border-border p-4 hover:border-primary hover:shadow-md transition bg-card flex items-start gap-3"
            >
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold truncate">{c.display_name}</div>
                {c.short_description && (
                  <div className="text-xs text-muted-foreground line-clamp-2">{c.short_description}</div>
                )}
                {c.positioning && (
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {c.positioning}
                  </div>
                )}
              </div>
            </button>
          ))}

          <Link
            to="/admin/companies"
            className="rounded-xl border-2 border-dashed border-border p-4 hover:border-primary hover:bg-accent/40 transition flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Créer une nouvelle marque</span>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}