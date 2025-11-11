-- Migration pour insérer les détails de TOUS les partenaires Prisma Media
-- Emplacements publicitaires et conditions de partenariat

-- ============================================
-- FEMME ACTUELLE
-- ============================================
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '25-55 ans',
  gender_distribution = '{"male": 15, "female": 83, "other": 2}'::jsonb,
  interests = '["Mode", "Beauté", "Cuisine", "Santé", "People"]'::jsonb,
  rating = 4.6,
  partnerships_count = 89,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'Femme Actuelle';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '970×250px',
  'Header',
  280000,
  4
FROM media_partners WHERE name = 'Femme Actuelle'
UNION ALL
SELECT 
  id,
  'Article sponsorisé',
  'Article lifestyle mettant en avant votre marque',
  '1000-1500 mots',
  'Section Lifestyle',
  150000,
  8
FROM media_partners WHERE name = 'Femme Actuelle'
UNION ALL
SELECT 
  id,
  'Encart Newsletter',
  'Encart dans notre newsletter hebdomadaire',
  '300×250px',
  'Newsletter',
  95000,
  12
FROM media_partners WHERE name = 'Femme Actuelle';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  7,
  60,
  3,
  300,
  8000,
  '["Produits beauté", "Mode", "Accessoires", "Bons d''achat", "Expériences bien-être"]'::jsonb,
  '["Les dotations doivent correspondre à notre audience féminine", "Photos haute qualité requises", "Validation éditoriale rapide"]'::jsonb
FROM media_partners WHERE name = 'Femme Actuelle';

-- ============================================
-- CUISINE ACTUELLE
-- ============================================
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '30-60 ans',
  gender_distribution = '{"male": 25, "female": 72, "other": 3}'::jsonb,
  interests = '["Cuisine", "Recettes", "Gastronomie", "Nutrition", "Équipement cuisine"]'::jsonb,
  rating = 4.7,
  partnerships_count = 56,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'Cuisine Actuelle';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '728×90px',
  'Header',
  95000,
  3
FROM media_partners WHERE name = 'Cuisine Actuelle'
UNION ALL
SELECT 
  id,
  'Article recette sponsorisé',
  'Recette mettant en avant vos produits',
  '800-1200 mots + photos',
  'Section Recettes',
  60000,
  6
FROM media_partners WHERE name = 'Cuisine Actuelle'
UNION ALL
SELECT 
  id,
  'Test produit',
  'Test et avis sur vos produits culinaires',
  '600-800 mots',
  'Section Tests',
  45000,
  4
FROM media_partners WHERE name = 'Cuisine Actuelle';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  14,
  90,
  5,
  400,
  12000,
  '["Produits alimentaires", "Équipement cuisine", "Ustensiles", "Livres de recettes", "Cours de cuisine"]'::jsonb,
  '["Les produits doivent être liés à la cuisine", "Photos professionnelles des produits requises", "Possibilité de créer des recettes avec vos produits"]'::jsonb
FROM media_partners WHERE name = 'Cuisine Actuelle';

-- ============================================
-- ÇA M'INTÉRESSE
-- ============================================
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '35-65 ans',
  gender_distribution = '{"male": 58, "female": 40, "other": 2}'::jsonb,
  interests = '["Science", "Histoire", "Culture", "Découverte", "Innovation"]'::jsonb,
  rating = 4.8,
  partnerships_count = 41,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'Ça m''intéresse';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '728×90px',
  'Header',
  110000,
  2
FROM media_partners WHERE name = 'Ça m''intéresse'
UNION ALL
SELECT 
  id,
  'Article découverte',
  'Article sur une innovation ou découverte',
  '1200-1800 mots',
  'Section Découvertes',
  70000,
  5
FROM media_partners WHERE name = 'Ça m''intéresse'
UNION ALL
SELECT 
  id,
  'Dossier thématique',
  'Dossier complet sur un sujet scientifique ou culturel',
  '2000-3000 mots',
  'Section Dossiers',
  85000,
  3
FROM media_partners WHERE name = 'Ça m''intéresse';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  14,
  60,
  7,
  600,
  15000,
  '["Livres", "Documentaires", "Expériences culturelles", "Musées", "Innovations technologiques"]'::jsonb,
  '["Les dotations doivent avoir un lien avec la culture ou la science", "Contenu éducatif privilégié", "Validation éditoriale stricte"]'::jsonb
FROM media_partners WHERE name = 'Ça m''intéresse';

