# 📊 Analyse Complète de l'Harmonisation des Éditeurs

## 🎯 Objectif
Harmoniser tous les éditeurs pour qu'ils aient exactement le même système de modules, panneaux, interfaces, fonctionnalités et comportements.

## 📁 Éditeurs Identifiés

### 1. **DesignEditor** (`/src/components/DesignEditor/`)
- **Route**: `/design-editor`
- **Type**: Éditeur de design générique
- **Composants clés**:
  - `DesignEditorLayout.tsx`
  - `HybridSidebar.tsx`
  - `DesignToolbar.tsx`
  - `DesignCanvas.tsx`
  - `MobileStableEditor.tsx`
  - `ZoomSlider.tsx`

### 2. **QuizEditor** (`/src/components/QuizEditor/`)
- **Route**: `/quiz-editor`
- **Type**: Éditeur de quiz
- **Composants clés**:
  - `DesignEditorLayout.tsx`
  - `HybridSidebar.tsx`
  - `DesignToolbar.tsx`
  - `DesignCanvas.tsx`
  - `MobileStableEditor.tsx`
  - `ZoomSlider.tsx`
  - `QuizConfigPanel.tsx`
  - `QuizManagementPanel.tsx`

### 3. **ModelEditor** (`/src/components/ModelEditor/`)
- **Route**: `/model-editor`
- **Type**: Template de base pour nouveaux éditeurs
- **Composants clés**:
  - `DesignEditorLayout.tsx`
  - `HybridSidebar.tsx`
  - `DesignToolbar.tsx`
  - `DesignCanvas.tsx`
  - `MobileStableEditor.tsx`
  - `ZoomSlider.tsx`

### 4. **JackpotEditor** (`/src/components/JackpotEditor/`)
- **Route**: `/jackpot-editor`
- **Type**: Éditeur de jackpot/slot machine
- **Composants clés**:
  - `JackpotEditorLayout.tsx`
  - `HybridSidebar.tsx`
  - `DesignToolbar.tsx`
  - `DesignCanvas.tsx`
  - `MobileStableEditor.tsx`
  - `ZoomSlider.tsx`

### 5. **ScratchCardEditor** (`/src/components/ScratchCardEditor/`)
- **Route**: `/scratch-card-editor`
- **Type**: Éditeur de cartes à gratter
- **Composants clés**:
  - `ScratchCardEditorLayout.tsx`
  - `HybridSidebar.tsx`
  - `DesignToolbar.tsx`
  - `DesignCanvas.tsx`
  - `MobileStableEditor.tsx`
  - `ZoomSlider.tsx`
  - `useScratchCardStore.ts`

## 🔍 Différences Identifiées

### A. **Imports et Dépendances**

#### DesignEditor
```tsx
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';
import PreviewRenderer from '@/components/preview/PreviewRenderer';
```

#### QuizEditor
```tsx
import { useLocation, useNavigate } from '@/lib/router-adapter';
import { useEditorPreviewSync } from '@/hooks/useEditorPreviewSync';
import PreviewRenderer from '@/components/preview/PreviewRenderer';
import { quizTemplates } from '../../types/quizTemplates';
// NO wheel config sync
```

#### ModelEditor
```tsx
import { useLocation, useNavigate } from 'react-router-dom'; // ❌ Différent!
import FunnelUnlockedGame from '@/components/funnels/FunnelUnlockedGame';
import EditorStateCleanup from '../EditorStateCleanup';
// NO wheel config sync
```

#### JackpotEditor & ScratchCardEditor
```tsx
import { useLocation, useNavigate } from 'react-router-dom'; // ❌ Différent!
import FunnelUnlockedGame from '@/components/funnels/FunnelUnlockedGame';
import FunnelQuizParticipate from '../funnels/FunnelQuizParticipate';
// NO wheel config sync
```

### B. **HybridSidebar - Onglets Disponibles**

#### DesignEditor
```tsx
const allTabs = [
  { id: 'background', label: 'Design', icon: Palette },
  { id: 'elements', label: 'Éléments', icon: Plus },
  { id: 'form', label: 'Formulaire', icon: FormInput },
  { id: 'game', label: 'Jeu', icon: Gamepad2 },
  { id: 'messages', label: 'Sortie', icon: MessageSquare }
];
```

