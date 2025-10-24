-- Créer les politiques pour le bucket campaign-assets
CREATE POLICY "Allow public uploads to campaign-assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'campaign-assets');

CREATE POLICY "Allow public access to campaign-assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Allow public updates to campaign-assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'campaign-assets');

CREATE POLICY "Allow public deletes to campaign-assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'campaign-assets');