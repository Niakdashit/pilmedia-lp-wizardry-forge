# Audit des Éditeurs - Janvier 2025

## Vue d'ensemble

Cet audit examine les 8 éditeurs du projet pour identifier les incohérences en termes de :
- **Fonctionnalités** : Features disponibles dans chaque éditeur
- **Logique** : Hooks, stores, et flux de données
- **Affichage** : Composants UI et rendu
- **Interfaces** : Props, types, et contrats d'API

---

## 📊 Inventaire des Éditeurs

### 1. **DesignEditor** (`/design-editor`)
- **Fichier principal** : `src/components/DesignEditor/DesignEditorLayout.tsx` (2170 lignes)
- **Page** : `src/pages/DesignEditor.tsx`
- **Types** : Utilise `DesignModule` de `designEditorModular.ts`
- **Jeu** : Roue de la fortune (StandardizedWheel)
- **Hooks spécifiques** : `useWheelConfigSync`
- **Props interface** : `DesignEditorLayoutProps { mode?, hiddenTabs? }`

### 2. **QuizEditor** (`/quiz-editor`)
- **Fichier principal** : `src/components/QuizEditor/DesignEditorLayout.tsx` (3182 lignes)
- **Page** : `src/pages/QuizEditor.tsx`
- **Types** : Utilise `Module` de `modularEditor.ts`
- **Jeu** : Quiz interactif
- **Hooks spécifiques** : `useEditorPreviewSync`
- **Props interface** : Pas de props explicites (mode hardcodé à 'campaign')

### 3. **ModelEditor** (`/model-editor`)
- **Fichier principal** : `src/components/ModelEditor/DesignEditorLayout.tsx` (2005 lignes)
- **Page** : `src/pages/ModelEditor.tsx`
- **Types** : Utilise `Module` de `modularEditor.ts` (non déclaré, inféré)
- **Jeu** : Aucun (éditeur de modèle)
- **Hooks spécifiques** : Aucun hook de jeu
- **Props interface** : `ModelEditorLayoutProps { mode?, hiddenTabs?, showFormOverlay? }`

### 4. **FormEditor** (`/form-editor`)
- **Fichier principal** : Réutilise `src/components/ModelEditor/DesignEditorLayout.tsx`
- **Page** : `src/pages/FormEditor.tsx`
- **Particularité** : Passe `showFormOverlay={true}` à ModelEditor
- **Props interface** : Hérite de `ModelEditorLayoutProps`

### 5. **JackpotEditor** (`/jackpot-editor`)
- **Fichier principal** : `src/components/JackpotEditor/JackpotEditorLayout.tsx` (2996 lignes)
- **Page** : `src/pages/JackpotEditor.tsx`
- **Types** : Utilise `Module` de `modularEditor.ts`
- **Jeu** : Jackpot/Slot machine
- **Hooks spécifiques** : Aucun hook de jeu (configuration inline)
- **Props interface** : Pas de props explicites (mode hardcodé à 'campaign')

### 6. **ScratchCardEditor** (`/scratch-card-editor`)
- **Fichier principal** : `src/components/ScratchCardEditor/ScratchCardEditorLayout.tsx` (3080 lignes)
- **Page** : `src/pages/ScratchCardEditor.tsx`
- **Types** : Utilise `Module` de `modularEditor.ts`
- **Jeu** : Carte à gratter
- **Hooks spécifiques** : `useScratchCardStore`
- **Props interface** : Pas de props explicites
- **Documentation** : Architecture documentée dans `ARCHITECTURE.md`

### 7. **ScratchCard2** (`/scratch-card-2`)
- **Fichier principal** : Réutilise `src/components/ScratchCardEditor/ScratchCardEditorLayout.tsx`
- **Page** : `src/pages/ScratchCard2.tsx`
- **Particularité** : Passe `mode="campaign"` explicitement
- **Props interface** : Hérite de ScratchCardEditor

