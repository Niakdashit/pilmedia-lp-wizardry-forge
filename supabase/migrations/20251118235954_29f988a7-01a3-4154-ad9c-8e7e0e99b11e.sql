-- =====================================================
-- GDPR COMPLIANCE TABLES
-- =====================================================

-- Table pour stocker les consentements utilisateurs
CREATE TABLE IF NOT EXISTS public.user_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT, -- Pour les utilisateurs non authentifiés
  ip_address INET,
  
  -- Types de consentements
  analytics_consent BOOLEAN DEFAULT false,
  marketing_consent BOOLEAN DEFAULT false,
  functional_consent BOOLEAN DEFAULT true, -- Toujours true (nécessaire)
  personalization_consent BOOLEAN DEFAULT false,
  
  -- Métadonnées
  consent_version TEXT NOT NULL DEFAULT '1.0',
  consent_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  consent_method TEXT NOT NULL, -- 'banner', 'settings', 'registration'
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT user_or_session_required CHECK (
    user_id IS NOT NULL OR session_id IS NOT NULL
  )
);

-- Index pour performances
CREATE INDEX idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX idx_user_consents_session_id ON public.user_consents(session_id);
CREATE INDEX idx_user_consents_created_at ON public.user_consents(created_at);

-- Table pour les demandes GDPR (export, suppression)
CREATE TABLE IF NOT EXISTS public.gdpr_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('export', 'delete', 'rectify')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Données de la demande
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Résultat
  export_url TEXT, -- URL signée pour télécharger l'export
  export_expires_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Métadonnées
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gdpr_requests_user_id ON public.gdpr_requests(user_id);
CREATE INDEX idx_gdpr_requests_status ON public.gdpr_requests(status);
CREATE INDEX idx_gdpr_requests_type ON public.gdpr_requests(request_type);

-- Table pour l'historique des modifications de données (audit trail)
CREATE TABLE IF NOT EXISTS public.data_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted', 'exported', 'anonymized')),
  table_name TEXT NOT NULL,
  record_id UUID,
  
  -- Détails
  action_description TEXT,
  data_before JSONB,
  data_after JSONB,
  
  -- Contexte
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_data_processing_log_user_id ON public.data_processing_log(user_id);
CREATE INDEX idx_data_processing_log_action ON public.data_processing_log(action_type);
CREATE INDEX idx_data_processing_log_created ON public.data_processing_log(created_at);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gdpr_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_processing_log ENABLE ROW LEVEL SECURITY;

-- Policies pour user_consents
CREATE POLICY "Users can view their own consents"
  ON public.user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consents"
  ON public.user_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own consents"
  ON public.user_consents FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies pour gdpr_requests
CREATE POLICY "Users can view their own GDPR requests"
  ON public.gdpr_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own GDPR requests"
  ON public.gdpr_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies pour data_processing_log (read-only pour les users)
CREATE POLICY "Users can view their own processing log"
  ON public.data_processing_log FOR SELECT
  USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour updated_at sur user_consents
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON public.user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gdpr_requests_updated_at
  BEFORE UPDATE ON public.gdpr_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTIONS UTILITAIRES GDPR
-- =====================================================

-- Fonction pour anonymiser un utilisateur
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Fonction pour exporter toutes les données d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_data_export(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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