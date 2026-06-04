import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCurrentProfile } from "@/lib/profiles.functions";
import { signOut } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Users,
  Database,
  LogOut,
  Home,
  Building2,
  LayoutDashboard,
  MessageSquare,
  Settings2,
} from "lucide-react";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const fetchProfile = useServerFn(getCurrentProfile);
  const { data: profile } = useQuery({
    queryKey: ["current-profile"],
    queryFn: () => fetchProfile(),
  });

  const handleLogout = async () => {
    await signOut();
    router.invalidate();
    router.navigate({ to: "/login" });
  };

  const isAdmin = profile?.role === "admin";
  const isStaff = profile?.role === "admin" || profile?.role === "consultant";

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-60 border-r border-border bg-card flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/app/studies" className="font-semibold text-lg">
            Stella
          </Link>
          <div className="text-xs text-muted-foreground mt-1">
            {profile?.full_name || profile?.email}
            <span className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] uppercase">
              {profile?.role}
            </span>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1 text-sm">
          {isAdmin && (
            <NavItem to="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
              Dashboard
            </NavItem>
          )}
          <NavItem to="/app/studies" icon={<FileText className="h-4 w-4" />}>
            Études
          </NavItem>
          {isStaff && (
            <NavItem to="/admin/crm" icon={<MessageSquare className="h-4 w-4" />}>
              CRM interne
            </NavItem>
          )}
          {isAdmin && (
            <>
              <div className="mt-4 px-3 text-xs uppercase text-muted-foreground">Admin</div>
              <NavItem to="/admin/studies" icon={<FileText className="h-4 w-4" />}>
                Toutes les études
              </NavItem>
              <NavItem to="/admin/companies" icon={<Building2 className="h-4 w-4" />}>
                Marques
              </NavItem>
              <NavItem to="/admin/profiles" icon={<Users className="h-4 w-4" />}>
                Profils & rôles
              </NavItem>
              <NavItem to="/admin/masters" icon={<Database className="h-4 w-4" />}>
                Tables référentielles
              </NavItem>
              <NavItem to="/admin/presets" icon={<Settings2 className="h-4 w-4" />}>
                Presets d'étude
              </NavItem>
            </>
          )}
          <div className="mt-4 px-3 text-xs uppercase text-muted-foreground">Public</div>
          <a
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Landing Stella
          </a>
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}

function NavItem({
  to,
  icon,
  children,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent"
      activeProps={{ className: "flex items-center gap-2 px-3 py-2 rounded-md bg-accent" }}
    >
      {icon}
      {children}
    </Link>
  );
}

export function GenerationStatusBadge({
  status,
  errorMessage,
}: {
  status: string | null | undefined;
  errorMessage?: string | null;
}) {
  const map: Record<string, { label: string; cls: string; animate?: boolean }> = {
    draft: { label: "Brouillon", cls: "bg-muted text-muted-foreground" },
    pending: { label: "En attente", cls: "bg-muted text-muted-foreground", animate: true },
    processing: { label: "Génération…", cls: "bg-blue-500/15 text-blue-700 dark:text-blue-300", animate: true },
    completed: { label: "Prête", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    done: { label: "Prête", cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
    failed: { label: "Échec", cls: "bg-destructive/15 text-destructive" },
    error: { label: "Échec", cls: "bg-destructive/15 text-destructive" },
    cancelled: { label: "Annulée", cls: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  };
  const key = status ?? "draft";
  const v = map[key] ?? map.draft;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${v.cls} ${v.animate ? "animate-pulse" : ""}`}
      title={key === "failed" || key === "error" ? errorMessage ?? undefined : undefined}
    >
      {v.label}
    </span>
  );
}