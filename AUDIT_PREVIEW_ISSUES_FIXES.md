# 🔧 CORRECTIONS RECOMMANDÉES : Preview vs Édition

## Problèmes Identifiés et Solutions

---

## 1️⃣ BACKGROUND DEVICE-SPECIFIC NON SYNCHRONISÉ

### Problème
Le mode édition permet de configurer des backgrounds différents par device (desktop/tablet/mobile), mais le preview utilise un background unique.

### Impact
- **Sévérité**: Moyenne
- **Utilisateur**: Voit un background différent en preview qu'en édition
- **Cas d'usage**: Utilisateur configure un fond bleu sur desktop et vert sur mobile

### Code Actuel (Preview)
```typescript
// FunnelUnlockedGame.tsx - Ligne 483
const backgroundStyle: React.CSSProperties = {
  background: campaign.design?.background?.type === 'image'
    ? `url(${campaign.design.background.value}) center/cover no-repeat`
    : campaign.design?.background?.value || '#ffffff'
};
```

### Solution Proposée
```typescript
// FunnelUnlockedGame.tsx
const getDeviceBackground = (screenId: ScreenId) => {
  // 1. Essayer d'obtenir le background device-specific
  const screenBackgrounds = campaign.design?.screenBackgrounds?.[screenId];
  
  if (screenBackgrounds?.devices?.[previewMode]) {
    const deviceBg = screenBackgrounds.devices[previewMode];
    return {
      background: deviceBg.type === 'image'
        ? `url(${deviceBg.value}) center/cover no-repeat`
        : deviceBg.value || '#ffffff'
    };
  }
  
  // 2. Fallback sur le background général du screen
  if (screenBackgrounds) {
    return {
      background: screenBackgrounds.type === 'image'
        ? `url(${screenBackgrounds.value}) center/cover no-repeat`
        : screenBackgrounds.value || '#ffffff'
    };
  }
  
  // 3. Fallback sur le background global
  return {
    background: campaign.design?.background?.type === 'image'
      ? `url(${campaign.design.background.value}) center/cover no-repeat`
      : campaign.design?.background?.value || '#ffffff'
  };
};

// Utilisation
const backgroundStyle = getDeviceBackground('screen1'); // ou screen2, screen3
```

### Fichiers à Modifier
- `/src/components/funnels/FunnelUnlockedGame.tsx`

---

## 2️⃣ MODULES RENDERER DIFFÉRENT

### Problème
Le mode édition utilise `DesignCanvas` avec `modularModules`, le preview utilise `QuizModuleRenderer` ou `DesignModuleRenderer`.

### Impact
- **Sévérité**: Faible
- **Utilisateur**: Rendu potentiellement légèrement différent
- **Cas d'usage**: Styles CSS ou spacing légèrement différents

### Code Actuel

**Mode Édition**:
```tsx
<DesignCanvas
  screenId="screen1"
  modularModules={modularPage.screens.screen1}
/>
```

**Mode Preview**:
```tsx
<QuizModuleRenderer 
  modules={logoModules1}
  previewMode={true}
  device={previewMode}
/>
```

### Solution Proposée

#### Option A: Unifier sur QuizModuleRenderer (Recommandé)
Utiliser `QuizModuleRenderer` partout avec un flag `editable`

```tsx
<QuizModuleRenderer 
  modules={modularPage.screens.screen1}
  previewMode={false}  // Mode édition
  editable={true}      // Permet l'édition
  device={selectedDevice}
/>
```

#### Option B: Créer un UnifiedModuleRenderer
```tsx
// /src/components/shared/UnifiedModuleRenderer.tsx
interface UnifiedModuleRendererProps {
  modules: Module[];
  mode: 'edit' | 'preview';
  device: 'desktop' | 'tablet' | 'mobile';
  onModuleUpdate?: (module: Module) => void;
  onButtonClick?: () => void;
}

const UnifiedModuleRenderer: React.FC<UnifiedModuleRendererProps> = ({
  modules,
  mode,
  device,
  onModuleUpdate,
  onButtonClick
}) => {
  // Logique de rendu unifiée
  return (
    <div>
      {modules.map(module => (
        <ModuleComponent
          key={module.id}
          module={module}
          editable={mode === 'edit'}
          device={device}
          onUpdate={onModuleUpdate}
          onClick={onButtonClick}
        />
      ))}
    </div>
  );
};
```

