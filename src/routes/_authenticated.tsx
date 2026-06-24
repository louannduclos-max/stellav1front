import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useRouter } from "@tanstack/react-router";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Skip auth check during SSR — supabase session lives in browser localStorage
    // and is not available server-side. The component-level guard below handles
    // the redirect on the client.
    if (typeof window === "undefined") return;
    const { data } = await supabaseBrowser.auth.getSession();
    if (!data.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const router = useRouter();
  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        router.navigate({
          to: "/login",
          search: { redirect: window.location.pathname + window.location.search },
        });
      }
    });
    return () => {
      mounted = false;
    };
  }, [router]);
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}