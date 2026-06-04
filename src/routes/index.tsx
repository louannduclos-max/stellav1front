import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LogIn, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  // null = not yet resolved → don't render the button to avoid flicker
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [landingTo, setLandingTo] = useState<"/admin/dashboard" | "/app/studies">("/app/studies");

  useEffect(() => {
    const onMessage = (event: MessageEvent<{ type?: string; path?: string }>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "stella:navigate") return;
      if (event.data.path !== "/app/studies/new") return;
      navigate({ to: "/app/studies/new" });
    };

    window.addEventListener("message", onMessage);

    return () => window.removeEventListener("message", onMessage);
  }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const resolve = async (session: import("@supabase/supabase-js").Session | null) => {
      if (!mounted) return;
      if (!session) {
        setIsAuthed(false);
        setLandingTo("/app/studies");
        return;
      }
      const { data: profile } = await supabaseBrowser
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      if (!mounted) return;
      setLandingTo(profile?.role === "admin" ? "/admin/dashboard" : "/app/studies");
      setIsAuthed(true);
    };

    supabaseBrowser.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
      resolve(session);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <iframe
        src="/stella/Louann.html"
        title="Stella"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          border: 0,
        }}
      />
      {isAuthed === null ? null : (
        <Link
          to={isAuthed ? landingTo : "/login"}
          className="louann-account-btn"
          data-authed={isAuthed ? "true" : "false"}
        >
          {isAuthed ? (
            <>
              <span className="louann-account-dot" aria-hidden />
              <UserCheck className="h-4 w-4" />
              <span>Mon espace</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Mon espace</span>
            </>
          )}
        </Link>
      )}
      <style>{`
        .louann-account-btn {
          position: fixed;
          top: 12px;
          right: 24px;
          z-index: 50;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 44px;
          padding: 0 22px;
          border-radius: 999px;
          font-family: 'Outfit', system-ui, -apple-system, 'Segoe UI', sans-serif;
          font-size: 14.5px;
          font-weight: 700;
          letter-spacing: 0.01em;
          text-decoration: none;
          color: #fff;
          background: linear-gradient(135deg, #16a34a, #15803d);
          border: 1.5px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 2px 4px rgba(21, 128, 61, 0.25), 0 10px 28px rgba(22, 163, 74, 0.4);
          transition: all 0.18s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .louann-account-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(21, 128, 61, 0.3), 0 14px 32px rgba(22, 163, 74, 0.5);
        }
        .louann-account-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </>
  );
}
