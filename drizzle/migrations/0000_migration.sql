CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'Custom encounter',
  patient jsonb NOT NULL,
  probability numeric NOT NULL,
  tier text NOT NULL,
  readiness text NOT NULL,
  priority text NOT NULL,
  prediction jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.assessments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.assessments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.assessments FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX assessments_user_created_idx ON public.assessments (user_id, created_at DESC);