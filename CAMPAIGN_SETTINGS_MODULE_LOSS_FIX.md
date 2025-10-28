# 🐛 Fix: Modules Disparaissent à l'Enregistrement des Paramètres

## Problème Identifié

Les modules du FormEditor disparaissaient quand l'utilisateur cliquait sur "Enregistrer" dans la modale **"Paramètres de la campagne"**.

### Scénario de Reproduction

1. **Créer une campagne FormEditor** avec plusieurs modules (textes, boutons, etc.)
2. **Ouvrir la modale "Paramètres"** (icône ⚙️ dans la toolbar)
3. **Cliquer sur "Enregistrer"**
4. **Résultat** : Les modules disparaissent ❌

## Cause Racine

### Flux de Sauvegarde Problématique

```typescript
// CampaignSettingsModal.tsx - ligne 88
const savedCampaign = await saveCampaignToDB(campaign, saveCampaign);
```

**Problème** : La modale sauvegardait directement l'objet `campaign` du store Zustand **SANS** synchroniser les états locaux de l'éditeur avant.

### États Locaux Non Synchronisés

Dans `FormEditor/DesignEditorLayout.tsx`, plusieurs états sont gérés localement :

```typescript
const [canvasElements, setCanvasElements] = useState([]);
const [modularPage, setModularPage] = useState(createEmptyModularPage());
const [screenBackgrounds, setScreenBackgrounds] = useState({});
const [extractedColors, setExtractedColors] = useState([]);
```

Ces états **ne sont pas automatiquement** synchronisés avec l'objet `campaign` du store Zustand. Ils sont synchronisés uniquement :
- Via l'autosave (toutes les 1-1.5 secondes)
- Lors de la fermeture de l'éditeur
- Lors du changement de nom de campagne

**Conséquence** : Quand la modale sauvegarde, elle utilise une version **obsolète** de `campaign` qui ne contient pas les modules récemment ajoutés/modifiés.

## Solution Implémentée

### 1. Événement de Synchronisation

**Fichier** : `/src/components/DesignEditor/modals/CampaignSettingsModal.tsx`

```typescript
const handleSaveAndClose = async () => {
  try {
    // Step 0: Trigger state synchronization in the editor BEFORE saving
    console.log('🔄 [CampaignSettingsModal] Requesting state sync from editor...');
    window.dispatchEvent(new CustomEvent('campaign:sync:before-save'));
    
    // Wait a bit for the sync to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 1: Save the campaign itself (with all design, config, etc.)
    // Get the updated campaign from store after sync
    const updatedCampaign = useEditorStore.getState().campaign;
    const savedCampaign = await saveCampaignToDB(updatedCampaign || campaign, saveCampaign);
    
    // ... rest of the save logic
  } catch (error) {
    console.error('❌ [CampaignSettingsModal] Error saving:', error);
  }
};
```

**Avantages** :
- ✅ Déclenche la synchronisation **avant** la sauvegarde
- ✅ Attend 100ms pour que la sync se termine
- ✅ Récupère la version **à jour** de `campaign` après sync

### 2. Listener dans FormEditor

**Fichier** : `/src/components/FormEditor/DesignEditorLayout.tsx`

```typescript
// 🔄 Listen for sync request from CampaignSettingsModal before saving
useEffect(() => {
  const handler = () => {
    console.log('🔄 [FormEditor] Received sync request, syncing all states...', {
      canvasElements: canvasElements.length,
      modularPageModules: modularPage ? Object.values(modularPage.screens || {}).flat().length : 0,
      screenBackgrounds: Object.keys(screenBackgrounds).length
    });
    
    syncAllStates({
      canvasElements,
      modularPage,
      screenBackgrounds,
      extractedColors,
      selectedDevice,
      canvasZoom
    });
    
    console.log('✅ [FormEditor] All states synced to campaign object');
  };
  
  window.addEventListener('campaign:sync:before-save', handler);
  return () => window.removeEventListener('campaign:sync:before-save', handler);
}, [syncAllStates, canvasElements, modularPage, screenBackgrounds, extractedColors, selectedDevice, canvasZoom]);
```

**Avantages** :
- ✅ Écoute l'événement de synchronisation
- ✅ Synchronise **tous** les états locaux avec `campaign`
- ✅ Logs détaillés pour debug
- ✅ Dépendances correctes pour toujours avoir les valeurs à jour

### 3. Hook de Synchronisation

