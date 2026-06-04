CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT USAGE ON SCHEMA private TO service_role;

CREATE OR REPLACE FUNCTION private.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id AND role = 'admin'
  )
$$;

REVOKE ALL ON FUNCTION private.is_admin(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION private.is_admin(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM authenticated;

DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
CREATE POLICY "Admins read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
CREATE POLICY "Admins update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
CREATE POLICY "Admins can manage companies"
ON public.companies
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read allowed companies" ON public.companies;
CREATE POLICY "Users can read allowed companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.user_company_permissions ucp
    WHERE ucp.company_id = companies.id
      AND ucp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage user company permissions" ON public.user_company_permissions;
CREATE POLICY "Admins can manage user company permissions"
ON public.user_company_permissions
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read own company permissions" ON public.user_company_permissions;
CREATE POLICY "Users can read own company permissions"
ON public.user_company_permissions
FOR SELECT
TO authenticated
USING (private.is_admin(auth.uid()) OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage company branding" ON public.company_branding;
CREATE POLICY "Admins can manage company branding"
ON public.company_branding
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read branding for allowed companies" ON public.company_branding;
CREATE POLICY "Users can read branding for allowed companies"
ON public.company_branding
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.user_company_permissions ucp
    WHERE ucp.company_id = company_branding.company_id
      AND ucp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage company activity families" ON public.company_activity_families;
CREATE POLICY "Admins can manage company activity families"
ON public.company_activity_families
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read activities for allowed companies" ON public.company_activity_families;
CREATE POLICY "Users can read activities for allowed companies"
ON public.company_activity_families
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.user_company_permissions ucp
    WHERE ucp.company_id = company_activity_families.company_id
      AND ucp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins can manage company target publics" ON public.company_target_publics;
CREATE POLICY "Admins can manage company target publics"
ON public.company_target_publics
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can read target publics for allowed companies" ON public.company_target_publics;
CREATE POLICY "Users can read target publics for allowed companies"
ON public.company_target_publics
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.user_company_permissions ucp
    WHERE ucp.company_id = company_target_publics.company_id
      AND ucp.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage study categories" ON public.study_categories_master;
CREATE POLICY "Admins manage study categories"
ON public.study_categories_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage study subtypes" ON public.study_subtypes_master;
CREATE POLICY "Admins manage study subtypes"
ON public.study_subtypes_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage sap activities" ON public.sap_activities_master;
CREATE POLICY "Admins manage sap activities"
ON public.sap_activities_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage target publics" ON public.target_publics_master;
CREATE POLICY "Admins manage target publics"
ON public.target_publics_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage territory modes" ON public.territory_modes_master;
CREATE POLICY "Admins manage territory modes"
ON public.territory_modes_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage service modes" ON public.service_modes_master;
CREATE POLICY "Admins manage service modes"
ON public.service_modes_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage study types" ON public.study_types_master;
CREATE POLICY "Admins manage study types"
ON public.study_types_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage zone focus" ON public.zone_focus_master;
CREATE POLICY "Admins manage zone focus"
ON public.zone_focus_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage commune types" ON public.commune_types_master;
CREATE POLICY "Admins manage commune types"
ON public.commune_types_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage kpis" ON public.kpi_master;
CREATE POLICY "Admins manage kpis"
ON public.kpi_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage risks" ON public.risks_master;
CREATE POLICY "Admins manage risks"
ON public.risks_master
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage company presets" ON public.company_study_presets;
CREATE POLICY "Admins manage company presets"
ON public.company_study_presets
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read own studies" ON public.studies;
CREATE POLICY "Users read own studies"
ON public.studies
FOR SELECT
TO authenticated
USING (private.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users create own studies" ON public.studies;
CREATE POLICY "Users create own studies"
ON public.studies
FOR INSERT
TO authenticated
WITH CHECK (private.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Users update own studies" ON public.studies;
CREATE POLICY "Users update own studies"
ON public.studies
FOR UPDATE
TO authenticated
USING (private.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by)
WITH CHECK (private.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Admins delete studies" ON public.studies;
CREATE POLICY "Admins delete studies"
ON public.studies
FOR DELETE
TO authenticated
USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins manage deliverables" ON public.study_deliverables;
CREATE POLICY "Admins manage deliverables"
ON public.study_deliverables
FOR ALL
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read allowed deliverables" ON public.study_deliverables;
CREATE POLICY "Users read allowed deliverables"
ON public.study_deliverables
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.studies s
    WHERE s.id = study_deliverables.study_id
      AND (s.user_id = auth.uid() OR s.created_by = auth.uid())
  )
);

DROP POLICY IF EXISTS "Authenticated create crm logs" ON public.internal_crm_logs;
CREATE POLICY "Authenticated create crm logs"
ON public.internal_crm_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by OR private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins update crm logs" ON public.internal_crm_logs;
CREATE POLICY "Admins update crm logs"
ON public.internal_crm_logs
FOR UPDATE
TO authenticated
USING (private.is_admin(auth.uid()))
WITH CHECK (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins delete crm logs" ON public.internal_crm_logs;
CREATE POLICY "Admins delete crm logs"
ON public.internal_crm_logs
FOR DELETE
TO authenticated
USING (private.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read deliverable files" ON storage.objects;
CREATE POLICY "Users read deliverable files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables'
  AND (
    private.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.study_deliverables sd
      JOIN public.studies s ON s.id = sd.study_id
      WHERE sd.file_url = storage.objects.name
        AND (s.user_id = auth.uid() OR s.created_by = auth.uid())
    )
  )
);