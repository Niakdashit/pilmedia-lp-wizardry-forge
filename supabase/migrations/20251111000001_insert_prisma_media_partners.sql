-- Migration pour insérer les partenaires médias Prisma Media
-- Données récupérées en novembre 2024 depuis les sites officiels

-- Insertion des médias partenaires Prisma Media
INSERT INTO media_partners (
  name,
  website,
  description,
  logo_url,
  category,
  audience_size,
  monthly_visitors,
  status,
  contact_email
) VALUES
(
  'GEO',
  'https://www.geo.fr',
  'Magazine de voyage, nature et environnement. GEO connecte les lecteurs à la nature et au monde en profonde mutation avec un impact positif sur la société et l''environnement. Sublimant la beauté du monde et mettant en lumière des solutions concrètes.',
  'https://www.geo.fr/img/geo-logo.svg',
  'Magazine - Voyage & Nature',
  7400000,
  5300000,
  'active',
  'contact@geo.fr'
),
(
  'Capital',
  'https://www.capital.fr',
  'Premier magazine économique de France. Capital décrypte l''actualité économique et financière avec indépendance et rigueur. Accompagne les lecteurs pour maîtriser leur pouvoir d''achat et faire les bons choix en matière de placements et consommation.',
  'https://www.capital.fr/img/capital-logo.svg',
  'Magazine - Économie & Finance',
  10700000,
  8500000,
  'active',
  'contact@capital.fr'
),
(
  'Femme Actuelle',
  'https://www.femmeactuelle.fr',
  'Média féminin n°1 en France depuis 40 ans. Femme Actuelle accompagne les femmes dans toutes les facettes de leur vie avec engagement, proximité et bienveillance. Donne la parole et le pouvoir aux femmes.',
  'https://www.femmeactuelle.fr/img/femme-actuelle-logo.svg',
  'Magazine - Féminin',
  20000000,
  7300000,
  'active',
  'contact@femmeactuelle.fr'
),
(
  'Cuisine Actuelle',
  'https://www.cuisineactuelle.fr',
  'Magazine de cuisine mensuel proposant des recettes 100% fait maison, pour manger varié et équilibré sans sacrifier le plaisir. Plus de 65 000 recettes disponibles dont 3 000 en vidéo. Met à l''honneur les produits de saison et les terroirs français.',
  'https://www.cuisineactuelle.fr/img/cuisine-actuelle-logo.svg',
  'Magazine - Cuisine & Gastronomie',
  5200000,
  4100000,
  'active',
  'contact@cuisineactuelle.fr'
),
(
  'Ça m''intéresse',
  'https://www.caminteresse.fr',
  'Magazine de la curiosité qui permet de s''émerveiller, découvrir, comprendre et apprendre tout en s''amusant. Aborde tous les sujets avec un souci permanent de décryptage : science, Histoire, environnement, santé, consommation.',
  'https://www.caminteresse.fr/img/ca-minteresse-logo.svg',
  'Magazine - Culture & Découverte',
  6800000,
  3900000,
  'active',
  'contact@caminteresse.fr'
),
(
  'Voici',
  'https://www.voici.fr',
  'Magazine people n°1 en France. Voici dévoile la vie des célébrités avec humour et bienveillance. Rend accessible les nouvelles tendances lifestyle, mode, beauté & bien-être. Site people le plus visité de France.',
  'https://www.voici.fr/img/voici-logo.svg',
  'Magazine - People & Divertissement',
  8200000,
  9900000,
  'active',
  'contact@voici.fr'
),
(
  'Télé-Loisirs',
  'https://www.programme-tv.net',
  'Marque historique de la presse TV en France. Guide complet des programmes télé, replay et SVOD (Netflix, Canal+, Amazon Prime...). Couvre tous les écrans avec un focus sur la télé, les séries, le streaming et le cinéma.',
  'https://www.programme-tv.net/img/tele-loisirs-logo.svg',
  'Magazine - Télévision & Programmes',
  22100000,
  140000000,
  'active',
  'contact@programme-tv.net'
),
(
  'Télé 2 Semaines',
  'https://www.programme.tv',
  'Magazine TV quinzomadaire proposant 2 semaines de programmes dans le même magazine. Liberté de ton et impertinence sur la télévision et ses coulisses. Rubriques variées pour toute la famille : cinéma, livres, musique, DVD, jeux.',
  'https://www.programme.tv/img/tele-2-semaines-logo.svg',
  'Magazine - Télévision & Programmes',
  7100000,
  12500000,
  'active',
  'contact@programme.tv'
)
ON CONFLICT (name) DO UPDATE SET
  website = EXCLUDED.website,
  description = EXCLUDED.description,
  logo_url = EXCLUDED.logo_url,
  category = EXCLUDED.category,
  audience_size = EXCLUDED.audience_size,
  monthly_visitors = EXCLUDED.monthly_visitors,
  status = EXCLUDED.status,
  contact_email = EXCLUDED.contact_email,
  updated_at = now();

-- Créer un index unique sur le nom si pas déjà existant
CREATE UNIQUE INDEX IF NOT EXISTS idx_media_partners_name ON media_partners(name);

-- Commentaire sur les données
COMMENT ON TABLE media_partners IS 'Partenaires médias du groupe Prisma Media - Données mises à jour novembre 2024';
