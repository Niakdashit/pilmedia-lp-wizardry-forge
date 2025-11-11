# 🧪 Test : Récupération des Images dans la Galerie

## 🎯 Objectif
Vérifier que toutes les campagnes affichent correctement leurs images de fond dans la galerie du dashboard.

## 📋 Checklist de Test

### 1. Ouvrir la Console du Navigateur
- Ouvrir le dashboard (`/dashboard`)
- Ouvrir les DevTools (F12 ou Cmd+Option+I)
- Aller dans l'onglet Console

### 2. Vérifier les Logs de Debug

#### ✅ Campagnes AVEC Images
Vous devriez voir des logs comme :
```
✅ Image trouvée: design.backgroundImage
```

#### ⚠️ Campagnes SANS Images
Vous devriez voir des logs détaillés comme :
```
⚠️ [RecentCampaigns] Campagne sans visuel: roue test
🔍 DEBUG Campaign: roue test
  📊 Structure complète: { id: "...", type: "wheel", name: "roue test" }
  🎨 design: { hasDesign: true, backgroundImage: null, ... }
  ⚙️ canvasConfig: { hasCanvasConfig: true, background: {...}, ... }
  📦 config: { hasConfig: true, canvasConfig: {...}, ... }
  🔗 Toutes les sources d'images possibles: { ... }
  ❌ Aucune source d'image valide trouvée
```

### 3. Analyser les Sources d'Images

Pour chaque campagne sans image, vérifier dans les logs :

#### Sources Vérifiées (dans l'ordre)
1. **design.backgroundImage** ← Source principale
2. **canvasConfig.background.value** ← Structure moderne
3. **config.canvasConfig.background.value** ← Structure imbriquée
4. **design.background** (si URL directe)
5. **banner_url** ← Fallback
6. **thumbnail_url** ← Fallback
7. **modules** (pour type 'article')

### 4. Identifier le Problème

#### Si `design.backgroundImage` est `null` ou `undefined`
→ **L'image n'a pas été sauvegardée correctement**

**Actions à faire :**
1. Ouvrir la campagne dans l'éditeur
2. Vérifier qu'une image de fond est bien définie
3. Sauvegarder la campagne
4. Rafraîchir le dashboard

#### Si `design.backgroundImage` contient une URL `blob:`
→ **L'image est temporaire et n'a pas été uploadée sur le serveur**

**Actions à faire :**
1. Ouvrir la campagne dans l'éditeur
2. Re-uploader l'image de fond (elle sera uploadée sur Supabase Storage)
3. Sauvegarder la campagne
4. Rafraîchir le dashboard

#### Si `config.canvasConfig.background` existe mais pas `design.backgroundImage`
→ **Problème de migration de données**

**Actions à faire :**
1. Ouvrir la campagne dans l'éditeur
2. Sauvegarder la campagne (cela migrera les données)
3. Rafraîchir le dashboard

## 🔧 Commandes de Debug Manuelles

### Dans la Console du Navigateur

```javascript
// Récupérer toutes les campagnes
const { data } = await supabase.from('campaigns').select('*').limit(6);

// Analyser une campagne spécifique
const campaign = data[0]; // Première campagne
console.log('design.backgroundImage:', campaign.design?.backgroundImage);
console.log('canvasConfig.background:', campaign.canvasConfig?.background);
console.log('config.canvasConfig.background:', campaign.config?.canvasConfig?.background);

// Tester la fonction d'extraction
import { extractCampaignBackgroundImage } from './utils/debugCampaignImages';
const image = extractCampaignBackgroundImage(campaign);
console.log('Image extraite:', image);
```

## 📊 Résultats Attendus

### Campagnes Correctement Configurées
- ✅ Image affichée dans la carte
- ✅ Log : `✅ Image trouvée: design.backgroundImage`
- ✅ Pas de warning dans la console

### Campagnes Sans Image Configurée
- ⚠️ Couleur de fond par défaut affichée
- ⚠️ Log : `⚠️ [RecentCampaigns] Campagne sans visuel: ...`
- ⚠️ Debug détaillé dans la console

### Campagnes avec Images Temporaires (blob:)
- ❌ Image non affichée après rafraîchissement
- ⚠️ Log : `⚠️ [RecentCampaigns] Campagne sans visuel: ...`
- 🔧 **Action requise** : Re-uploader l'image

## 🐛 Problèmes Connus

### 1. Images Blob Temporaires
**Symptôme** : Image visible dans l'éditeur mais pas dans la galerie après rafraîchissement

**Cause** : Les URLs `blob:` sont temporaires et ne persistent pas

**Solution** : Re-uploader l'image pour qu'elle soit stockée sur Supabase Storage

### 2. Structure de Données Ancienne
**Symptôme** : `config.canvasConfig.background` existe mais pas `design.backgroundImage`

**Cause** : Campagne créée avec une ancienne version du code

**Solution** : Ouvrir et sauvegarder la campagne pour migrer les données

### 3. Image Non Sauvegardée
**Symptôme** : Toutes les sources d'images sont `null` ou `undefined`

**Cause** : L'image n'a jamais été définie ou la sauvegarde a échoué

**Solution** : Définir une image de fond dans l'éditeur et sauvegarder

## ✅ Validation Finale

Une fois tous les tests effectués :

1. **Toutes les campagnes avec images** → Images affichées ✅
2. **Toutes les campagnes sans images** → Couleurs de fond affichées ✅
3. **Logs de debug clairs** → Facile d'identifier les problèmes ✅
4. **Pas d'erreurs console** → Code stable ✅

## 📝 Notes

- Les logs de debug sont **activés par défaut** pour faciliter le diagnostic
- Les campagnes de type 'article' ont une logique spéciale pour les modules
- Les images doivent être uploadées sur Supabase Storage pour persister
- La priorité de récupération favorise `design.backgroundImage` (source principale)
