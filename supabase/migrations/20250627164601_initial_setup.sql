
-- Create a storage bucket for logos (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('brand-logos', 'brand-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow public read access to logos
DROP POLICY IF EXISTS "Public read access for brand logos" ON storage.objects;
CREATE POLICY "Public read access for brand logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'brand-logos');

-- Create policy to allow authenticated users to upload logos
DROP POLICY IF EXISTS "Authenticated users can upload brand logos" ON storage.objects;
CREATE POLICY "Authenticated users can upload brand logos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'brand-logos' AND auth.role() = 'authenticated');