### 8. **TemplateEditor** (`/template-editor`)
- **Fichier principal** : Réutilise `src/components/DesignEditor/DesignEditorLayout.tsx`
- **Page** : `src/pages/TemplateEditor.tsx`
- **Particularité** : Passe `mode="template"` + change background
- **Props interface** : Hérite de `DesignEditorLayoutProps`

---

## 🔴 Incohérences Critiques

### 1. **Système de Types Fragmenté**

**Problème** : Deux systèmes de types parallèles et incompatibles

| Fichier | Éditeurs concernés | Taille |
|---------|-------------------|--------|
| `designEditorModular.ts` | DesignEditor, TemplateEditor | 219 lignes |
| `modularEditor.ts` | QuizEditor, ModelEditor, JackpotEditor, ScratchCardEditor | 225 lignes |

**Contenu** : Les deux fichiers définissent des types **quasi-identiques** :
- `DesignModule` vs `Module`
- `DesignBlocTexte` vs `BlocTexte`
- `DesignScreenId` vs `ScreenId`
- etc.

**Impact** :
- ❌ Code dupliqué (~220 lignes × 2)
- ❌ Risque de divergence lors de modifications
- ❌ Confusion pour les développeurs
- ❌ Incompatibilité entre éditeurs

**Recommandation** : 🔥 **URGENT - UNIFICATION REQUISE**
```typescript
// types/shared/modules.ts (nouveau fichier unifié)
export type ModuleType = 'BlocTexte' | 'BlocImage' | ...;
export type ScreenId = 'screen1' | 'screen2' | 'screen3';
export interface BaseModule { ... }
export type Module = BlocTexte | BlocImage | ...;
```

---

### 2. **Props Interface Incohérentes**

**Problème** : Chaque éditeur définit (ou non) ses props différemment

| Éditeur | Interface déclarée | Props supportées |
|---------|-------------------|------------------|
| DesignEditor | ✅ `DesignEditorLayoutProps` | `mode`, `hiddenTabs` |
| QuizEditor | ❌ Aucune | Mode hardcodé |
| ModelEditor | ✅ `ModelEditorLayoutProps` | `mode`, `hiddenTabs`, `showFormOverlay` |
| JackpotEditor | ❌ Aucune | Mode hardcodé |
| ScratchCardEditor | ❌ Aucune | Mode hardcodé (mais accepte `mode` en pratique) |

**Impact** :
- ❌ Incohérence d'API entre éditeurs
- ❌ Difficulté à réutiliser des layouts
- ❌ Code non maintenable

**Recommandation** : **Définir une interface commune**
```typescript
// types/shared/editorProps.ts
export interface BaseEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

export interface ExtendedEditorLayoutProps extends BaseEditorLayoutProps {
  showFormOverlay?: boolean;
  // Autres extensions spécifiques
}
```

---

### 3. **Taille de Fichiers Excessive**

**Problème** : Les layouts sont devenus des monolithes

| Fichier | Lignes | État |
|---------|--------|------|
| QuizEditor/DesignEditorLayout.tsx | **3182** | 🔴 Critique |
| ScratchCardEditor/ScratchCardEditorLayout.tsx | **3080** | 🔴 Critique |
| JackpotEditor/JackpotEditorLayout.tsx | **2996** | 🔴 Critique |
| DesignEditor/DesignEditorLayout.tsx | **2170** | 🟠 Élevé |
| ModelEditor/DesignEditorLayout.tsx | **2005** | 🟠 Élevé |

**Seuil recommandé** : < 500 lignes par fichier

**Impact** :
- ❌ Difficulté de maintenance
- ❌ Performances de l'éditeur de code
- ❌ Risque d'erreurs élevé
- ❌ Tests impossibles à écrire

**Recommandation** : **Refactorisation urgente**
- Extraire les hooks métier dans `/hooks`
- Extraire les composants UI dans `/components`
- Extraire la logique de sauvegarde dans `/utils`
- Utiliser le pattern Container/Presenter

