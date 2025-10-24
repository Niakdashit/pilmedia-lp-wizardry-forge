
-- Migration pour ajouter les champs de formulaire dynamique et les participations

-- 1. Ajouter la colonne formFields à la table campaigns (si elle n'existe pas déjà)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'campaigns' AND column_name = 'form_fields') THEN
        ALTER TABLE campaigns ADD COLUMN form_fields JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Créer la table participations
CREATE TABLE IF NOT EXISTS participations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_email text,
  user_ip inet,
  user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_participations_campaign_id ON participations(campaign_id);
-- Note: user_id column may not exist in all schemas, only create index if column exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'user_id') THEN
        CREATE INDEX IF NOT EXISTS idx_participations_user_id ON participations(user_id);
    END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_participations_created_at ON participations(created_at);
CREATE INDEX IF NOT EXISTS idx_participations_user_email ON participations(user_email);

-- 4. Créer une fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Créer le trigger pour updated_at
DROP TRIGGER IF EXISTS update_participations_updated_at ON participations;
CREATE TRIGGER update_participations_updated_at
    BEFORE UPDATE ON participations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Activer RLS (Row Level Security)
ALTER TABLE participations ENABLE ROW LEVEL SECURITY;

-- 7. Créer les politiques RLS
-- Permettre la lecture pour les propriétaires de campagne
DROP POLICY IF EXISTS "Campaign owners can read participations" ON participations;
CREATE POLICY "Campaign owners can read participations"
  ON participations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = participations.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- Permettre l'insertion pour tous (utilisateurs anonymes et authentifiés)
DROP POLICY IF EXISTS "Anyone can create participations" ON participations;
CREATE POLICY "Anyone can create participations"
  ON participations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permettre la mise à jour pour les propriétaires de campagne
DROP POLICY IF EXISTS "Campaign owners can update participations" ON participations;
CREATE POLICY "Campaign owners can update participations"
  ON participations
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = participations.campaign_id 
      AND campaigns.created_by = auth.uid()
    )
  );

-- Permettre la suppression pour les propriétaires de campagne (gérée dans 20251024111500)
-- DROP POLICY IF EXISTS "Campaign owners can delete participations" ON participations;

-- 8. Commentaires pour documentation (conditionnels selon les colonnes existantes)
COMMENT ON TABLE participations IS 'Stockage des participations utilisateur aux campagnes avec formulaires dynamiques';
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'form_data') THEN
        COMMENT ON COLUMN participations.form_data IS 'Données soumises par l''utilisateur selon le formulaire dynamique';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'user_email') THEN
        COMMENT ON COLUMN participations.user_email IS 'Email de l''utilisateur (déduit des form_data si présent)';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'user_ip') THEN
        EXECUTE 'COMMENT ON COLUMN participations.user_ip IS ''Adresse IP de l''''utilisateur pour tracking''';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'user_agent') THEN
        COMMENT ON COLUMN participations.user_agent IS 'User agent du navigateur';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'utm_source') THEN
        COMMENT ON COLUMN participations.utm_source IS 'Source UTM pour tracking marketing';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'utm_medium') THEN
        COMMENT ON COLUMN participations.utm_medium IS 'Medium UTM pour tracking marketing';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'participations' AND column_name = 'utm_campaign') THEN
        COMMENT ON COLUMN participations.utm_campaign IS 'Campagne UTM pour tracking marketing';
    END IF;
END $$;