#### QuizEditor
```tsx
const allTabs = [
  { id: 'background', label: 'Design', icon: Palette },
  { id: 'elements', label: 'Éléments', icon: Plus },
  { id: 'form', label: 'Formulaire', icon: FormInput },
  { id: 'game', label: 'Jeu', icon: Gamepad2 }
  // ❌ PAS de 'messages'
];
```

#### ModelEditor, JackpotEditor, ScratchCardEditor
- **À vérifier** - Probablement similaires mais avec variations

### C. **Panneaux de Jeu (Game Tab)**

#### DesignEditor
```tsx
case 'game':
  return (
    <div className="h-full overflow-y-auto">
      <QuizManagementPanel 
        campaign={campaign}
        setCampaign={setCampaign}
      />
    </div>
  );
```

#### QuizEditor
```tsx
case 'game':
  return (
    <div className="h-full overflow-y-auto">
      <QuizManagementPanel 
        campaign={campaign}
        setCampaign={setCampaign}
      />
    </div>
  );
```

#### ScratchCardEditor
- **Probablement**: `ScratchCardGamePanel` au lieu de `QuizManagementPanel`

#### JackpotEditor
- **Probablement**: `JackpotGamePanel` au lieu de `QuizManagementPanel`

### D. **Hooks Utilisés**

| Hook | DesignEditor | QuizEditor | ModelEditor | JackpotEditor | ScratchCardEditor |
|------|--------------|------------|-------------|---------------|-------------------|
| `useWheelConfigSync` | ✅ | ❌ | ❌ | ❌ | ❌ |
| `useEditorPreviewSync` | ❌ | ✅ | ❌ | ❌ | ❌ |
| `useKeyboardShortcuts` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `useUndoRedo` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `useGroupManager` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `useScratchCardStore` | ❌ | ❌ | ❌ | ❌ | ✅ |

### E. **Composants de Preview**

| Éditeur | Composant Preview |
|---------|-------------------|
| DesignEditor | `PreviewRenderer` |
| QuizEditor | `PreviewRenderer` |
| ModelEditor | `FunnelUnlockedGame` |
| JackpotEditor | `FunnelUnlockedGame` + `FunnelQuizParticipate` |
| ScratchCardEditor | `FunnelUnlockedGame` + `FunnelQuizParticipate` |

### F. **Lazy Loading**

#### DesignEditor & QuizEditor
```tsx
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
const DesignCanvas = lazy(() => import('./DesignCanvas'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));
const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
```

#### ModelEditor
```tsx
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
// ❌ DesignCanvas NOT lazy
import DesignCanvas from './DesignCanvas';
```

### G. **Configurations Spécifiques**

#### QuizEditor & JackpotEditor & ScratchCardEditor
```tsx
const LAUNCH_BUTTON_FALLBACK_GRADIENT = '#000000';
const LAUNCH_BUTTON_DEFAULT_TEXT_COLOR = '#ffffff';
const LAUNCH_BUTTON_DEFAULT_PADDING = '14px 28px';
const LAUNCH_BUTTON_DEFAULT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.15)';

const buildLaunchButtonStyles = (...) => { ... }
```

#### DesignEditor & ModelEditor
- **Pas de** `buildLaunchButtonStyles`

#### ScratchCardEditor
```tsx
const SCRATCH_DEFAULT_COLOR = '#C0C0C0';
const transformScratchStateToGameConfig = (state?: any) => { ... }
```

## 🎯 Architecture de Référence Unifiée

### 1. **Structure de Fichiers Standard**
```
EditorName/
├── EditorNameLayout.tsx          # Layout principal
├── HybridSidebar.tsx             # Sidebar unifiée
├── DesignToolbar.tsx             # Toolbar unifiée
├── DesignCanvas.tsx              # Canvas unifié
├── components/
│   ├── MobileStableEditor.tsx    # Mobile wrapper
│   └── ZoomSlider.tsx            # Contrôle zoom
├── panels/
│   ├── GamePanel.tsx             # Panneau jeu spécifique
│   ├── ConfigPanel.tsx           # Configuration
│   └── ...
├── modules/
│   ├── ImageModulePanel.tsx
│   ├── ButtonModulePanel.tsx
│   └── ...
└── hooks/
    └── useEditorSpecific.ts      # Hooks spécifiques
```

