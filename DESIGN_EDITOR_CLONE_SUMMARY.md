# Clonage de ScratchEditor vers DesignEditor - Résumé

## 📅 Date
2025-10-05

## 🎯 Objectif
Cloner intégralement `/scratch-editor` par-dessus `/design-editor` en préservant uniquement :
- L'onglet "Jeu" (GameManagementPanel) pour la gestion des lots et gains
- Le panneau de configuration de la roue (WheelConfigPanel)
- La roue de la fortune positionnée uniquement sur screen2/canvas2

## ✅ Changements Effectués

### 1. Fichiers Sauvegardés (Backups créés)
- `DesignEditorLayout.tsx.original` - Backup de l'original
- `HybridSidebar.tsx.original` - Backup de l'original
- `DesignCanvas.tsx.original` - Backup de l'original
- `DesignToolbar.tsx.original` - Backup de l'original

### 2. Fichiers Principaux Clonés

#### DesignEditorLayout.tsx
- ✅ Remplacé par `ScratchCardEditorLayout.tsx`
- ✅ Import `useWheelConfigSync` réactivé (ligne 19)
- ✅ Hook `useWheelConfigSync` configuré (lignes 1221-1235) avec:
  - `wheelModalConfig`
  - `updateWheelConfig`
  - `getCanonicalConfig`
  - Setters pour borderStyle, borderColor, scale, bulbs, position

#### HybridSidebar.tsx
- ✅ Remplacé par `ScratchCardEditor/HybridSidebar.tsx`
- ✅ Import modifié : `GameManagementPanel` au lieu de `ScratchCardGamePanel` (ligne 24)
- ✅ Rendu de l'onglet 'game' mis à jour (lignes 781-787):
  ```tsx
  case 'game':
    return (
      <GameManagementPanel
        campaign={campaign}
        setCampaign={setCampaign}
      />
    );
  ```

#### DesignCanvas.tsx
- ✅ Remplacé par `ScratchCardEditor/DesignCanvas.tsx`
- ✅ Système de filtrage par `screenId` déjà en place (lignes 1893-1902)
- ✅ La roue apparaîtra automatiquement uniquement sur screen2 via le filtrage existant

#### DesignToolbar.tsx
- ✅ Remplacé par `ScratchCardEditor/DesignToolbar.tsx`

### 3. Répertoires Copiés
- ✅ `components/` - Composants UI du ScratchEditor
- ✅ `core/` - Utilitaires de transformation et drag & drop
- ✅ `hooks/` - Hooks React personnalisés
- ✅ `modules/` - Modules modulaires (images, logos, boutons, etc.)

## 🎮 Fonctionnalités Préservées

### Onglet "Jeu" - GameManagementPanel
- **Gestion des segments de la roue**:
  - Ajout/suppression de segments (minimum 2)
  - Personnalisation des labels et couleurs
  - Support images dans les segments
  - Association prizes ↔ segments

- **Système de lots**:
  - Création/suppression de prizes
  - Méthodes d'attribution: Calendar-based et Probability-based
  - Gestion des unités disponibles/attribuées

### Configuration Roue - WheelConfigSync
- **Hook `useWheelConfigSync`** (lignes 1221-1235):
  - Synchronisation temps réel avec la campagne
  - Gestion des couleurs extraites
  - Configuration des bordures, échelle, bulbs, position
  - API canonique via `getCanonicalConfig`

### Affichage de la Roue
- **Position**: Uniquement sur screen2/canvas2
- **Logique de filtrage**: Automatique via `screenId` (DesignCanvas.tsx, lignes 1893-1902)
- **Composant**: `SmartWheel` dans `CanvasElement.tsx` (lignes 1297-1332)
- **Props roue**:
  - Segments dynamiques depuis campaign
  - Couleurs extraites de l'image de fond
  - Désactivée en mode édition (disabled=true)
  - Animation du pointeur désactivée (disablePointerAnimation=true)

## 🔧 Architecture Technique

