-- Activate triggers for campaigns table to ensure revision tracking and snapshots

-- 1. BEFORE UPDATE: Update updated_at timestamp
DROP TRIGGER IF EXISTS campaigns_set_updated_at ON public.campaigns;
CREATE TRIGGER campaigns_set_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. BEFORE UPDATE: Increment revision for optimistic locking
DROP TRIGGER IF EXISTS campaigns_increment_revision ON public.campaigns;
CREATE TRIGGER campaigns_increment_revision
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW 
  EXECUTE FUNCTION public.increment_campaign_revision();

-- 3. AFTER UPDATE: Auto-create snapshots
DROP TRIGGER IF EXISTS campaigns_auto_snapshot ON public.campaigns;
CREATE TRIGGER campaigns_auto_snapshot
  AFTER UPDATE ON public.campaigns
  FOR EACH ROW 
  EXECUTE FUNCTION public.auto_create_campaign_snapshot();

-- 4. AFTER UPDATE: Log campaign updates
DROP TRIGGER IF EXISTS campaigns_log_update ON public.campaigns;
CREATE TRIGGER campaigns_log_update
  AFTER UPDATE ON public.campaigns
  FOR EACH ROW 
  EXECUTE FUNCTION public.log_campaign_update();