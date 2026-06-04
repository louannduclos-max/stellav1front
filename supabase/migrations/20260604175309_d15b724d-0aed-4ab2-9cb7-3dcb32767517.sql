DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'app_role' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.study_categories_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_categories_master TO authenticated;
GRANT ALL ON public.study_categories_master TO service_role;
ALTER TABLE public.study_categories_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read study categories" ON public.study_categories_master;
CREATE POLICY "Authenticated read study categories"
ON public.study_categories_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage study categories" ON public.study_categories_master;
CREATE POLICY "Admins manage study categories"
ON public.study_categories_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.study_subtypes_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  category_code TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  backend_prompt_id TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_subtypes_master TO authenticated;
GRANT ALL ON public.study_subtypes_master TO service_role;
ALTER TABLE public.study_subtypes_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read study subtypes" ON public.study_subtypes_master;
CREATE POLICY "Authenticated read study subtypes"
ON public.study_subtypes_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage study subtypes" ON public.study_subtypes_master;
CREATE POLICY "Admins manage study subtypes"
ON public.study_subtypes_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.sap_activities_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sap_activities_master TO authenticated;
GRANT ALL ON public.sap_activities_master TO service_role;
ALTER TABLE public.sap_activities_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read sap activities" ON public.sap_activities_master;
CREATE POLICY "Authenticated read sap activities"
ON public.sap_activities_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage sap activities" ON public.sap_activities_master;
CREATE POLICY "Admins manage sap activities"
ON public.sap_activities_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.target_publics_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.target_publics_master TO authenticated;
GRANT ALL ON public.target_publics_master TO service_role;
ALTER TABLE public.target_publics_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read target publics" ON public.target_publics_master;
CREATE POLICY "Authenticated read target publics"
ON public.target_publics_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage target publics" ON public.target_publics_master;
CREATE POLICY "Admins manage target publics"
ON public.target_publics_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.territory_modes_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.territory_modes_master TO authenticated;
GRANT ALL ON public.territory_modes_master TO service_role;
ALTER TABLE public.territory_modes_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read territory modes" ON public.territory_modes_master;
CREATE POLICY "Authenticated read territory modes"
ON public.territory_modes_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage territory modes" ON public.territory_modes_master;
CREATE POLICY "Admins manage territory modes"
ON public.territory_modes_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.service_modes_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_modes_master TO authenticated;
GRANT ALL ON public.service_modes_master TO service_role;
ALTER TABLE public.service_modes_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read service modes" ON public.service_modes_master;
CREATE POLICY "Authenticated read service modes"
ON public.service_modes_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage service modes" ON public.service_modes_master;
CREATE POLICY "Admins manage service modes"
ON public.service_modes_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.study_types_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_types_master TO authenticated;
GRANT ALL ON public.study_types_master TO service_role;
ALTER TABLE public.study_types_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read study types" ON public.study_types_master;
CREATE POLICY "Authenticated read study types"
ON public.study_types_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage study types" ON public.study_types_master;
CREATE POLICY "Admins manage study types"
ON public.study_types_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.zone_focus_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  general_circle TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.zone_focus_master TO authenticated;
GRANT ALL ON public.zone_focus_master TO service_role;
ALTER TABLE public.zone_focus_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read zone focus" ON public.zone_focus_master;
CREATE POLICY "Authenticated read zone focus"
ON public.zone_focus_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage zone focus" ON public.zone_focus_master;
CREATE POLICY "Admins manage zone focus"
ON public.zone_focus_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.commune_types_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  general_circle TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.commune_types_master TO authenticated;
GRANT ALL ON public.commune_types_master TO service_role;
ALTER TABLE public.commune_types_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read commune types" ON public.commune_types_master;
CREATE POLICY "Authenticated read commune types"
ON public.commune_types_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage commune types" ON public.commune_types_master;
CREATE POLICY "Admins manage commune types"
ON public.commune_types_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.kpi_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  kpi_group TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kpi_master TO authenticated;
GRANT ALL ON public.kpi_master TO service_role;
ALTER TABLE public.kpi_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read kpis" ON public.kpi_master;
CREATE POLICY "Authenticated read kpis"
ON public.kpi_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage kpis" ON public.kpi_master;
CREATE POLICY "Admins manage kpis"
ON public.kpi_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.risks_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risks_master TO authenticated;
GRANT ALL ON public.risks_master TO service_role;
ALTER TABLE public.risks_master ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read risks" ON public.risks_master;
CREATE POLICY "Authenticated read risks"
ON public.risks_master
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage risks" ON public.risks_master;
CREATE POLICY "Admins manage risks"
ON public.risks_master
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.company_study_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  default_study_type TEXT,
  default_target_publics JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_activity_families JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_zone_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_commune_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_reference_years JSONB NOT NULL DEFAULT '[]'::jsonb,
  justification_note TEXT,
  guidance JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis_axes JSONB,
  preferred_tools JSONB,
  brief_overrides JSONB,
  study_category_code TEXT,
  study_subtype_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT company_study_presets_company_unique UNIQUE (company_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_study_presets TO authenticated;
GRANT ALL ON public.company_study_presets TO service_role;
ALTER TABLE public.company_study_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read company presets" ON public.company_study_presets;
CREATE POLICY "Authenticated read company presets"
ON public.company_study_presets
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Admins manage company presets" ON public.company_study_presets;
CREATE POLICY "Admins manage company presets"
ON public.company_study_presets
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  generation_status TEXT NOT NULL DEFAULT 'pending',
  generation_started_at TIMESTAMPTZ,
  generation_completed_at TIMESTAMPTZ,
  generation_error_message TEXT,
  version_number INTEGER NOT NULL DEFAULT 1,
  parent_study_id UUID REFERENCES public.studies(id) ON DELETE SET NULL,
  study_type TEXT,
  study_category_code TEXT,
  study_subtype_code TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  country_code TEXT,
  city_name TEXT,
  postal_code TEXT,
  study_objective TEXT,
  deliverable_format TEXT,
  palette_key TEXT,
  included_activity_families JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_target_public JSONB NOT NULL DEFAULT '[]'::jsonb,
  synthesis_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  market_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  hr_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  competition_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  transport_kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  commune_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  zone_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  reference_years JSONB NOT NULL DEFAULT '[]'::jsonb,
  road_axes JSONB NOT NULL DEFAULT '[]'::jsonb,
  demographic_segments JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studies TO authenticated;
GRANT ALL ON public.studies TO service_role;
ALTER TABLE public.studies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read own studies" ON public.studies;
CREATE POLICY "Users read own studies"
ON public.studies
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by);
DROP POLICY IF EXISTS "Users create own studies" ON public.studies;
CREATE POLICY "Users create own studies"
ON public.studies
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by);
DROP POLICY IF EXISTS "Users update own studies" ON public.studies;
CREATE POLICY "Users update own studies"
ON public.studies
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by)
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() = user_id OR auth.uid() = created_by);
DROP POLICY IF EXISTS "Admins delete studies" ON public.studies;
CREATE POLICY "Admins delete studies"
ON public.studies
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE TABLE IF NOT EXISTS public.internal_crm_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID REFERENCES public.studies(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'moyen',
  status TEXT NOT NULL DEFAULT 'ouvert',
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT internal_crm_logs_severity_check CHECK (severity IN ('faible', 'moyen', 'eleve', 'critique')),
  CONSTRAINT internal_crm_logs_status_check CHECK (status IN ('ouvert', 'en_cours', 'resolu', 'archive'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.internal_crm_logs TO authenticated;
GRANT ALL ON public.internal_crm_logs TO service_role;
ALTER TABLE public.internal_crm_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated read crm logs" ON public.internal_crm_logs;
CREATE POLICY "Authenticated read crm logs"
ON public.internal_crm_logs
FOR SELECT
TO authenticated
USING (true);
DROP POLICY IF EXISTS "Authenticated create crm logs" ON public.internal_crm_logs;
CREATE POLICY "Authenticated create crm logs"
ON public.internal_crm_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by OR public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins update crm logs" ON public.internal_crm_logs;
CREATE POLICY "Admins update crm logs"
ON public.internal_crm_logs
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));
DROP POLICY IF EXISTS "Admins delete crm logs" ON public.internal_crm_logs;
CREATE POLICY "Admins delete crm logs"
ON public.internal_crm_logs
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

DROP TRIGGER IF EXISTS update_study_categories_master_updated_at ON public.study_categories_master;
CREATE TRIGGER update_study_categories_master_updated_at BEFORE UPDATE ON public.study_categories_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_study_subtypes_master_updated_at ON public.study_subtypes_master;
CREATE TRIGGER update_study_subtypes_master_updated_at BEFORE UPDATE ON public.study_subtypes_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_sap_activities_master_updated_at ON public.sap_activities_master;
CREATE TRIGGER update_sap_activities_master_updated_at BEFORE UPDATE ON public.sap_activities_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_target_publics_master_updated_at ON public.target_publics_master;
CREATE TRIGGER update_target_publics_master_updated_at BEFORE UPDATE ON public.target_publics_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_territory_modes_master_updated_at ON public.territory_modes_master;
CREATE TRIGGER update_territory_modes_master_updated_at BEFORE UPDATE ON public.territory_modes_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_service_modes_master_updated_at ON public.service_modes_master;
CREATE TRIGGER update_service_modes_master_updated_at BEFORE UPDATE ON public.service_modes_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_study_types_master_updated_at ON public.study_types_master;
CREATE TRIGGER update_study_types_master_updated_at BEFORE UPDATE ON public.study_types_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_zone_focus_master_updated_at ON public.zone_focus_master;
CREATE TRIGGER update_zone_focus_master_updated_at BEFORE UPDATE ON public.zone_focus_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_commune_types_master_updated_at ON public.commune_types_master;
CREATE TRIGGER update_commune_types_master_updated_at BEFORE UPDATE ON public.commune_types_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_kpi_master_updated_at ON public.kpi_master;
CREATE TRIGGER update_kpi_master_updated_at BEFORE UPDATE ON public.kpi_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_risks_master_updated_at ON public.risks_master;
CREATE TRIGGER update_risks_master_updated_at BEFORE UPDATE ON public.risks_master FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_company_study_presets_updated_at ON public.company_study_presets;
CREATE TRIGGER update_company_study_presets_updated_at BEFORE UPDATE ON public.company_study_presets FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_studies_updated_at ON public.studies;
CREATE TRIGGER update_studies_updated_at BEFORE UPDATE ON public.studies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
DROP TRIGGER IF EXISTS update_internal_crm_logs_updated_at ON public.internal_crm_logs;
CREATE TRIGGER update_internal_crm_logs_updated_at BEFORE UPDATE ON public.internal_crm_logs FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();