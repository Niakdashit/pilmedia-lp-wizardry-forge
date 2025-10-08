# 🔍 Audit Comparatif : /design-editor vs /scratch-editor

**Date**: 2025-10-07  
**Objectif**: Identifier les différences majeures entre les deux éditeurs (hors mécanique de jeu et onglet Jeu)

---

## ✅ Similarités Confirmées

### Architecture Globale
- **Structure identique** : Les deux éditeurs utilisent la même architecture Layout → Toolbar → Canvas → Sidebar
- **Composants partagés** : 
  - `DesignCanvas` (avec imports légèrement différents)
  - `CanvasElement` (scratch utilise celui de DesignEditor)
  - `CanvasToolbar`
  - `DesignToolbar`
  - `HybridSidebar`
  - Hooks d'optimisation (useAdvancedCache, useAdaptiveAutoSave, useVirtualizedCanvas, etc.)

### Fonctionnalités Communes
- ✅ Undo/Redo avec raccourcis clavier
- ✅ Sélection multiple et groupes
- ✅ Drag & drop avec DnD
- ✅ Zoom et responsive (desktop/mobile)
- ✅ Alignement intelligent et guides
- ✅ Gestion des éléments (texte, images, formes)
- ✅ Panneaux latéraux (Background, Effets, Animations, Position)
- ✅ Système de sauvegarde automatique
- ✅ Mode aperçu/édition
- ✅ Formulaire de contact

---

## ⚠️ Différences Majeures Identifiées

### 1. **Hook de Synchronisation de Configuration**

#### DesignEditor
```typescript
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';

const {
  wheelBorderStyle,
  wheelBorderColor,
  wheelBorderWidth,
  wheelScale,
  wheelShowBulbs,
  wheelPosition,
  setWheelBorderStyle,
  setWheelBorderColor,
  setWheelBorderWidth,
  setWheelScale,
  setShowBulbs,
  setWheelPosition
} = useWheelConfigSync({
  campaign: campaignConfig,
  extractedColors,
  onCampaignChange: setCampaignConfig
});
```

#### ScratchEditor
```typescript
// Scratch Editor doesn't need wheel config sync
// import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
```

**Impact**: DesignEditor a une synchronisation avancée pour la roue de fortune, ScratchEditor ne l'utilise pas.

---

### 2. **Composants de Jeu Différents**

#### DesignEditor
- **Composant**: `StandardizedWheel` (roue de fortune)
- **Props**: `wheelModalConfig`, `extractedColors`, `updateWheelConfig`, `getCanonicalConfig`
- **Panneau**: `WheelConfigPanel` avec configuration de bordure, échelle, bulbes, position

#### ScratchEditor
- **Composant**: `ScratchCardCanvas` (cartes à gratter)
- **Props**: `quizModalConfig`, `updateQuizConfig`, `getCanonicalConfig`
- **Panneau**: `ScratchCardGamePanel` avec configuration des cartes
- **Composant supplémentaire**: `TemplatedQuiz` (quiz intégré)

**Impact**: Mécaniques de jeu complètement différentes avec leurs propres systèmes de configuration.

---

### 3. **Onglets de la Sidebar**

#### DesignEditor - Onglets
```typescript
{ id: 'game', label: 'Jeu', icon: Gamepad2 }  // Roue de fortune
{ id: 'wheel', label: 'Roue de fortune', icon: ... }  // Panneau inline
```

#### ScratchEditor - Onglets
```typescript
{ id: 'game', label: 'Jeu', icon: Gamepad2 }  // Cartes à gratter
{ id: 'messages', label: 'Messages', icon: MessageSquare }  // Messages personnalisés
{ id: 'quiz', label: 'Quiz', icon: ... }  // Configuration quiz
```

**Impact**: ScratchEditor a un onglet "Messages" supplémentaire et un panneau Quiz dédié.

---

### 4. **Système de Types**

#### DesignEditor
```typescript
import type { DesignModularPage, DesignScreenId, DesignModule } from '@/types/designEditorModular';
```

#### ScratchEditor
```typescript
import type { ModularPage, ScreenId, Module } from '@/types/modularEditor';
import { quizTemplates } from '../../types/quizTemplates';
```

**Impact**: Types différents pour les modules et système de templates de quiz intégré.

---

### 5. **Configuration de Campagne**

#### DesignEditor
```typescript
campaignConfig: {
  design: {
    wheelConfig: {
      scale: 2,
      borderStyle: 'solid',
      borderColor: '#000000',
      borderWidth: 2,
      showBulbs: false,
      position: 'right'
    }
  }
}
```

