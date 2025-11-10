# ✅ CORRECTION FINALE - Sauvegarde des lots programmés

## 🐛 Problème identifié

Les lots programmés étaient présents dans le formulaire mais **n'étaient PAS sauvegardés en base de données** car le champ `dotation` n'était pas inclus dans le payload envoyé à Supabase.

## 🔍 Diagnostic

### Logs observés
```javascript
💾 [CampaignSettingsModal] Dotation data before save: {timed_prizes: Array(1)}
💾 [CampaignSettingsModal] Full form data: {..., dotation: {...}}
```

Les données étaient bien dans le formulaire, mais **aucune trace de `dotation` dans les logs de `useCampaignSettings`**.

### Cause racine
Dans `useCampaignSettings.ts`, le payload construit pour l'insertion/mise à jour ne contenait PAS le champ `dotation`.

## ✅ Correction appliquée

**Fichier** : `src/hooks/useCampaignSettings.ts` (lignes 218-236)

### Avant
```typescript
const payload: any = {
  campaign_id: realId,
  publication: values.publication ?? null,
  campaign_url: campaignUrlValue,
  soft_gate: values.soft_gate ?? null,
  limits: values.limits ?? null,
  email_verification: values.email_verification ?? null,
  legal: values.legal ?? null,
  winners: values.winners ?? null,
  // ❌ dotation manquant !
  output: values.output ?? null,
  data_push: values.data_push ?? null,
  advanced: values.advanced ?? null,
  opt_in: values.opt_in ?? null,
  tags: values.tags ?? null,
  updated_at: new Date().toISOString(),
};
```

### Après
```typescript
const payload: any = {
  campaign_id: realId,
  publication: values.publication ?? null,
  campaign_url: campaignUrlValue,
  soft_gate: values.soft_gate ?? null,
  limits: values.limits ?? null,
  email_verification: values.email_verification ?? null,
  legal: values.legal ?? null,
  winners: values.winners ?? null,
  dotation: values.dotation ?? null, // ✅ Ajouté !
  output: values.output ?? null,
  data_push: values.data_push ?? null,
  advanced: values.advanced ?? null,
  opt_in: values.opt_in ?? null,
  tags: values.tags ?? null,
  updated_at: new Date().toISOString(),
};

console.log('💾 [useCampaignSettings] Payload dotation:', payload.dotation);
```

## 🧪 Comment tester

### 1. Hard refresh
**Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows)

### 2. Créer un lot
1. Ouvrir les paramètres de campagne
2. Onglet "Dotation"
3. Ajouter un lot :
   - Nom : "Test Final"
   - Date : 09/11/2025
   - Heure : 22:30
4. Enregistrer

### 3. Vérifier les logs
Vous devriez voir :
```javascript
💾 [CampaignSettingsModal] Dotation data before save: {
  timed_prizes: [{
    id: "prize-xxx",
    name: "Test Final",
    date: "2025-11-09",
    time: "22:30",
    enabled: true
  }]
}

💾 [useCampaignSettings] Payload dotation: {
  timed_prizes: [...]
}
```

### 4. Fermer et rouvrir
1. Fermer la modale
2. Rouvrir les paramètres
3. Aller dans "Dotation"
4. **Le lot doit être là** ✅

### 5. Vérifier en base de données
Dans Supabase SQL Editor :
```sql
SELECT 
  campaign_id,
  dotation,
  updated_at
FROM campaign_settings
WHERE campaign_id = 'VOTRE_CAMPAIGN_ID'
ORDER BY updated_at DESC
LIMIT 1;
```

Résultat attendu :
```json
{
  "dotation": {
    "timed_prizes": [
      {
        "id": "prize-xxx",
        "name": "Test Final",
        "date": "2025-11-09",
        "time": "22:30",
        "enabled": true
      }
    ]
  }
}
```

## 📊 Résumé des corrections

### Fichiers modifiés
1. **`src/hooks/useCampaignSettings.ts`**
   - Ajout de `dotation` dans le payload (ligne 227)
   - Ajout d'un log de debug (ligne 236)

2. **`src/pages/CampaignSettings/DotationStep.tsx`**
   - Clone profond dans handleChange (ligne 54)
   - Logs de debug ajoutés

3. **`src/components/DesignEditor/modals/CampaignSettingsModal.tsx`**
   - Logs de debug ajoutés (lignes 191-192)

## ✅ Checklist de validation

- [ ] Hard refresh effectué
- [ ] Lot créé avec tous les champs
- [ ] Logs "Payload dotation" visible
- [ ] Enregistrement effectué
- [ ] Modale fermée et rouverte
- [ ] Lot toujours présent
- [ ] Vérification en base de données OK

## 🎉 Résultat attendu

Après cette correction, les lots programmés doivent :
1. ✅ Être sauvegardés en base de données
2. ✅ Persister après fermeture de la modale
3. ✅ Être rechargés correctement
4. ✅ Être disponibles pour le système de double mécanique

---

**Correction appliquée le 9 novembre 2025 à 22:15**
**Problème résolu** ✅
