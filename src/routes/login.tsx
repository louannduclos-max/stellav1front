import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createLovableAuth } from "@lovable.dev/cloud-auth-js";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const lovableAuth = createLovableAuth();

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Connexion — Stella" }] }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

async function landingForCurrentUser(): Promise<"/admin/dashboard" | "/app/studies"> {
  const { data: userData } = await supabaseBrowser.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) return "/app/studies";
  const { data: profile } = await supabaseBrowser
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return profile?.role === "admin" ? "/admin/dashboard" : "/app/studies";
}

function LoginPage() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const safeRedirect = (path: string | undefined): string | undefined => {
    if (!path) return undefined;
    // Only allow same-origin internal paths
    if (!path.startsWith("/") || path.startsWith("//")) return undefined;
    return path;
  };
  const goAfterLogin = async () => {
    const target = safeRedirect(redirectTo);
    if (target) {
      navigate({ to: target, replace: true });
      return;
    }
    const to = await landingForCurrentUser();
    navigate({ to, replace: true });
  };
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("stella:last-email") : null;
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      if (data.session) {
        if (!mounted) return;
        await goAfterLogin();
      } else {
        setSessionChecked(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate, redirectTo]);

  if (!sessionChecked) {
    return <div className="min-h-screen bg-background" />;
  }

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabaseBrowser.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/app/studies",
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifiez votre boîte mail pour confirmer.");
      } else {
        if (typeof window !== "undefined") localStorage.setItem("stella:last-email", email);
        const { error } = await supabaseBrowser.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await goAfterLogin();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      const result = await lovableAuth.signInWithOAuth("google", {
        redirect_uri: window.location.origin + "/login" + window.location.search,
      });
      if (!result.redirected && result.tokens) {
        const { error } = await supabaseBrowser.auth.setSession(result.tokens);
        if (error) throw error;
      }
      if (result.error) throw result.error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur Google");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Stella — Espace consultant</CardTitle>
          <CardDescription>
            {mode === "signin" ? "Connectez-vous à votre compte" : "Créer un compte"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full" onClick={handleGoogle} disabled={loading}>
            Continuer avec Google
          </Button>
          <div className="relative text-center text-xs text-muted-foreground">
            <span className="bg-background px-2 relative z-10">ou</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          </div>
          <form onSubmit={handleEmail} className="space-y-3" autoComplete="on">
            {mode === "signup" && (
              <div>
                <Label>Nom complet</Label>
                <Input name="name" autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
            )}
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input
                type="password"
                name="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "signin" ? "Se connecter" : "Créer le compte"}
            </Button>
          </form>
          <button
            type="button"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="w-full text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Pas encore de compte ? Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}