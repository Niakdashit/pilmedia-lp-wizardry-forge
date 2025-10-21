# 🔍 AUDIT COMPARATIF : 3 Éditeurs
## /design-editor (Référence ✅) vs /scratch-editor vs /jackpot-editor

**Date**: 20 Octobre 2025  
**Objectif**: Comparer les 3 éditeurs pour identifier les différences et harmoniser

---

## 📊 VUE D'ENSEMBLE

### Éditeurs Analysés

| Éditeur | Type de Jeu | Status | Fichier Principal |
|---------|------------|--------|-------------------|
| **design-editor** | Roue (Wheel) | ✅ **RÉFÉRENCE VALIDÉE** | `DesignEditorLayout.tsx` |
| **scratch-editor** | Cartes à Gratter | ⚠️ À harmoniser | `ScratchCardEditorLayout.tsx` |
| **jackpot-editor** | Machine à Sous | ⚠️ À harmoniser | `JackpotEditorLayout.tsx` |

---

## 🎯 ARCHITECTURE GLOBALE

### Structure des 3 Écrans

Tous les éditeurs utilisent la même structure de base :

```tsx
// Écran 1 : Avant le jeu
<DesignCanvas screenId="screen1" />

// Écran 2 : Jeu en cours
<DesignCanvas screenId="screen2" />

// Écran 3 : Résultat
<DesignCanvas screenId="screen3" />
```

✅ **CONFORME** : Structure identique dans les 3 éditeurs

---

## 📐 COMPARAISON DÉTAILLÉE

### 1. ÉCRAN 1 : Avant le Jeu

#### Design Editor (Référence)
```tsx
<DesignCanvas
  screenId="screen1"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen1?.devices?.[selectedDevice] || screenBackgrounds.screen1}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  wheelModalConfig={wheelModalConfig}
  extractedColors={extractedColors}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return !role.includes('exit-message') && 
           element?.screenId !== 'screen2' && 
           element?.screenId !== 'screen3';
  }}
  modularModules={modularPage.screens.screen1}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
  selectedModuleId={selectedModuleId}
  selectedModule={selectedModule}
/>
```

**Caractéristiques** :
- ✅ Background device-specific
- ✅ Wheel config sync
- ✅ Extracted colors
- ✅ Element filter strict
- ✅ Modular modules complets
- ✅ Module selection

#### Scratch Editor
```tsx
<DesignCanvas
  screenId="screen1"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen1?.devices?.[selectedDevice] || screenBackgrounds.screen1}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  extractedColors={extractedColors}
  quizModalConfig={quizModalConfig}
  hideInlineQuizPreview
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return !role.includes('exit-message');
  }}
  modularModules={modularPage.screens.screen1}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Différences** :
- ❌ Pas de `wheelModalConfig` (utilise `quizModalConfig`)
- ❌ `hideInlineQuizPreview` (spécifique scratch)
- ⚠️ Element filter moins strict (ne filtre pas screenId)
- ❌ Pas de `selectedModuleId` / `selectedModule`

#### Jackpot Editor
```tsx
<DesignCanvas
  screenId="screen1"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen1?.devices?.[selectedDevice] || screenBackgrounds.screen1}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  extractedColors={extractedColors}
  quizModalConfig={quizModalConfig}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return !role.includes('exit-message');
  }}
  modularModules={modularPage.screens.screen1}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Différences** :
- ❌ Pas de `wheelModalConfig` (utilise `quizModalConfig`)
- ⚠️ Element filter moins strict
- ❌ Pas de `selectedModuleId` / `selectedModule`

#### 🔍 Tableau Comparatif Écran 1

| Fonctionnalité | Design Editor | Scratch Editor | Jackpot Editor |
|----------------|---------------|----------------|----------------|
| **Background device-specific** | ✅ | ✅ | ✅ |
| **Wheel/Quiz config** | wheelModalConfig | quizModalConfig | quizModalConfig |
| **Extracted colors** | ✅ | ✅ | ✅ |
| **Element filter strict** | ✅ (3 conditions) | ⚠️ (1 condition) | ⚠️ (1 condition) |
| **Modular modules** | ✅ Complet | ✅ Complet | ✅ Complet |
| **Module selection** | ✅ | ❌ | ❌ |
| **hideInlineQuizPreview** | ❌ | ✅ | ❌ |

