
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
UPDATE public.profiles SET role = 'viewer' WHERE role = 'user';
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'viewer';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'consultant', 'viewer'));
