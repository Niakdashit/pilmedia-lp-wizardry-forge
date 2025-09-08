# ScratchCard Game Plugin

## Description

Plugin de jeu de cartes à gratter intégré à Scratch-Editor3. Remplace les 4 cartes statiques existantes par un système interactif et configurable.

## Fonctionnalités

### Core Features
- ✅ Grattage interactif avec brosse configurable
- ✅ Gestion des couvertures (couleur/image) 
- ✅ Contenu révélé (texte/image)
- ✅ Modes Édition et Preview
- ✅ Persistance de la configuration
- ✅ Feature flag pour rollback

### Configuration
- **Design**: Disposition en grille, taille de brosse, seuil de révélation
- **Couverture**: Images uploadées ou couleurs unies (globale ou par carte)
- **Cartes**: Nombre variable (1-24), configuration individuelle
- **Révélation**: Texte ou images avec styles personnalisables
- **Effets**: Confetti pour les gagnants

### Interface
- **Onglet "Jeu"** dans HybridSidebar avec tous les contrôles
- **Mode Édition**: Overlays d'aide, boutons Test/Reset visibles
- **Mode Preview**: Interface de grattage pure

## Installation

### 1. Feature Flag
```typescript
// src/config/features.ts
export const features = {
  scratchcardGame: true  // false pour désactiver
};
```

### 2. Integration
Le plugin s'intègre automatiquement via:
- `src/plugins/scratchcard/integration.tsx`
- `src/components/DesignEditor/DesignCanvas.tsx`
- `src/components/DesignEditor/HybridSidebar.tsx`

### 3. Store Integration
Les données sont persistées dans:
```typescript
campaign.plugins.scratchcardGame: ScratchCardState
```

## API

### Types principaux

```typescript
type ScratchCardCover = 
  | { type: 'image'; url: string; alt?: string }
  | { type: 'color'; value: string };

type ScratchCardReveal =
  | { type: 'image'; url: string; alt?: string }
  | { type: 'text'; value: string; style?: TextStyle };

type ScratchCard = {
  id: string;
  title?: string;
  cover?: ScratchCardCover;
  reveal?: ScratchCardReveal;
  isWinner?: boolean;
  progress?: number;    // 0-1 (read-only)
  revealed?: boolean;   // read-only
};

type ScratchCardState = {
  cards: ScratchCard[];
  settings: ScratchCardSettings;
};
```

### Composants

#### ScratchCardCanvas
```typescript
<ScratchCardCanvas
  mode="edit" | "preview"
  state={scratchCardState}
  onStateChange={handler}
  device="desktop" | "tablet" | "mobile"
/>
```

#### ScratchGamePanel
```typescript
<ScratchGamePanel
  state={scratchCardState}
  onStateChange={handler}
  mode="edit" | "preview"
  onModeChange={handler}
/>
```

### Événements

- `scratchcard:progress` - Progression du grattage (cardId, progress)
- `scratchcard:revealed` - Carte révélée (cardId)
- `scratchcard:reset` - Reset de toutes les cartes
- `scratchcard:configChanged` - Configuration modifiée (state)

## Styles

Tous les styles sont scopés avec le préfixe `sc-` pour éviter les conflits:

```css
.sc-canvas        /* Conteneur principal */
.sc-card          /* Carte individuelle */
.sc-card__content /* Contenu révélé */
.sc-card__cover   /* Surface à gratter */
.sc-card__canvas  /* Canvas de grattage */
```

Variables CSS personnalisées:
```css
--sc-primary: hsl(var(--primary));
--sc-background: hsl(var(--background));
--sc-border: hsl(var(--border));
```

## Performance

- **60 FPS** grattage avec `requestAnimationFrame`
- **HiDPI** support avec `devicePixelRatio`
- **Lazy loading** des ressources
- **Memory management** avec cleanup automatique
- **Touch optimized** pour mobile

## Accessibilité

- **Focus management** avec navigation clavier
- **ARIA attributes** (`role="button"`, `aria-pressed`)
- **Alt text** pour toutes les images
- **Screen reader** friendly

## Tests

### Tests unitaires
```bash
npm test -- src/plugins/scratchcard/
```

### Tests E2E
- Création/suppression de cartes
- Upload d'images
- Grattage jusqu'au seuil
- Persistance de la configuration

## Limitations connues

1. **Images**: Maximum 10MB par image
2. **Cartes**: Maximum 24 cartes simultanées
3. **Browser support**: Modern browsers seulement (Canvas API)
4. **Mobile**: Empêche le scroll pendant le grattage

## Rollback

Pour désactiver le plugin:
```typescript
// src/config/features.ts
features.scratchcardGame = false
```

Le système retourne automatiquement au `ScratchGrid` existant.

## Changelog

### v1.0.0 (2024-01-09)
- ✅ Implémentation initiale
- ✅ Feature flag system
- ✅ Integration complète avec Scratch-Editor3
- ✅ Onglet "Jeu" dans HybridSidebar
- ✅ Styles scopés avec préfixe sc-
- ✅ Documentation complète