DROP POLICY IF EXISTS "scoped users read companies" ON public.companies;
CREATE POLICY "scoped users read companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    is_owner_global(auth.uid())
    OR id IN (SELECT user_company_ids(auth.uid()))
    OR id IN (SELECT company_id FROM public.user_company_permissions WHERE user_id = auth.uid())
  );