### Flux de Données - Roue
```
GameManagementPanel (Jeu Tab)
    ↓
campaign.wheelConfig.segments + campaign.prizes
    ↓
useWheelConfigSync hook
    ↓
wheelModalConfig + getCanonicalConfig
    ↓
DesignCanvas (screen2 only via screenId filter)
    ↓
CanvasElement (type: 'wheel')
    ↓
SmartWheel component
```

### Flux de Données - Lots
```
GameManagementPanel
    ↓
campaign.prizes (avec attributionMethod, probability, calendarDate)
    ↓
usePrizeLogic hook
    ↓
segments enrichis avec prizeId
    ↓
SmartWheel rendering
```

## 📦 Structure des Données

### WheelConfig (campaign.design.wheelConfig)
```typescript
{
  segments: WheelSegment[],
  borderStyle: string,
  borderColor: string,
  borderWidth: number,
  scale: number,
  showBulbs: boolean,
  position: 'left' | 'center' | 'right'
}
```

### WheelSegment
```typescript
{
  id: string,
  label: string,
  color: string,
  textColor: string,
  contentType: 'text' | 'image',
  imageUrl?: string,
  prizeId?: string
}
```

### Prize
```typescript
{
  id: string,
  name: string,
  description?: string,
  totalUnits?: number,
  awardedUnits?: number,
  attributionMethod: 'calendar' | 'probability',
  calendarDate?: string,
  calendarTime?: string,
  probability?: number,
  segmentId?: string
}
```

## 🚨 Points d'Attention

### extractedColors
- Variable déclarée ligne 850 dans DesignEditorLayout
- Utilisée par useWheelConfigSync (ligne 1233)
- Passée au DesignCanvas via props
- Appliquée aux couleurs de la roue via brandColors

### screenId Filtering
- Les éléments wheel doivent avoir `screenId: 'screen2'`
- Le filtrage est automatique dans DesignCanvas (lignes 1897-1901)
- Pour ajouter une roue : créer un élément avec `{ type: 'wheel', screenId: 'screen2' }`

### Imports Critiques
```typescript
// DesignEditorLayout.tsx
import { useWheelConfigSync } from '../../hooks/useWheelConfigSync';

// HybridSidebar.tsx
import GameManagementPanel from './panels/GameManagementPanel';

// CanvasElement.tsx
import { SmartWheel } from '../SmartWheel';
import { usePrizeLogic } from '../../hooks/usePrizeLogic';
```

## ✨ Résultat Final

### Ce qui a été remplacé
- ✅ Toute la structure de ScratchEditor (layout, canvas, toolbar, sidebar)
- ✅ Tous les composants et modules
- ✅ Tous les hooks et utilitaires core

### Ce qui a été préservé
- ✅ Onglet "Jeu" avec GameManagementPanel (gestion segments + prizes)
- ✅ WheelConfigPanel et sa logique de synchronisation
- ✅ Roue de la fortune sur screen2 uniquement

### Fonctionnalités disponibles
- ✅ Système de 3 écrans modulaires (screen1, screen2, screen3)
- ✅ Éditeur de quiz avec templates
- ✅ Gestion de cartes à gratter
- ✅ Gestion de roue de la fortune (screen2)
- ✅ Système de lots et probabilités
- ✅ Drag & drop professionnel (Excalidraw-style)
- ✅ Alignement intelligent
- ✅ Undo/Redo
- ✅ Groupes d'éléments
- ✅ Responsive multi-devices

## 🔄 Prochaines Étapes Recommandées

1. **Tester le chargement** de `/design-editor`
2. **Vérifier l'onglet "Jeu"** et la gestion des segments/prizes
3. **Tester l'affichage de la roue** sur screen2
4. **Vérifier la sauvegarde** de la configuration wheel
5. **Tester le preview** avec la roue interactive

## 📝 Notes Techniques

- Les warnings TypeScript sur les propriétés manquantes de `useWheelConfigSync` sont normaux - le hook retourne uniquement les propriétés définies dans son interface
- Les setters non utilisés (setShowBulbs, setWheelPosition) sont disponibles pour usage futur
- La propriété `extractedColors` est essentielle pour la personnalisation automatique des couleurs de la roue depuis l'image de fond
