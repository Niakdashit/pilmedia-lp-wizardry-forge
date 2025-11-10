# 🔧 Fix: Erreur 409 Conflict - Sauvegarde Dotation

## 🐛 Problème Identifié

**Erreur 409 (Conflict)** lors de la sauvegarde des lots :
```
Failed to load resource: the server responded with a status of 409
```

### Cause

L'erreur 409 indique un **conflit avec la contrainte unique** `unique_campaign_dotation` sur la colonne `campaign_id` dans la table `dotation_configs`.

Le problème : `upsert()` sans spécifier explicitement la colonne de conflit ne fonctionnait pas correctement.

## ✅ Solution Appliquée

### Modification du Code

Ajout du paramètre `onConflict` dans toutes les opérations `upsert()` :

```typescript
// ❌ AVANT (ne fonctionnait pas)
await supabase
  .from('dotation_configs')
  .upsert({
    campaign_id: campaignId,
    prizes: newPrizes,
    // ...
  });

// ✅ APRÈS (fonctionne)
await supabase
  .from('dotation_configs')
  .upsert({
    campaign_id: campaignId,
    prizes: newPrizes,
    // ...
  }, {
    onConflict: 'campaign_id'  // ← Spécifie la colonne de conflit
  })
  .select();  // ← Retourne les données insérées/mises à jour
```

### Fichiers Modifiés

**Fichier** : `src/components/CampaignSettings/DotationPanel/index.tsx`

**Fonctions corrigées** :
1. `saveConfig()` - Sauvegarde manuelle
2. `savePrize()` - Sauvegarde automatique après ajout/modification
3. `deletePrize()` - Sauvegarde automatique après suppression

### Logs Ajoutés

Des logs détaillés ont été ajoutés pour faciliter le debugging :

```typescript
console.log('💾 [DotationPanel] Auto-saving after prize add/edit');
console.log('📦 [DotationPanel] Data to save:', {
  campaign_id: campaignId,
  prizes_count: newPrizes.length,
  prizes: newPrizes
});

// En cas d'erreur
console.error('❌ [DotationPanel] Error details:', {
  message: error.message,
  code: error.code,
  details: error.details,
  hint: error.hint
});
```

## 🧪 Comment Tester

1. **Rafraîchir la page** (Cmd+R ou F5)
2. **Ouvrir une campagne**
3. **Aller dans "Paramètres de la campagne" → Onglet "Dotation"**
4. **Créer un lot** :
   - Cliquer sur "Ajouter un lot"
   - Remplir les informations
   - Cliquer sur "Enregistrer"
5. **Vérifier dans la console** :
   ```
   💾 [DotationPanel] Auto-saving after prize add/edit
   📦 [DotationPanel] Data to save: {...}
   ✅ [DotationPanel] Prize saved to database
   ```
6. **Fermer et rouvrir la modale** → Le lot doit être toujours là ✅

## 📊 Vérification en Base de Données

### Via Supabase Dashboard

1. **Ouvrir** : https://supabase.com/dashboard/project/vmkwascgjntopgkbmctv
2. **Table Editor** → `dotation_configs`
3. **Vérifier** qu'il y a UNE SEULE ligne par campagne

### Via SQL

```sql
-- Vérifier qu'il n'y a pas de doublons
SELECT 
  campaign_id,
  COUNT(*) as count
FROM dotation_configs
GROUP BY campaign_id
HAVING COUNT(*) > 1;

-- Doit retourner 0 lignes (pas de doublons)
```

## 🔍 Comprendre l'Erreur 409

### Qu'est-ce qu'une erreur 409 ?

**409 Conflict** = Le serveur ne peut pas traiter la requête car elle entre en conflit avec l'état actuel de la ressource.

### Dans notre cas :

- La table `dotation_configs` a une contrainte `UNIQUE(campaign_id)`
- Sans `onConflict`, Supabase ne sait pas quoi faire quand il trouve une ligne existante
- Avec `onConflict: 'campaign_id'`, Supabase sait qu'il doit **mettre à jour** la ligne existante au lieu d'en créer une nouvelle

## 📝 Comportement Attendu

### Première sauvegarde (INSERT)
```sql
INSERT INTO dotation_configs (campaign_id, prizes, ...)
VALUES ('454a315f-...', '[...]', ...)
```
✅ Crée une nouvelle ligne

### Sauvegardes suivantes (UPDATE)
```sql
INSERT INTO dotation_configs (campaign_id, prizes, ...)
VALUES ('454a315f-...', '[...]', ...)
ON CONFLICT (campaign_id) DO UPDATE SET
  prizes = EXCLUDED.prizes,
  updated_at = EXCLUDED.updated_at
```
✅ Met à jour la ligne existante

## ⚠️ Erreur 406 (Not Acceptable)

Si vous voyez aussi des erreurs 406, c'est probablement lié aux headers HTTP. Cela peut être résolu en ajoutant `.select()` après `.upsert()` pour forcer le retour des données.

```typescript
.upsert({...}, { onConflict: 'campaign_id' })
.select();  // ← Force le retour des données
```

## 🎉 Résultat

Les lots sont maintenant **correctement sauvegardés** en base de données :
- ✅ Pas d'erreur 409
- ✅ Une seule ligne par campagne
- ✅ Les lots persistent après fermeture de la modale
- ✅ Logs détaillés pour debugging

---

**Date** : 10 Novembre 2025  
**Fichier modifié** : `src/components/CampaignSettings/DotationPanel/index.tsx`