-- ============================================
-- VOICI
-- ============================================
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '25-50 ans',
  gender_distribution = '{"male": 30, "female": 68, "other": 2}'::jsonb,
  interests = '["People", "Célébrités", "Mode", "Beauté", "Actualité people"]'::jsonb,
  rating = 4.5,
  partnerships_count = 73,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'Voici';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '970×250px',
  'Header',
  200000,
  5
FROM media_partners WHERE name = 'Voici'
UNION ALL
SELECT 
  id,
  'Article sponsorisé',
  'Article people mettant en avant votre marque',
  '800-1200 mots',
  'Section People',
  120000,
  7
FROM media_partners WHERE name = 'Voici'
UNION ALL
SELECT 
  id,
  'Diaporama sponsorisé',
  'Diaporama photos avec votre marque',
  '15-20 photos',
  'Section Galeries',
  90000,
  6
FROM media_partners WHERE name = 'Voici';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  7,
  45,
  3,
  400,
  10000,
  '["Mode", "Beauté", "Accessoires", "Voyages", "Expériences VIP"]'::jsonb,
  '["Les dotations doivent être attractives et glamour", "Photos de qualité professionnelle", "Réactivité éditoriale rapide"]'::jsonb
FROM media_partners WHERE name = 'Voici';

-- ============================================
-- TÉLÉ-LOISIRS
-- ============================================
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '35-70 ans',
  gender_distribution = '{"male": 45, "female": 53, "other": 2}'::jsonb,
  interests = '["Télévision", "Programmes TV", "Séries", "Cinéma", "Divertissement"]'::jsonb,
  rating = 4.6,
  partnerships_count = 52,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'Télé-Loisirs';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '728×90px',
  'Header',
  180000,
  4
FROM media_partners WHERE name = 'Télé-Loisirs'
UNION ALL
SELECT 
  id,
  'Article sponsorisé',
  'Article sur une émission ou série',
  '800-1000 mots',
  'Section Programmes',
  100000,
  6
FROM media_partners WHERE name = 'Télé-Loisirs'
UNION ALL
SELECT 
  id,
  'Encart Newsletter',
  'Encart dans notre newsletter quotidienne',
  '300×250px',
  'Newsletter',
  75000,
  8
FROM media_partners WHERE name = 'Télé-Loisirs';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  7,
  60,
  4,
  500,
  12000,
  '["Produits high-tech", "Streaming", "Équipement TV", "Bons d''achat", "Expériences cinéma"]'::jsonb,
  '["Les dotations doivent avoir un lien avec le divertissement", "Validation éditoriale requise", "Possibilité de jeux concours"]'::jsonb
FROM media_partners WHERE name = 'Télé-Loisirs';

-- ============================================
-- TÉLÉ 2 SEMAINES
-- ============================================
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '40-75 ans',
  gender_distribution = '{"male": 42, "female": 56, "other": 2}'::jsonb,
  interests = '["Télévision", "Programmes TV", "Actualité TV", "Grille des programmes"]'::jsonb,
  rating = 4.5,
  partnerships_count = 38,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'Télé 2 Semaines';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '728×90px',
  'Header',
  85000,
  3
FROM media_partners WHERE name = 'Télé 2 Semaines'
UNION ALL
SELECT 
  id,
  'Article sponsorisé',
  'Article sur les programmes TV',
  '600-800 mots',
  'Section Programmes',
  50000,
  4
FROM media_partners WHERE name = 'Télé 2 Semaines'
UNION ALL
SELECT 
  id,
  'Encart Magazine',
  'Encart dans le magazine papier',
  'Pleine page',
  'Magazine',
  120000,
  2
FROM media_partners WHERE name = 'Télé 2 Semaines';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  14,
  60,
  5,
  600,
  10000,
  '["Produits seniors", "Loisirs", "Voyages", "Santé", "Bien-être"]'::jsonb,
  '["Les dotations doivent correspondre à une audience senior", "Validation éditoriale requise", "Possibilité de partenariat magazine + web"]'::jsonb
FROM media_partners WHERE name = 'Télé 2 Semaines';

-- ============================================
-- VÉRIFICATION FINALE
-- ============================================
SELECT 
  mp.name,
  mp.category,
  mp.rating,
  mp.partnerships_count,
  mp.monthly_visitors,
  COUNT(DISTINCT ap.id) as placements_count,
  COUNT(DISTINCT pc.id) as conditions_count
FROM media_partners mp
LEFT JOIN media_ad_placements ap ON mp.id = ap.media_id
LEFT JOIN media_partnership_conditions pc ON mp.id = pc.media_id
WHERE mp.status = 'active'
GROUP BY mp.id, mp.name, mp.category, mp.rating, mp.partnerships_count, mp.monthly_visitors
ORDER BY mp.monthly_visitors DESC;
