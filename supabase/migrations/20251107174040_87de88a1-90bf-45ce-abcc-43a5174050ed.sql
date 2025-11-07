-- Synchronize campaign_settings.publication.name with campaigns.name
-- This fixes existing campaigns where the names are out of sync

UPDATE campaign_settings cs
SET publication = jsonb_set(
  COALESCE(cs.publication, '{}'::jsonb),
  '{name}',
  to_jsonb(c.name)
)
FROM campaigns c
WHERE cs.campaign_id = c.id
AND (
  cs.publication->>'name' IS NULL 
  OR cs.publication->>'name' != c.name
  OR cs.publication->>'name' = 'Ma Campagne'
);