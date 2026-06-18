
-- 1) company_study_presets: scope SELECT to admins or users with company permission
DROP POLICY IF EXISTS "Authenticated read company presets" ON public.company_study_presets;
CREATE POLICY "Read company presets with permission"
ON public.company_study_presets
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.user_company_permissions ucp
    WHERE ucp.user_id = auth.uid()
      AND ucp.company_id = company_study_presets.company_id
  )
);

-- 2) internal_crm_logs: restrict SELECT to admins and consultants
DROP POLICY IF EXISTS "Authenticated read crm logs" ON public.internal_crm_logs;
CREATE POLICY "Staff read crm logs"
ON public.internal_crm_logs
FOR SELECT
TO authenticated
USING (
  private.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.role = 'consultant'
  )
);

-- 3) profiles: prevent self role escalation
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role IS NOT DISTINCT FROM (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
);
