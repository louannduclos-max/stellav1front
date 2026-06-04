import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { listStudyCategories, listStudySubtypes } from "@/lib/study-types.functions";
import { Star } from "lucide-react";

export type PickedSubtype = {
  category_code: string;
  subtype_code: string;
  subtype_label: string;
  category_label: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (s: PickedSubtype) => void;
}

export function StudyCategoryPicker({ open, onClose, onPick }: Props) {
  const fetchCats = useServerFn(listStudyCategories);
  const fetchSubs = useServerFn(listStudySubtypes);
  const cats = useQuery({ queryKey: ["study-cats"], queryFn: () => fetchCats(), enabled: open });
  const subs = useQuery({ queryKey: ["study-subs"], queryFn: () => fetchSubs(), enabled: open });

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouvelle étude — quel type ?</DialogTitle>
          <DialogDescription>
            Choisissez la famille d'étude. Le moteur génère ensuite un plan dynamique selon vos choix (KPI, cibles, zones…).
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
          {(cats.isLoading || subs.isLoading) && (
            <div className="text-sm text-muted-foreground col-span-3">Chargement…</div>
          )}
          {cats.data?.map((c) => {
            const sub = subs.data?.find((s) => s.category_code === c.code);
            const recommended = sub?.is_recommended ?? false;
            return (
              <button
                key={c.code}
                disabled={!sub}
                onClick={() =>
                  sub &&
                  onPick({
                    category_code: c.code,
                    subtype_code: sub.code,
                    subtype_label: sub.display_name,
                    category_label: c.display_name,
                  })
                }
                className="text-left rounded-xl border border-border p-4 hover:border-primary hover:shadow-md transition bg-card relative disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {recommended && (
                  <span className="absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3" /> Recommandé
                  </span>
                )}
                <div className="text-2xl mb-2">{c.icon_emoji}</div>
                <div className="font-semibold mb-1 pr-20">{c.display_name}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}