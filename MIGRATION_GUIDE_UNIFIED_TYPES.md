# Guide de Migration - Types Unifiés

## 📋 Vue d'ensemble

Ce guide documente la migration vers le nouveau système de types unifié implémentant les recommandations de l'audit des éditeurs.

**Date de création**: 17 octobre 2025  
**Statut**: Phase 1 - Infrastructure créée  
**Impact**: Réduction de ~220 lignes de code dupliqué

---

## 🎯 Objectifs

1. **Éliminer la duplication** entre `designEditorModular.ts` et `modularEditor.ts`
2. **Standardiser les interfaces** de props pour tous les éditeurs
3. **Centraliser les constantes** de design et de boutons
4. **Harmoniser les imports** React Router

---

## 📁 Nouveaux Fichiers Créés

### 1. Types Unifiés

**Fichier**: `src/types/shared/modules.ts`

Remplace:
- ❌ `src/types/designEditorModular.ts` (220 lignes)
- ❌ `src/types/modularEditor.ts` (226 lignes)

**Exports principaux**:
```typescript
// Types de base
export type ModuleType = 'BlocTexte' | 'BlocImage' | ...;
export type ScreenId = 'screen1' | 'screen2' | 'screen3';
export interface BaseModule { ... }

// Types de modules spécifiques
export interface BlocTexte extends BaseModule { ... }
export interface BlocImage extends BaseModule { ... }
export interface BlocBouton extends BaseModule { ... }
// ... etc.

// Type union
export type Module = BlocTexte | BlocImage | BlocBouton | ...;

// Utilitaires
export interface ModularPage { ... }
export const createEmptyModularPage = () => ({ ... });

// Alias legacy pour rétrocompatibilité
export type DesignModule = Module;
export type DesignModuleType = ModuleType;
// ... etc.
```

### 2. Props Standardisées

**Fichier**: `src/types/shared/editorProps.ts`

**Interfaces**:
```typescript
// Props de base pour tous les éditeurs
export interface BaseEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

// Props étendues pour éditeurs avec overlay de formulaire
export interface ExtendedEditorLayoutProps extends BaseEditorLayoutProps {
  showFormOverlay?: boolean;
}

// Props pour éditeurs de jeux
export interface GameEditorLayoutProps extends BaseEditorLayoutProps {
  initialGameConfig?: any;
  onGameConfigChange?: (config: any) => void;
}

// Valeurs par défaut
export const DEFAULT_EDITOR_PROPS = {
  mode: 'campaign',
  hiddenTabs: []
};
```

### 3. Constantes Centralisées

**Fichier**: `src/components/shared/designTokens.ts` (amélioré)

**Nouvelles constantes**:
```typescript
// Constantes de boutons de lancement
export const LAUNCH_BUTTON_DEFAULTS = {
  GRADIENT: '#000000',
  TEXT_COLOR: '#ffffff',
  PADDING: '14px 28px',
  SHADOW: '0 4px 12px rgba(0, 0, 0, 0.15)',
  BORDER_RADIUS: '12px',
  FONT_WEIGHT: 600,
  MIN_WIDTH: '200px',
};

// Fonction de style de bouton de lancement
export const buildLaunchButtonStyles = (
  buttonModule: any,
  styleOverrides: Record<string, any>,
  config?: { ... }
): React.CSSProperties => { ... }
```

### 4. Index d'Export

**Fichier**: `src/types/shared/index.ts`

```typescript
// Permet des imports propres
export * from './modules';
export * from './editorProps';
```

---

## 🔄 Migration Progressive

### Phase 1 ✅ - Infrastructure (Complétée)

- [x] Créer `src/types/shared/modules.ts`
- [x] Créer `src/types/shared/editorProps.ts`
- [x] Améliorer `src/components/shared/designTokens.ts`
- [x] Créer `src/types/shared/index.ts`
- [x] Créer ce guide de migration

### Phase 2 🔄 - Migration des Éditeurs (À faire)

Pour chaque éditeur, suivre ces étapes:

#### Étape 1: Mettre à jour les imports de types

**Avant**:
```typescript
// Dans DesignEditor
import { DesignModule, DesignModuleType } from '@/types/designEditorModular';

// Dans QuizEditor
import { Module, ModuleType } from '@/types/modularEditor';
```

**Après**:
```typescript
// Dans tous les éditeurs
import { Module, ModuleType } from '@/types/shared';

// Ou utiliser les alias legacy temporairement
import { DesignModule, DesignModuleType } from '@/types/shared';
```

#### Étape 2: Ajouter l'interface de props

**Avant**:
```typescript
// QuizEditor - Pas de props déclarées
const QuizEditorLayout = () => {
  const mode = 'campaign'; // hardcodé
  // ...
}

// DesignEditor - Props non standardisées
interface DesignEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}
```

