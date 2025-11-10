# 🔍 Debug - Lots qui disparaissent

## Problème

Les lots programmés sont affichés dans l'interface mais disparaissent après avoir cliqué sur "Enregistrer".

## Logs de debug ajoutés

Des logs ont été ajoutés pour tracer le problème. Voici comment les utiliser :

### 1. Ouvrir la console du navigateur

Appuyez sur **F12** ou **Cmd+Option+I** (Mac) pour ouvrir les DevTools

### 2. Aller dans l'onglet "Console"

### 3. Créer un lot et observer les logs

Quand vous ajoutez un lot, vous devriez voir :
```javascript
🎁 [DotationStep] Adding prize: {
  id: "prize-1699876543210",
  name: "",
  description: "",
  date: "",
  time: "",
  enabled: true
}

🎁 [DotationStep] Updated prizes: [...]
```

### 4. Remplir les champs et observer les logs

Chaque modification devrait afficher :
```javascript
🎁 [DotationStep] Updating prize 0, field name: "Test"
🎁 [DotationStep] Updated prizes: [...]

🎁 [DotationStep] Updating prize 0, field date: "2025-11-09"
🎁 [DotationStep] Updated prizes: [...]

🎁 [DotationStep] Updating prize 0, field time: "22:11"
🎁 [DotationStep] Updated prizes: [...]
```

### 5. Cliquer sur "Enregistrer" et observer

Vous devriez voir :
```javascript
💾 [CampaignSettingsModal] Dotation data before save: {
  timed_prizes: [
    {
      id: "prize-xxx",
      name: "Test",
      description: "",
      date: "2025-11-09",
      time: "22:11",
      enabled: true
    }
  ]
}

💾 [CampaignSettingsModal] Full form data: {...}
```

## Diagnostic selon les logs

### Cas 1 : Les logs de DotationStep ne s'affichent pas
**Problème** : Le composant DotationStep ne reçoit pas les événements
**Solution** : Vérifier que le composant est bien monté

### Cas 2 : Les logs de DotationStep s'affichent mais pas ceux de CampaignSettingsModal
**Problème** : Les données ne sont pas propagées au formulaire parent
**Solution** : Problème de synchronisation entre DotationStep et la modale

### Cas 3 : Dotation data before save est vide ou undefined
**Problème** : Les données ne sont pas dans le state du formulaire
**Solution** : Le handleChange ne met pas à jour correctement le formulaire

### Cas 4 : Dotation data before save contient les données
**Problème** : Les données sont présentes mais ne sont pas sauvegardées en base
**Solution** : Problème dans useCampaignSettings.upsertSettings

## Actions correctives selon le diagnostic

### Si les données ne sont pas dans le formulaire

Vérifier que `DotationStep` utilise bien le formulaire contrôlé :

```typescript
// Dans DotationStep.tsx
const isControlled = !!props.form && !!props.setForm && !!props.campaignId;
const form = (isControlled ? props.form! : uncontrolledForm);
const setForm = (isControlled ? props.setForm! : setUncontrolledForm);
```

### Si les données ne sont pas sauvegardées

Vérifier dans Supabase :

1. Ouvrir Supabase Dashboard
2. Table Editor → campaign_settings
3. Chercher votre campagne
4. Vérifier la colonne `dotation`

## Test manuel

### Étape 1 : Vider le cache
```javascript
// Dans la console
localStorage.clear();
location.reload();
```

### Étape 2 : Créer un lot simple
- Nom : "Test"
- Date : Aujourd'hui
- Heure : 22:00
- Actif : Oui

### Étape 3 : Enregistrer et vérifier les logs

### Étape 4 : Fermer et rouvrir les paramètres

### Étape 5 : Vérifier si le lot est toujours là

## Vérification en base de données

### Requête SQL pour vérifier

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

### Résultat attendu

```json
{
  "dotation": {
    "timed_prizes": [
      {
        "id": "prize-xxx",
        "name": "Test",
        "description": "",
        "date": "2025-11-09",
        "time": "22:00",
        "enabled": true
      }
    ]
  }
}
```

## Si le problème persiste

### Vérifier le chargement

Ajoutez ce log dans `DotationStep` au chargement :

```typescript
useEffect(() => {
  console.log('🔍 [DotationStep] Form data:', form);
  console.log('🔍 [DotationStep] Timed prizes:', timedPrizes);
}, [form, timedPrizes]);
```

### Vérifier la sauvegarde

Ajoutez ce log dans `useCampaignSettings.upsertSettings` :

```typescript
console.log('💾 [useCampaignSettings] Saving dotation:', values.dotation);
```

## Solutions possibles

### Solution 1 : Forcer la mise à jour du formulaire

Dans `DotationStep`, forcer la mise à jour :

```typescript
const handleChange = (path: string, value: any) => {
  setForm(prev => {
    const next: any = { ...(prev || {}) };
    const keys = path.split('.');
    let ref = next;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      ref[k] = { ...(ref[k] || {}) }; // Clone profond
      ref = ref[k];
    }
    ref[keys[keys.length - 1]] = value;
    
    console.log('📝 [DotationStep] Form updated:', next);
    return next;
  });
};
```

### Solution 2 : Vérifier le type de données

S'assurer que `dotation` est bien un objet et non une chaîne :

```typescript
dotation: (form as any).dotation && typeof (form as any).dotation === 'object'
  ? (form as any).dotation
  : {}
```

### Solution 3 : Sauvegarder manuellement

Si le problème persiste, sauvegarder directement :

```typescript
// Dans DotationStep
const handleSaveManually = async () => {
  if (!campaignId) return;
  
  const { data, error } = await supabase
    .from('campaign_settings')
    .update({
      dotation: {
        timed_prizes: timedPrizes
      }
    })
    .eq('campaign_id', campaignId);
    
  if (error) {
    console.error('Error saving:', error);
  } else {
    console.log('Saved successfully:', data);
  }
};
```

## Contact support

Si aucune solution ne fonctionne, fournir :
1. Les logs de la console (copier/coller)
2. L'ID de la campagne
3. Le contenu de la colonne `dotation` dans Supabase
4. Les étapes exactes pour reproduire le problème

---

**Debug créé le 9 novembre 2025**
