# 🤝 Partenaires Médias Prisma Media - Guide Complet

## 📊 Données Intégrées

J'ai récupéré et intégré les informations les plus récentes (novembre 2024) pour les 8 marques médias suivantes :

### 1. **GEO** 🌍
- **Site** : https://www.geo.fr
- **Audience** : 7,4 millions de personnes/mois
- **Visiteurs web** : 5,3 millions/mois
- **Catégorie** : Magazine - Voyage & Nature
- **Description** : Magazine de voyage, nature et environnement à impact positif

### 2. **Capital** 💰
- **Site** : https://www.capital.fr
- **Audience** : 10,7 millions de personnes/mois
- **Visiteurs web** : 8,5 millions/mois
- **Catégorie** : Magazine - Économie & Finance
- **Description** : Premier magazine économique de France

### 3. **Femme Actuelle** 👩
- **Site** : https://www.femmeactuelle.fr
- **Audience** : 20 millions de personnes/mois
- **Visiteurs web** : 7,3 millions/mois
- **Catégorie** : Magazine - Féminin
- **Description** : Média féminin n°1 en France depuis 40 ans

### 4. **Cuisine Actuelle** 🍳
- **Site** : https://www.cuisineactuelle.fr
- **Audience** : 5,2 millions de personnes/mois
- **Visiteurs web** : 4,1 millions/mois
- **Catégorie** : Magazine - Cuisine & Gastronomie
- **Description** : Plus de 65 000 recettes 100% fait maison

### 5. **Ça m'intéresse** 🔬
- **Site** : https://www.caminteresse.fr
- **Audience** : 6,8 millions de personnes/mois
- **Visiteurs web** : 3,9 millions/mois
- **Catégorie** : Magazine - Culture & Découverte
- **Description** : Magazine de la curiosité et du savoir

### 6. **Voici** ⭐
- **Site** : https://www.voici.fr
- **Audience** : 8,2 millions de personnes/mois
- **Visiteurs web** : 9,9 millions/mois
- **Catégorie** : Magazine - People & Divertissement
- **Description** : Magazine people n°1 en France

### 7. **Télé-Loisirs** 📺
- **Site** : https://www.programme-tv.net
- **Audience** : 22,1 millions de personnes/mois
- **Visiteurs web** : 140 millions de visites/mois
- **Catégorie** : Magazine - Télévision & Programmes
- **Description** : Guide complet TV, replay et SVOD

### 8. **Télé 2 Semaines** 📅
- **Site** : https://www.programme.tv
- **Audience** : 7,1 millions de personnes/mois
- **Visiteurs web** : 12,5 millions/mois
- **Catégorie** : Magazine - Télévision & Programmes
- **Description** : 2 semaines de programmes TV

---

## 🎯 Audience Totale Cumulée

**87,5 millions de personnes** touchées mensuellement par ces 8 marques médias !

---

## 🚀 Installation et Configuration

### Étape 1 : Exécuter la Migration SQL

```bash
# Dans le dashboard Supabase, aller dans SQL Editor
# Copier et exécuter le contenu de :
supabase/migrations/20251111000001_insert_prisma_media_partners.sql
```

### Étape 2 : Télécharger les Logos (Optionnel)

```bash
# Rendre le script exécutable
chmod +x scripts/download-partner-logos.sh

# Exécuter le script
./scripts/download-partner-logos.sh
```

**Note** : Le script télécharge les favicons par défaut. Pour les vrais logos officiels, voir `LOGOS_PARTENAIRES_INSTRUCTIONS.md`

### Étape 3 : Vérifier l'Affichage

1. Lancer l'application : `npm run dev`
2. Naviguer vers `/partnerships`
3. Vérifier que les 8 partenaires s'affichent correctement

---

## 📁 Fichiers Créés

### 1. Migration SQL
- **Fichier** : `supabase/migrations/20251111000001_insert_prisma_media_partners.sql`
- **Contenu** : Insertion des 8 partenaires médias avec toutes leurs données
- **Fonctionnalité** : Gère les conflits (ON CONFLICT DO UPDATE)

### 2. Instructions Logos
- **Fichier** : `LOGOS_PARTENAIRES_INSTRUCTIONS.md`
- **Contenu** : Guide détaillé pour récupérer les logos officiels
- **Méthodes** : Inspection web, contact Prisma Media, page presse

