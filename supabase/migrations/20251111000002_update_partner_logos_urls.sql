-- Migration pour mettre à jour les URLs des logos des partenaires médias
-- À exécuter APRÈS avoir placé les logos dans /public/logos/partners/

-- Mise à jour des URLs des logos vers les fichiers locaux
UPDATE media_partners SET logo_url = '/logos/partners/geo-logo.svg' WHERE name = 'GEO';
UPDATE media_partners SET logo_url = '/logos/partners/capital-logo.svg' WHERE name = 'Capital';
UPDATE media_partners SET logo_url = '/logos/partners/femme-actuelle-logo.svg' WHERE name = 'Femme Actuelle';
UPDATE media_partners SET logo_url = '/logos/partners/cuisine-actuelle-logo.svg' WHERE name = 'Cuisine Actuelle';
UPDATE media_partners SET logo_url = '/logos/partners/ca-minteresse-logo.svg' WHERE name = 'Ça m''intéresse';
UPDATE media_partners SET logo_url = '/logos/partners/voici-logo.svg' WHERE name = 'Voici';
UPDATE media_partners SET logo_url = '/logos/partners/tele-loisirs-logo.svg' WHERE name = 'Télé-Loisirs';
UPDATE media_partners SET logo_url = '/logos/partners/tele-2-semaines-logo.svg' WHERE name = 'Télé 2 Semaines';

-- Vérification : afficher tous les partenaires avec leurs logos
SELECT name, logo_url, category, audience_size, monthly_visitors 
FROM media_partners 
WHERE status = 'active'
ORDER BY audience_size DESC;
