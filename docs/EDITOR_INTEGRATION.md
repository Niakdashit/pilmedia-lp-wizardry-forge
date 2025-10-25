# Guide d'intégration pour les éditeurs

## Objectif

Assurer que tous les états locaux de l'éditeur sont correctement synchronisés avec l'objet `campaign` pour garantir une persistance complète lors de la sauvegarde.

## Problème à éviter

❌ **Mauvais** : États locaux non synchronisés
```typescript
// États locaux isolés (NE SERA PAS SAUVEGARDÉ)
const [canvasElements, setCanvasElements] = useState([]);
const [modularPage, setModularPage] = useState({});
const [screenBackgrounds, setScreenBackgrounds] = useState({});

// Sauvegarde - PERD LES ÉTATS LOCAUX
await saveCampaign(campaign);
```

✅ **Bon** : États synchronisés avec l'objet campaign
```typescript
// Synchroniser AVANT chaque changement ou périodiquement
useEffect(() => {
  setCampaign(prev => ({
    ...prev,
    canvasElements,
    modularPage,
    screenBackgrounds
  }));
}, [canvasElements, modularPage, screenBackgrounds]);

// Sauvegarde - TOUS LES ÉTATS SONT PRESERVÉS
await saveCampaign(campaign);
```

## Méthode 1 : Synchronisation automatique avec useEffect

### Étape 1 : Identifier tous les états locaux

```typescript
// Dans votre éditeur (DesignEditor, QuizEditor, etc.)
const [canvasElements, setCanvasElements] = useState([]);
const [modularPage, setModularPage] = useState({});
const [screenBackgrounds, setScreenBackgrounds] = useState({});
const [extractedColors, setExtractedColors] = useState([]);
const [selectedDevice, setSelectedDevice] = useState('desktop');
const [canvasZoom, setCanvasZoom] = useState(0.7);
```

### Étape 2 : Ajouter la synchronisation automatique

```typescript
// Synchroniser tous les états vers campaign dès qu'ils changent
useEffect(() => {
  setCampaign(prev => {
    // Éviter les boucles infinies
    const currentHash = JSON.stringify({
      canvasElements,
      modularPage,
      screenBackgrounds,
      extractedColors,
      selectedDevice,
      canvasZoom
    });
    
    const prevHash = JSON.stringify({
      canvasElements: prev?.canvasElements,
      modularPage: prev?.modularPage,
      screenBackgrounds: prev?.screenBackgrounds,
      extractedColors: prev?.extractedColors,
      selectedDevice: prev?.selectedDevice,
      canvasZoom: prev?.canvasZoom
    });
    
    if (currentHash === prevHash) return prev;
    
    return {
      ...prev,
      canvasElements,
      modularPage,
      screenBackgrounds,
      extractedColors,
      selectedDevice,
      canvasZoom,
      _statesLastSync: Date.now()
    };
  });
}, [canvasElements, modularPage, screenBackgrounds, extractedColors, selectedDevice, canvasZoom]);
```

## Méthode 2 : Utiliser le hook `useCampaignStateSync`

### Plus simple et recommandé

```typescript
import { useCampaignStateSync } from '@/hooks/useCampaignStateSync';

// Dans votre composant
const { syncAllStates } = useCampaignStateSync();

// Synchroniser périodiquement (recommandé : après chaque changement majeur)
useEffect(() => {
  syncAllStates({
    canvasElements,
    modularPage,
    screenBackgrounds,
    extractedColors,
    selectedDevice,
    canvasZoom
  });
}, [canvasElements, modularPage, screenBackgrounds, extractedColors, selectedDevice, canvasZoom]);
```

## Méthode 3 : Synchronisation avant sauvegarde manuelle

### Pour les boutons "Sauvegarder"

```typescript
import { useCampaignStateSync } from '@/hooks/useCampaignStateSync';

const { syncAllStates } = useCampaignStateSync();

const handleManualSave = async () => {
  // 1. Synchroniser TOUS les états
  syncAllStates({
    canvasElements,
    modularPage,
    screenBackgrounds,
    extractedColors,
    selectedDevice,
    canvasZoom,
    campaignConfig,
    // Type-specific configs
    quizConfig,
    scratchConfig,
    jackpotConfig,
    wheelConfig
  });
  
  // 2. Attendre un peu pour laisser React mettre à jour
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // 3. Sauvegarder
  await saveCampaign(campaign);
  
  // 4. Notifier l'utilisateur
  toast.success('Campagne sauvegardée !');
};
```

