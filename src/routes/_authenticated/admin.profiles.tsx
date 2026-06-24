import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProfiles, updateProfileRole, getCurrentProfile } from "@/lib/profiles.functions";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPermissionsDialog } from "@/components/user-permissions-dialog";

export const Route = createFileRoute("/_authenticated/admin/profiles")({
  head: () => ({ meta: [{ title: "Profils — Stella Admin" }] }),
  component: AdminProfilesPage,
});

function AdminProfilesPage() {
  const qc = useQueryClient();
  const fetchProfiles = useServerFn(listProfiles);
  const fetchMe = useServerFn(getCurrentProfile);
  const updateRole = useServerFn(updateProfileRole);
  const [permsTarget, setPermsTarget] = useState<{
    id: string;
    email: string | null;
    full_name: string | null;
  } | null>(null);

  const meQ = useQuery({ queryKey: ["current-profile"], queryFn: () => fetchMe() });
  const profilesQ = useQuery({
    queryKey: ["profiles"],
    queryFn: () => fetchProfiles(),
    enabled: meQ.data?.role === "admin",
  });

  const mut = useMutation({
    mutationFn: (v: { profile_id: string; role: "admin" | "consultant" | "viewer" }) =>
      updateRole({ data: v }),
    onSuccess: () => {
      toast.success("Rôle mis à jour");
      qc.invalidateQueries({ queryKey: ["profiles"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Erreur"),
  });

  if (meQ.isLoading) return <div className="p-6">Chargement…</div>;
  if (meQ.data && meQ.data.role !== "admin") {
    throw redirect({ to: "/app/studies" });
  }

  return (
    <>
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-semibold mb-1">Profils & rôles</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Gérer les rôles des utilisateurs.
        </p>
        <div className="border border-border rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Nom</th>
                <th className="text-left px-3 py-2">Rôle</th>
                <th className="text-left px-3 py-2">Entreprises autorisées</th>
                <th className="text-left px-3 py-2">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {profilesQ.data?.map((p) => (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">{p.email}</td>
                  <td className="px-3 py-2">{p.full_name || "—"}</td>
                  <td className="px-3 py-2">
                    <select
                      className="border border-input rounded px-2 py-1 bg-background"
                      value={p.role}
                      onChange={(e) =>
                        mut.mutate({
                          profile_id: p.id,
                          role: e.target.value as "admin" | "consultant" | "viewer",
                        })
                      }
                    >
                      <option value="admin">admin</option>
                      <option value="consultant">consultant</option>
                      <option value="viewer">viewer</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    {p.role === "admin" ? (
                      <span className="text-xs text-muted-foreground italic">
                        Toutes (admin)
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setPermsTarget({
                            id: p.id,
                            email: p.email,
                            full_name: p.full_name,
                          })
                        }
                      >
                        Gérer
                      </Button>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(p.created_at).toLocaleString("fr-FR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <UserPermissionsDialog
        open={!!permsTarget}
        onOpenChange={(o) => !o && setPermsTarget(null)}
        user={permsTarget}
      />
    </>
  );
}