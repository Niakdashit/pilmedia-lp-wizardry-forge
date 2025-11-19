-- Corriger les warnings "Function Search Path Mutable" en ajoutant SET search_path

-- 1. Fonction has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;

-- 2. Fonction anonymize_user_data
CREATE OR REPLACE FUNCTION public.anonymize_user_data(target_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.participations
  SET 
    user_email = 'anonymized_' || id || '@deleted.local',
    form_data = '{"anonymized": true}'::jsonb,
    ip_address = '0.0.0.0'::inet,
    user_agent = 'anonymized'
  WHERE user_email IN (
    SELECT email FROM profiles WHERE id = target_user_id
  );
  
  UPDATE public.profiles
  SET
    email = 'anonymized_' || id || '@deleted.local',
    full_name = 'Utilisateur Anonymisé',
    avatar_url = NULL,
    company = NULL
  WHERE id = target_user_id;
  
  INSERT INTO public.data_processing_log (user_id, action_type, table_name, action_description, performed_by)
  VALUES (target_user_id, 'anonymized', 'profiles', 'User data anonymized per GDPR request', auth.uid());
  
  RETURN TRUE;
END;
$function$;

-- 3. Fonction get_user_data_export
CREATE OR REPLACE FUNCTION public.get_user_data_export(target_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  export_data JSONB;
  user_email TEXT;
BEGIN
  SELECT email INTO user_email FROM profiles WHERE id = target_user_id;
  
  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = target_user_id),
    'campaigns', (SELECT jsonb_agg(row_to_json(c.*)) FROM campaigns c WHERE c.created_by = target_user_id),
    'participations', (SELECT jsonb_agg(row_to_json(p.*)) FROM participations p WHERE p.user_email = user_email),
    'game_results', (SELECT jsonb_agg(row_to_json(g.*)) FROM game_results g WHERE g.user_id = target_user_id),
    'consents', (SELECT jsonb_agg(row_to_json(uc.*)) FROM user_consents uc WHERE uc.user_id = target_user_id),
    'gdpr_requests', (SELECT jsonb_agg(row_to_json(gr.*)) FROM gdpr_requests gr WHERE gr.user_id = target_user_id),
    'export_date', now(),
    'export_version', '1.0'
  ) INTO export_data;
  
  RETURN export_data;
END;
$function$;

-- 4. Fonction update_dotation_config_timestamp
CREATE OR REPLACE FUNCTION public.update_dotation_config_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 5. Fonction update_dotation_stats
CREATE OR REPLACE FUNCTION public.update_dotation_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  v_config JSONB;
  v_total_prizes INTEGER;
  v_total_quantity INTEGER;
  v_total_awarded INTEGER;
  v_total_participants INTEGER;
  v_total_winners INTEGER;
BEGIN
  SELECT prizes INTO v_config
  FROM public.dotation_configs
  WHERE campaign_id = NEW.campaign_id;
  
  IF v_config IS NULL THEN
    RETURN NEW;
  END IF;
  
  SELECT 
    jsonb_array_length(v_config),
    COALESCE(SUM((prize->>'totalQuantity')::INTEGER), 0),
    COALESCE(SUM((prize->>'awardedQuantity')::INTEGER), 0)
  INTO v_total_prizes, v_total_quantity, v_total_awarded
  FROM jsonb_array_elements(v_config) AS prize;
  
  SELECT 
    COUNT(DISTINCT participant_email),
    COUNT(DISTINCT CASE WHEN (result->>'isWinner')::BOOLEAN THEN participant_email END)
  INTO v_total_participants, v_total_winners
  FROM public.attribution_history
  WHERE campaign_id = NEW.campaign_id;
  
  INSERT INTO public.dotation_stats (
    campaign_id,
    total_prizes,
    total_quantity,
    total_awarded,
    total_remaining,
    attribution_rate,
    total_participants,
    total_winners,
    win_rate,
    last_updated
  ) VALUES (
    NEW.campaign_id,
    v_total_prizes,
    v_total_quantity,
    v_total_awarded,
    v_total_quantity - v_total_awarded,
    CASE WHEN v_total_quantity > 0 THEN (v_total_awarded::DECIMAL / v_total_quantity * 100) ELSE 0 END,
    v_total_participants,
    v_total_winners,
    CASE WHEN v_total_participants > 0 THEN (v_total_winners::DECIMAL / v_total_participants * 100) ELSE 0 END,
    NOW()
  )
  ON CONFLICT (campaign_id) DO UPDATE SET
    total_prizes = EXCLUDED.total_prizes,
    total_quantity = EXCLUDED.total_quantity,
    total_awarded = EXCLUDED.total_awarded,
    total_remaining = EXCLUDED.total_remaining,
    attribution_rate = EXCLUDED.attribution_rate,
    total_participants = EXCLUDED.total_participants,
    total_winners = EXCLUDED.total_winners,
    win_rate = EXCLUDED.win_rate,
    last_updated = NOW();
  
  RETURN NEW;
END;
$function$;

-- 6. Fonction log_campaign_update
CREATE OR REPLACE FUNCTION public.log_campaign_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM public.log_campaign_action(
    NEW.id,
    'updated',
    NULL,
    'Campaign updated via editor',
    OLD.revision,
    NEW.revision
  );
  RETURN NEW;
END;
$function$;

-- 7. Fonction handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$function$;