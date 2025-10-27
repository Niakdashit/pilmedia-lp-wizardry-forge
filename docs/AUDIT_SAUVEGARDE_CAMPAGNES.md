# 🔍 Audit d'optimisation: Sauvegarde des campagnes vers /campaigns

**Date**: 2025-01-XX  
**Objectif**: S'assurer que les sauvegardes vers `/campaigns` incluent tous les modules/blocs et images, et que les éditeurs sont correctement réinitialisés après fermeture.

---

## 📊 Résumé exécutif

### ✅ Points forts actuels

1. **`saveCampaignToDB` complet** (lignes 38-219 de `saveHandler.ts`):
   - ✅ Capture `modularPage` (modules par écran)
   - ✅ Capture `canvasElements` (éléments canvas)
   - ✅ Capture `screenBackgrounds` (backgrounds par écran)
   - ✅ Capture `extractedColors` (couleurs extraites)
   - ✅ Capture configs spécifiques: `wheelConfig`, `quizConfig`, `scratchConfig`, `jackpotConfig`
   - ✅ Structure hiérarchique complète: `config` → `canvasConfig` + `modularPage`

2. **Autosave actif** dans tous les éditeurs (debounce 1000ms):
   - ✅ DesignEditor (lignes 420-443)
   - ✅ FormEditor (lignes 557-580)
   - ✅ JackpotEditor (lignes 625-661) - **le plus complet**
   - ✅ ScratchCardEditor
   - ✅ QuizEditor

3. **Reset à l'unmount** implémenté dans tous les éditeurs via `resetCampaign()`

---

## ❌ Problèmes critiques identifiés

### 🔴 CRITIQUE 1: Sauvegarde incomplète avant fermeture éditeur

**Éditeurs concernés**: DesignEditor, QuizEditor, FormEditor

**Symptôme**:
```typescript
// DesignEditor ligne 153-158
useEffect(() => {
  return () => {
    console.log('🧹 [DesignEditor] Unmounting - resetting store for next editor');
    resetCampaign(); // ⚠️ AUCUNE sauvegarde avant reset!
  };
}, [resetCampaign]);
```

**Impact**:
- ❌ Si l'utilisateur ferme l'onglet/navigateur, **perte totale** des modifications depuis le dernier autosave (max 1 seconde, mais peut être plus si debounce annulé)
- ❌ Si l'utilisateur navigue rapidement vers `/campaigns`, modifications récentes non visibles
- ❌ Modules, backgrounds, couleurs non sauvegardés si modifiés juste avant fermeture

**Comparaison avec JackpotEditor (✅ CORRECT)** (lignes 249-330):
```typescript
useEffect(() => {
  return () => {
    console.log('🧹 [JackpotEditor] Unmounting - resetting store for next editor');
    try {
      // ✅ 1. Sync local → store
      syncAllStates({
        canvasElements, modularPage, screenBackgrounds, 
        extractedColors, selectedDevice, canvasZoom
      });
      
      // ✅ 2. Build complete payload
      const payload: any = {
        ...(useEditorStore.getState().campaign || campaignState || {}),
        type: 'jackpot',
        jackpotConfig: (base as any)?.jackpotConfig,
        modularPage,
        canvasConfig: { elements: canvasElements, screenBackgrounds, ... }
      };
      
      // ✅ 3. Save then reset
      void saveCampaignToDB(payload, saveCampaign);
    } catch {}
    resetCampaign();
  };
}, [resetCampaign]);
```

**Solution**: Appliquer le pattern JackpotEditor à tous les éditeurs.

---

### 🔴 CRITIQUE 2: Images des modules non trackées dans `design.customImages`

**Symptôme**:
Les images uploadées dans les modules `BlocImage` ne sont PAS automatiquement ajoutées à `design.customImages`.

**Preuve**:
```typescript
// saveHandler.ts ligne 148-149
customTexts: campaign?.design?.customTexts || [],
customImages: campaign?.design?.customImages || [], // ⚠️ Jamais mis à jour automatiquement!
```

**Impact**:
- ❌ Images "orphelines" non référencées
- ❌ Impossible de nettoyer les images inutilisées
- ❌ Miniatures de campagne sur `/campaigns` peuvent ne pas montrer les vraies images utilisées

**Solution**: Créer une fonction `extractImagesFromModules()` qui parse `modularPage` et extrait toutes les URLs d'images:

```typescript
// Nouvelle fonction utilitaire
export const extractImagesFromModules = (modularPage: any): string[] => {
  const images: string[] = [];
  
  if (!modularPage?.screens) return images;
  
  Object.values(modularPage.screens).forEach((modules: any) => {
    if (!Array.isArray(modules)) return;
    
    modules.forEach((module: any) => {
      if (module.type === 'BlocImage' && module.url) {
        images.push(module.url);
      }
      if (module.type === 'BlocBouton' && module.backgroundImage) {
        images.push(module.backgroundImage);
      }
      if (module.type === 'BlocTexte' && module.backgroundImage) {
        images.push(module.backgroundImage);
      }
    });
  });
  
  return images;
};
```

