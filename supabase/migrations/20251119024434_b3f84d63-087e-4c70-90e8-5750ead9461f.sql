-- Allow authenticated users to read campaign_views for analytics UI
ALTER TABLE public.campaign_views ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'campaign_views' 
      AND policyname = 'Authenticated can read campaign views'
  ) THEN
    CREATE POLICY "Authenticated can read campaign views"
      ON public.campaign_views
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;