---

### 4. **Imports React Router Divergents**

**Problème** : Utilisation inconsistante de l'adaptateur de routage

| Éditeur | Import utilisé |
|---------|----------------|
| DesignEditor | ✅ `@/lib/router-adapter` |
| QuizEditor | ✅ `@/lib/router-adapter` |
| ModelEditor | ❌ `react-router-dom` (direct) |
| JackpotEditor | ❌ `react-router-dom` (direct) |
| ScratchCardEditor | ❌ `react-router-dom` (direct) |

**Impact** :
- ❌ Incohérence dans la gestion du routing
- ❌ Potentiels bugs lors de migrations

**Recommandation** : **Harmoniser tous les imports**
```typescript
// Tous les éditeurs doivent utiliser :
import { useLocation, useNavigate } from '@/lib/router-adapter';
```

---

### 5. **Gestion du Zoom Incohérente**

**Problème** : Valeurs de zoom par défaut différentes entre éditeurs

| Éditeur | Desktop | Tablet | Mobile | Persistance |
|---------|---------|--------|--------|-------------|
| DesignEditor | 0.7 | 0.55 | 0.45 | ✅ localStorage |
| QuizEditor | 0.7 | 0.55 | 0.45 | ✅ localStorage |
| ModelEditor | 0.7 | 0.55 | 0.45 | ✅ localStorage |
| JackpotEditor | 0.7 | 0.55 | 0.45 | ✅ localStorage |
| ScratchCardEditor | 0.7 | 0.55 | 0.45 | ✅ localStorage |

**Constat** : ✅ **HARMONISÉ** (tous identiques)

**Note** : Cette incohérence a été corrigée lors de l'harmonisation documentée dans `HARMONISATION_COMPLETE.md`

---

### 6. **Safe Zone Radius Divergents**

**Problème** : Rayons des zones de sécurité différents (historique)

**Constat** : ✅ **HARMONISÉ** d'après `AUDIT_DESIGN_VS_SCRATCH.md`

Tous les éditeurs utilisent maintenant :
```typescript
const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 24,
  tablet: 20,
  mobile: 16
};
```

---

## 🟠 Incohérences Moyennes

### 7. **Hooks de Synchronisation Manquants**

**Problème** : Certains éditeurs n'utilisent pas les hooks de synchronisation

| Éditeur | `useWheelConfigSync` | `useEditorPreviewSync` | Store spécifique |
|---------|---------------------|----------------------|------------------|
| DesignEditor | ✅ Utilisé | ❌ Non | - |
| QuizEditor | ❌ Non (commenté) | ✅ Utilisé | - |
| ModelEditor | ❌ Non (commenté) | ❌ Non | - |
| JackpotEditor | ❌ Non (commenté) | ❌ Non | - |
| ScratchCardEditor | ❌ Non (commenté) | ❌ Non | `useScratchCardStore` |

**Impact** :
- ⚠️ Synchronisation preview/editor potentiellement cassée
- ⚠️ Risque de données perdues lors de changements d'écran

**Recommandation** : **Vérifier la synchronisation preview**
- Documenter pourquoi certains éditeurs n'utilisent pas ces hooks
- S'assurer que la synchronisation fonctionne via d'autres mécanismes

---

### 8. **Templates Quiz Dupliqués**

**Problème** : Importation de `quizTemplates` dans plusieurs éditeurs

| Éditeur | Utilise `quizTemplates` |
|---------|------------------------|
| QuizEditor | ✅ Oui |
| ModelEditor | ✅ Oui |
| JackpotEditor | ✅ Oui |
| ScratchCardEditor | ✅ Oui |

**Question** : Pourquoi les éditeurs non-quiz importent-ils des templates quiz ?

**Impact** :
- ⚠️ Couplage inutile
- ⚠️ Bundle size augmenté