---

### 2. ÉCRAN 2 : Jeu en Cours

#### Design Editor (Référence)
```tsx
<DesignCanvas
  screenId="screen2"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen2?.devices?.[selectedDevice] || screenBackgrounds.screen2}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  wheelModalConfig={wheelModalConfig}
  extractedColors={extractedColors}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return !role.includes('exit-message') && 
           (element?.screenId === 'screen2' || 
            role.includes('form') || 
            role.includes('contact'));
  }}
  modularModules={modularPage.screens.screen2}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Caractéristiques** :
- ✅ Filter pour screen2 + form + contact
- ✅ Modular modules screen2
- ✅ Wheel config

#### Scratch Editor
```tsx
<DesignCanvas
  screenId="screen2"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen2?.devices?.[selectedDevice] || screenBackgrounds.screen2}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  extractedColors={extractedColors}
  quizModalConfig={quizModalConfig}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return !role.includes('exit-message');
  }}
  modularModules={modularPage.screens.screen2}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Différences** :
- ⚠️ Element filter moins strict (ne filtre pas screenId)
- ❌ Pas de `wheelModalConfig`

#### Jackpot Editor
```tsx
<DesignCanvas
  screenId="screen2"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen2?.devices?.[selectedDevice] || screenBackgrounds.screen2}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  extractedColors={extractedColors}
  quizModalConfig={quizModalConfig}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return !role.includes('exit-message');
  }}
  modularModules={modularPage.screens.screen2}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Différences** :
- ⚠️ Element filter moins strict
- ❌ Pas de `wheelModalConfig`

#### 🔍 Tableau Comparatif Écran 2

| Fonctionnalité | Design Editor | Scratch Editor | Jackpot Editor |
|----------------|---------------|----------------|----------------|
| **Element filter** | ✅ Strict (screen2 + form) | ⚠️ Simple | ⚠️ Simple |
| **Wheel/Quiz config** | wheelModalConfig | quizModalConfig | quizModalConfig |
| **Modular modules** | ✅ screen2 | ✅ screen2 | ✅ screen2 |
| **Background** | ✅ Device-specific | ✅ Device-specific | ✅ Device-specific |

---

### 3. ÉCRAN 3 : Résultat

#### Design Editor (Référence)
```tsx
<DesignCanvas
  screenId="screen3"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen3?.devices?.[selectedDevice] || screenBackgrounds.screen3}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  wheelModalConfig={wheelModalConfig}
  extractedColors={extractedColors}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return role.includes('exit-message') || element?.screenId === 'screen3';
  }}
  modularModules={modularPage.screens.screen3}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Caractéristiques** :
- ✅ Filter pour exit-message OU screen3
- ✅ Modular modules screen3

#### Scratch Editor
```tsx
<DesignCanvas
  screenId="screen3"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen3?.devices?.[selectedDevice] || screenBackgrounds.screen3}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  extractedColors={extractedColors}
  quizModalConfig={quizModalConfig}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return role.includes('exit-message');
  }}
  modularModules={modularPage.screens.screen3}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Différences** :
- ⚠️ Element filter moins strict (seulement exit-message, pas screenId)
- ❌ Pas de `wheelModalConfig`

#### Jackpot Editor
```tsx
<DesignCanvas
  screenId="screen3"
  selectedDevice={selectedDevice}
  elements={canvasElements}
  background={screenBackgrounds.screen3?.devices?.[selectedDevice] || screenBackgrounds.screen3}
  campaign={campaignData}
  zoom={canvasZoom}
  enableInternalAutoFit={true}
  extractedColors={extractedColors}
  quizModalConfig={quizModalConfig}
  elementFilter={(element) => {
    const role = element?.role?.toLowerCase() || '';
    return role.includes('exit-message');
  }}
  modularModules={modularPage.screens.screen3}
  onModuleUpdate={handleUpdateModule}
  onModuleDelete={handleDeleteModule}
  onModuleMove={handleMoveModule}
  onModuleDuplicate={handleDuplicateModule}
