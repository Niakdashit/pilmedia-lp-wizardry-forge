-- Migration pour insérer les détails des partenaires Prisma Media
-- Emplacements publicitaires et conditions de partenariat

-- 1. Mettre à jour les informations détaillées des partenaires existants
UPDATE media_partners SET
  location = 'Paris, Île-de-France',
  age_range = '35-65 ans',
  gender_distribution = '{"male": 52, "female": 45, "other": 3}'::jsonb,
  interests = '["Actualité locale", "Sport", "Culture", "Économie"]'::jsonb,
  rating = 4.7,
  partnerships_count = 47,
  member_since = '2024-01-01',
  contact_phone = '+33 3 22 82 60 00',
  contact_address = '29 rue de la République, 80000 Amiens'
WHERE name = 'Capital';

-- 2. Insérer les emplacements publicitaires pour Capital
INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil du site web',
  '728×90px',
  'Header',
  150000,
  3
FROM media_partners WHERE name = 'Capital';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Article sponsorisé',
  'Article rédigé par nos journalistes mettant en avant votre marque',
  '800-1200 mots',
  'Section Partenaires',
  80000,
  5
FROM media_partners WHERE name = 'Capital';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Encart Newsletter',
  'Encart dans notre newsletter quotidienne',
  '300×250px',
  'Milieu de newsletter',
  45000,
  10
FROM media_partners WHERE name = 'Capital';

-- 3. Insérer les conditions de partenariat pour Capital
INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  7,
  90,
  5,
  500,
  10000,
  '["Produits", "Services", "Bons d''achat", "Expériences"]'::jsonb,
  '["Les dotations doivent être en lien avec notre audience", "Validation éditoriale requise pour les articles", "Possibilité de renouvellement si succès"]'::jsonb
FROM media_partners WHERE name = 'Capital';

-- 4. Répéter pour les autres partenaires (exemple avec GEO)
UPDATE media_partners SET
  location = 'Paris, France',
  age_range = '25-55 ans',
  gender_distribution = '{"male": 48, "female": 50, "other": 2}'::jsonb,
  interests = '["Voyage", "Nature", "Environnement", "Photographie"]'::jsonb,
  rating = 4.8,
  partnerships_count = 32,
  member_since = '2024-01-01',
  contact_phone = '+33 1 73 05 45 45',
  contact_address = '13 rue Henri Barbusse, 92230 Gennevilliers'
WHERE name = 'GEO';

INSERT INTO media_ad_placements (media_id, name, description, format, position, estimated_visibility, available_slots)
SELECT 
  id,
  'Bannière Homepage',
  'Bannière en haut de la page d''accueil',
  '728×90px',
  'Header',
  120000,
  2
FROM media_partners WHERE name = 'GEO'
UNION ALL
SELECT 
  id,
  'Article sponsorisé',
  'Article sur une destination ou expérience de voyage',
  '1000-1500 mots',
  'Section Voyages',
  65000,
  4
FROM media_partners WHERE name = 'GEO';

INSERT INTO media_partnership_conditions (media_id, duration_min, duration_max, validation_delay, min_dotation_value, max_dotation_value, dotation_types, specific_conditions)
SELECT 
  id,
  14,
  60,
  7,
  800,
  15000,
  '["Voyages", "Expériences", "Équipements outdoor", "Services"]'::jsonb,
  '["Les dotations doivent avoir un lien avec le voyage ou la nature", "Photos haute qualité requises", "Validation éditoriale stricte"]'::jsonb
FROM media_partners WHERE name = 'GEO';

-- 5. Vérification
SELECT 
  mp.name,
  mp.rating,
  mp.partnerships_count,
  COUNT(DISTINCT ap.id) as placements_count,
  COUNT(DISTINCT pc.id) as conditions_count
FROM media_partners mp
LEFT JOIN media_ad_placements ap ON mp.id = ap.media_id
LEFT JOIN media_partnership_conditions pc ON mp.id = pc.media_id
WHERE mp.status = 'active'
GROUP BY mp.id, mp.name, mp.rating, mp.partnerships_count
ORDER BY mp.name;
