import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type StudyRow = {
  id: string;
  title: string | null;
  generation_status: string;
  generation_started_at: string | null;
  generation_completed_at: string | null;
  company_id: string | null;
  study_type: string | null;
  created_at: string;
  created_by: string | null;
};

function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const getAdminDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;

    const [{ data: studies }, { data: companies }, { data: crm }] = await Promise.all([
      supabase
        .from("studies")
        .select(
          "id, title, generation_status, generation_started_at, generation_completed_at, company_id, study_type, created_at, created_by",
        )
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase.from("companies").select("id, display_name"),
      supabase
        .from("internal_crm_logs")
        .select("id, category, status, created_at, resolved_at, title")
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const rows = (studies ?? []) as StudyRow[];
    const companyMap = new Map((companies ?? []).map((c) => [c.id, c.display_name]));

    // Charger les profils des auteurs (rôle + nom) pour les études récentes
    const authorIds = Array.from(
      new Set(rows.map((r) => r.created_by).filter(Boolean)),
    ) as string[];
    const { data: authors } = authorIds.length
      ? await supabase
          .from("profiles")
          .select("id, full_name, email, role")
          .in("id", authorIds)
      : { data: [] as Array<{ id: string; full_name: string | null; email: string | null; role: string | null }> };
    const authorMap = new Map(
      (authors ?? []).map((p) => [
        p.id,
        {
          name: p.full_name || p.email || "—",
          isAdmin: p.role === "admin",
        },
      ]),
    );

    const total = rows.length;
    const done = rows.filter((r) => r.generation_status === "done").length;
    const processing = rows.filter((r) => r.generation_status === "processing").length;
    const error = rows.filter((r) => r.generation_status === "error").length;
    const pending = rows.filter((r) => r.generation_status === "pending").length;

    const durations = rows
      .filter((r) => r.generation_started_at && r.generation_completed_at)
      .map(
        (r) =>
          (new Date(r.generation_completed_at!).getTime() -
            new Date(r.generation_started_at!).getTime()) /
          1000,
      );
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;
    const medDuration = Math.round(median(durations));
    const successRate = total ? Math.round((done / total) * 100) : 0;

    const byStatus = [
      { name: "Terminées", value: done },
      { name: "En cours", value: processing },
      { name: "En attente", value: pending },
      { name: "Erreur", value: error },
    ];

    const byCompanyMap = new Map<string, number>();
    for (const r of rows) {
      const name = companyMap.get(r.company_id ?? "") || "Sans entreprise";
      byCompanyMap.set(name, (byCompanyMap.get(name) ?? 0) + 1);
    }
    const byCompany = Array.from(byCompanyMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    const byTypeMap = new Map<string, number>();
    for (const r of rows) {
      const t = r.study_type || "Non défini";
      byTypeMap.set(t, (byTypeMap.get(t) ?? 0) + 1);
    }
    const byType = Array.from(byTypeMap.entries()).map(([name, value]) => ({ name, value }));

    // 30-day volume
    const now = new Date();
    const days: { date: string; value: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, value: 0 });
    }
    const idx = new Map(days.map((d, i) => [d.date, i]));
    for (const r of rows) {
      const k = r.created_at.slice(0, 10);
      const i = idx.get(k);
      if (i !== undefined) days[i].value += 1;
    }

    const recent = rows.slice(0, 10).map((r) => ({
      id: r.id,
      title: r.title,
      generation_status: r.generation_status,
      company: companyMap.get(r.company_id ?? "") || "—",
      created_at: r.created_at,
      completed_at: r.generation_completed_at,
      author: r.created_by ? authorMap.get(r.created_by)?.name ?? "—" : "—",
      author_is_admin: r.created_by ? !!authorMap.get(r.created_by)?.isAdmin : false,
    }));

    const blocked = rows
      .filter((r) => r.generation_status === "error" || r.generation_status === "processing")
      .slice(0, 10)
      .map((r) => ({
        id: r.id,
        title: r.title,
        generation_status: r.generation_status,
        company: companyMap.get(r.company_id ?? "") || "—",
        started_at: r.generation_started_at,
        author: r.created_by ? authorMap.get(r.created_by)?.name ?? "—" : "—",
        author_is_admin: r.created_by ? !!authorMap.get(r.created_by)?.isAdmin : false,
      }));

    // CRM KPIs
    const crmRows = crm ?? [];
    const crmOpen = crmRows.filter((c) => c.status === "ouvert" || c.status === "en_cours").length;
    const crmResolved = crmRows.filter((c) => c.status === "resolu").length;
    const resolutionDurations = crmRows
      .filter((c) => c.resolved_at)
      .map((c) => (new Date(c.resolved_at!).getTime() - new Date(c.created_at).getTime()) / 1000);
    const crmAvgResolution = resolutionDurations.length
      ? Math.round(resolutionDurations.reduce((a, b) => a + b, 0) / resolutionDurations.length)
      : 0;

    const crmByCategoryMap = new Map<string, number>();
    for (const c of crmRows) {
      crmByCategoryMap.set(c.category, (crmByCategoryMap.get(c.category) ?? 0) + 1);
    }
    const crmByCategory = Array.from(crmByCategoryMap.entries()).map(([name, value]) => ({
      name,
      value,
    }));

    const topPositive = crmRows
      .filter((c) => c.category === "fonctionne_bien")
      .slice(0, 5)
      .map((c) => ({ id: c.id, title: c.title }));
    const topNegative = crmRows
      .filter((c) => c.category === "ne_fonctionne_pas" || c.category === "probleme")
      .slice(0, 5)
      .map((c) => ({ id: c.id, title: c.title }));

    return {
      kpis: {
        total,
        done,
        processing,
        error,
        pending,
        avgDuration,
        medDuration,
        successRate,
      },
      charts: { byStatus, byCompany, byType, days },
      recent,
      blocked,
      crm: {
        open: crmOpen,
        resolved: crmResolved,
        avgResolution: crmAvgResolution,
        byCategory: crmByCategory,
        topPositive,
        topNegative,
      },
    };
  });