#### ScratchEditor
```typescript
campaignConfig: {
  design: {
    quizConfig: {
      style: {
        width: '450px',
        mobileWidth: '450px',
        backgroundColor: '#ffffff',
        backgroundOpacity: 100,
        textColor: '#000000',
        buttonBackgroundColor: '#f3f4f6',
        buttonTextColor: '#000000',
        buttonHoverBackgroundColor: '#9fa4a4',
        buttonActiveBackgroundColor: '#a7acb5'
      }
    }
  }
}
```

**Impact**: Structures de configuration complètement différentes adaptées à chaque mécanique.

---

### 6. **Transformation de Données de Jeu**

#### ScratchEditor - Fonction Unique
```typescript
const transformScratchStateToGameConfig = (state?: any) => {
  // Transformation complexe de l'état scratch vers config de jeu
  // Gestion des cartes, seuils, couleurs, images de révélation
  // Logique gagnant/perdant
}
```

**Impact**: ScratchEditor a une logique de transformation de données spécifique absente de DesignEditor.

---

### 7. **Imports de Composants Canvas**

#### DesignEditor
```typescript
import CanvasElement from './CanvasElement';
import StandardizedWheel from '../shared/StandardizedWheel';
import DesignModularCanvas from './modules/DesignModularCanvas';
```

#### ScratchEditor
```typescript
import CanvasElement from '../DesignEditor/CanvasElement';  // Réutilise celui de DesignEditor
import ScratchCardCanvas from './ScratchCardCanvas';
import ModularCanvas from './modules/ModularCanvas';
import { QuizModuleRenderer } from './QuizRenderer';
```

**Impact**: ScratchEditor réutilise `CanvasElement` de DesignEditor mais a ses propres composants de rendu.

---

### 8. **Gestion des Modules**

#### DesignEditor
```typescript
type DesignScreenId = 'screen1' | 'screen2' | 'screen3';
interface DesignModule {
  type: 'BlocTexte' | 'BlocImage' | 'BlocLogo' | 'BlocPiedDePage' | 'BlocCarte';
  // ...
}
```

#### ScratchEditor
```typescript
type CanvasScreenId = 'screen1' | 'screen2' | 'screen3' | 'all';  // Ajout de 'all'
interface Module {
  type: 'BlocTexte' | 'BlocImage' | 'BlocLogo' | 'BlocPiedDePage' | 'BlocCarte';
  // ...
}
```

**Impact**: ScratchEditor supporte un écran 'all' pour afficher tous les écrans simultanément.

---

### 9. **Panneaux de Configuration Spécifiques**

#### DesignEditor - Panneaux Uniques
- `WheelConfigPanel` - Configuration roue de fortune
- `GameManagementPanel` - Gestion des segments et prix

#### ScratchEditor - Panneaux Uniques
- `QuizConfigPanel` - Configuration quiz
- `ScratchCardGamePanel` - Configuration cartes à gratter
- `MessagesPanel` - Messages personnalisés

---

### 10. **Safe Zone Radius**

#### DesignEditor
```typescript
const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 24,
  tablet: 20,
  mobile: 16
};
```

#### ScratchEditor
```typescript
const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 32,  // +8px
  tablet: 28,   // +8px
  mobile: 24    // +8px
};
```

**Impact**: ScratchEditor a des zones de sécurité plus larges (+8px sur tous les appareils).

---

### 11. **Nommage des Interfaces**

#### DesignEditor
```typescript
interface DesignToolbarProps { ... }
const DesignToolbar: React.FC<DesignToolbarProps> = ...
```

#### ScratchEditor
```typescript
interface QuizToolbarProps { ... }  // ⚠️ Nommé "Quiz" au lieu de "Scratch"
const QuizToolbar: React.FC<QuizToolbarProps> = ...
```

**Impact**: Incohérence de nommage dans ScratchEditor (QuizToolbar au lieu de ScratchToolbar).

---

## 🎯 Résumé des Différences Critiques

### Différences Acceptables (Liées au Jeu)
1. ✅ Composants de jeu différents (roue vs cartes)
2. ✅ Panneaux de configuration de jeu différents
3. ✅ Onglet "Jeu" avec contenu différent
4. ✅ Hooks de synchronisation spécifiques au jeu

### Différences Mineures
1. ⚠️ Safe zone radius légèrement différent (+8px)
2. ⚠️ Support de screenId 'all' dans ScratchEditor
3. ⚠️ Onglet "Messages" supplémentaire dans ScratchEditor

