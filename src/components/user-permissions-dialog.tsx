import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  listUserCompanyPermissions,
  setUserCompanyPermissions,
} from "@/lib/permissions.functions";
import { listCompanies } from "@/lib/companies.functions";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: string; email: string | null; full_name: string | null } | null;
};

export function UserPermissionsDialog({ open, onOpenChange, user }: Props) {
  const qc = useQueryClient();
  const fetchPerms = useServerFn(listUserCompanyPermissions);
  const fetchCompanies = useServerFn(listCompanies);
  const savePerms = useServerFn(setUserCompanyPermissions);

  const companiesQ = useQuery({
    queryKey: ["all-companies-for-perms"],
    queryFn: () => fetchCompanies(),
    enabled: open,
  });
  const permsQ = useQuery({
    queryKey: ["user-perms", user?.id],
    queryFn: () => fetchPerms({ data: { user_id: user!.id } }),
    enabled: open && !!user?.id,
  });

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (permsQ.data) {
      setSelected(new Set(permsQ.data.map((p) => p.company_id)));
    }
  }, [permsQ.data]);

  const filtered = useMemo(() => {
    const list = companiesQ.data ?? [];
    const f = filter.trim().toLowerCase();
    if (!f) return list;
    return list.filter(
      (c) =>
        (c.display_name ?? "").toLowerCase().includes(f) ||
        (c.name ?? "").toLowerCase().includes(f),
    );
  }, [companiesQ.data, filter]);

  const mut = useMutation({
    mutationFn: () =>
      savePerms({
        data: { user_id: user!.id, company_ids: Array.from(selected) },
      }),
    onSuccess: () => {
      toast.success("Permissions enregistrées");
      qc.invalidateQueries({ queryKey: ["user-perms", user?.id] });
      onOpenChange(false);
    },
    onError: (e) =>
      toast.error(e instanceof Error ? e.message : "Erreur d'enregistrement"),
  });

  const toggle = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Permissions entreprises</DialogTitle>
          <DialogDescription>
            {user
              ? `Choisissez les entreprises pour lesquelles ${user.full_name || user.email || "cet utilisateur"} peut créer des études.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Rechercher une entreprise…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          <div className="text-xs text-muted-foreground">
            {selected.size} entreprise{selected.size > 1 ? "s" : ""} sélectionnée
            {selected.size > 1 ? "s" : ""}
          </div>
          <div className="border border-border rounded-md max-h-80 overflow-y-auto divide-y">
            {companiesQ.isLoading || permsQ.isLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Chargement…</div>
            ) : filtered.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                Aucune entreprise trouvée.
              </div>
            ) : (
              filtered.map((c) => {
                const isOn = selected.has(c.id);
                return (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={isOn}
                      onCheckedChange={(v) => toggle(c.id, !!v)}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {c.display_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.name}
                      </div>
                    </div>
                  </label>
                );
              })
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}