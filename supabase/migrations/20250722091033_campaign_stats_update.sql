-- Supprimer les anciennes politiques restrictives
DROP POLICY IF EXISTS "Allow public uploads to campaign-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to campaign-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public updates to campaign-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes to campaign-assets" ON storage.objects;

-- Créer des politiques plus permissives pour campaign-assets
CREATE POLICY "Public read access for campaign-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Public insert access for campaign-assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'campaign-assets');

CREATE POLICY "Public update access for campaign-assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'campaign-assets')
WITH CHECK (bucket_id = 'campaign-assets');

CREATE POLICY "Public delete access for campaign-assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'campaign-assets');