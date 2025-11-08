-- ============================================
-- CRITICAL FIX: Proper date synchronization from campaign_settings to campaigns
-- This ensures campaigns.start_date/end_date are ALWAYS up-to-date
-- and status is recalculated automatically
-- ============================================

-- Step 1: Ensure the trigger function extracts dates properly (handles all formats)
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
  -- Priority 1: Use dedicated date columns if available
  final_start_date := NEW.start_date;
  final_end_date := NEW.end_date;
  
  -- Priority 2: Extract from publication JSON if columns are NULL
  IF final_start_date IS NULL AND NEW.publication IS NOT NULL THEN
    BEGIN
      -- Try to parse publication.start (ISO format)
      final_start_date := (NEW.publication->>'start')::timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore parse errors, keep NULL
      NULL;
    END;
  END IF;
  
  IF final_end_date IS NULL AND NEW.publication IS NOT NULL THEN
    BEGIN
      -- Try to parse publication.end (ISO format)
      final_end_date := (NEW.publication->>'end')::timestamp with time zone;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore parse errors, keep NULL
      NULL;
    END;
  END IF;
  
  -- Update campaigns table with extracted dates
  -- This will trigger compute_campaign_status automatically
  UPDATE public.campaigns
  SET 
    start_date = final_start_date,
    end_date = final_end_date,
    updated_at = now()
  WHERE id = NEW.campaign_id;
  
  RETURN NEW;
END;
$$;

-- Step 2: Ensure trigger fires on all relevant changes
DROP TRIGGER IF EXISTS trigger_sync_dates_to_campaigns ON public.campaign_settings;

CREATE TRIGGER trigger_sync_dates_to_campaigns
  AFTER INSERT OR UPDATE OF start_date, end_date, publication
  ON public.campaign_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_campaign_dates_from_settings();

-- Step 3: CRITICAL BACKFILL - Sync all existing campaign dates from settings NOW
-- This ensures all campaigns reflect their true dates from campaign_settings
UPDATE public.campaigns c
SET 
  start_date = COALESCE(
    (
      SELECT COALESCE(
        cs.start_date::timestamp with time zone,
        (cs.publication->>'start')::timestamp with time zone
      )
      FROM public.campaign_settings cs
      WHERE cs.campaign_id = c.id
      LIMIT 1
    ),
    c.start_date
  ),
  end_date = COALESCE(
    (
      SELECT COALESCE(
        cs.end_date::timestamp with time zone,
        (cs.publication->>'end')::timestamp with time zone
      )
      FROM public.campaign_settings cs
      WHERE cs.campaign_id = c.id
      LIMIT 1
    ),
    c.end_date
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 
  FROM public.campaign_settings cs 
  WHERE cs.campaign_id = c.id
);

-- Step 4: Force status recalculation for ALL campaigns
-- This ensures computed status matches the newly synchronized dates
UPDATE public.campaigns
SET updated_at = now()
WHERE TRUE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Date synchronization completed successfully. All campaign dates and statuses have been updated.';
END
$$;