Puis dans `saveCampaignToDB()`, ligne 147-149:
```typescript
// Extract images from all sources
const allImages = new Set<string>();

// From modularPage
extractImagesFromModules(campaign?.modularPage).forEach(img => allImages.add(img));

// From screenBackgrounds
Object.values(campaign?.screenBackgrounds || {}).forEach((bg: any) => {
  if (bg?.type === 'image' && bg.value) allImages.add(bg.value);
});

// From canvasElements
campaign?.canvasElements?.forEach((el: any) => {
  if (el.url) allImages.add(el.url);
  if (el.backgroundImage) allImages.add(el.backgroundImage);
});

// From design
if (campaign?.design?.backgroundImage) allImages.add(campaign.design.backgroundImage);
if (campaign?.design?.mobileBackgroundImage) allImages.add(campaign.design.mobileBackgroundImage);

// Auto-populate customImages
customImages: Array.from(allImages),
```

---

### 🟡 MINEUR 3: `extractedColors` manquants dans certains autosaves

**Éditeurs concernés**: ScratchCardEditor

**Symptôme**:
L'autosave de ScratchCardEditor n'inclut pas explicitement `extractedColors` dans le payload.

**Impact**: Faible (les couleurs sont généralement sauvegardées via `design.extractedColors`), mais incohérence entre éditeurs.

**Solution**: Ajouter `extractedColors` explicitement dans tous les autosaves:

```typescript
const payload: any = {
  ...(campaignState || {}),
  type: 'scratch',
  extractedColors, // ✅ Ajouter cette ligne
  scratchConfig: (campaignState as any)?.scratchConfig,
  modularPage,
  canvasElements,
  // ...
};
```

---

### 🟡 MINEUR 4: Reset incomplet des états locaux

**Symptôme**:
`resetCampaign()` vide le store global (ligne 362-368 de `editorStore.ts`):
```typescript
resetCampaign: () => {
  set({
    campaign: null,
    isModified: false,
    selectedElementId: null,
    updateCounter: 0,
    lastUpdateTime: Date.now()
  });
},
```

**MAIS**: les états locaux des éditeurs (`canvasElements`, `modularPage`, `screenBackgrounds`, etc.) ne sont PAS réinitialisés!

**Impact**:
- ⚠️ Si un utilisateur crée une campagne, navigue vers `/campaigns`, puis revient rapidement créer une nouvelle campagne **du même type**, les anciens états locaux peuvent "contaminer" la nouvelle campagne.

**Solution**: Créer un hook `useEditorCleanup()` qui reset à la fois le store global ET les états locaux:

```typescript
export const useEditorCleanup = (
  editorType: string,
  localStateSetters: {
    setCanvasElements: (v: any[]) => void;
    setModularPage: (v: any) => void;
    setScreenBackgrounds: (v: any) => void;
    setExtractedColors: (v: string[]) => void;
    setSelectedDevice?: (v: any) => void;
    setCanvasZoom?: (v: number) => void;
  }
) => {
  const { resetCampaign } = useEditorStore();
  
  const cleanupAll = useCallback(() => {
    console.log(`🧹 [${editorType}Editor] Full cleanup`);
    
    // 1. Reset local states
    localStateSetters.setCanvasElements([]);
    localStateSetters.setModularPage({ 
      screens: { screen1: [], screen2: [], screen3: [] } 
    });
    localStateSetters.setScreenBackgrounds({
      screen1: { type: 'color', value: '' },
      screen2: { type: 'color', value: '' },
      screen3: { type: 'color', value: '' }
    });
    localStateSetters.setExtractedColors([]);
    localStateSetters.setSelectedDevice?.('desktop');
    localStateSetters.setCanvasZoom?.(0.7);
    
    // 2. Reset global store
    resetCampaign();
  }, [editorType, localStateSetters, resetCampaign]);

  return { cleanupAll };
};
```

---

## 🎯 Plan de correction (4 phases)

### Phase 1: Sauvegarde complète à l'unmount ⚠️ URGENT

**Fichiers à modifier**: `DesignEditor/DesignEditorLayout.tsx`, `QuizEditor/DesignEditorLayout.tsx`, `FormEditor/DesignEditorLayout.tsx`

**Action**:
1. Créer `src/hooks/useEditorUnmountSave.ts` (hook réutilisable)
2. Remplacer les simples `resetCampaign()` par la logique complète JackpotEditor

