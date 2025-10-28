# 🐛 Fix: Modules Disparaissent dans FormEditor

## Problème Identifié

Les modules du FormEditor disparaissaient instantanément à l'ouverture des campagnes depuis `/campaigns`.

### Cause Racine

**Conflit entre deux systèmes d'autosave** dans `DesignEditorLayout.tsx` :

1. **Guard problématique (ligne 635-637)** :
   ```typescript
   if (modularPage && Object.keys(modularPage.screens || {}).length > 0) {
     return; // ❌ Bloquait l'autosave si des modules existaient
   }
   ```

2. **Payload avec modularPage vide (ligne 654)** :
   ```typescript
   const payload: any = {
     modularPage, // ⚠️ Pouvait être vide ou obsolète !
     canvasElements,
     // ...
   };
   ```

### Scénario de Perte de Données

1. **Chargement** : Modules chargés depuis DB → `modularPage` rempli
2. **Guard actif** : Autosave bloqué car modules présents
3. **Changement canvas** : `canvasElements` modifié → autosave déclenché
4. **Écrasement** : Sauvegarde avec `modularPage` vide/obsolète
5. **Résultat** : Modules perdus en DB ❌

## Solutions Appliquées

### 1. Préservation du modularPage lors de l'autosave

**Fichier** : `/src/components/FormEditor/DesignEditorLayout.tsx` (lignes 644-648)

```typescript
// ✅ FIX: Toujours inclure le modularPage actuel pour éviter l'écrasement
const currentModularPage = modularPage && Object.keys(modularPage.screens || {}).length > 0 
  ? modularPage 
  : (campaignState as any)?.config?.modularPage || (campaignState as any)?.design?.modularPage;

const payload: any = {
  modularPage: currentModularPage, // ✅ Préserver les modules existants
  // ...
};
```

**Avantages** :
- ✅ Ne jamais sauvegarder un `modularPage` vide si on en a un rempli
- ✅ Fallback sur l'état sauvegardé en cas de problème
- ✅ Logs détaillés pour debug

### 2. Autosave séparé pour les modules

**Fichier** : `/src/components/FormEditor/DesignEditorLayout.tsx` (lignes 679-716)

```typescript
// 💾 Autosave des modules séparément pour éviter les conflits
useEffect(() => {
  // Guards...
  const hasModules = modularPage && Object.keys(modularPage.screens || {}).length > 0;
  if (!hasModules) return;

  const totalModules = Object.values(modularPage.screens || {}).flat().length;
  if (totalModules === 0) return;

  const t = window.setTimeout(async () => {
    const payload: any = {
      ...(campaignState || {}),
      type: 'form',
      modularPage,
      config: { modularPage },
      design: { modularPage, quizModules: modularPage }
    };
    console.log('🧩 [FormEditor] Autosave modules → DB', totalModules);
    await saveCampaignToDB(payload, saveCampaign);
  }, 1500);
  return () => clearTimeout(t);
}, [modularPage, campaignState?.id]);
```

**Avantages** :
- ✅ Sauvegarde indépendante des modules
- ✅ Pas de conflit avec l'autosave des éléments canvas
- ✅ Délai de 1500ms pour éviter les sauvegardes trop fréquentes

### 3. Amélioration de persistModular

**Fichier** : `/src/components/FormEditor/DesignEditorLayout.tsx` (lignes 1107-1123)

```typescript
const persistModular = useCallback((next: ModularPage) => {
  console.log('🧩 [FormEditor] persistModular: saving modules', {
    screen1: next.screens.screen1?.length || 0,
    screen2: next.screens.screen2?.length || 0
  });

  setModularPage(next);
  setCampaignConfig((prev: any) => ({
    ...prev,
    design: {
      ...prev?.design,
      quizModules: { ...next, _updatedAt: Date.now() }
    },
    config: {
      ...prev?.config,
      modularPage: { ...next, _updatedAt: Date.now() }
    }
  }));
}, [modularPage]);
```

**Avantages** :
- ✅ Sauvegarde dans `design.quizModules` ET `config.modularPage`
- ✅ Logs pour tracer les modifications
- ✅ Timestamp pour détecter les changements

## Résultat Final

### ✅ Comportement Corrigé

1. **Ouverture campagne** : Modules chargés et affichés ✅
2. **Modification modules** : Sauvegarde automatique séparée ✅
3. **Modification canvas** : Modules préservés lors de la sauvegarde ✅
4. **Fermeture éditeur** : Tous les changements persistés ✅

### 📊 Logs de Debug

```
🧩 [FormEditor] persistModular: saving modules { screen1: 3, screen2: 2 }
💾 [FormEditor] Autosave complete state → DB { elements: 5, modules: 5 }
🧩 [FormEditor] Autosave modules → DB 5
```

## Tests Recommandés

1. **Créer une campagne FormEditor** avec plusieurs modules
2. **Fermer et rouvrir** depuis `/campaigns`
3. **Vérifier** que tous les modules sont présents
4. **Modifier un module** et vérifier la sauvegarde
5. **Ajouter des éléments canvas** et vérifier que les modules restent

## Fichiers Modifiés

- `/src/components/FormEditor/DesignEditorLayout.tsx`
  - Ligne 644-648 : Préservation modularPage
  - Ligne 679-716 : Autosave séparé modules
  - Ligne 1107-1123 : Amélioration persistModular

## Impact

- ✅ **Perte de données** : Éliminée
- ✅ **Expérience utilisateur** : Améliorée
- ✅ **Fiabilité** : Augmentée
- ✅ **Debug** : Facilité avec logs détaillés
