
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_owner_global(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_company_ids(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_owner_global(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.user_company_ids(uuid) TO authenticated, service_role;
