# 🔍 Audit d'Harmonisation des Éditeurs

**Date**: 20 Octobre 2025  
**Objectif**: Vérifier que tous les éditeurs partagent les mêmes bases que DesignEditor

---

## ✅ Points Communs Vérifiés

### 1. **Dimensions Canvas** ✅
**Status**: ✅ **HARMONISÉ**

Tous les éditeurs utilisent le fichier centralisé `/src/utils/deviceDimensions.ts`:
```typescript
export const STANDARD_DEVICE_DIMENSIONS = {
  desktop: { width: 1700, height: 850 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 430, height: 932 }
}
```

**Éditeurs conformes**:
- ✅ DesignEditor
- ✅ QuizEditor
- ✅ ModelEditor
- ✅ ScratchCardEditor
- ✅ JackpotEditor

---

### 2. **Échelles de Zoom** ✅
**Status**: ✅ **HARMONISÉ**

Tous les éditeurs utilisent la même fonction `getDefaultZoom`:
```typescript
const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
  try {
    const saved = localStorage.getItem(`editor-zoom-${device}`);
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {}
  
  return device === 'mobile' ? 0.45 : device === 'tablet' ? 0.7 : 1;
};
```

**Fonctionnalités**:
- ✅ Persistance du zoom dans localStorage
- ✅ Valeurs par défaut cohérentes (desktop: 1, tablet: 0.7, mobile: 0.45)
- ✅ Auto-ajustement sur redimensionnement mobile

**Éditeurs conformes**:
- ✅ DesignEditor
- ✅ QuizEditor
- ✅ ModelEditor
- ✅ ScratchCardEditor
- ✅ JackpotEditor

---

### 3. **Mode Preview** ✅
**Status**: ✅ **HARMONISÉ**

Tous les éditeurs utilisent:
- ✅ État `showFunnel` pour toggle preview
- ✅ `PreviewRenderer` component pour l'affichage
- ✅ Détection appareil physique (`actualDevice`)
- ✅ Arrondis conditionnels (édition vs preview)

**Comportement uniforme**:
```typescript
{showFunnel ? (
  // Mode Preview
  <PreviewRenderer
    campaign={campaignData}
    previewMode={selectedDevice}
    wheelModalConfig={wheelModalConfig}
  />
) : (
  // Mode Édition
  <DesignCanvas ... />
)}
```

**Éditeurs conformes**:
- ✅ DesignEditor
- ✅ QuizEditor
- ✅ ModelEditor (utilise FunnelUnlockedGame)
- ✅ ScratchCardEditor (utilise FunnelUnlockedGame)
- ✅ JackpotEditor

---

### 4. **Gestion des Backgrounds** ✅
**Status**: ✅ **HARMONISÉ** (DesignEditor + QuizEditor)

**Fonctionnalités avancées**:
```typescript
handleBackgroundChange(bg, {
  screenId: 'screen1' | 'screen2' | 'screen3',  // Par écran
  device: 'desktop' | 'tablet' | 'mobile',      // Par appareil
  applyToAllScreens: boolean                     // Tous les écrans
})
```

**Structure de données**:
```typescript
screenBackgrounds = {
  screen1: {
    type: 'color' | 'image',
    value: string,
    devices: {
      desktop: { type, value },
      mobile: { type, value },
      tablet: { type, value }
    }
  }
}
```

**Éditeurs conformes**:
- ✅ DesignEditor (complet)
- ✅ QuizEditor (complet)
- ⚠️ ModelEditor (système simplifié)
- ⚠️ ScratchCardEditor (système simplifié)
- ⚠️ JackpotEditor (système simplifié)

---

## ⚠️ Différences Identifiées

### 1. **Synchronisation Preview/Édition**
**Status**: ⚠️ **PARTIEL**

| Éditeur | `useEditorPreviewSync` | Status |
|---------|------------------------|--------|
| DesignEditor | ❌ Commenté | ⚠️ À activer |
| QuizEditor | ✅ Actif | ✅ OK |
| ModelEditor | ❌ Absent | ⚠️ À ajouter |
| ScratchCardEditor | ❌ Absent | ⚠️ À ajouter |
| JackpotEditor | ❌ Absent | ⚠️ À ajouter |

**Recommandation**: Activer `useEditorPreviewSync` dans tous les éditeurs pour assurer la synchronisation temps réel entre mode édition et preview.

---

### 2. **Gestion Backgrounds par Device**
**Status**: ⚠️ **PARTIEL**

**Éditeurs avec système complet**:
- ✅ DesignEditor
- ✅ QuizEditor

**Éditeurs à migrer**:
- ⚠️ ModelEditor
- ⚠️ ScratchCardEditor
- ⚠️ JackpotEditor

**Action requise**: Implémenter le système de backgrounds par écran ET par device dans les 3 éditeurs manquants.

---

### 3. **WYSIWYG (What You See Is What You Get)**
**Status**: ✅ **HARMONISÉ**

