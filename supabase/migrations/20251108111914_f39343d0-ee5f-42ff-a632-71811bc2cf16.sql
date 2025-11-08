-- ============================================
-- SYNC DATES FROM campaign_settings TO campaigns
-- ============================================

-- 1. Create function to sync dates and trigger status recalculation
CREATE OR REPLACE FUNCTION public.sync_campaign_dates_from_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update campaigns table with dates from campaign_settings
  UPDATE public.campaigns
  SET 
    start_date = NEW.start_date,
    end_date = NEW.end_date,
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  -- The trigger_compute_campaign_status will automatically recalculate status
  RETURN NEW;
END;
$$;

-- 2. Create trigger on campaign_settings
DROP TRIGGER IF EXISTS trigger_sync_dates_to_campaigns ON public.campaign_settings;

CREATE TRIGGER trigger_sync_dates_to_campaigns
  AFTER INSERT OR UPDATE OF start_date, end_date
  ON public.campaign_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_campaign_dates_from_settings();

-- 3. Immediate backfill: sync all existing dates from campaign_settings to campaigns
UPDATE public.campaigns c
SET 
  start_date = cs.start_date,
  end_date = cs.end_date,
  updated_at = now()
FROM public.campaign_settings cs
WHERE c.id = cs.campaign_id
  AND (
    c.start_date IS DISTINCT FROM cs.start_date 
    OR c.end_date IS DISTINCT FROM cs.end_date
  );

-- 4. Force recalculation of all campaign statuses by updating updated_at
-- This will trigger the compute_campaign_status trigger
UPDATE public.campaigns
SET updated_at = now()
WHERE TRUE;