## États à synchroniser par type d'éditeur

### DesignEditor (Wheel)
```typescript
{
  canvasElements,        // Éléments dessinés
  modularPage,          // Modules structurés
  screenBackgrounds,    // Fonds par écran
  extractedColors,      // Couleurs extraites
  selectedDevice,       // Device actuel
  canvasZoom,          // Niveau de zoom
  wheelConfig: {       // Config roue
    segments: [...],
    spinDuration: 3000,
    // ...
  }
}
```

### QuizEditor
```typescript
{
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  quizConfig: {
    questions: [...],
    timeLimit: 30,
    randomizeQuestions: false,
    // ...
  }
}
```

### FormEditor
```typescript
{
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  formFields: [...],     // Champs du formulaire
  formConfig: {
    submitButtonText: 'Envoyer',
    successMessage: 'Merci !',
    // ...
  }
}
```

### JackpotEditor
```typescript
{
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  jackpotConfig: {
    slots: [...],
    spinSpeed: 100,
    winPatterns: [...],
    // ...
  }
}
```

### ScratchCardEditor
```typescript
{
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  scratchConfig: {
    scratchArea: 70,
    scratchColor: '#C0C0C0',
    cards: [...],
    // ...
  }
}
```

## Restauration des états au chargement

### Automatique avec `campaignLoader`

La fonction `loadCampaign` restaure automatiquement tous les états. Il suffit de les extraire de l'objet campaign :

```typescript
useEffect(() => {
  if (campaign?.canvasElements) {
    setCanvasElements(campaign.canvasElements);
  }
  if (campaign?.modularPage) {
    setModularPage(campaign.modularPage);
  }
  if (campaign?.screenBackgrounds) {
    setScreenBackgrounds(campaign.screenBackgrounds);
  }
  if (campaign?.extractedColors) {
    setExtractedColors(campaign.extractedColors);
  }
  if (campaign?.selectedDevice) {
    setSelectedDevice(campaign.selectedDevice);
  }
  if (campaign?.canvasZoom) {
    setCanvasZoom(campaign.canvasZoom);
  }
}, [campaign?.id]); // Se déclenche au chargement d'une nouvelle campagne
```

## Debugging

### Vérifier que la synchronisation fonctionne

```typescript
// Ajouter des logs pour vérifier
useEffect(() => {
  console.log('🔍 [Editor] States to sync:', {
    canvasElementsCount: canvasElements.length,
    modularPageScreens: Object.keys(modularPage?.screens || {}).length,
    screenBackgroundsCount: Object.keys(screenBackgrounds || {}).length,
    extractedColorsCount: extractedColors.length
  });
  
  console.log('🔍 [Editor] Current campaign state:', {
    campaignId: campaign?.id,
    campaignCanvasElements: campaign?.canvasElements?.length || 0,
    campaignModularPage: campaign?.modularPage ? 'present' : 'missing'
  });
}, [canvasElements, modularPage, screenBackgrounds, extractedColors, campaign]);
```

### Vérifier la sauvegarde en base

```sql
-- Dans la console Supabase
SELECT 
  id,
  name,
  type,
  config->'canvasConfig'->'elements' as canvas_elements,
  config->'modularPage'->'screens' as modular_screens,
  design->'screenBackgrounds' as screen_backgrounds
FROM campaigns
WHERE id = 'votre-campaign-id';
```

## Checklist d'intégration

Pour chaque éditeur, vérifier :

- [ ] Tous les états locaux sont identifiés
- [ ] Les états sont synchronisés avec `campaign` (useEffect ou `useCampaignStateSync`)
- [ ] La synchronisation se fait AVANT l'autosave
- [ ] Les états sont restaurés depuis `campaign` au chargement
- [ ] Les logs de debug sont en place
- [ ] Test de sauvegarde/rechargement réussi
- [ ] Aucun état n'est perdu entre les sessions

## Support

En cas de problème de persistance :

1. Vérifier les logs de sauvegarde : `💾 [saveCampaignToDB]`
2. Vérifier les logs de chargement : `✅ [campaignLoader]`
3. Vérifier que l'état est dans l'objet campaign avant save
4. Consulter `docs/CAMPAIGN_PERSISTENCE.md`