### Problèmes Potentiels
1. ❌ **Incohérence de nommage**: `QuizToolbar` au lieu de `ScratchToolbar`
2. ⚠️ **Réutilisation de CanvasElement**: ScratchEditor importe depuis DesignEditor (couplage)
3. ⚠️ **Types différents**: `DesignModule` vs `Module` (pourrait être unifié)

---

## 📋 Recommandations

### Corrections Nécessaires
1. **Renommer `QuizToolbar` → `ScratchToolbar`** dans ScratchEditor pour cohérence
2. **Documenter la réutilisation de CanvasElement** ou créer une version partagée
3. **Unifier les types de modules** si possible (DesignModule vs Module)

### Améliorations Optionnelles
1. Harmoniser les safe zone radius (décider d'une valeur commune ou documenter la différence)
2. Évaluer si l'onglet "Messages" devrait être ajouté à DesignEditor
3. Considérer l'ajout du support screenId 'all' dans DesignEditor

---

## ✅ Conclusion

Les deux éditeurs partagent **~90% de leur code et architecture**, avec des différences principalement liées à:
- La mécanique de jeu (roue vs cartes)
- Les panneaux de configuration spécifiques
- Quelques ajouts mineurs dans ScratchEditor (Messages, Quiz)

**Aucune différence majeure problématique** n'a été identifiée en dehors des mécaniques de jeu et de l'onglet Jeu, conformément à la demande d'audit.

---

## 🔧 Corrections Appliquées

**Date**: 2025-10-07

### 1. ✅ Renommage QuizToolbar → ScratchToolbar
**Fichier**: `/src/components/ScratchCardEditor/DesignToolbar.tsx`

**Changements**:
- `interface QuizToolbarProps` → `interface ScratchToolbarProps`
- `const QuizToolbar` → `const ScratchToolbar`
- `QuizToolbar.displayName` → `ScratchToolbar.displayName`
- `export default QuizToolbar` → `export default ScratchToolbar`

**Impact**: Cohérence de nommage restaurée, plus de confusion entre Quiz et Scratch.

---

### 2. ✅ Harmonisation Safe Zone Radius
**Fichier**: `/src/components/ScratchCardEditor/DesignCanvas.tsx`

**Avant**:
```typescript
const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 32,  // +8px
  tablet: 28,   // +8px
  mobile: 24    // +8px
};
```

**Après**:
```typescript
const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 24,  // Aligné avec DesignEditor
  tablet: 20,   // Aligné avec DesignEditor
  mobile: 16    // Aligné avec DesignEditor
};
```

**Impact**: Comportement uniforme des zones de sécurité entre les deux éditeurs.

---

### 3. ✅ Documentation Architecture
**Fichier créé**: `/src/components/ScratchCardEditor/ARCHITECTURE.md`

**Contenu**:
- Explication de la réutilisation de CanvasElement
- Liste des composants partagés vs spécifiques
- Différences avec DesignEditor documentées
- Bonnes pratiques pour la maintenance
- Checklist de test pour modifications futures
- Opportunités d'unification identifiées

**Impact**: 
- Clarification du couplage entre ScratchEditor et DesignEditor
- Guide pour les développeurs futurs
- Prévention des régressions lors de modifications

---

## 📊 État Final

### Problèmes Résolus
- ✅ Incohérence de nommage (QuizToolbar)
- ✅ Safe zone radius harmonisé
- ✅ Documentation du couplage CanvasElement

### Différences Acceptées et Documentées
- ⚠️ Réutilisation de CanvasElement (documentée dans ARCHITECTURE.md)
- ⚠️ Types différents (Module vs DesignModule) - candidat à l'unification future
- ⚠️ ScreenId 'all' dans ScratchEditor (fonctionnalité spécifique)

### Recommandations Futures
1. **Unifier les types** : Créer un type `EditorModule` commun
2. **Extraire composants partagés** : Créer un dossier `shared/` pour les composants communs
3. **Tests de régression** : Ajouter des tests E2E pour valider les deux éditeurs simultanément

---

## 📝 Résumé des Fichiers Modifiés

1. **ScratchCardEditor/DesignToolbar.tsx** - Renommage QuizToolbar → ScratchToolbar
2. **ScratchCardEditor/DesignCanvas.tsx** - Harmonisation safe zone radius
3. **ScratchCardEditor/ARCHITECTURE.md** - Nouvelle documentation (créé)
4. **AUDIT_DESIGN_VS_SCRATCH.md** - Mise à jour avec corrections (ce fichier)
