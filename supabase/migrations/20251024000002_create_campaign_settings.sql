-- Migration pour créer la table campaign_settings
-- Cette table stocke les paramètres de configuration des campagnes

-- 1. Créer la table campaign_settings
CREATE TABLE IF NOT EXISTS campaign_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Dates et heures de publication
  start_date timestamptz,
  start_time text,
  end_date timestamptz,
  end_time text,
  
  -- URL de la campagne
  campaign_url text,
  
  -- Intégrations (Javascript, HTML, Webview, oEmbed, Smart URL)
  integration_javascript text,
  integration_html text,
  integration_webview text,
  integration_oembed text,
  integration_smart_url text,
  
  -- Métadonnées
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Activer RLS
ALTER TABLE campaign_settings ENABLE ROW LEVEL SECURITY;

-- 3. Policies pour campaign_settings
-- Les utilisateurs peuvent voir les paramètres de leurs propres campagnes
DROP POLICY IF EXISTS "Users can view their campaign settings" ON campaign_settings;
CREATE POLICY "Users can view their campaign settings"
  ON campaign_settings FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des paramètres pour leurs campagnes
DROP POLICY IF EXISTS "Users can create campaign settings" ON campaign_settings;
CREATE POLICY "Users can create campaign settings"
  ON campaign_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier les paramètres de leurs campagnes
DROP POLICY IF EXISTS "Users can update their campaign settings" ON campaign_settings;
CREATE POLICY "Users can update their campaign settings"
  ON campaign_settings FOR UPDATE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

-- Les utilisateurs peuvent supprimer les paramètres de leurs campagnes
DROP POLICY IF EXISTS "Users can delete their campaign settings" ON campaign_settings;
CREATE POLICY "Users can delete their campaign settings"
  ON campaign_settings FOR DELETE
  TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

-- Les admins peuvent voir tous les paramètres
DROP POLICY IF EXISTS "Admins can view all campaign settings" ON campaign_settings;
CREATE POLICY "Admins can view all campaign settings"
  ON campaign_settings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_campaign_settings_campaign_id ON campaign_settings(campaign_id);

-- 5. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_campaign_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger pour updated_at
DROP TRIGGER IF EXISTS update_campaign_settings_updated_at ON campaign_settings;
CREATE TRIGGER update_campaign_settings_updated_at
  BEFORE UPDATE ON campaign_settings
  FOR EACH ROW EXECUTE FUNCTION update_campaign_settings_updated_at();

-- 7. Commentaires pour la documentation
COMMENT ON TABLE campaign_settings IS 'Paramètres de configuration des campagnes (dates, URL, intégrations)';
COMMENT ON COLUMN campaign_settings.campaign_id IS 'ID de la campagne associée (unique)';
COMMENT ON COLUMN campaign_settings.start_date IS 'Date de début de publication';
COMMENT ON COLUMN campaign_settings.end_date IS 'Date de fin de publication';
COMMENT ON COLUMN campaign_settings.campaign_url IS 'URL publique de la campagne';
