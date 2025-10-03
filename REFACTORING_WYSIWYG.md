# 🎯 Refactorisation WYSIWYG - Plan Complet

## Problème Actuel

**Mode Édition** : Rendu via `DesignCanvas` → `ModularCanvas` → fonction `renderModule`
**Mode Preview** : Rendu via `FunnelQuizParticipate` → conversion manuelle des modules

**Résultat** : Divergences visuelles (vidéo manquante, styles incorrects, bordures indésirables)

## Solution : Composant Unifié `QuizModuleRenderer`

### Architecture Proposée

```
┌─────────────────────────────────────────────────────────────┐
│                    QuizModuleRenderer                        │
│  (Composant de rendu unifié pour tous les modules)          │
│                                                              │
│  Props:                                                      │
│  - modules: Module[]                                         │
│  - previewMode: boolean                                      │
│  - device: DeviceType                                        │
│  - onModuleClick?: (id: string) => void                      │
│  - selectedModuleId?: string                                 │
│                                                              │
│  Rend: BlocTexte, BlocImage, BlocVideo, BlocBouton          │
└─────────────────────────────────────────────────────────────┘
           ▲                                    ▲
           │                                    │
           │                                    │
    ┌──────┴──────┐                      ┌─────┴──────┐
    │  MODE       │                      │   MODE     │
    │  ÉDITION    │                      │  PREVIEW   │
    └─────────────┘                      └────────────┘
    
DesignCanvas.tsx                    FunnelQuizParticipate.tsx
    │                                        │
    ├─ ModularCanvas                        ├─ QuizModuleRenderer
    │  └─ QuizModuleRenderer                │   (previewMode=true)
    │     (previewMode=false)                │
    │     + Toolbar                          └─ Pas de toolbar
    │     + Drag & Drop                         Pas d'interactions
    │     + Selection                           Rendu pur
    └─ Interactions édition
```

## Fichiers à Modifier

### 1. **Créer** `/src/components/QuizEditor/QuizModuleRenderer.tsx`

Composant pur qui rend les modules sans logique d'édition.

**Responsabilités** :
- Rendre BlocTexte avec tous les styles (customCSS, advancedStyle, etc.)
- Rendre BlocImage avec dimensions et styles
- Rendre BlocVideo (iframe YouTube/Vimeo ou embedCode)
- Rendre BlocBouton (uniquement en mode édition pour visualisation)
- Appliquer les styles de device (mobile/desktop)
- Gérer l'alignement et le layout

**Interface** :
```typescript
interface QuizModuleRendererProps {
  modules: Module[];
  previewMode?: boolean;
  device?: DeviceType;
  onModuleClick?: (moduleId: string) => void;
  selectedModuleId?: string;
  className?: string;
}
```

### 2. **Modifier** `/src/components/QuizEditor/modules/ModularCanvas.tsx`

**Changements** :
- Extraire la fonction `renderModule` vers `QuizModuleRenderer`
- Garder uniquement la logique d'édition (Toolbar, Drag & Drop, Selection)
- Utiliser `<QuizModuleRenderer>` pour le rendu visuel
- Wrapper les modules avec les overlays d'édition

**Avant** :
```tsx
const renderModule = (m: Module, ...) => {
  // 400+ lignes de rendu
}

return modules.map(m => (
  <div>
    <Toolbar />
    {renderModule(m, ...)}
  </div>
))
```

**Après** :
```tsx
import { QuizModuleRenderer } from '../QuizModuleRenderer';

return modules.map(m => (
  <div className="relative">
    <Toolbar />
    <QuizModuleRenderer 
      modules={[m]} 
      previewMode={false}
      device={device}
      onModuleClick={onSelect}
      selectedModuleId={selectedModuleId}
    />
  </div>
))
```

### 3. **Modifier** `/src/components/funnels/FunnelQuizParticipate.tsx`

**Changements** :
- Supprimer la conversion manuelle des modules (lignes 98-198)
- Supprimer le rendu manuel des modules (lignes 415-547)
- Utiliser directement `<QuizModuleRenderer>`

**Avant** :
```tsx
// Conversion manuelle
const canvasElements = rawCanvasElements.map((el: any) => {
  if (el.type === 'BlocTexte') { /* conversion */ }
  if (el.type === 'BlocImage') { /* conversion */ }
  // ...
});

// Rendu manuel
{participateElements.map(element => {
  if (element.type === 'text') { /* rendu */ }
  if (element.type === 'image') { /* rendu */ }
  // ...
})}
```

**Après** :
```tsx
import { QuizModuleRenderer } from '@/components/QuizEditor/QuizModuleRenderer';

// Récupérer directement modularPage
const modularPage = campaign?.modularPage || { screens: { screen1: [], screen2: [], screen3: [] } };
const modules = modularPage.screens.screen1 || [];

// Rendu unifié
<QuizModuleRenderer 
  modules={modules}
  previewMode={true}
  device={previewMode}
/>
```

### 4. **Modifier** `/src/components/QuizEditor/DesignEditorLayout.tsx`

**Changements** :
- S'assurer que `modularPage` est bien passé à `campaignData`
- Vérifier que `modularPage` est sauvegardé dans la base de données

**Ligne 1587** (déjà fait) :
```tsx
modularPage: modularPage
```

## Étapes d'Implémentation

### Phase 1 : Créer QuizModuleRenderer (✅ FAIT)
- [x] Créer le fichier `QuizModuleRenderer.tsx`
- [x] Extraire la logique de rendu de `ModularCanvas`
- [x] Supporter tous les types de modules
- [x] Gérer les styles avancés (customCSS, advancedStyle)

### Phase 2 : Intégrer dans ModularCanvas
- [ ] Modifier `ModularCanvas.tsx` pour utiliser `QuizModuleRenderer`
- [ ] Garder uniquement la logique d'édition (Toolbar, DnD)
- [ ] Tester que l'édition fonctionne toujours

### Phase 3 : Intégrer dans FunnelQuizParticipate
- [ ] Supprimer la conversion manuelle des modules
- [ ] Utiliser `QuizModuleRenderer` avec `previewMode=true`
- [ ] Tester que le preview affiche tout correctement

### Phase 4 : Tests & Validation
- [ ] Vérifier que édition === preview (WYSIWYG)
- [ ] Tester tous les types de modules (texte, image, vidéo, bouton)
- [ ] Tester les styles avancés (gradients, ombres, etc.)
- [ ] Tester sur mobile et desktop
- [ ] Tester les 3 écrans (screen1, screen2, screen3)

## Bénéfices Attendus

✅ **WYSIWYG parfait** : Ce que vous voyez en édition = ce que vous avez en preview
✅ **Code DRY** : Un seul endroit pour le rendu des modules
✅ **Maintenance facilitée** : Modifier le rendu une seule fois
✅ **Bugs éliminés** : Plus de divergences entre édition et preview
✅ **Performance** : Moins de code dupliqué

## Risques & Mitigations

⚠️ **Risque** : Casser l'édition existante
✅ **Mitigation** : Tester progressivement, garder les tests existants

⚠️ **Risque** : Styles différents entre édition et preview
✅ **Mitigation** : Utiliser exactement le même composant, seul `previewMode` change

⚠️ **Risque** : Performance dégradée
✅ **Mitigation** : Utiliser `React.memo` et optimisations

## Prochaines Étapes

1. ✅ Créer `QuizModuleRenderer.tsx` (FAIT)
2. 🔄 Modifier `ModularCanvas.tsx` pour l'utiliser
3. 🔄 Modifier `FunnelQuizParticipate.tsx` pour l'utiliser
4. ✅ Tester et valider le WYSIWYG