**Code type**:
```typescript
// Nouveau hook
export const useEditorUnmountSave = (
  campaignType: 'wheel' | 'quiz' | 'form' | 'scratch' | 'jackpot',
  states: {
    canvasElements: any[];
    modularPage: any;
    screenBackgrounds: any;
    extractedColors: string[];
    selectedDevice: string;
    canvasZoom: number;
    gameConfig?: any;
  },
  saveCampaign: (c: any) => Promise<any>
) => {
  const { syncAllStates } = useCampaignStateSync();
  const { resetCampaign } = useEditorStore();
  const campaignState = useEditorStore(s => s.campaign);

  useEffect(() => {
    return () => {
      console.log(`🧹 [${campaignType}Editor] Unmounting - saving before reset`);
      
      try {
        // 1. Sync local → store
        syncAllStates({
          canvasElements: states.canvasElements,
          modularPage: states.modularPage,
          screenBackgrounds: states.screenBackgrounds,
          extractedColors: states.extractedColors,
          selectedDevice: states.selectedDevice,
          canvasZoom: states.canvasZoom
        });

        // 2. Build complete payload
        const base = useEditorStore.getState().campaign || campaignState || {};
        const payload: any = {
          ...base,
          type: campaignType,
          extractedColors: states.extractedColors,
          modularPage: states.modularPage,
          canvasElements: states.canvasElements,
          screenBackgrounds: states.screenBackgrounds,
          canvasConfig: {
            ...(base as any)?.canvasConfig,
            elements: states.canvasElements,
            screenBackgrounds: states.screenBackgrounds,
            device: states.selectedDevice,
            zoom: states.canvasZoom
          }
        };

        // Add game-specific config
        if (states.gameConfig) {
          const configKey = `${campaignType}Config`;
          payload[configKey] = states.gameConfig;
        }

        // 3. Save then reset
        void saveCampaignToDB(payload, saveCampaign);
      } catch (e) {
        console.error(`❌ [${campaignType}Editor] Failed to save on unmount:`, e);
      }
      
      resetCampaign();
    };
  }, [resetCampaign]);
};
```

**Utilisation dans DesignEditor** (remplacer lignes 153-158):
```typescript
useEditorUnmountSave('wheel', {
  canvasElements,
  modularPage,
  screenBackgrounds,
  extractedColors,
  selectedDevice,
  canvasZoom,
  gameConfig: (campaignState as any)?.wheelConfig
}, saveCampaign);
```

---

### Phase 2: Auto-extraction des images

**Fichiers à modifier**: `src/hooks/useModernCampaignEditor/saveHandler.ts`

**Action**:
1. Créer `src/utils/extractImagesFromModules.ts`
2. Intégrer dans `saveCampaignToDB()` ligne 147-149

**Code**:
```typescript
// src/utils/extractImagesFromModules.ts
export const extractImagesFromModules = (modularPage: any): string[] => {
  const images: string[] = [];
  if (!modularPage?.screens) return images;
  
  Object.values(modularPage.screens).forEach((modules: any) => {
    if (!Array.isArray(modules)) return;
    modules.forEach((module: any) => {
      if (module.type === 'BlocImage' && module.url) images.push(module.url);
      if (module.type === 'BlocBouton' && module.backgroundImage) images.push(module.backgroundImage);
      if (module.type === 'BlocTexte' && module.backgroundImage) images.push(module.backgroundImage);
    });
  });
  
  return images;
};

export const extractImagesFromBackgrounds = (screenBackgrounds: any): string[] => {
  const images: string[] = [];
  if (!screenBackgrounds) return images;
  
  Object.values(screenBackgrounds).forEach((bg: any) => {
    if (bg?.type === 'image' && bg.value) images.push(bg.value);
  });
  
  return images;
};

export const extractImagesFromCanvasElements = (canvasElements: any[]): string[] => {
  const images: string[] = [];
  if (!Array.isArray(canvasElements)) return images;
  
  canvasElements.forEach((el: any) => {
    if (el.url) images.push(el.url);
    if (el.backgroundImage) images.push(el.backgroundImage);
  });
  
  return images;
};

export const extractAllCampaignImages = (campaign: any): string[] => {
  const allImages = new Set<string>();
  
  extractImagesFromModules(campaign.modularPage).forEach(img => allImages.add(img));
  extractImagesFromBackgrounds(campaign.screenBackgrounds).forEach(img => allImages.add(img));
  extractImagesFromCanvasElements(campaign.canvasElements).forEach(img => allImages.add(img));
  
  if (campaign.design?.backgroundImage) allImages.add(campaign.design.backgroundImage);
  if (campaign.design?.mobileBackgroundImage) allImages.add(campaign.design.mobileBackgroundImage);
  
  return Array.from(allImages);
};
```

