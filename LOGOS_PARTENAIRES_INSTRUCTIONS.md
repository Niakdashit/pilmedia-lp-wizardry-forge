# 📋 Instructions pour Récupérer les Logos Officiels des Partenaires

## 🎯 Logos à Récupérer

Les logos officiels doivent être téléchargés depuis les sites web des marques Prisma Media et hébergés dans votre projet.

### 1. **GEO**
- **Site officiel** : https://www.geo.fr
- **Logo à récupérer** : Logo GEO en SVG ou PNG haute résolution
- **Chemin suggéré** : `/public/logos/partners/geo-logo.svg`
- **Couleurs** : Vert/Bleu (couleurs nature)

### 2. **Capital**
- **Site officiel** : https://www.capital.fr
- **Logo à récupérer** : Logo Capital en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/capital-logo.svg`
- **Couleurs** : Rouge/Blanc

### 3. **Femme Actuelle**
- **Site officiel** : https://www.femmeactuelle.fr
- **Logo à récupérer** : Logo Femme Actuelle en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/femme-actuelle-logo.svg`
- **Couleurs** : Rose/Violet

### 4. **Cuisine Actuelle**
- **Site officiel** : https://www.cuisineactuelle.fr
- **Logo à récupérer** : Logo Cuisine Actuelle en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/cuisine-actuelle-logo.svg`
- **Couleurs** : Rouge/Orange

### 5. **Ça m'intéresse**
- **Site officiel** : https://www.caminteresse.fr
- **Logo à récupérer** : Logo Ça m'intéresse en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/ca-minteresse-logo.svg`
- **Couleurs** : Bleu/Jaune

### 6. **Voici**
- **Site officiel** : https://www.voici.fr
- **Logo à récupérer** : Logo Voici en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/voici-logo.svg`
- **Couleurs** : Rose/Fuchsia

### 7. **Télé-Loisirs**
- **Site officiel** : https://www.programme-tv.net
- **Logo à récupérer** : Logo Télé-Loisirs en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/tele-loisirs-logo.svg`
- **Couleurs** : Rouge/Bleu

### 8. **Télé 2 Semaines**
- **Site officiel** : https://www.programme.tv
- **Logo à récupérer** : Logo Télé 2 Semaines en SVG ou PNG
- **Chemin suggéré** : `/public/logos/partners/tele-2-semaines-logo.svg`
- **Couleurs** : Bleu/Rouge

---

## 🔧 Méthode de Récupération

### Option 1 : Inspection du Site Web
1. Ouvrir le site web de la marque
2. Clic droit sur le logo → "Inspecter l'élément"
3. Trouver l'URL du logo dans le code HTML
4. Télécharger le fichier SVG ou PNG

### Option 2 : Contact Prisma Media
Pour obtenir les logos officiels en haute résolution :
- **Email** : contact@prismamedia.com
- **Site** : https://www.prismamedia.com/marques/
- Demander le kit média/presse avec les logos officiels

### Option 3 : Page Presse Prisma Media
Visiter : https://www.prismamedia.com/
- Section "Nos Marques"
- Télécharger les assets officiels

---

## 📝 Mise à Jour de la Migration SQL

Une fois les logos téléchargés et placés dans `/public/logos/partners/`, mettre à jour le fichier de migration :

```sql
-- Exemple de mise à jour
UPDATE media_partners SET logo_url = '/logos/partners/geo-logo.svg' WHERE name = 'GEO';
UPDATE media_partners SET logo_url = '/logos/partners/capital-logo.svg' WHERE name = 'Capital';
UPDATE media_partners SET logo_url = '/logos/partners/femme-actuelle-logo.svg' WHERE name = 'Femme Actuelle';
UPDATE media_partners SET logo_url = '/logos/partners/cuisine-actuelle-logo.svg' WHERE name = 'Cuisine Actuelle';
UPDATE media_partners SET logo_url = '/logos/partners/ca-minteresse-logo.svg' WHERE name = 'Ça m''intéresse';
UPDATE media_partners SET logo_url = '/logos/partners/voici-logo.svg' WHERE name = 'Voici';
UPDATE media_partners SET logo_url = '/logos/partners/tele-loisirs-logo.svg' WHERE name = 'Télé-Loisirs';
UPDATE media_partners SET logo_url = '/logos/partners/tele-2-semaines-logo.svg' WHERE name = 'Télé 2 Semaines';
```

---

## ✅ Checklist

- [ ] Créer le dossier `/public/logos/partners/`
- [ ] Télécharger les 8 logos officiels
- [ ] Vérifier que les logos sont en format SVG (préféré) ou PNG haute résolution
- [ ] Placer les logos dans le dossier
- [ ] Mettre à jour la migration SQL avec les bons chemins
- [ ] Exécuter la migration dans Supabase
- [ ] Vérifier l'affichage sur la page Partenaires

---

## 📊 Données Insérées

| Marque | Audience Mensuelle | Visiteurs Web | Catégorie |
|--------|-------------------|---------------|-----------|
| GEO | 7,4M | 5,3M | Voyage & Nature |
| Capital | 10,7M | 8,5M | Économie & Finance |
| Femme Actuelle | 20M | 7,3M | Féminin |
| Cuisine Actuelle | 5,2M | 4,1M | Cuisine |
| Ça m'intéresse | 6,8M | 3,9M | Culture |
| Voici | 8,2M | 9,9M | People |
| Télé-Loisirs | 22,1M | 140M visites/mois | Télévision |
| Télé 2 Semaines | 7,1M | 12,5M | Télévision |

**Total Audience Cumulée** : ~87,5 millions de personnes touchées mensuellement
