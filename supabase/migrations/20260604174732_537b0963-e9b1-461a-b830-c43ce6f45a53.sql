CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  actor_type TEXT NOT NULL DEFAULT 'private_company',
  positioning TEXT,
  group_name TEXT,
  short_description TEXT,
  long_description TEXT,
  website_url TEXT,
  internal_notes TEXT,
  default_language TEXT NOT NULL DEFAULT 'fr-FR',
  status TEXT NOT NULL DEFAULT 'active',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT companies_actor_type_check CHECK (actor_type IN ('private_company', 'public_actor', 'association', 'franchise_network', 'integrated_network', 'local_independent', 'platform_intermediary')),
  CONSTRAINT companies_positioning_check CHECK (positioning IS NULL OR positioning IN ('generalist', 'specialist', 'premium', 'proximity', 'network_volume')),
  CONSTRAINT companies_status_check CHECK (status IN ('active', 'archived'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.user_company_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_company_permissions_unique UNIQUE (user_id, company_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_company_permissions TO authenticated;
GRANT ALL ON public.user_company_permissions TO service_role;
ALTER TABLE public.user_company_permissions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.company_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  primary_color TEXT NOT NULL DEFAULT '#1E3A8A',
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT,
  text_color TEXT,
  brand_style TEXT,
  logo_primary_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT company_branding_company_unique UNIQUE (company_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_branding TO authenticated;
GRANT ALL ON public.company_branding TO service_role;
ALTER TABLE public.company_branding ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.company_activity_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  activity_code TEXT NOT NULL,
  activity_label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT company_activity_families_unique UNIQUE (company_id, activity_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_activity_families TO authenticated;
GRANT ALL ON public.company_activity_families TO service_role;
ALTER TABLE public.company_activity_families ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.company_target_publics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  public_code TEXT NOT NULL,
  public_label TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT company_target_publics_unique UNIQUE (company_id, public_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_target_publics TO authenticated;
GRANT ALL ON public.company_target_publics TO service_role;
ALTER TABLE public.company_target_publics ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Admins can manage companies'
  ) THEN
    CREATE POLICY "Admins can manage companies"
    ON public.companies
    FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'Users can read allowed companies'
  ) THEN
    CREATE POLICY "Users can read allowed companies"
    ON public.companies
    FOR SELECT
    TO authenticated
    USING (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.user_company_permissions ucp
        WHERE ucp.company_id = companies.id
          AND ucp.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_company_permissions' AND policyname = 'Admins can manage user company permissions'
  ) THEN
    CREATE POLICY "Admins can manage user company permissions"
    ON public.user_company_permissions
    FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_company_permissions' AND policyname = 'Users can read own company permissions'
  ) THEN
    CREATE POLICY "Users can read own company permissions"
    ON public.user_company_permissions
    FOR SELECT
    TO authenticated
    USING (public.is_admin(auth.uid()) OR auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_branding' AND policyname = 'Admins can manage company branding'
  ) THEN
    CREATE POLICY "Admins can manage company branding"
    ON public.company_branding
    FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_branding' AND policyname = 'Users can read branding for allowed companies'
  ) THEN
    CREATE POLICY "Users can read branding for allowed companies"
    ON public.company_branding
    FOR SELECT
    TO authenticated
    USING (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.user_company_permissions ucp
        WHERE ucp.company_id = company_branding.company_id
          AND ucp.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_activity_families' AND policyname = 'Admins can manage company activity families'
  ) THEN
    CREATE POLICY "Admins can manage company activity families"
    ON public.company_activity_families
    FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_activity_families' AND policyname = 'Users can read activities for allowed companies'
  ) THEN
    CREATE POLICY "Users can read activities for allowed companies"
    ON public.company_activity_families
    FOR SELECT
    TO authenticated
    USING (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.user_company_permissions ucp
        WHERE ucp.company_id = company_activity_families.company_id
          AND ucp.user_id = auth.uid()
      )
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_target_publics' AND policyname = 'Admins can manage company target publics'
  ) THEN
    CREATE POLICY "Admins can manage company target publics"
    ON public.company_target_publics
    FOR ALL
    TO authenticated
    USING (public.is_admin(auth.uid()))
    WITH CHECK (public.is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_target_publics' AND policyname = 'Users can read target publics for allowed companies'
  ) THEN
    CREATE POLICY "Users can read target publics for allowed companies"
    ON public.company_target_publics
    FOR SELECT
    TO authenticated
    USING (
      public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1
        FROM public.user_company_permissions ucp
        WHERE ucp.company_id = company_target_publics.company_id
          AND ucp.user_id = auth.uid()
      )
    );
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_companies_updated_at ON public.companies;
CREATE TRIGGER update_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_company_branding_updated_at ON public.company_branding;
CREATE TRIGGER update_company_branding_updated_at
BEFORE UPDATE ON public.company_branding
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_company_activity_families_updated_at ON public.company_activity_families;
CREATE TRIGGER update_company_activity_families_updated_at
BEFORE UPDATE ON public.company_activity_families
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_company_target_publics_updated_at ON public.company_target_publics;
CREATE TRIGGER update_company_target_publics_updated_at
BEFORE UPDATE ON public.company_target_publics
FOR EACH ROW
EXECUTE FUNCTION public.touch_updated_at();