Tous les éditeurs utilisent `PreviewRenderer` qui assure:
- ✅ Rendu identique entre édition et preview
- ✅ Synchronisation des éléments canvas
- ✅ Synchronisation des backgrounds
- ✅ Synchronisation des modules

**Composants clés**:
- `PreviewRenderer.tsx` - Rendu unifié
- `DesignModuleRenderer.tsx` - Modules Design
- `QuizModuleRenderer.tsx` - Modules Quiz
- `useEditorPreviewSync.ts` - Hook de synchronisation

---

## 📋 Plan d'Action Recommandé

### Phase 1: Synchronisation Preview ⚠️ PRIORITAIRE

**Fichiers à modifier**:
1. `/src/components/DesignEditor/DesignEditorLayout.tsx`
   - ✅ Décommenter `useEditorPreviewSync`
   - ✅ Activer `syncBackground`

2. `/src/components/ModelEditor/DesignEditorLayout.tsx`
   - ⚠️ Importer `useEditorPreviewSync`
   - ⚠️ Utiliser `syncBackground` dans `handleBackgroundChange`

3. `/src/components/ScratchCardEditor/ScratchCardEditorLayout.tsx`
   - ⚠️ Importer `useEditorPreviewSync`
   - ⚠️ Utiliser `syncBackground` dans `handleBackgroundChange`

4. `/src/components/JackpotEditor/JackpotEditorLayout.tsx`
   - ⚠️ Importer `useEditorPreviewSync`
   - ⚠️ Utiliser `syncBackground` dans `handleBackgroundChange`

---

### Phase 2: Backgrounds par Device ⚠️ MOYEN

**Migrer le système avancé de DesignEditor/QuizEditor vers**:
- ModelEditor
- ScratchCardEditor
- JackpotEditor

**Fonctionnalités à implémenter**:
```typescript
// 1. État screenBackgrounds avec support device
const [screenBackgrounds, setScreenBackgrounds] = useState({
  screen1: { type: 'color', value: '...', devices: {} },
  screen2: { type: 'color', value: '...', devices: {} },
  screen3: { type: 'color', value: '...', devices: {} }
});

// 2. handleBackgroundChange avec options device
const handleBackgroundChange = (bg, options?: {
  screenId?: 'screen1' | 'screen2' | 'screen3',
  device?: 'desktop' | 'tablet' | 'mobile',
  applyToAllScreens?: boolean
}) => { ... }

// 3. Lecture conditionnelle par device
background={screenBackgrounds.screen1?.devices?.[selectedDevice] || screenBackgrounds.screen1}
```

---

### Phase 3: Tests et Validation ✅ FINAL

**Tests à effectuer**:
1. ✅ Upload background → Vérifier synchronisation preview
2. ✅ Changement device → Vérifier background spécifique
3. ✅ Mode preview → Vérifier WYSIWYG
4. ✅ Zoom → Vérifier persistance
5. ✅ Arrondis → Vérifier édition vs preview

---

## 📊 Score d'Harmonisation

| Éditeur | Dimensions | Zoom | Preview | Backgrounds | Sync | Score |
|---------|-----------|------|---------|-------------|------|-------|
| **DesignEditor** | ✅ | ✅ | ✅ | ✅ | ⚠️ | 90% |
| **QuizEditor** | ✅ | ✅ | ✅ | ✅ | ✅ | 100% |
| **ModelEditor** | ✅ | ✅ | ✅ | ⚠️ | ❌ | 70% |
| **ScratchCardEditor** | ✅ | ✅ | ✅ | ⚠️ | ❌ | 70% |
| **JackpotEditor** | ✅ | ✅ | ✅ | ⚠️ | ❌ | 70% |

**Score moyen**: 80%

---

## 🎯 Conclusion

### Points Forts ✅
- ✅ Dimensions canvas centralisées et uniformes
- ✅ Système de zoom cohérent avec persistance
- ✅ Mode preview fonctionnel sur tous les éditeurs
- ✅ WYSIWYG assuré par PreviewRenderer
- ✅ Arrondis conditionnels harmonisés

### Points à Améliorer ⚠️
- ⚠️ Activer `useEditorPreviewSync` dans DesignEditor
- ⚠️ Ajouter `useEditorPreviewSync` dans ModelEditor, ScratchCardEditor, JackpotEditor
- ⚠️ Migrer le système de backgrounds par device vers les 3 éditeurs manquants

### Impact Utilisateur 🎨
- **Actuel**: Expérience cohérente à 80%
- **Après harmonisation**: Expérience cohérente à 100%
- **Bénéfices**: 
  - Synchronisation temps réel parfaite
  - Backgrounds personnalisables par appareil
  - Workflow unifié entre tous les éditeurs

---

**Prochaine étape**: Implémenter Phase 1 (Synchronisation Preview) pour atteindre 100% d'harmonisation.
