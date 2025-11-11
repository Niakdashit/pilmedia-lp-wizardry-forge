-- Migration pour utiliser les logos locaux stockés dans /public/logos/partners/

UPDATE media_partners SET logo_url = '/logos/partners/ca-minteresse-logo.svg' WHERE name = 'Ça m''intéresse';
UPDATE media_partners SET logo_url = '/logos/partners/capital-logo.svg' WHERE name = 'Capital';
UPDATE media_partners SET logo_url = '/logos/partners/cuisine-actuelle-logo.svg' WHERE name = 'Cuisine Actuelle';
UPDATE media_partners SET logo_url = '/logos/partners/femme-actuelle-logo.svg' WHERE name = 'Femme Actuelle';
UPDATE media_partners SET logo_url = '/logos/partners/geo-logo.svg' WHERE name = 'GEO';
UPDATE media_partners SET logo_url = '/logos/partners/tele-2-semaines-logo.svg' WHERE name = 'Télé 2 Semaines';
UPDATE media_partners SET logo_url = '/logos/partners/tele-loisirs-logo.svg' WHERE name = 'Télé-Loisirs';
UPDATE media_partners SET logo_url = '/logos/partners/voici-logo.svg' WHERE name = 'Voici';

-- Vérification
SELECT name, logo_url FROM media_partners WHERE status = 'active' ORDER BY name;
