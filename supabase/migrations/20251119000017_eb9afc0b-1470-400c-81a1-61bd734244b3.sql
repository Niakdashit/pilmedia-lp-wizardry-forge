-- Fix search_path security warnings for GDPR functions

-- Recréer update_updated_at_column avec search_path
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recréer anonymize_user_data avec search_path
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Anonymiser les participations
  UPDATE public.participations
  SET 
    user_email = 'anonymized_' || id || '@deleted.local',
    form_data = '{"anonymized": true}'::jsonb,
    ip_address = '0.0.0.0'::inet,
    user_agent = 'anonymized'
  WHERE user_email IN (
    SELECT email FROM profiles WHERE id = target_user_id
  );
  
  -- Anonymiser les profiles
  UPDATE public.profiles
  SET
    email = 'anonymized_' || id || '@deleted.local',
    full_name = 'Utilisateur Anonymisé',
    avatar_url = NULL,
    company = NULL
  WHERE id = target_user_id;
  
  -- Logger l'action
  INSERT INTO public.data_processing_log (user_id, action_type, table_name, action_description, performed_by)
  VALUES (target_user_id, 'anonymized', 'profiles', 'User data anonymized per GDPR request', auth.uid());
  
  RETURN TRUE;
END;
$$;

-- Recréer get_user_data_export avec search_path
CREATE OR REPLACE FUNCTION get_user_data_export(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  export_data JSONB;
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur
  SELECT email INTO user_email FROM profiles WHERE id = target_user_id;
  
  -- Construire l'export complet
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
$$;