/>
```

**Différences** :
- ⚠️ Element filter moins strict
- ❌ Pas de `wheelModalConfig`

#### 🔍 Tableau Comparatif Écran 3

| Fonctionnalité | Design Editor | Scratch Editor | Jackpot Editor |
|----------------|---------------|----------------|----------------|
| **Element filter** | ✅ exit-message OU screen3 | ⚠️ exit-message only | ⚠️ exit-message only |
| **Wheel/Quiz config** | wheelModalConfig | quizModalConfig | quizModalConfig |
| **Modular modules** | ✅ screen3 | ✅ screen3 | ✅ screen3 |

---

## 🔧 FONCTIONNALITÉS SPÉCIFIQUES

### Wheel Panel (Design Editor uniquement)

```tsx
// Design Editor
onOpenWheelPanel={() => {
  setShowWheelPanel(true);
  if (sidebarRef.current) {
    sidebarRef.current.setActiveTab('wheel');
  }
}}
showWheelPanel={showWheelPanel}
onWheelPanelChange={setShowWheelPanel}
```

**Status** :
- ✅ Design Editor : Complet
- ❌ Scratch Editor : Absent
- ❌ Jackpot Editor : Absent (devrait avoir un JackpotPanel)

### Quiz Panel (Scratch Editor uniquement)

```tsx
// Scratch Editor
showQuizPanel={showQuizPanel}
onQuizPanelChange={setShowQuizPanel}
```

**Status** :
- ❌ Design Editor : Absent
- ✅ Scratch Editor : Présent
- ❌ Jackpot Editor : Absent

### Module Selection (Design Editor uniquement)

```tsx
// Design Editor
selectedModuleId={selectedModuleId}
selectedModule={selectedModule}
onSelectedModuleChange={setSelectedModuleId}
```

**Status** :
- ✅ Design Editor : Complet
- ❌ Scratch Editor : Absent
- ❌ Jackpot Editor : Absent

---

## 📊 TABLEAU RÉCAPITULATIF GLOBAL

### Props DesignCanvas

| Prop | Design Editor | Scratch Editor | Jackpot Editor | Priorité |
|------|---------------|----------------|----------------|----------|
| **screenId** | ✅ | ✅ | ✅ | - |
| **selectedDevice** | ✅ | ✅ | ✅ | - |
| **elements** | ✅ | ✅ | ✅ | - |
| **background** | ✅ Device-specific | ✅ Device-specific | ✅ Device-specific | - |
| **campaign** | ✅ | ✅ | ✅ | - |
| **zoom** | ✅ | ✅ | ✅ | - |
| **enableInternalAutoFit** | ✅ | ✅ | ✅ | - |
| **wheelModalConfig** | ✅ | ❌ | ❌ | 🔴 Haute |
| **quizModalConfig** | ❌ | ✅ | ✅ | - |
| **extractedColors** | ✅ | ✅ | ✅ | - |
| **elementFilter** | ✅ Strict | ⚠️ Simple | ⚠️ Simple | 🟡 Moyenne |
| **modularModules** | ✅ | ✅ | ✅ | - |
| **selectedModuleId** | ✅ | ❌ | ❌ | 🟢 Faible |
| **selectedModule** | ✅ | ❌ | ❌ | 🟢 Faible |
| **hideInlineQuizPreview** | ❌ | ✅ | ❌ | - |
| **showWheelPanel** | ✅ | ❌ | ❌ | 🟡 Moyenne |
| **showQuizPanel** | ❌ | ✅ | ❌ | - |

---

## ⚠️ DIFFÉRENCES CRITIQUES IDENTIFIÉES

### 1. Element Filter Inconsistant

#### Problème
Les 3 éditeurs utilisent des filtres différents pour les éléments.

#### Impact
- **Sévérité** : Moyenne
- **Risque** : Éléments affichés sur les mauvais écrans

#### Design Editor (Référence)
```typescript
// Screen 1
elementFilter: (element) => {
  const role = element?.role?.toLowerCase() || '';
  return !role.includes('exit-message') && 
         element?.screenId !== 'screen2' && 
         element?.screenId !== 'screen3';
}

// Screen 2
elementFilter: (element) => {
  const role = element?.role?.toLowerCase() || '';
  return !role.includes('exit-message') && 
         (element?.screenId === 'screen2' || 
          role.includes('form') || 
          role.includes('contact'));
}

