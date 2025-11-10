# 🔧 Correction - Persistance des lots programmés

## Problème identifié

Les lots programmés disparaissent après avoir cliqué sur "Enregistrer" dans les paramètres de campagne.

## Corrections appliquées

### 1. Clone profond dans handleChange

**Fichier** : `src/pages/CampaignSettings/DotationStep.tsx`

**Problème** : Les objets imbriqués n'étaient pas clonés, causant des mutations non détectées par React

**Solution** : Clone profond de chaque niveau de l'objet

```typescript
const handleChange = (path: string, value: any) => {
  setForm(prev => {
    const next: any = { ...(prev || {}) };
    const keys = path.split('.');
    let ref = next;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      // Clone profond pour éviter les mutations
      ref[k] = { ...(ref[k] || {}) };  // ← CORRECTION ICI
      ref = ref[k];
    }
    ref[keys[keys.length - 1]] = value;
    return next;
  });
};
```

### 2. Logs de debug ajoutés

Des logs ont été ajoutés pour tracer le flux de données :

**Dans DotationStep** :
- `🎁 [DotationStep] Adding prize` : Quand un lot est ajouté
- `🎁 [DotationStep] Updating prize` : Quand un lot est modifié
- `📝 [DotationStep] handleChange called` : Quand le formulaire est mis à jour
- `📝 [DotationStep] Dotation in form` : État de dotation dans le formulaire

**Dans CampaignSettingsModal** :
- `💾 [CampaignSettingsModal] Dotation data before save` : Données avant sauvegarde
- `💾 [CampaignSettingsModal] Full form data` : Formulaire complet

## Comment tester

### Étape 1 : Hard refresh

Appuyez sur **Cmd+Shift+R** (Mac) ou **Ctrl+Shift+R** (Windows)

### Étape 2 : Ouvrir la console

Appuyez sur **F12** ou **Cmd+Option+I** (Mac)

### Étape 3 : Créer un lot

1. Ouvrir une campagne
2. Paramètres de la campagne
3. Onglet "Dotation"
4. Cliquer sur "Ajouter un lot"

**Logs attendus** :
```javascript
🎁 [DotationStep] Adding prize: {
  id: "prize-1699876543210",
  name: "",
  ...
}
```

### Étape 4 : Remplir les champs

1. Nom : "Test"
2. Date : 09/11/2025
3. Heure : 22:11

**Logs attendus** (pour chaque champ) :
```javascript
🎁 [DotationStep] Updating prize 0, field name: "Test"
📝 [DotationStep] handleChange called: {
  path: "dotation.timed_prizes",
  value: [...]
}
📝 [DotationStep] Dotation in form: {
  timed_prizes: [...]
}
```

### Étape 5 : Enregistrer

Cliquer sur "Enregistrer"

**Logs attendus** :
```javascript
💾 [CampaignSettingsModal] Dotation data before save: {
  timed_prizes: [
    {
      id: "prize-xxx",
      name: "Test",
      date: "2025-11-09",
      time: "22:11",
      enabled: true
    }
  ]
}
```

### Étape 6 : Vérifier la persistance

1. Fermer la modale
2. Rouvrir les paramètres
3. Aller dans l'onglet "Dotation"
4. **Le lot doit toujours être là** ✅

## Diagnostic si le problème persiste

### Scénario 1 : Les logs de DotationStep ne s'affichent pas

**Problème** : Le composant n'est pas monté ou les props ne sont pas passées

**Vérification** :
```typescript
// Dans DotationStep, ajouter au début du composant
console.log('🔍 [DotationStep] Component mounted');
console.log('🔍 [DotationStep] Props:', { form, setForm, campaignId });
console.log('🔍 [DotationStep] isControlled:', isControlled);
```

### Scénario 2 : Dotation in form est vide

**Problème** : handleChange ne met pas à jour correctement

**Vérification** :
```typescript
// Vérifier que setForm est bien la fonction du parent
console.log('🔍 [DotationStep] setForm type:', typeof setForm);
console.log('🔍 [DotationStep] setForm:', setForm);
```

### Scénario 3 : Dotation data before save est vide

**Problème** : Les données ne sont pas dans le state de la modale

**Vérification** :
```typescript
// Dans CampaignSettingsModal, avant la sauvegarde
console.log('🔍 [Modal] Form state:', form);
console.log('🔍 [Modal] Form.dotation:', (form as any).dotation);
```

### Scénario 4 : Les données sont présentes mais disparaissent après reload

**Problème** : Sauvegarde en base de données échoue

**Vérification dans Supabase** :
1. Ouvrir Supabase Dashboard
2. SQL Editor
3. Exécuter :
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

## Solutions alternatives

### Solution 1 : Utiliser JSON.parse/stringify pour clone profond

```typescript
const handleChange = (path: string, value: any) => {
  setForm(prev => {
    // Clone profond complet
    const next = JSON.parse(JSON.stringify(prev || {}));
    const keys = path.split('.');
    let ref = next;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      ref[k] = ref[k] ?? {};
      ref = ref[k];
    }
    ref[keys[keys.length - 1]] = value;
    return next;
  });
};
```

### Solution 2 : Utiliser structuredClone (moderne)

```typescript
const handleChange = (path: string, value: any) => {
  setForm(prev => {
    const next = structuredClone(prev || {});
    const keys = path.split('.');
    let ref = next;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      ref[k] = ref[k] ?? {};
      ref = ref[k];
    }
    ref[keys[keys.length - 1]] = value;
    return next;
  });
};
```

### Solution 3 : Utiliser immer (bibliothèque)

```typescript
import { produce } from 'immer';

const handleChange = (path: string, value: any) => {
  setForm(prev => produce(prev || {}, draft => {
    const keys = path.split('.');
    let ref = draft;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      ref[k] = ref[k] ?? {};
      ref = ref[k];
    }
    ref[keys[keys.length - 1]] = value;
  }));
};
```

## Vérification finale

### Checklist
- [ ] Hard refresh effectué
- [ ] Console ouverte
- [ ] Lot créé avec tous les champs remplis
- [ ] Logs "handleChange" visibles
- [ ] Logs "Dotation data before save" visibles
- [ ] Enregistrement effectué
- [ ] Modale fermée et rouverte
- [ ] Lot toujours présent

### Si tout fonctionne
✅ Le problème est résolu !

### Si le problème persiste
Consultez `DEBUG_DOTATION.md` pour un diagnostic approfondi

## Support

Pour toute question :
1. Vérifier les logs de la console
2. Vérifier la base de données Supabase
3. Consulter `DEBUG_DOTATION.md`
4. Fournir les logs complets

---

**Correction appliquée le 9 novembre 2025**
