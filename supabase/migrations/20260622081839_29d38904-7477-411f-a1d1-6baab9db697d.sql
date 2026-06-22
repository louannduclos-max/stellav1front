
-- 1. user_roles : ajout company_id + conversion role text -> enum
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE;

ALTER TABLE public.user_roles ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.user_roles
  ALTER COLUMN role TYPE public.app_role
  USING (
    CASE lower(role::text)
      WHEN 'admin'         THEN 'owner_global'::public.app_role
      WHEN 'owner_global'  THEN 'owner_global'::public.app_role
      WHEN 'admin_filiale' THEN 'admin_filiale'::public.app_role
      WHEN 'analyst'       THEN 'analyst'::public.app_role
      WHEN 'reader'        THEN 'reader'::public.app_role
      ELSE 'reader'::public.app_role
    END
  );

DO $$ BEGIN
  ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_role_company_unique UNIQUE (user_id, role, company_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- 2. Fonctions security definer
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_owner_global(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'owner_global')
$$;

CREATE OR REPLACE FUNCTION public.user_company_ids(_user_id uuid)
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.user_roles
  WHERE user_id = _user_id AND company_id IS NOT NULL
$$;

-- 3. companies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Users can read allowed companies" ON public.companies;

CREATE POLICY "owner_global manages companies" ON public.companies
  FOR ALL TO authenticated
  USING (public.is_owner_global(auth.uid()))
  WITH CHECK (public.is_owner_global(auth.uid()));

CREATE POLICY "admin_filiale manages own companies" ON public.companies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin_filiale') AND id IN (SELECT public.user_company_ids(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(),'admin_filiale') AND id IN (SELECT public.user_company_ids(auth.uid())));

CREATE POLICY "scoped users read companies" ON public.companies
  FOR SELECT TO authenticated
  USING (public.is_owner_global(auth.uid()) OR id IN (SELECT public.user_company_ids(auth.uid())));

-- 4. studies
DROP POLICY IF EXISTS "Admins delete studies" ON public.studies;
DROP POLICY IF EXISTS "Users create own studies" ON public.studies;
DROP POLICY IF EXISTS "Users read own studies" ON public.studies;
DROP POLICY IF EXISTS "Users update own studies" ON public.studies;

CREATE POLICY "owner_global all studies" ON public.studies
  FOR ALL TO authenticated
  USING (public.is_owner_global(auth.uid()))
  WITH CHECK (public.is_owner_global(auth.uid()));

CREATE POLICY "admin_filiale crud company studies" ON public.studies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin_filiale') AND company_id IN (SELECT public.user_company_ids(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(),'admin_filiale') AND company_id IN (SELECT public.user_company_ids(auth.uid())));

CREATE POLICY "analyst read company studies" ON public.studies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'analyst') AND company_id IN (SELECT public.user_company_ids(auth.uid())));

CREATE POLICY "analyst insert company studies" ON public.studies
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'analyst') AND company_id IN (SELECT public.user_company_ids(auth.uid())));

CREATE POLICY "analyst update company studies" ON public.studies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'analyst') AND company_id IN (SELECT public.user_company_ids(auth.uid())))
  WITH CHECK (public.has_role(auth.uid(),'analyst') AND company_id IN (SELECT public.user_company_ids(auth.uid())));

CREATE POLICY "reader read company studies" ON public.studies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'reader') AND company_id IN (SELECT public.user_company_ids(auth.uid())));

-- 5. study_deliverables
DROP POLICY IF EXISTS "Admins manage deliverables" ON public.study_deliverables;
DROP POLICY IF EXISTS "Users read allowed deliverables" ON public.study_deliverables;

CREATE POLICY "owner_global all deliverables" ON public.study_deliverables
  FOR ALL TO authenticated
  USING (public.is_owner_global(auth.uid()))
  WITH CHECK (public.is_owner_global(auth.uid()));

CREATE POLICY "company-scoped read deliverables" ON public.study_deliverables
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.studies s
    WHERE s.id = study_deliverables.study_id
      AND s.company_id IN (SELECT public.user_company_ids(auth.uid()))
  ));

CREATE POLICY "admin_filiale write deliverables" ON public.study_deliverables
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(),'admin_filiale')
    AND EXISTS (SELECT 1 FROM public.studies s WHERE s.id = study_deliverables.study_id AND s.company_id IN (SELECT public.user_company_ids(auth.uid())))
  )
  WITH CHECK (
    public.has_role(auth.uid(),'admin_filiale')
    AND EXISTS (SELECT 1 FROM public.studies s WHERE s.id = study_deliverables.study_id AND s.company_id IN (SELECT public.user_company_ids(auth.uid())))
  );

-- 6. user_roles : owner_global gère
CREATE POLICY "owner_global manages user_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_owner_global(auth.uid()))
  WITH CHECK (public.is_owner_global(auth.uid()));

-- 7. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_deliverables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.studies TO service_role;
GRANT ALL ON public.study_deliverables TO service_role;
GRANT ALL ON public.user_roles TO service_role;