**Après**:
```typescript
// Pour éditeurs simples (DesignEditor, QuizEditor, JackpotEditor)
import { BaseEditorLayoutProps } from '@/types/shared';

interface QuizEditorLayoutProps extends BaseEditorLayoutProps {
  // Props spécifiques au quiz si nécessaire
}

const QuizEditorLayout: React.FC<QuizEditorLayoutProps> = ({ 
  mode = 'campaign',
  hiddenTabs = [],
  ...props 
}) => {
  // ...
}

// Pour éditeurs avec formulaire (ModelEditor, FormEditor)
import { ExtendedEditorLayoutProps } from '@/types/shared';

const ModelEditorLayout: React.FC<ExtendedEditorLayoutProps> = ({
  mode = 'campaign',
  hiddenTabs = [],
  showFormOverlay = false,
  ...props
}) => {
  // ...
}
```

#### Étape 3: Utiliser les constantes centralisées

**Avant**:
```typescript
// Dans QuizEditor
const LAUNCH_BUTTON_FALLBACK_GRADIENT = '#000000';
const LAUNCH_BUTTON_DEFAULT_TEXT_COLOR = '#ffffff';
const LAUNCH_BUTTON_DEFAULT_PADDING = '14px 28px';

// Fonction locale dupliquée
const buildLaunchButtonStyles = (buttonModule, styleOverrides) => {
  // 60 lignes de code...
}
```

**Après**:
```typescript
// Dans tous les éditeurs
import { 
  LAUNCH_BUTTON_DEFAULTS, 
  buildLaunchButtonStyles 
} from '@/components/shared/designTokens';

// Utiliser directement
const styles = buildLaunchButtonStyles(buttonModule, styleOverrides, {
  brandColors: campaign?.design?.customColors,
  defaultGradient: LAUNCH_BUTTON_DEFAULTS.GRADIENT
});
```

#### Étape 4: Harmoniser les imports React Router

**Avant**:
```typescript
// Certains éditeurs
import { useLocation, useNavigate } from 'react-router-dom';
```

**Après**:
```typescript
// Tous les éditeurs
import { useLocation, useNavigate } from '@/lib/router-adapter';
```

---

## 📊 Plan de Migration par Éditeur

### DesignEditor (/design-editor)
- **Priorité**: 🔴 Haute (éditeur de référence)
- **Complexité**: Moyenne
- **Étapes**:
  1. Remplacer imports `designEditorModular` → `shared/modules`
  2. Utiliser `BaseEditorLayoutProps`
  3. Tester fonctionnalités wheel

### TemplateEditor (/template-editor)
- **Priorité**: 🟠 Moyenne (réutilise DesignEditor)
- **Complexité**: Faible
- **Étapes**:
  1. Valider que la migration de DesignEditor fonctionne
  2. Tester mode template

### QuizEditor (/quiz-editor)
- **Priorité**: 🔴 Haute (3182 lignes)
- **Complexité**: Élevée
- **Étapes**:
  1. Remplacer imports `modularEditor` → `shared/modules`
  2. Ajouter `BaseEditorLayoutProps`
  3. Remplacer fonction locale `buildLaunchButtonStyles`
  4. Remplacer constantes par `LAUNCH_BUTTON_DEFAULTS`
  5. Harmoniser imports React Router

### ModelEditor (/model-editor)
- **Priorité**: 🟠 Moyenne (2005 lignes)
- **Complexité**: Moyenne
- **Étapes**:
  1. Remplacer imports `modularEditor` → `shared/modules`
  2. Utiliser `ExtendedEditorLayoutProps`
  3. Harmoniser imports React Router

### FormEditor (/form-editor)
- **Priorité**: 🟢 Faible (réutilise ModelEditor)
- **Complexité**: Faible
- **Étapes**:
  1. Valider que ModelEditor fonctionne
  2. Tester `showFormOverlay={true}`

### JackpotEditor (/jackpot-editor)
- **Priorité**: 🔴 Haute (2996 lignes)
- **Complexité**: Élevée
- **Étapes**:
  1. Remplacer imports `modularEditor` → `shared/modules`
  2. Ajouter `BaseEditorLayoutProps`
  3. Remplacer fonction locale `buildLaunchButtonStyles`
  4. Remplacer constantes par `LAUNCH_BUTTON_DEFAULTS`
  5. Harmoniser imports React Router

### ScratchCardEditor (/scratch-card-editor)
- **Priorité**: 🔴 Haute (3080 lignes)
- **Complexité**: Élevée
- **Étapes**:
  1. Remplacer imports `modularEditor` → `shared/modules`
  2. Ajouter `BaseEditorLayoutProps`
  3. Harmoniser imports React Router
  4. Tester intégration `useScratchCardStore`

