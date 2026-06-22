-- ============================================================
-- Migration : RBAC company-scoped — Stella / OuiCare
-- Adapté au schéma Lovable Cloud réel (2026-06-22)
-- ============================================================
-- Ordre d'exécution :
--   1. Enum app_role
--   2. Colonne company_id sur user_roles
--   3. Conversion text → enum (admin→owner_global, sinon reader)
--   4. Fonctions security definer
--   5. Policies companies / studies / study_deliverables / user_roles
-- ============================================================

-- ── 1. Enum public.app_role ───────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM (
    'owner_global',
    'admin_filiale',
    'analyst',
    'reader'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── 2. Colonne company_id sur user_roles ─────────────────────
-- NULL = rôle global (owner_global), sinon scoped à une filiale
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

-- ── 3. Conversion user_roles.role : text → app_role ──────────
-- On fait la conversion en douceur : admin → owner_global, reste → reader
ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role
  USING CASE
    WHEN role = 'admin'          THEN 'owner_global'::public.app_role
    WHEN role = 'owner_global'   THEN 'owner_global'::public.app_role
    WHEN role = 'admin_filiale'  THEN 'admin_filiale'::public.app_role
    WHEN role = 'analyst'        THEN 'analyst'::public.app_role
    ELSE 'reader'::public.app_role
  END;

-- ── 4. Fonctions security definer ────────────────────────────

-- 4a. has_role : l'utilisateur a-t-il ce rôle (global ou sur une company) ?
CREATE OR REPLACE FUNCTION public.has_role(_user uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user
      AND role = _role
  );
$$;

-- 4b. is_owner_global : raccourci pratique
CREATE OR REPLACE FUNCTION public.is_owner_global(_user uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user, 'owner_global');
$$;

-- 4c. user_company_ids : toutes les company_ids accessibles par l'utilisateur
--   owner_global → toutes les companies
--   autres → seulement les companies de user_company_permissions + user_roles.company_id
CREATE OR REPLACE FUNCTION public.user_company_ids(_user uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.companies       -- owner_global voit tout
  WHERE public.is_owner_global(_user)

  UNION

  SELECT company_id FROM public.user_company_permissions  -- accès explicite
  WHERE user_id = _user
    AND NOT public.is_owner_global(_user)

  UNION

  SELECT company_id FROM public.user_roles  -- accès via rôle scopé
  WHERE user_id = _user
    AND company_id IS NOT NULL
    AND NOT public.is_owner_global(_user);
$$;

-- ── 5. Policies ───────────────────────────────────────────────

-- ── 5a. companies ─────────────────────────────────────────────
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_select" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
DROP POLICY IF EXISTS "companies_update" ON public.companies;
DROP POLICY IF EXISTS "companies_delete" ON public.companies;

CREATE POLICY "companies_select" ON public.companies
  FOR SELECT TO authenticated
  USING (
    id IN (SELECT public.user_company_ids(auth.uid()))
  );

CREATE POLICY "companies_insert" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (public.is_owner_global(auth.uid()));

CREATE POLICY "companies_update" ON public.companies
  FOR UPDATE TO authenticated
  USING (
    public.is_owner_global(auth.uid())
    OR (
      public.has_role(auth.uid(), 'admin_filiale')
      AND id IN (SELECT public.user_company_ids(auth.uid()))
    )
  );

CREATE POLICY "companies_delete" ON public.companies
  FOR DELETE TO authenticated
  USING (public.is_owner_global(auth.uid()));

-- ── 5b. studies ───────────────────────────────────────────────
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "studies_select" ON public.studies;
DROP POLICY IF EXISTS "studies_insert" ON public.studies;
DROP POLICY IF EXISTS "studies_update" ON public.studies;
DROP POLICY IF EXISTS "studies_delete" ON public.studies;

CREATE POLICY "studies_select" ON public.studies
  FOR SELECT TO authenticated
  USING (
    company_id IN (SELECT public.user_company_ids(auth.uid()))
    OR user_id = auth.uid()
    OR created_by = auth.uid()
  );

CREATE POLICY "studies_insert" ON public.studies
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'owner_global')
    OR public.has_role(auth.uid(), 'admin_filiale')
    OR public.has_role(auth.uid(), 'analyst')
  );

CREATE POLICY "studies_update" ON public.studies
  FOR UPDATE TO authenticated
  USING (
    company_id IN (SELECT public.user_company_ids(auth.uid()))
    OR user_id = auth.uid()
  )
  WITH CHECK (
    NOT public.has_role(auth.uid(), 'reader')
  );

CREATE POLICY "studies_delete" ON public.studies
  FOR DELETE TO authenticated
  USING (
    public.is_owner_global(auth.uid())
    OR (
      public.has_role(auth.uid(), 'admin_filiale')
      AND company_id IN (SELECT public.user_company_ids(auth.uid()))
    )
  );

-- ── 5c. study_deliverables ────────────────────────────────────
ALTER TABLE public.study_deliverables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deliverables_select" ON public.study_deliverables;
DROP POLICY IF EXISTS "deliverables_insert" ON public.study_deliverables;
DROP POLICY IF EXISTS "deliverables_delete" ON public.study_deliverables;

CREATE POLICY "deliverables_select" ON public.study_deliverables
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.id = study_id
        AND (
          s.company_id IN (SELECT public.user_company_ids(auth.uid()))
          OR s.user_id = auth.uid()
        )
    )
  );

CREATE POLICY "deliverables_insert" ON public.study_deliverables
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.studies s
      WHERE s.id = study_id
        AND s.company_id IN (SELECT public.user_company_ids(auth.uid()))
    )
  );

CREATE POLICY "deliverables_delete" ON public.study_deliverables
  FOR DELETE TO authenticated
  USING (public.is_owner_global(auth.uid()));

-- ── 5d. user_roles ────────────────────────────────────────────
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_roles_select_own" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_manage_global" ON public.user_roles;

-- Chacun voit ses propres rôles
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_owner_global(auth.uid()));

-- owner_global gère tous les rôles
CREATE POLICY "user_roles_manage_global" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_owner_global(auth.uid()))
  WITH CHECK (public.is_owner_global(auth.uid()));

-- ── Grants ────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_owner_global TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_company_ids TO authenticated;

-- ── Vérification post-migration ───────────────────────────────
-- SELECT schemaname, tablename, policyname, cmd
-- FROM pg_policies WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