### 2. **Imports Standardisés**
```tsx
// Router (TOUJOURS via adapter)
import { useLocation, useNavigate } from '@/lib/router-adapter';

// Hooks communs
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { useGroupManager } from '../../hooks/useGroupManager';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';

// Store
import { useEditorStore } from '../../stores/editorStore';
import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';

// Composants partagés (lazy)
const HybridSidebar = lazy(() => import('./HybridSidebar'));
const DesignToolbar = lazy(() => import('./DesignToolbar'));
const DesignCanvas = lazy(() => import('./DesignCanvas'));
const MobileStableEditor = lazy(() => import('./components/MobileStableEditor'));
const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));

// Preview (conditionnel selon type)
import PreviewRenderer from '@/components/preview/PreviewRenderer'; // Pour Design/Quiz
// OU
const FunnelUnlockedGame = lazy(() => import('@/components/funnels/FunnelUnlockedGame')); // Pour autres
```

### 3. **Onglets HybridSidebar Standard**
```tsx
const allTabs = [
  { id: 'background', label: 'Design', icon: Palette },
  { id: 'elements', label: 'Éléments', icon: Plus },
  { id: 'form', label: 'Formulaire', icon: FormInput },
  { id: 'game', label: 'Jeu', icon: Gamepad2 },
  { id: 'messages', label: 'Sortie', icon: MessageSquare }
];
```

### 4. **Hooks Standard par Éditeur**

#### Tous les éditeurs
- `useKeyboardShortcuts`
- `useUndoRedo`
- `useUndoRedoShortcuts`
- `useGroupManager`
- `useEditorStore`
- `useCampaigns`

