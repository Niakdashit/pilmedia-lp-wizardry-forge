-- Migration pour le système de partenariats médias
-- À exécuter dans le SQL Editor de Supabase

-- 1. Table des médias partenaires
CREATE TABLE IF NOT EXISTS media_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  website text,
  description text,
  logo_url text,
  contact_email text,
  contact_phone text,
  category text, -- 'blog', 'magazine', 'influencer', 'website', etc.
  audience_size integer,
  monthly_visitors integer,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Table des demandes de partenariat
CREATE TABLE IF NOT EXISTS partnership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media_partners(id) ON DELETE CASCADE,
  requester_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message text,
  response_message text,
  requested_at timestamptz DEFAULT now(),
  responded_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Table des campagnes partagées avec les médias
CREATE TABLE IF NOT EXISTS media_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE CASCADE,
  media_id uuid REFERENCES media_partners(id) ON DELETE CASCADE,
  partnership_request_id uuid REFERENCES partnership_requests(id),
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  start_date timestamptz,
  end_date timestamptz,
  views integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  revenue numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Activer RLS
ALTER TABLE media_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnership_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_campaigns ENABLE ROW LEVEL SECURITY;

-- 5. Policies pour media_partners
DROP POLICY IF EXISTS "Users can view their own media" ON media_partners;
CREATE POLICY "Users can view their own media"
  ON media_partners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own media" ON media_partners;
CREATE POLICY "Users can create their own media"
  ON media_partners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own media" ON media_partners;
CREATE POLICY "Users can update their own media"
  ON media_partners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all media" ON media_partners;
CREATE POLICY "Admins can view all media"
  ON media_partners FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Policies pour partnership_requests
DROP POLICY IF EXISTS "Media can view their requests" ON partnership_requests;
CREATE POLICY "Media can view their requests"
  ON partnership_requests FOR SELECT
  TO authenticated
  USING (
    media_id IN (
      SELECT id FROM media_partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Requesters can view their requests" ON partnership_requests;
CREATE POLICY "Requesters can view their requests"
  ON partnership_requests FOR SELECT
  TO authenticated
  USING (requester_id = auth.uid());

DROP POLICY IF EXISTS "Media can update their requests" ON partnership_requests;
CREATE POLICY "Media can update their requests"
  ON partnership_requests FOR UPDATE
  TO authenticated
  USING (
    media_id IN (
      SELECT id FROM media_partners WHERE user_id = auth.uid()
    )
  );

-- 7. Policies pour media_campaigns
DROP POLICY IF EXISTS "Media can view their campaigns" ON media_campaigns;
CREATE POLICY "Media can view their campaigns"
  ON media_campaigns FOR SELECT
  TO authenticated
  USING (
    media_id IN (
      SELECT id FROM media_partners WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Campaign owners can view their media campaigns" ON media_campaigns;
CREATE POLICY "Campaign owners can view their media campaigns"
  ON media_campaigns FOR SELECT
  TO authenticated
  USING (
    campaign_id IN (
      SELECT id FROM campaigns WHERE created_by = auth.uid()
    )
  );

-- 8. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_media_partners_user_id ON media_partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_media_id ON partnership_requests(media_id);
CREATE INDEX IF NOT EXISTS idx_partnership_requests_campaign_id ON partnership_requests(campaign_id);
CREATE INDEX IF NOT EXISTS idx_media_campaigns_media_id ON media_campaigns(media_id);
CREATE INDEX IF NOT EXISTS idx_media_campaigns_campaign_id ON media_campaigns(campaign_id);

-- 9. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Triggers pour updated_at
DROP TRIGGER IF EXISTS update_media_partners_updated_at ON media_partners;
CREATE TRIGGER update_media_partners_updated_at
  BEFORE UPDATE ON media_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_partnership_requests_updated_at ON partnership_requests;
CREATE TRIGGER update_partnership_requests_updated_at
  BEFORE UPDATE ON partnership_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_campaigns_updated_at ON media_campaigns;
CREATE TRIGGER update_media_campaigns_updated_at
  BEFORE UPDATE ON media_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