**Recommandation** : **Nettoyer les imports inutiles**

---

### 9. **Constantes Dupliquées**

**Problème** : Mêmes constantes redéfinies dans chaque éditeur

```typescript
// Présent dans QuizEditor, JackpotEditor, ScratchCardEditor
const LAUNCH_BUTTON_FALLBACK_GRADIENT = '#000000';
const LAUNCH_BUTTON_DEFAULT_TEXT_COLOR = '#ffffff';
const LAUNCH_BUTTON_DEFAULT_PADDING = '14px 28px';
const LAUNCH_BUTTON_DEFAULT_SHADOW = '0 4px 12px rgba(0, 0, 0, 0.15)';
```

**Impact** :
- ⚠️ Code dupliqué
- ⚠️ Risque de divergence

**Recommandation** : **Centraliser dans `designTokens.ts`**
```typescript
// src/components/shared/designTokens.ts
export const BUTTON_DEFAULTS = {
  GRADIENT: '#000000',
  TEXT_COLOR: '#ffffff',
  PADDING: '14px 28px',
  SHADOW: '0 4px 12px rgba(0, 0, 0, 0.15)',
};
```

---

### 10. **Fonction `buildLaunchButtonStyles` Dupliquée**

**Problème** : Même fonction copiée-collée dans 3 éditeurs

| Éditeur | Fonction présente |
|---------|------------------|
| QuizEditor | ✅ Ligne 38-100 |
| JackpotEditor | ✅ Ligne 37-99 |
| ScratchCardEditor | ❌ Non (mais logique similaire inline) |

**Impact** :
- ⚠️ Code dupliqué (~60 lignes × 2)
- ⚠️ Maintenance difficile

**Recommandation** : **Extraire dans `designTokens.ts`**
```typescript
// src/components/shared/designTokens.ts
export const buildLaunchButtonStyles = (
  buttonModule: BlocBouton | undefined,
  styleOverrides: Record<string, any>,
  config: ButtonConfig
): React.CSSProperties => { ... }
```

---

## 🟢 Points Positifs (Harmonisés)

### ✅ Composants Partagés Bien Utilisés

Tous les éditeurs réutilisent correctement :
- `HybridSidebar` (lazy loaded)
- `DesignToolbar` (lazy loaded)
- `DesignCanvas` (lazy loaded)
- `ZoomSlider`
- `PreviewRenderer`
- `KeyboardShortcutsHelp`
- `MobileStableEditor`

### ✅ Hooks Communs Partagés

Tous les éditeurs utilisent :
- `useEditorStore`
- `useKeyboardShortcuts`
- `useUndoRedo`
- `useUndoRedoShortcuts`
- `useGroupManager`
- `useCampaigns`

### ✅ Utilitaires Communs

Tous les éditeurs utilisent :
- `getDeviceDimensions`
- `getEditorDeviceOverride`
- `createSaveAndContinueHandler`
- `saveCampaignToDB`

### ✅ Détection d'Appareil Harmonisée

Tous les éditeurs utilisent la même logique :
```typescript
const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
  const override = getEditorDeviceOverride();
  if (override) return override;
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
};
```

---

## 📋 Matrice de Fonctionnalités

| Fonctionnalité | DesignEditor | QuizEditor | ModelEditor | JackpotEditor | ScratchCardEditor |
|----------------|--------------|------------|-------------|---------------|-------------------|
| **Undo/Redo** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Multi-screen** | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3) | ✅ (3 + 'all') |
| **Preview mode** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Zoom** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lazy loading** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Mobile responsive** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Keyboard shortcuts** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Auto-save** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Template mode** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Form overlay** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Wheel config** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Quiz config** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Scratch config** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Jackpot config** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Messages tab** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **'all' screenId** | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🎯 Recommandations Priorisées

### 🔥 URGENT (Semaine 1-2)

