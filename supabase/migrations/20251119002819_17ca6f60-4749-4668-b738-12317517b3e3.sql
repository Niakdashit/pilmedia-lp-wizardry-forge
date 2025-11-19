-- Activer les extensions nécessaires pour les cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Créer le cron job pour traiter les demandes d'export toutes les heures
SELECT cron.schedule(
  'process-gdpr-exports-hourly',
  '0 * * * *', -- Toutes les heures à minute 0
  $$
  SELECT
    net.http_post(
        url:='https://vmkwascgjntopgkbmctv.supabase.co/functions/v1/process-gdpr-export',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta3dhc2Nnam50b3Bna2JtY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDA3MzYsImV4cCI6MjA2NjYxNjczNn0.W17ac2AbL4zpsYcLyvPM7QBgFb_vqJvf3QxB0V1ePKA"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Créer le cron job pour traiter les demandes de suppression toutes les heures (5 minutes après les exports)
SELECT cron.schedule(
  'process-gdpr-deletions-hourly',
  '5 * * * *', -- Toutes les heures à minute 5
  $$
  SELECT
    net.http_post(
        url:='https://vmkwascgjntopgkbmctv.supabase.co/functions/v1/process-gdpr-deletion',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZta3dhc2Nnam50b3Bna2JtY3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEwNDA3MzYsImV4cCI6MjA2NjYxNjczNn0.W17ac2AbL4zpsYcLyvPM7QBgFb_vqJvf3QxB0V1ePKA"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);