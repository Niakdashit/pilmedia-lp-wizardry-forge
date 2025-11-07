# Guide de persistance des campagnes

## Problème résolu

Auparavant, seules certaines métadonnées (nom, type, statut) étaient sauvegardées lors de l'enregistrement d'une campagne. Les configurations internes des onglets Design, Éléments, Jeu, Formulaire, et Sortie n'étaient pas intégralement persistées.

## Solution implémentée

### 1. Sauvegarde exhaustive (`saveCampaignToDB`)

La fonction `saveCampaignToDB` dans `src/hooks/useModernCampaignEditor/saveHandler.ts` capture maintenant **tous** les états de l'éditeur :

#### Structure de sauvegarde complète :

```typescript
{
  id: string,
  name: string,
  type: 'wheel' | 'quiz' | 'form' | 'jackpot' | 'scratch',
  status: 'draft' | 'active' | 'ended',
  
  // Configuration complète de l'éditeur
  config: {
    // Configuration du canvas (éléments, backgrounds)
    canvasConfig: {
      elements: [...],              // Éléments dessinés sur le canvas
      background: {...},             // Image/couleur de fond desktop
      mobileBackground: {...},       // Image/couleur de fond mobile
      screenBackgrounds: {...},      // Backgrounds par écran
      device: 'desktop' | 'tablet' | 'mobile',
      zoom: number
    },
    
    // Structure modulaire (modules par écran)
    modularPage: {
      screens: {
        screen1: [...],
        screen2: [...],
        screen3: [...]
      },
      _updatedAt: timestamp
    },
    
    // Configurations spécifiques
    campaignConfig: {...},
    buttonConfig: {...},
    screens: {...}
  },
  
  // Configuration du jeu (spécifique à chaque type)
  game_config: {
    wheel: {...},      // Pour type='wheel'
    quiz: {...},       // Pour type='quiz'
    scratch: {...},    // Pour type='scratch'
    jackpot: {...}     // Pour type='jackpot'
  },
  
  // Configuration du design
  design: {
    backgroundImage: string,           // Image de fond desktop
    mobileBackgroundImage: string,     // Image de fond mobile
    background: string,                // Couleur/gradient de fond
    screenBackgrounds: {...},          // Backgrounds par écran
    extractedColors: [...],            // Couleurs extraites des images
    customColors: {...},               // Couleurs personnalisées
    designModules: {...},              // Modules de design
    customTexts: [...],                // Textes personnalisés
    customImages: [...],               // Images personnalisées
    borderStyle: {...},                // Style de bordure
    wheelBorderStyle: {...}            // Style de bordure roue
  },
  
  // Champs du formulaire
  form_fields: [...]
}
```

### 2. Chargement exhaustif (`campaignLoader`)

La fonction `loadCampaign` dans `src/hooks/useModernCampaignEditor/campaignLoader.ts` restaure **tous** les états :

- ✅ Canvas elements
- ✅ Modular page structure
- ✅ Screen backgrounds
- ✅ Extracted colors
- ✅ Button and screen configs
- ✅ Game-specific configurations
- ✅ Design modules and custom elements

### 3. Hook de synchronisation (`useCampaignStateSync`)

Le nouveau hook `useCampaignStateSync` facilite la synchronisation des états locaux vers l'objet campaign :

```typescript
import { useCampaignStateSync } from '@/hooks/useCampaignStateSync';

// Dans votre éditeur
const { syncAllStates } = useCampaignStateSync();

// Avant de sauvegarder, synchroniser tous les états
syncAllStates({
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  // ... autres états
});

// Puis sauvegarder
await saveCampaign(campaign);
```

## Utilisation dans les éditeurs

### Dans chaque éditeur (DesignEditor, QuizEditor, FormEditor, etc.)

#### 1. Importer le hook de synchronisation :

```typescript
import { useCampaignStateSync } from '@/hooks/useCampaignStateSync';
```

#### 2. Utiliser le hook :

```typescript
const { syncAllStates } = useCampaignStateSync();
```

#### 3. Synchroniser avant chaque sauvegarde :