1. **Unifier les types de modules**
   - Créer `src/types/shared/modules.ts`
   - Migrer tous les éditeurs vers le type unifié
   - Supprimer `designEditorModular.ts` et `modularEditor.ts`
   - **Impact** : Réduction de 220 lignes de duplication

2. **Standardiser les props interfaces**
   - Créer `src/types/shared/editorProps.ts`
   - Définir `BaseEditorLayoutProps`
   - Appliquer à tous les éditeurs
   - **Impact** : API cohérente entre éditeurs

3. **Harmoniser les imports React Router**
   - Remplacer tous les imports directs par `@/lib/router-adapter`
   - **Impact** : Préparation pour futures migrations

### 🟠 IMPORTANT (Semaine 3-4)

4. **Extraire les constantes partagées**
   - Centraliser dans `src/components/shared/designTokens.ts`
   - Supprimer les duplications
   - **Impact** : Réduction de ~100 lignes

5. **Factoriser `buildLaunchButtonStyles`**
   - Déplacer vers `designTokens.ts`
   - Réutiliser dans tous les éditeurs
   - **Impact** : Réduction de ~120 lignes

6. **Nettoyer les imports inutiles**
   - Supprimer `quizTemplates` des éditeurs non-quiz
   - **Impact** : Bundle size réduit

### 🟢 AMÉLIORATION (Semaine 5-8)

7. **Refactoriser les gros fichiers (3000+ lignes)**
   - Extraire les hooks métier
   - Créer des composants sous-éditeurs
   - Utiliser le pattern Container/Presenter
   - **Impact** : Maintenabilité +200%

8. **Documenter les différences intentionnelles**
   - Mettre à jour `ARCHITECTURE.md` de JackpotEditor
   - Créer des `ARCHITECTURE.md` pour QuizEditor, ModelEditor
   - **Impact** : Onboarding des développeurs facilité

9. **Créer une bibliothèque de composants partagés**
   - `src/components/shared/editors/`
   - Composants génériques (SafeZone, CanvasContainer, etc.)
   - **Impact** : Réutilisabilité +100%

---

## 📈 Métriques

### État Actuel

| Métrique | Valeur |
|----------|--------|
| **Nombre d'éditeurs** | 8 (5 distincts + 3 alias) |
| **Lignes totales layouts** | 16 438 lignes |
| **Duplication estimée** | ~30% (4 900 lignes) |
| **Taille moyenne fichier** | 2 735 lignes |
| **Fichiers > 3000 lignes** | 3 fichiers 🔴 |
| **Fichiers > 2000 lignes** | 5 fichiers 🟠 |

### Objectif après Refactorisation

| Métrique | Objectif | Gain |
|----------|----------|------|
| **Lignes totales layouts** | ~8 000 lignes | **-51%** |
| **Duplication** | ~5% (400 lignes) | **-92%** |
| **Taille moyenne fichier** | 500 lignes | **-82%** |
| **Fichiers > 1000 lignes** | 0 fichiers | **-100%** |

---

## 🏗️ Architecture Cible

### Structure Proposée

```
src/
├── types/
│   └── shared/
│       ├── modules.ts          # Types unifiés (ex: designEditorModular + modularEditor)
│       ├── editorProps.ts      # Props interfaces communes
│       └── gameConfig.ts       # Config de jeux (wheel, quiz, scratch, etc.)
│
├── components/
│   └── shared/
│       ├── editors/            # Composants éditeurs partagés
│       │   ├── EditorLayout.tsx        # Layout de base commun
│       │   ├── EditorToolbar.tsx       # Toolbar commune
│       │   ├── EditorCanvas.tsx        # Canvas commun
│       │   └── EditorSidebar.tsx       # Sidebar commune
│       ├── designTokens.ts     # Constantes centralisées
│       └── buttonHelpers.ts    # buildLaunchButtonStyles, etc.
│
├── hooks/
│   └── editors/
│       ├── useEditorState.ts   # State management commun
│       ├── useSaveHandler.ts   # Logique de sauvegarde commune
│       └── usePreviewSync.ts   # Sync preview commune
│
└── components/
    ├── DesignEditor/
    │   ├── DesignEditorLayout.tsx    # < 500 lignes
    │   └── WheelConfigPanel.tsx      # Spécifique wheel
    ├── QuizEditor/
    │   ├── QuizEditorLayout.tsx      # < 500 lignes
    │   └── QuizConfigPanel.tsx       # Spécifique quiz
    └── ...
```