**Intégration dans `saveHandler.ts`** (ligne 147-149):
```typescript
import { extractAllCampaignImages } from '@/utils/extractImagesFromModules';

// ...

// Build comprehensive design object
const mergedDesign = {
  ...(campaign?.design || {}),
  
  // ... (code existant)
  
  // Custom texts and images - AUTO-POPULATE from all sources
  customTexts: campaign?.design?.customTexts || [],
  customImages: extractAllCampaignImages(campaign), // ✅ Auto-extraction!
  
  // ...
};
```

---

### Phase 3: Enrichir les autosaves

**Fichiers à modifier**: Tous les éditeurs

**Action**: Ajouter `extractedColors` explicitement dans tous les autosaves

**Code type** (exemple ScratchCardEditor):
```typescript
const payload: any = {
  ...(campaignState || {}),
  type: 'scratch',
  extractedColors, // ✅ Ajouter
  scratchConfig: (campaignState as any)?.scratchConfig,
  modularPage,
  canvasElements,
  screenBackgrounds,
  canvasConfig: { /* ... */ }
};
```

---

### Phase 4: Reset complet avec hook `useEditorCleanup`

**Fichiers à créer**: `src/hooks/useEditorCleanup.ts`

**Action**: Créer le hook et l'intégrer dans tous les éditeurs

**Code**: Voir section "MINEUR 4" ci-dessus

**Utilisation**:
```typescript
const { cleanupAll } = useEditorCleanup('wheel', {
  setCanvasElements,
  setModularPage,
  setScreenBackgrounds,
  setExtractedColors,
  setSelectedDevice,
  setCanvasZoom
});

// Dans unmount:
useEditorUnmountSave(/* ... */);
// cleanupAll(); // Optionnel si on veut aussi reset les états locaux
```

---

## 📊 Tableau récapitulatif avant/après

| Éditeur | Sauvegarde unmount | Autosave complet | Images trackées | Reset propre |
|---------|-------------------|-----------------|----------------|--------------|
| **DesignEditor** | ❌ → ✅ | ⚠️ → ✅ | ❌ → ✅ | ❌ → ✅ |
| **QuizEditor** | ❌ → ✅ | ⚠️ → ✅ | ❌ → ✅ | ❌ → ✅ |
| **FormEditor** | ❌ → ✅ | ⚠️ → ✅ | ❌ → ✅ | ❌ → ✅ |
| **ScratchCardEditor** | ⚠️ → ✅ | ⚠️ → ✅ | ❌ → ✅ | ❌ → ✅ |
| **JackpotEditor** | ✅ | ✅ | ❌ → ✅ | ❌ → ✅ |

**Légende**:
- ❌ : Absent ou incomplet
- ⚠️ : Partiellement implémenté
- ✅ : Complet et fonctionnel

---

## 🔧 Ordre de priorité d'implémentation

1. **Phase 1** (URGENT): Sauvegarde unmount → Évite perte de données
2. **Phase 2** (IMPORTANT): Auto-extraction images → Complétude visuelle sur `/campaigns`
3. **Phase 3** (MINEUR): Enrichir autosaves → Cohérence
4. **Phase 4** (OPTIONNEL): Reset propre → Prévention contamination

---

## ✅ Tests de validation

Après implémentation, valider:

1. **Test perte de données**:
   - Créer campagne dans DesignEditor
   - Ajouter modules + images
   - Fermer onglet navigateur sans "Save & Quit"
   - Rouvrir `/campaigns` → Vérifier que tout est là

2. **Test images**:
   - Créer campagne Quiz
   - Ajouter BlocImage avec upload
   - Sauvegarder
   - Vérifier en DB: `SELECT design->'customImages' FROM campaigns WHERE id = '...'`
   - Résultat attendu: `["https://...image.jpg"]`

3. **Test reset**:
   - Créer campagne wheel avec modules
   - Naviguer vers `/campaigns`
   - Recréer nouvelle campagne wheel
   - Vérifier que canvas est vierge (seulement bouton "Participer")

4. **Test autosave**:
   - Créer campagne, ajouter éléments
   - Attendre 2 secondes (debounce)
   - Vérifier en console: `💾 [Editor] Autosave → DB`
   - Vérifier en DB que `modularPage`, `canvasElements`, `extractedColors` sont présents

---

## 📚 Références

- **Code actuel complet**: `saveCampaignToDB` (lignes 38-219)
- **Meilleur pattern**: JackpotEditor unmount (lignes 249-330)
- **Store reset**: `editorStore.ts` (lignes 362-368)
- **Extraction modules**: À créer dans `src/utils/extractImagesFromModules.ts`

---

**Fin du rapport d'audit**