// Screen 3
elementFilter: (element) => {
  const role = element?.role?.toLowerCase() || '';
  return role.includes('exit-message') || 
         element?.screenId === 'screen3';
}
```

#### Scratch/Jackpot Editor (Actuel)
```typescript
// Screen 1
elementFilter: (element) => {
  const role = element?.role?.toLowerCase() || '';
  return !role.includes('exit-message');
}

// Screen 2
elementFilter: (element) => {
  const role = element?.role?.toLowerCase() || '';
  return !role.includes('exit-message');
}

// Screen 3
elementFilter: (element) => {
  const role = element?.role?.toLowerCase() || '';
  return role.includes('exit-message');
}
```

#### Recommandation
✅ **Harmoniser sur le modèle Design Editor** (plus strict et précis)

---

### 2. Wheel/Quiz Modal Config

#### Problème
Design Editor utilise `wheelModalConfig`, Scratch/Jackpot utilisent `quizModalConfig`.

#### Impact
- **Sévérité** : Faible
- **Risque** : Confusion dans le code

#### Solution
Créer un config unifié :
```typescript
// Nouveau prop unifié
gameModalConfig?: {
  type: 'wheel' | 'quiz' | 'scratch' | 'jackpot';
  extractedColors?: string[];
  // ... autres configs
}
```

---

### 3. Module Selection Manquante

#### Problème
Scratch et Jackpot n'ont pas de sélection de module.

#### Impact
- **Sévérité** : Faible
- **Risque** : UX moins bonne

#### Recommandation
Ajouter `selectedModuleId` et `selectedModule` aux deux éditeurs.

---

### 4. Panels Spécifiques Manquants

#### Problème
- Design Editor : Wheel Panel ✅
- Scratch Editor : Quiz Panel ✅
- Jackpot Editor : Aucun panel spécifique ❌

#### Impact
- **Sévérité** : Moyenne
- **Risque** : Jackpot moins configurable

#### Recommandation
Créer un `JackpotPanel` pour le jackpot-editor.

---

## 🎯 PLAN D'HARMONISATION

### Phase 1 : Corrections Critiques (Priorité Haute)

#### 1.1 Harmoniser Element Filters
**Temps estimé** : 1h  
**Complexité** : Faible

```typescript
// À appliquer dans ScratchCardEditorLayout.tsx et JackpotEditorLayout.tsx

// Screen 1
elementFilter={(element: any) => {
  const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
  return !role.includes('exit-message') && 
         element?.screenId !== 'screen2' && 
         element?.screenId !== 'screen3';
}}

// Screen 2
elementFilter={(element: any) => {
  const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
  return !role.includes('exit-message') && 
         (element?.screenId === 'screen2' || 
          role.includes('form') || 
          role.includes('contact'));
}}

// Screen 3
elementFilter={(element: any) => {
  const role = typeof element?.role === 'string' ? element.role.toLowerCase() : '';
  return role.includes('exit-message') || 
         element?.screenId === 'screen3';
}}
```

#### 1.2 Unifier Modal Config
**Temps estimé** : 2h  
**Complexité** : Moyenne

Créer un type unifié dans `/src/types/gameConfig.ts` :
```typescript
export interface GameModalConfig {
  type: 'wheel' | 'quiz' | 'scratch' | 'jackpot';
  extractedColors?: string[];
  wheelConfig?: WheelConfig;
  quizConfig?: QuizConfig;
  scratchConfig?: ScratchConfig;
  jackpotConfig?: JackpotConfig;
}
```

---

### Phase 2 : Améliorations (Priorité Moyenne)

#### 2.1 Ajouter Module Selection
**Temps estimé** : 1h  
**Complexité** : Faible

Ajouter aux deux éditeurs :
```typescript
const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
const selectedModule = useMemo(() => {
  if (!selectedModuleId) return null;
  // Trouver le module dans modularPage
}, [selectedModuleId, modularPage]);