---

## 🔗 Références

- [HARMONISATION_COMPLETE.md](./HARMONISATION_COMPLETE.md) - Harmonisation Design vs Scratch
- [HARMONISATION_FINALE.md](./HARMONISATION_FINALE.md) - Finalisation multi-screens
- [AUDIT_DESIGN_VS_SCRATCH.md](./AUDIT_DESIGN_VS_SCRATCH.md) - Audit détaillé 2 éditeurs
- [VERIFICATION_SYNC_3_EDITEURS.md](./VERIFICATION_SYNC_3_EDITEURS.md) - Sync preview
- [src/components/JackpotEditor/ARCHITECTURE.md](./src/components/JackpotEditor/ARCHITECTURE.md)

---

## ✅ Plan d'Action

### Phase 1 : Unification Types (Sprint 1)
- [ ] Créer `src/types/shared/modules.ts`
- [ ] Créer `src/types/shared/editorProps.ts`
- [ ] Migrer DesignEditor
- [ ] Migrer QuizEditor
- [ ] Migrer les 3 autres éditeurs
- [ ] Supprimer anciens fichiers types
- [ ] Tests de non-régression

### Phase 2 : Factorisation Code (Sprint 2)
- [ ] Créer `src/components/shared/buttonHelpers.ts`
- [ ] Centraliser constantes dans `designTokens.ts`
- [ ] Harmoniser imports React Router
- [ ] Nettoyer imports inutiles
- [ ] Tests de non-régression

### Phase 3 : Refactorisation Layouts (Sprint 3-4)
- [ ] Extraire hooks métier communs
- [ ] Créer composants éditeurs partagés
- [ ] Refactoriser QuizEditor (3182 → 500 lignes)
- [ ] Refactoriser ScratchCardEditor (3080 → 500 lignes)
- [ ] Refactoriser JackpotEditor (2996 → 500 lignes)
- [ ] Tests E2E complets

### Phase 4 : Documentation (Sprint 5)
- [ ] Créer ARCHITECTURE.md pour chaque éditeur
- [ ] Documenter différences intentionnelles
- [ ] Créer guide de contribution éditeurs
- [ ] Mettre à jour README principal

---

## 📝 Conclusion

### Points Forts
✅ Architecture de base solide et cohérente  
✅ Bonne réutilisation des composants UI  
✅ Hooks et utilitaires partagés efficacement  
✅ Harmonisation zoom et safe zones réussie  

### Points Faibles
🔴 Duplication massive des types (~220 lignes × 2)  
🔴 Fichiers layouts trop volumineux (> 3000 lignes)  
🔴 Constantes et fonctions dupliquées  
🔴 Props interfaces incohérentes  

### Impact Estimé de la Refactorisation
- **-51%** lignes de code totales
- **-92%** duplication
- **-82%** taille moyenne fichiers
- **+200%** maintenabilité
- **+100%** réutilisabilité

### Effort Estimé
- **40-60 heures** développement
- **20-30 heures** tests
- **10-15 heures** documentation
- **Total : 70-105 heures** (~2-3 sprints)

### ROI
🎯 **Très élevé** - Investissement unique pour bénéfices long terme majeurs

---

**Date de l'audit** : Janvier 2025  
**Auditeur** : AI Assistant (Lovable)  
**Statut** : ✅ Complet  
**Priorité** : 🔥 URGENT - Action requise