### Fichiers à Modifier
- `/src/components/ScratchCardEditor/QuizRenderer.tsx`
- `/src/components/DesignEditor/DesignRenderer.tsx`
- Créer `/src/components/shared/UnifiedModuleRenderer.tsx`

---

## 3️⃣ SCROLL DIFFÉRENT ENTRE MODES

### Problème
Le preview a `overflow-y-auto` sur le conteneur de contenu, pas le mode édition.

### Impact
- **Sévérité**: Très Faible
- **Utilisateur**: Comportement de scroll légèrement différent
- **Cas d'usage**: Contenu très long qui dépasse l'écran

### Code Actuel (Preview)
```tsx
<div 
  className="relative h-full w-full overflow-y-auto"
  style={{
    padding: `${safeZonePadding}px`,
    boxSizing: 'border-box'
  }}
>
```

### Solution Proposée

#### Option A: Ajouter overflow au DesignCanvas
```tsx
// Dans DesignCanvas.tsx
<div 
  className="relative h-full w-full overflow-y-auto"
  style={{
    padding: `${safeZonePadding}px`,
    boxSizing: 'border-box'
  }}
>
  {/* Contenu */}
</div>
```

#### Option B: Retirer overflow du Preview (Non recommandé)
Pourrait causer des problèmes si le contenu dépasse.

### Recommandation
**Option A** - Ajouter `overflow-y-auto` au mode édition pour harmoniser.

### Fichiers à Modifier
- `/src/components/ScratchCardEditor/DesignCanvas.tsx`
- `/src/components/DesignEditor/DesignCanvas.tsx`

---

## 4️⃣ FORMULAIRE MODAL - usePortal

### Problème
Le formulaire utilisait `usePortal={true}` par défaut, ce qui le faisait sortir du cadre du téléphone.

### Impact
- **Sévérité**: Haute (DÉJÀ CORRIGÉ ✅)
- **Utilisateur**: Formulaire dépassait du cadre
- **Solution**: Ajout de `usePortal={false}`

### Code Corrigé
```tsx
<FormHandler
  showFormModal={showFormModal}
  campaign={campaign}
  fields={fields}
  participationLoading={participationLoading}
  onClose={() => setShowFormModal(false)}
  onSubmit={handleFormSubmit}
  launchButtonStyles={launchButtonStyles}
  usePortal={false}  // ✅ CORRIGÉ
/>
```

### Status
✅ **DÉJÀ CORRIGÉ** dans les fichiers suivants:
- `/src/components/funnels/FunnelUnlockedGame.tsx` (ligne 862, 1056)
- `/src/components/funnels/components/FormHandler.tsx`

---

## 5️⃣ JACKPOT - RÉSULTAT VISUEL VS RÉEL

### Problème
Les slots affichaient un résultat visuel (3 cerises) mais le résultat réel était différent (lose).

### Impact
- **Sévérité**: Haute (DÉJÀ CORRIGÉ ✅)
- **Utilisateur**: Confusion entre ce qui est affiché et le résultat
- **Solution**: Forcer les slots à afficher le bon résultat

### Code Corrigé
```typescript
// Forcer les slots à afficher le bon résultat visuel
if (win) {
  // Si victoire, afficher 3 symboles identiques
  const winSymbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  currentSlots = [winSymbol, winSymbol, winSymbol];
} else {
  // Si défaite, s'assurer que les slots ne sont PAS tous identiques
  while (currentSlots[0] === currentSlots[1] && currentSlots[1] === currentSlots[2]) {
    currentSlots[2] = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
  }
}
setSlots([...currentSlots]);
```