#### Éditeurs avec roue
- `useWheelConfigSync` (DesignEditor uniquement pour l'instant)

#### Éditeurs avec quiz
- `useEditorPreviewSync` (QuizEditor)

#### Éditeurs spécifiques
- `useScratchCardStore` (ScratchCardEditor)

### 5. **Panneaux de Modules Standard**
```tsx
// Tous les éditeurs doivent avoir:
- ImageModulePanel
- LogoModulePanel
- FooterModulePanel
- ButtonModulePanel
- VideoModulePanel
- SocialModulePanel
- HtmlModulePanel
- CartePanel
```

### 6. **Panneaux Spéciaux Standard**
```tsx
// Tous les éditeurs doivent avoir:
- BackgroundPanel (Design)
- CompositeElementsPanel (Éléments)
- TextEffectsPanel (Effets)
- TextAnimationsPanel (Animations)
- PositionPanel (Position)
- ModernFormTab (Formulaire)
- MessagesPanel (Sortie)

// Spécifique au type de jeu:
- QuizManagementPanel (Quiz)
- GameManagementPanel (Roue)
- ScratchCardGamePanel (Scratch)
- JackpotGamePanel (Jackpot)
```

## 📋 Plan d'Harmonisation

### Phase 1: Standardisation des Imports
- [ ] Tous les éditeurs utilisent `@/lib/router-adapter`
- [ ] Tous les éditeurs ont les mêmes lazy imports
- [ ] Tous les éditeurs importent les mêmes hooks de base

### Phase 2: Standardisation des HybridSidebar
- [ ] Tous les éditeurs ont les 5 onglets standard
- [ ] Tous les éditeurs ont les mêmes panneaux de modules
- [ ] Tous les éditeurs ont la même logique de collapse/expand

### Phase 3: Standardisation des DesignToolbar
- [ ] Même interface
- [ ] Mêmes boutons
- [ ] Même logique de device selector

### Phase 4: Standardisation des DesignCanvas
- [ ] Même système de drag & drop
- [ ] Même système de sélection
- [ ] Même système de zoom

### Phase 5: Standardisation des Composants Partagés
- [ ] MobileStableEditor identique partout
- [ ] ZoomSlider identique partout
- [ ] KeyboardShortcutsHelp identique partout

### Phase 6: Hooks Spécifiques
- [ ] Identifier quels hooks doivent être partagés
- [ ] Créer des hooks conditionnels pour fonctionnalités spécifiques

### Phase 7: Tests
- [ ] Tester chaque éditeur individuellement
- [ ] Vérifier la cohérence entre tous les éditeurs
- [ ] Valider les fonctionnalités spécifiques

## 🚨 Points d'Attention

### 1. **Router Adapter**
- DesignEditor et QuizEditor utilisent `@/lib/router-adapter`
- ModelEditor, JackpotEditor, ScratchCardEditor utilisent `react-router-dom` directement
- **Action**: Migrer tous vers `@/lib/router-adapter`

### 2. **Preview Components**
- DesignEditor et QuizEditor utilisent `PreviewRenderer`
- Autres utilisent `FunnelUnlockedGame`
- **Action**: Standardiser ou rendre conditionnel

### 3. **Lazy Loading**
- ModelEditor n'a pas DesignCanvas en lazy
- **Action**: Uniformiser le lazy loading

### 4. **Panneaux de Jeu**
- Chaque éditeur a son propre panneau de jeu
- **Action**: Créer une interface commune

### 5. **Messages Tab**
- DesignEditor a l'onglet Messages
- QuizEditor ne l'a pas
- **Action**: Ajouter partout ou rendre optionnel

## 🎨 Composants à Créer/Partager

### 1. **BaseEditorLayout**
Un composant de base dont tous les layouts héritent:
```tsx
interface BaseEditorLayoutProps {
  editorType: 'design' | 'quiz' | 'model' | 'jackpot' | 'scratch';
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
  gamePanel?: React.ComponentType<any>;
  previewComponent?: React.ComponentType<any>;
}
```

### 2. **UnifiedHybridSidebar**
Une sidebar qui s'adapte au type d'éditeur:
```tsx
interface UnifiedHybridSidebarProps extends BaseHybridSidebarProps {
  editorType: 'design' | 'quiz' | 'model' | 'jackpot' | 'scratch';
  gamePanelComponent?: React.ComponentType<any>;
}
```

### 3. **EditorHooksProvider**
Un provider qui fournit tous les hooks nécessaires:
```tsx
<EditorHooksProvider editorType="quiz">
  {children}
</EditorHooksProvider>
```

## 📊 Matrice de Compatibilité

| Fonctionnalité | Design | Quiz | Model | Jackpot | Scratch |
|----------------|--------|------|-------|---------|---------|
| Router Adapter | ✅ | ✅ | ❌ | ❌ | ❌ |
| Lazy Loading | ✅ | ✅ | ⚠️ | ⚠️ | ⚠️ |
| 5 Onglets | ✅ | ❌ | ? | ? | ? |
| Wheel Sync | ✅ | ❌ | ❌ | ❌ | ❌ |
| Preview Sync | ❌ | ✅ | ❌ | ❌ | ❌ |
| Messages Panel | ✅ | ❌ | ? | ? | ? |
| Module Panels | ✅ | ✅ | ✅ | ✅ | ✅ |

## 🎯 Objectif Final

**Tous les éditeurs doivent avoir**:
1. ✅ Même structure de fichiers
2. ✅ Mêmes imports standardisés
3. ✅ Mêmes 5 onglets (Design, Éléments, Formulaire, Jeu, Sortie)
4. ✅ Mêmes panneaux de modules
5. ✅ Mêmes hooks de base
6. ✅ Même système de lazy loading
7. ✅ Même logique de device detection
8. ✅ Même système de zoom
9. ✅ Même système de drag & drop
10. ✅ Même système de sélection
11. ✅ Même système de groupes
12. ✅ Même système d'undo/redo
13. ✅ Même système de raccourcis clavier
14. ✅ Panneau de jeu spécifique mais interface commune
15. ✅ Preview component adapté au type mais interface commune
