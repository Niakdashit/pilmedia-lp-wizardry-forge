-- Corriger la fonction pour ajouter search_path et éviter les warnings de sécurité
CREATE OR REPLACE FUNCTION public.compute_campaign_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  is_active_flag boolean;
  now_ts timestamptz;
BEGIN
  -- Récupérer la date actuelle
  now_ts := now();
  
  -- Extraire le flag isActive du config JSON (default true si non défini)
  is_active_flag := COALESCE((NEW.config->>'isActive')::boolean, true);
  
  -- Logique de calcul du statut
  IF is_active_flag = false THEN
    -- Si désactivé manuellement, forcer "paused"
    NEW.status := 'paused'::campaign_status;
  ELSIF NEW.start_date IS NULL OR NEW.end_date IS NULL THEN
    -- Si dates non définies, rester en "draft"
    NEW.status := 'draft'::campaign_status;
  ELSIF now_ts < NEW.start_date THEN
    -- Si pas encore commencé
    NEW.status := 'draft'::campaign_status;
  ELSIF now_ts >= NEW.start_date AND now_ts <= NEW.end_date THEN
    -- Si en cours
    NEW.status := 'active'::campaign_status;
  ELSE
    -- Si terminé
    NEW.status := 'ended'::campaign_status;
  END IF;
  
  RETURN NEW;
END;
$function$;