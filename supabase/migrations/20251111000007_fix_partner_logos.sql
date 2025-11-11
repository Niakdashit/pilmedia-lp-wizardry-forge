-- Migration pour corriger les URLs des logos des partenaires
-- Utilisation des favicons et URLs accessibles

UPDATE media_partners SET logo_url = 'https://www.geo.fr/favicon.ico' WHERE name = 'GEO';
UPDATE media_partners SET logo_url = 'https://www.capital.fr/favicon.ico' WHERE name = 'Capital';
UPDATE media_partners SET logo_url = 'https://www.femmeactuelle.fr/favicon.ico' WHERE name = 'Femme Actuelle';
UPDATE media_partners SET logo_url = 'https://www.cuisineactuelle.fr/favicon.ico' WHERE name = 'Cuisine Actuelle';
UPDATE media_partners SET logo_url = 'https://www.caminteresse.fr/favicon.ico' WHERE name = 'Ça m''intéresse';
UPDATE media_partners SET logo_url = 'https://www.voici.fr/favicon.ico' WHERE name = 'Voici';
UPDATE media_partners SET logo_url = 'https://www.programme-tv.net/favicon.ico' WHERE name = 'Télé-Loisirs';
UPDATE media_partners SET logo_url = 'https://www.programme.tv/favicon.ico' WHERE name = 'Télé 2 Semaines';

-- Vérification
SELECT name, logo_url FROM media_partners WHERE status = 'active' ORDER BY name;
