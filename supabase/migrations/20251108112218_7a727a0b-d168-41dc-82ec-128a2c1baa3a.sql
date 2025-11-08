-- ============================================
-- FIX: Extract dates from publication JSON
-- ============================================

-- 1. Update the sync function to extract dates from publication JSON
CREATE OR REPLACE FUNCTION public.sync_campaign_dates_from_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  final_start_date timestamp with time zone;
  final_end_date timestamp with time zone;
BEGIN
  -- Priority 1: Use dedicated columns if available
  final_start_date := NEW.start_date;
  final_end_date := NEW.end_date;
  
  -- Priority 2: Extract from publication JSON if columns are NULL
  IF final_start_date IS NULL AND NEW.publication IS NOT NULL THEN
    BEGIN
      final_start_date := (NEW.publication->>'start')::timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignore parse errors
    END;
  END IF;
  
  IF final_end_date IS NULL AND NEW.publication IS NOT NULL THEN
    BEGIN
      final_end_date := (NEW.publication->>'end')::timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ignore parse errors
    END;
  END IF;
  
  -- Update campaigns table with extracted dates
  UPDATE public.campaigns
  SET 
    start_date = final_start_date,
    end_date = final_end_date,
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$;

-- 2. Update trigger to fire on publication changes too
DROP TRIGGER IF EXISTS trigger_sync_dates_to_campaigns ON public.campaign_settings;

CREATE TRIGGER trigger_sync_dates_to_campaigns
  AFTER INSERT OR UPDATE OF start_date, end_date, publication
  ON public.campaign_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_campaign_dates_from_settings();

-- 3. Immediate backfill: extract dates from publication JSON for all campaigns
UPDATE public.campaigns c
SET 
  start_date = (
    SELECT 
      COALESCE(
        cs.start_date,
        (cs.publication->>'start')::timestamp with time zone
      )
    FROM public.campaign_settings cs
    WHERE cs.campaign_id = c.id
    LIMIT 1
  ),
  end_date = (
    SELECT 
      COALESCE(
        cs.end_date,
        (cs.publication->>'end')::timestamp with time zone
      )
    FROM public.campaign_settings cs
    WHERE cs.campaign_id = c.id
    LIMIT 1
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 
  FROM public.campaign_settings cs 
  WHERE cs.campaign_id = c.id
);

-- 4. Force status recalculation for all campaigns
UPDATE public.campaigns
SET updated_at = now()
WHERE TRUE;