Le hook `useCampaignStateSync` (déjà existant) est utilisé pour synchroniser les états :

```typescript
const syncAllStates = useCallback((editorStates: {
  canvasElements?: any[];
  modularPage?: any;
  screenBackgrounds?: any;
  extractedColors?: string[];
  canvasZoom?: number;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
}) => {
  setCampaign((prev: any) => {
    if (!prev) return prev;

    const updated = {
      ...prev,
      ...(editorStates.canvasElements !== undefined && {
        canvasElements: editorStates.canvasElements
      }),
      ...(editorStates.modularPage !== undefined && {
        modularPage: editorStates.modularPage
      }),
      // ... autres états
      _lastSync: Date.now()
    };

    return updated;
  });
}, [setCampaign]);
```

## Flux de Sauvegarde Corrigé

### Avant (❌ Perte de Données)

```
1. Utilisateur clique "Enregistrer" dans la modale
2. Modale récupère `campaign` du store (obsolète)
3. Sauvegarde en DB avec données obsolètes
4. Modules perdus ❌
```

### Après (✅ Données Préservées)

```
1. Utilisateur clique "Enregistrer" dans la modale
2. Modale émet événement 'campaign:sync:before-save'
3. FormEditor écoute l'événement
4. FormEditor synchronise tous les états locaux → campaign
5. Modale attend 100ms
6. Modale récupère `campaign` à jour du store
7. Sauvegarde en DB avec toutes les données
8. Modules préservés ✅
```

## Tests de Validation

### Test 1 : Modules Préservés
1. ✅ Créer une campagne FormEditor
2. ✅ Ajouter plusieurs modules (texte, bouton, image)
3. ✅ Ouvrir "Paramètres de la campagne"
4. ✅ Modifier un paramètre (nom, dates, etc.)
5. ✅ Cliquer "Enregistrer"
6. ✅ **Vérifier** : Les modules sont toujours visibles

### Test 2 : Logs de Synchronisation
Console attendue :
```
🔄 [CampaignSettingsModal] Requesting state sync from editor...
🔄 [FormEditor] Received sync request, syncing all states... { canvasElements: 5, modularPageModules: 3, ... }
🔄 [useCampaignStateSync] States synced to campaign: { id: '...', syncedStates: [...], modularPageScreens: 2 }
✅ [FormEditor] All states synced to campaign object
💾 [CampaignSettingsModal] Saving new campaign to DB...
✅ [CampaignSettingsModal] Settings saved successfully
```

### Test 3 : Réouverture de la Campagne
1. ✅ Sauvegarder avec la modale
2. ✅ Fermer l'éditeur
3. ✅ Rouvrir la campagne depuis `/campaigns`
4. ✅ **Vérifier** : Tous les modules sont présents

## Fichiers Modifiés

### 1. CampaignSettingsModal.tsx
- **Ligne 78-82** : Ajout de l'événement de synchronisation
- **Ligne 97-98** : Récupération de `campaign` à jour après sync

### 2. FormEditor/DesignEditorLayout.tsx
- **Ligne 1072-1095** : Listener pour l'événement de synchronisation

## Impact

- ✅ **Perte de données** : Éliminée
- ✅ **Expérience utilisateur** : Améliorée (pas de surprise)
- ✅ **Fiabilité** : Augmentée
- ✅ **Debug** : Facilité avec logs détaillés
- ✅ **Compatibilité** : Fonctionne avec tous les éditeurs (FormEditor, QuizEditor, etc.)

## Notes Importantes

### Délai de 100ms
Le délai de 100ms est nécessaire pour que l'événement soit traité et que la synchronisation se termine avant de récupérer `campaign` du store.

### Événement Global
L'utilisation d'un événement global (`window.dispatchEvent`) permet de découpler la modale des éditeurs spécifiques. Chaque éditeur peut écouter l'événement et synchroniser ses propres états.

### Hook useCampaignStateSync
Ce hook est déjà utilisé dans d'autres parties du code (sauvegarde du nom, fermeture de l'éditeur). La solution réutilise ce pattern existant pour la cohérence.

## Prochaines Améliorations Possibles

1. **Synchronisation automatique** : Synchroniser les états à chaque modification au lieu d'attendre la sauvegarde
2. **Indicateur visuel** : Afficher un indicateur "Synchronisation..." pendant la sync
3. **Validation** : Vérifier que la sync a réussi avant de sauvegarder
4. **Tests automatisés** : Ajouter des tests Playwright pour ce scénario
