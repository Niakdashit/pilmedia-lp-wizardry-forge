-- Corriger la dernière fonction avec le warning search_path

-- update_campaign_stats
CREATE OR REPLACE FUNCTION public.update_campaign_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'participations' THEN
    UPDATE public.campaigns 
    SET total_participants = (
      SELECT COUNT(*) 
      FROM public.participations 
      WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  IF TG_TABLE_NAME = 'campaign_views' THEN
    UPDATE public.campaigns 
    SET total_views = (
      SELECT COUNT(*) 
      FROM public.campaign_views 
      WHERE campaign_id = NEW.campaign_id
    )
    WHERE id = NEW.campaign_id;
  END IF;
  
  RETURN NEW;
END;
$function$;