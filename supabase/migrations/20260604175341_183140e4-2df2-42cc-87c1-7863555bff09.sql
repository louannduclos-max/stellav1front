CREATE TABLE IF NOT EXISTS public.study_deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES public.studies(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_deliverables TO authenticated;
GRANT ALL ON public.study_deliverables TO service_role;
ALTER TABLE public.study_deliverables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users read allowed deliverables" ON public.study_deliverables;
CREATE POLICY "Users read allowed deliverables"
ON public.study_deliverables
FOR SELECT
TO authenticated
USING (
  public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.studies s
    WHERE s.id = study_deliverables.study_id
      AND (s.user_id = auth.uid() OR s.created_by = auth.uid())
  )
);
DROP POLICY IF EXISTS "Admins manage deliverables" ON public.study_deliverables;
CREATE POLICY "Admins manage deliverables"
ON public.study_deliverables
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users read deliverable files" ON storage.objects;
CREATE POLICY "Users read deliverable files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'deliverables'
  AND (
    public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.study_deliverables sd
      JOIN public.studies s ON s.id = sd.study_id
      WHERE sd.file_url = storage.objects.name
        AND (s.user_id = auth.uid() OR s.created_by = auth.uid())
    )
  )
);

DROP POLICY IF EXISTS "Service role manages deliverable files" ON storage.objects;
CREATE POLICY "Service role manages deliverable files"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'deliverables')
WITH CHECK (bucket_id = 'deliverables');