### 3. Script de Téléchargement
- **Fichier** : `scripts/download-partner-logos.sh`
- **Contenu** : Script bash pour télécharger automatiquement les logos
- **Usage** : `./scripts/download-partner-logos.sh`

---

## 🔧 Structure de la Base de Données

### Table `media_partners`

```sql
CREATE TABLE media_partners (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  website text,
  description text,
  logo_url text,
  category text,
  audience_size integer,      -- Audience totale mensuelle
  monthly_visitors integer,   -- Visiteurs web mensuels
  status text,                -- 'active', 'pending', etc.
  contact_email text,
  created_at timestamptz,
  updated_at timestamptz
);
```

---

## 📊 Statistiques par Catégorie

### Magazines Féminins
- **Femme Actuelle** : 20M d'audience

### Économie & Finance
- **Capital** : 10,7M d'audience

### Télévision & Programmes
- **Télé-Loisirs** : 22,1M d'audience
- **Télé 2 Semaines** : 7,1M d'audience

### Cuisine & Gastronomie
- **Cuisine Actuelle** : 5,2M d'audience

### Voyage & Nature
- **GEO** : 7,4M d'audience

### Culture & Découverte
- **Ça m'intéresse** : 6,8M d'audience

### People & Divertissement
- **Voici** : 8,2M d'audience

---

## 🎨 Logos Officiels

Les logos doivent être placés dans `/public/logos/partners/` :

```
public/
└── logos/
    └── partners/
        ├── geo-logo.svg
        ├── capital-logo.svg
        ├── femme-actuelle-logo.svg
        ├── cuisine-actuelle-logo.svg
        ├── ca-minteresse-logo.svg
        ├── voici-logo.svg
        ├── tele-loisirs-logo.svg
        └── tele-2-semaines-logo.svg
```

---

## 📞 Contact Prisma Media

Pour obtenir les assets officiels et établir des partenariats :

- **Site** : https://www.prismamedia.com
- **Email** : contact@prismamedia.com
- **Marques** : https://www.prismamedia.com/marques/

---

## ✅ Checklist de Déploiement

- [x] Migration SQL créée
- [x] Données récupérées depuis les sources officielles
- [x] Script de téléchargement des logos créé
- [x] Instructions détaillées fournies
- [ ] Migration exécutée dans Supabase
- [ ] Logos officiels téléchargés
- [ ] Logos placés dans `/public/logos/partners/`
- [ ] URLs des logos mises à jour dans la migration
- [ ] Page Partenaires testée
- [ ] Affichage vérifié sur mobile et desktop

---

## 🔄 Mise à Jour des Données

Les données d'audience évoluent. Pour les mettre à jour :

1. Visiter https://www.prismamedia.com/marques/
2. Récupérer les nouvelles statistiques
3. Mettre à jour la migration SQL
4. Exécuter un UPDATE dans Supabase

---

## 📝 Notes Importantes

- **Sources** : Toutes les données proviennent des sites officiels Prisma Media (novembre 2024)
- **Audience** : Les chiffres d'audience incluent tous les supports (magazine, web, app, réseaux sociaux)
- **Visiteurs web** : Chiffres Médiamétrie Internet Global
- **Statut** : Tous les partenaires sont marqués comme 'active'
- **Logos** : Les URLs actuelles dans la migration sont des placeholders à remplacer

---

## 🎯 Utilisation dans l'Application

La page `/partnerships` affiche automatiquement tous les partenaires actifs avec :

- Logo de la marque
- Nom et catégorie
- Description
- Statistiques d'audience
- Lien vers le site web
- Filtres par catégorie
- Recherche textuelle

---

## 🚀 Prochaines Étapes

1. **Exécuter la migration** dans Supabase
2. **Télécharger les logos officiels** (voir LOGOS_PARTENAIRES_INSTRUCTIONS.md)
3. **Tester la page** Partenaires
4. **Contacter Prisma Media** pour établir des partenariats officiels
5. **Configurer les dotations** concours avec chaque média

---

**Créé le** : 11 novembre 2024  
**Source des données** : Sites officiels Prisma Media  
**Dernière mise à jour** : Novembre 2024
