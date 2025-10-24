-- Enable RLS (safe if already enabled)
ALTER TABLE IF EXISTS public.campaigns ENABLE ROW LEVEL SECURITY;

-- Allow campaign owners to DELETE their campaigns
DROP POLICY IF EXISTS "Campaign owners can delete campaigns" ON public.campaigns;
CREATE POLICY "Campaign owners can delete campaigns"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Allow admins to manage campaigns (including DELETE)
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND COALESCE(p.is_admin, false) = true
    )
  );

-- Ensure dependent tables can be deleted by owners via RLS (participations + campaign_stats)
ALTER TABLE IF EXISTS public.participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.campaign_stats ENABLE ROW LEVEL SECURITY;

-- Delete participations if owner of campaign
DROP POLICY IF EXISTS "Campaign owners can delete participations" ON public.participations;
CREATE POLICY "Campaign owners can delete participations"
  ON public.participations
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = participations.campaign_id AND c.created_by = auth.uid()
    )
  );

-- Delete stats if owner of campaign
DROP POLICY IF EXISTS "Campaign owners can delete stats" ON public.campaign_stats;
CREATE POLICY "Campaign owners can delete stats"
  ON public.campaign_stats
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_stats.campaign_id AND c.created_by = auth.uid()
    )
  );