### ScratchCard2 (/scratch-card-2)
- **Priorité**: 🟢 Faible (réutilise ScratchCardEditor)
- **Complexité**: Faible
- **Étapes**:
  1. Valider que ScratchCardEditor fonctionne

---

## ✅ Checklist de Migration (par éditeur)

```markdown
### [Nom de l'éditeur]
- [ ] Remplacer imports types anciens → `@/types/shared`
- [ ] Ajouter interface de props appropriée
- [ ] Remplacer constantes locales → `LAUNCH_BUTTON_DEFAULTS`
- [ ] Remplacer fonction locale → `buildLaunchButtonStyles`
- [ ] Harmoniser imports React Router → `@/lib/router-adapter`
- [ ] Tests manuels: création, édition, sauvegarde
- [ ] Tests manuels: preview, multi-screens
- [ ] Validation build TypeScript
- [ ] Validation tests unitaires (si existants)
```

---

## 🧪 Tests de Non-Régression

Après migration de chaque éditeur:

### Tests Fonctionnels
1. ✅ Création d'une nouvelle campagne
2. ✅ Édition d'éléments sur les 3 écrans
3. ✅ Sauvegarde et rechargement
4. ✅ Preview mode
5. ✅ Zoom et navigation
6. ✅ Undo/Redo
7. ✅ Raccourcis clavier

### Tests TypeScript
```bash
npm run typecheck
```

### Tests Visuels
- Vérifier que les boutons ont le bon style
- Vérifier que les modules s'affichent correctement
- Vérifier que les couleurs de marque sont appliquées

---

## 📈 Métriques d'Impact

### Avant Migration
- **Fichiers de types**: 2 (designEditorModular + modularEditor)
- **Lignes dupliquées**: ~220 lignes
- **Constantes dupliquées**: ~40 lignes × 3 éditeurs = 120 lignes
- **Fonctions dupliquées**: ~60 lignes × 2 éditeurs = 120 lignes
- **Total duplication**: ~460 lignes

### Après Migration (Objectif)
- **Fichiers de types**: 1 (shared/modules)
- **Lignes dupliquées**: 0
- **Constantes dupliquées**: 0
- **Fonctions dupliquées**: 0
- **Total duplication**: 0 ✅

**Gain net**: **-460 lignes** (~-2.8% du code total des éditeurs)

---

## 🚨 Points d'Attention

### Rétrocompatibilité
Les **alias legacy** permettent une migration progressive:
```typescript
// Ces imports continuent de fonctionner
import { DesignModule } from '@/types/shared';
import { Module } from '@/types/shared';

// Mais il est recommandé d'utiliser
import { Module } from '@/types/shared';
```

### Suppression des anciens fichiers
**NE PAS SUPPRIMER** avant d'avoir migré tous les éditeurs:
- `src/types/designEditorModular.ts`
- `src/types/modularEditor.ts`

**Ordre de suppression**:
1. Migrer tous les éditeurs vers `@/types/shared`
2. Rechercher tous les imports des anciens fichiers: `grep -r "designEditorModular\|modularEditor" src/`
3. Si 0 résultat → Supprimer les fichiers
4. Supprimer les alias legacy de `src/types/shared/modules.ts`

---

## 📚 Ressources

### Documentation Connexe
- [AUDIT_IMPLEMENTATION_COMPLETE.md](./AUDIT_IMPLEMENTATION_COMPLETE.md) - Audit complet
- [HARMONISATION_COMPLETE.md](./HARMONISATION_COMPLETE.md) - Harmonisation Design vs Scratch
- [src/components/JackpotEditor/ARCHITECTURE.md](./src/components/JackpotEditor/ARCHITECTURE.md)

### Fichiers Clés
- `src/types/shared/modules.ts` - Types unifiés
- `src/types/shared/editorProps.ts` - Props standardisées
- `src/components/shared/designTokens.ts` - Constantes centralisées
- `src/lib/router-adapter.ts` - Adaptateur de routage

---

## 🎯 Prochaines Étapes

### Immédiat (Cette semaine)
1. Migrer **DesignEditor** (éditeur de référence)
2. Valider les tests
3. Migrer **TemplateEditor** (utilise DesignEditor)

### Court terme (1-2 semaines)
4. Migrer **QuizEditor** (le plus gros)
5. Migrer **JackpotEditor**
6. Migrer **ScratchCardEditor**

### Moyen terme (3-4 semaines)
7. Migrer **ModelEditor** et **FormEditor**
8. Valider tous les tests E2E
9. Supprimer les anciens fichiers de types
10. Supprimer les alias legacy

---

## ✍️ Contributeurs

- **Phase 1 - Infrastructure**: AI Assistant (17 oct 2025)
- **Phase 2 - Migration**: À venir

---

**Dernière mise à jour**: 17 octobre 2025  
**Statut**: ✅ Phase 1 Complétée - Infrastructure prête