// Dans DesignCanvas
selectedModuleId={selectedModuleId}
selectedModule={selectedModule}
onSelectedModuleChange={setSelectedModuleId}
```

#### 2.2 Créer JackpotPanel
**Temps estimé** : 3h  
**Complexité** : Moyenne

Créer `/src/components/JackpotEditor/panels/JackpotGamePanel.tsx` similaire à `WheelPanel`.

---

### Phase 3 : Optimisations (Priorité Faible)

#### 3.1 Refactoriser Code Commun
**Temps estimé** : 4h  
**Complexité** : Haute

Créer `/src/components/shared/BaseEditorLayout.tsx` avec la logique commune.

---

## 📋 CHECKLIST D'HARMONISATION

### Scratch Editor
- [ ] Harmoniser element filters (3 écrans)
- [ ] Remplacer `quizModalConfig` par `gameModalConfig`
- [ ] Ajouter `selectedModuleId` et `selectedModule`
- [ ] Vérifier cohérence avec Design Editor

### Jackpot Editor
- [ ] Harmoniser element filters (3 écrans)
- [ ] Remplacer `quizModalConfig` par `gameModalConfig`
- [ ] Ajouter `selectedModuleId` et `selectedModule`
- [ ] Créer `JackpotPanel`
- [ ] Vérifier cohérence avec Design Editor

### Design Editor
- [ ] Migrer vers `gameModalConfig` (rétro-compatible)
- [ ] Documenter comme référence

---

## 📊 SCORE DE CONFORMITÉ

### Scratch Editor vs Design Editor

| Aspect | Conformité | Score |
|--------|-----------|-------|
| **Structure globale** | ✅ Identique | 100% |
| **Props DesignCanvas** | ⚠️ Manque quelques props | 85% |
| **Element filters** | ⚠️ Moins stricts | 60% |
| **Modular modules** | ✅ Identique | 100% |
| **Background** | ✅ Device-specific | 100% |
| **Module selection** | ❌ Absent | 0% |
| **Panel spécifique** | ✅ Quiz Panel | 100% |

**Score Global** : **78%** ⚠️

---

### Jackpot Editor vs Design Editor

| Aspect | Conformité | Score |
|--------|-----------|-------|
| **Structure globale** | ✅ Identique | 100% |
| **Props DesignCanvas** | ⚠️ Manque quelques props | 85% |
| **Element filters** | ⚠️ Moins stricts | 60% |
| **Modular modules** | ✅ Identique | 100% |
| **Background** | ✅ Device-specific | 100% |
| **Module selection** | ❌ Absent | 0% |
| **Panel spécifique** | ❌ Absent | 0% |

**Score Global** : **64%** ⚠️

---

## 🎯 RECOMMANDATIONS FINALES

### Priorité 1 : Harmoniser Element Filters
**Impact** : Haute  
**Effort** : Faible  
**ROI** : ⭐⭐⭐⭐⭐

Appliquer les filtres stricts du Design Editor aux deux autres éditeurs.

### Priorité 2 : Unifier Modal Config
**Impact** : Moyenne  
**Effort** : Moyen  
**ROI** : ⭐⭐⭐⭐

Créer un `gameModalConfig` unifié pour tous les éditeurs.

### Priorité 3 : Ajouter Module Selection
**Impact** : Faible  
**Effort** : Faible  
**ROI** : ⭐⭐⭐

Améliore l'UX mais pas critique.

### Priorité 4 : Créer JackpotPanel
**Impact** : Moyenne  
**Effort** : Moyen  
**ROI** : ⭐⭐⭐

Rend le Jackpot Editor plus complet.

---

## ✅ CONCLUSION

### Points Positifs
- ✅ Structure globale identique
- ✅ Modular modules bien implémentés
- ✅ Background device-specific partout
- ✅ Zoom et auto-fit cohérents

### Points à Améliorer
- ⚠️ Element filters à harmoniser
- ⚠️ Modal config à unifier
- ⚠️ Module selection manquante
- ⚠️ JackpotPanel à créer

### Verdict Final
Les 3 éditeurs sont **globalement cohérents** mais nécessitent une **harmonisation** pour atteindre le même niveau de qualité que le Design Editor (référence validée).

**Score Moyen** : **71%** ⚠️  
**Objectif** : **95%+** ✅

---

**Audit réalisé le** : 20 Octobre 2025  
**Par** : Assistant AI  
**Version** : 1.0  
**Référence** : Design Editor (validé)