### Status
✅ **DÉJÀ CORRIGÉ** dans:
- `/src/components/GameTypes/Jackpot/index.tsx` (lignes 69-80)

---

## 📋 PLAN D'ACTION RECOMMANDÉ

### Phase 1: Corrections Critiques (Déjà faites ✅)
- [x] Formulaire modal dans le cadre (`usePortal={false}`)
- [x] Jackpot résultat visuel cohérent
- [x] Safe zone visible et correcte
- [x] Padding identique entre modes

### Phase 2: Améliorations Importantes
- [ ] **Background device-specific** (Priorité Haute)
  - Temps estimé: 2h
  - Complexité: Moyenne
  - Impact: Moyen

- [ ] **Unifier les renderers de modules** (Priorité Moyenne)
  - Temps estimé: 4h
  - Complexité: Haute
  - Impact: Faible

### Phase 3: Optimisations
- [ ] **Harmoniser le scroll** (Priorité Faible)
  - Temps estimé: 30min
  - Complexité: Faible
  - Impact: Très Faible

---

## 🧪 TESTS RECOMMANDÉS

### Test 1: Background Device-Specific
```typescript
// Test à ajouter
describe('FunnelUnlockedGame - Background', () => {
  it('should use device-specific background when available', () => {
    const campaign = {
      design: {
        screenBackgrounds: {
          screen1: {
            devices: {
              desktop: { type: 'color', value: '#0000FF' },
              mobile: { type: 'color', value: '#00FF00' }
            }
          }
        }
      }
    };
    
    const { container } = render(
      <FunnelUnlockedGame campaign={campaign} previewMode="mobile" />
    );
    
    const bg = container.querySelector('[style*="background"]');
    expect(bg).toHaveStyle({ background: '#00FF00' });
  });
});
```

### Test 2: Modules Rendering
```typescript
describe('Module Rendering Consistency', () => {
  it('should render modules identically in edit and preview modes', () => {
    const modules = [
      { id: '1', type: 'BlocTexte', content: 'Test' }
    ];
    
    const editRender = renderInEditMode(modules);
    const previewRender = renderInPreviewMode(modules);
    
    expect(editRender.html()).toEqual(previewRender.html());
  });
});
```

### Test 3: Scroll Behavior
```typescript
describe('Scroll Behavior', () => {
  it('should have overflow-y-auto in both modes', () => {
    const editContainer = renderEditMode();
    const previewContainer = renderPreviewMode();
    
    expect(editContainer).toHaveClass('overflow-y-auto');
    expect(previewContainer).toHaveClass('overflow-y-auto');
  });
});
```

---

## 📊 IMPACT ESTIMATION

| Correction | Temps | Complexité | Impact Utilisateur | Priorité |
|-----------|-------|------------|-------------------|----------|
| Background device-specific | 2h | Moyenne | Moyen | 🔴 Haute |
| Unifier renderers | 4h | Haute | Faible | 🟡 Moyenne |
| Harmoniser scroll | 30min | Faible | Très Faible | 🟢 Faible |

---

## ✅ CHECKLIST DE VALIDATION

Après implémentation des corrections, vérifier:

### Écran 1
- [ ] Background identique en édition et preview
- [ ] Background device-specific respecté
- [ ] Modules rendus identiquement
- [ ] Scroll identique
- [ ] Safe zone identique

### Écran 2
- [ ] Background identique
- [ ] Jeu affiché correctement
- [ ] Formulaire dans le cadre ✅
- [ ] Modules en arrière-plan
- [ ] Overlay de blocage fonctionnel

### Écran 3
- [ ] Background identique
- [ ] Message résultat correct
- [ ] Bouton Rejouer fonctionnel
- [ ] Modules rendus identiquement

---

**Document créé le**: 20 Octobre 2025  
**Dernière mise à jour**: 20 Octobre 2025  
**Status**: En cours d'implémentation
