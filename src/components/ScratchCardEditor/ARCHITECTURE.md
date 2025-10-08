# Architecture ScratchCardEditor

## Vue d'ensemble

Le ScratchCardEditor est un éditeur spécialisé pour les campagnes de cartes à gratter, basé sur l'architecture du DesignEditor avec des adaptations spécifiques au jeu de grattage.

## Composants Partagés

### CanvasElement (Réutilisé depuis DesignEditor)

**Localisation**: `import CanvasElement from '../DesignEditor/CanvasElement'`

**Raison de la réutilisation**:
- CanvasElement est un composant générique pour le rendu et la manipulation d'éléments sur le canvas
- Il gère les interactions communes (drag & drop, resize, rotation) indépendamment du type de jeu
- Évite la duplication de code complexe (~64KB de logique)
- Maintient la cohérence des interactions entre tous les éditeurs

**Fonctionnalités héritées**:
- Drag & drop avec seuil de mouvement (5px)
- Redimensionnement avec poignées
- Rotation d'éléments
- Sélection et multi-sélection
- Gestion des groupes
- Support tactile mobile/tablette
- Virtualisation du canvas
- Alignement intelligent

### Autres Composants Partagés

Les composants suivants sont également réutilisés depuis DesignEditor:
- `SmartAlignmentGuides` - Guides d'alignement professionnels
- `AlignmentToolbar` - Barre d'outils d'alignement
- `GridOverlay` - Grille de positionnement
- `GroupSelectionFrame` - Cadre de sélection multiple
- `CanvasContextMenu` - Menu contextuel
- `AnimationSettingsPopup` - Popup de configuration des animations
- `MobileResponsiveLayout` - Layout responsive mobile

## Composants Spécifiques

### ScratchCardCanvas
**Localisation**: `./ScratchCardCanvas.tsx`

Composant spécialisé pour le rendu et l'interaction avec les cartes à gratter:
- Gestion du grattage avec canvas
- Détection du seuil de révélation
- Logique d'attribution des lots
- Support des cartes multiples (grille configurable)

### ScratchCardGamePanel
**Localisation**: `./panels/ScratchCardGamePanel.tsx`

Panneau de configuration spécifique aux cartes à gratter:
- Configuration des cartes (nombre, disposition)
- Paramètres de grattage (taille du pinceau, seuil)
- Configuration des révélations (gagnant/perdant)
- Gestion des lots et probabilités

### MessagesPanel
**Localisation**: `./panels/MessagesPanel.tsx`

Panneau pour personnaliser les messages de l'expérience:
- Messages de bienvenue
- Messages de victoire/défaite
- Messages de formulaire
- Messages de remerciement

## Différences avec DesignEditor

### Types
- Utilise `Module` au lieu de `DesignModule`
- Support du screenId `'all'` pour afficher tous les écrans
- Types spécifiques pour les cartes à gratter

### Configuration
- `quizConfig` au lieu de `wheelConfig`
- Configuration de grattage au lieu de configuration de roue
- Logique d'attribution spécifique aux cartes

### Hooks
- Pas de `useWheelConfigSync` (non nécessaire)
- Transformation de données via `transformScratchStateToGameConfig`

## Safe Zone Configuration

Les zones de sécurité sont alignées avec DesignEditor:
```typescript
const SAFE_ZONE_PADDING: Record<DeviceType, number> = {
  desktop: 56,
  tablet: 40,
  mobile: 28
};

const SAFE_ZONE_RADIUS: Record<DeviceType, number> = {
  desktop: 24,  // Harmonisé avec DesignEditor
  tablet: 20,   // Harmonisé avec DesignEditor
  mobile: 16    // Harmonisé avec DesignEditor
};
```

## Bonnes Pratiques

### Lors de l'ajout de nouvelles fonctionnalités

1. **Vérifier si le composant existe dans DesignEditor**
   - Si oui et qu'il est générique → le réutiliser
   - Si non ou spécifique → créer un nouveau composant

2. **Maintenir la cohérence**
   - Utiliser les mêmes conventions de nommage
   - Suivre la même structure de dossiers
   - Respecter les mêmes patterns d'architecture

3. **Documenter les différences**
   - Expliquer pourquoi un composant est spécifique
   - Documenter les adaptations nécessaires
   - Maintenir ce fichier ARCHITECTURE.md à jour

## Évolution Future

### Opportunités d'unification

Les types `Module` et `DesignModule` pourraient être unifiés dans un type commun:
```typescript
// Proposition: types/editorModular.ts
export interface EditorModule {
  id: string;
  type: 'BlocTexte' | 'BlocImage' | 'BlocLogo' | 'BlocPiedDePage' | 'BlocCarte';
  // ... propriétés communes
}
```

### Composants candidats au partage

Les composants suivants pourraient être extraits dans un dossier `shared`:
- `DesignToolbar` (actuellement dupliqué)
- `HybridSidebar` (avec variations mineures)
- `DesignCanvas` (avec adaptations pour chaque type de jeu)

## Maintenance

### Lors de modifications de CanvasElement

⚠️ **Important**: Toute modification de `DesignEditor/CanvasElement.tsx` affecte également ScratchCardEditor.

**Checklist de test**:
- [ ] Tester le drag & drop dans les deux éditeurs
- [ ] Vérifier le redimensionnement
- [ ] Valider la rotation
- [ ] Tester sur mobile/tablette
- [ ] Vérifier les performances

### Lors de l'ajout de hooks d'optimisation

Les hooks d'optimisation suivants sont partagés:
- `useVirtualizedCanvas`
- `useAdvancedCache`
- `useAdaptiveAutoSave`
- `useSmartSnapping`
- `useAlignmentSystem`

Toute amélioration de ces hooks bénéficie aux deux éditeurs.

## Contact

Pour toute question sur l'architecture ou les décisions de design, consulter:
- `AUDIT_DESIGN_VS_SCRATCH.md` - Audit complet des différences
- `DesignEditor/README.md` - Documentation du DesignEditor
- Les memories taggées `architecture` et `design_editor`