```typescript
const handleSave = async () => {
  // 1. Synchroniser tous les états locaux vers campaign
  syncAllStates({
    canvasElements,
    modularPage,
    screenBackgrounds,
    extractedColors,
    selectedDevice,
    canvasZoom,
    campaignConfig,
    buttonConfig,
    // Type-specific configs
    quizConfig,      // pour QuizEditor
    scratchConfig,   // pour ScratchEditor
    jackpotConfig,   // pour JackpotEditor
    wheelConfig      // pour DesignEditor (Wheel)
  });
  
  // 2. Sauvegarder
  await saveCampaign(campaign);
};
```

### Autosave automatique

Pour l'autosave, utiliser un debounce pour éviter trop de sauvegardes :

```typescript
import { useDebounce } from 'use-debounce';

useEffect(() => {
  const timeout = setTimeout(() => {
    syncAllStates({
      canvasElements,
      modularPage,
      screenBackgrounds,
      // ...
    });
    saveCampaign(campaign);
  }, 1500); // Attendre 1.5s après le dernier changement
  
  return () => clearTimeout(timeout);
}, [canvasElements, modularPage, screenBackgrounds, /* ... */]);
```

## Tests de validation

Pour vérifier que tout est correctement sauvegardé et restauré :

1. ✅ Créer une campagne complète avec :
   - Éléments canvas
   - Modules modulaires
   - Images de fond (desktop et mobile)
   - Champs de formulaire
   - Configuration de jeu
   
2. ✅ Sauvegarder la campagne

3. ✅ Naviguer vers `/campaigns`

4. ✅ Rouvrir la campagne

5. ✅ Vérifier que TOUS les éléments sont restaurés :
   - Éléments canvas visibles
   - Modules présents
   - Images de fond correctes
   - Formulaire complet
   - Configuration de jeu intacte

## Logs de debugging

Les fonctions de sauvegarde et chargement incluent des logs détaillés :

```javascript
// Lors de la sauvegarde
💾 [saveCampaignToDB] Saving campaign with complete state
💾 [saveCampaignToDB] Complete payload structure
✅ [saveCampaignToDB] Campaign saved successfully

// Lors du chargement
✅ [campaignLoader] Loaded campaign from DB
✅ [campaignLoader] Complete restored campaign
```

Utilisez ces logs pour diagnostiquer les problèmes de persistance.

## Problèmes connus et solutions

### Problème : Éléments canvas non restaurés
**Solution** : Vérifier que `canvasElements` est bien synchronisé avant la sauvegarde avec `syncCanvasElements(canvasElements)`

### Problème : Modules modulaires manquants
**Solution** : Vérifier que `modularPage` est bien synchronisé avant la sauvegarde avec `syncModularPage(modularPage)`

### Problème : Images de fond disparues
**Solution** : Vérifier que les images sont sauvegardées dans `design.backgroundImage` (desktop) et `design.mobileBackgroundImage` (mobile)

### Problème : Configuration de jeu perdue
**Solution** : S'assurer que la config spécifique au type (wheelConfig, quizConfig, etc.) est bien incluse dans la synchronisation

## API Reference

### `saveCampaignToDB(campaign, saveCampaignFn)`

Sauvegarde exhaustive d'une campagne avec tous ses états.

**Paramètres:**
- `campaign`: Objet campaign complet avec tous les états synchronisés
- `saveCampaignFn`: Fonction de sauvegarde Supabase

**Retour:** Promise<Campaign>

### `loadCampaign(campaignId, campaignType, getCampaign)`

Charge une campagne avec restauration complète de tous les états.

**Paramètres:**
- `campaignId`: ID de la campagne à charger
- `campaignType`: Type de campagne
- `getCampaign`: Fonction de récupération Supabase

**Retour:** Promise<Campaign>

### `useCampaignStateSync()`

Hook de synchronisation des états locaux vers l'objet campaign.

**Méthodes:**
- `syncAllStates(editorStates)`: Synchronise tous les états
- `syncCanvasElements(elements)`: Synchronise uniquement les éléments canvas
- `syncModularPage(modularPage)`: Synchronise uniquement les modules
- `syncBackgrounds(backgrounds)`: Synchronise uniquement les backgrounds
- `syncColors(colors)`: Synchronise uniquement les couleurs
