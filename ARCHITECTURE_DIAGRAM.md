# 🎨 Diagramme d'Architecture - Modules Partagés

## 📊 Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION PRINCIPALE                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ QuizEditor   │      │ DesignEditor │      │ ModelEditor  │
└──────────────┘      └──────────────┘      └──────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ SHARED MODULES   │
                    │ @/components/    │
                    │    shared/       │
                    └──────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   modules/   │      │   panels/    │      │   shapes/    │
└──────────────┘      └──────────────┘      └──────────────┘
```

## 🏗️ Structure Détaillée

### Niveau 1 : Éditeurs (Consommateurs)
```
┌────────────────────────────────────────────────────────────────┐
│                         ÉDITEURS                                │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │
│  │ QuizEditor  │  │DesignEditor │  │ ModelEditor │  ...      │
│  └─────────────┘  └─────────────┘  └─────────────┘           │
│         │                │                │                    │
│         └────────────────┴────────────────┘                    │
│                          │                                     │
│                    Import depuis                               │
│                  @/components/shared                           │
└────────────────────────────────────────────────────────────────┘
```

### Niveau 2 : Modules Partagés (Fournisseurs)
```
┌────────────────────────────────────────────────────────────────┐
│                    SHARED MODULES                               │
│                 src/components/shared/                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ modules/                                                  │ │
│  │  ├── ModulesPanel.tsx          (224 lignes)             │ │
│  │  ├── CompositeElementsPanel.tsx (35 lignes)             │ │
│  │  ├── socialIcons.ts             (150 lignes)             │ │
│  │  └── index.ts                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ panels/                                                   │ │
│  │  ├── AssetsPanel.tsx            (238 lignes)             │ │
│  │  ├── TextPanel.tsx              (446 lignes)             │ │
│  │  ├── TextEffectsPanel.tsx       (1500+ lignes)           │ │
│  │  └── index.ts                                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ shapes/                                                   │ │
│  │  └── shapeLibrary.ts            (85 lignes)              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  └── index.ts (Export principal)                              │
└────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### Import et Utilisation
```
┌─────────────────────────────────────────────────────────────┐
│ 1. IMPORT                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  import {                                                    │
│    ModulesPanel,                                            │
│    CompositeElementsPanel,                                  │
│    AssetsPanel                                              │
│  } from '@/components/shared';                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. UTILISATION                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  <CompositeElementsPanel                                    │
│    currentScreen="screen1"                                  │
│    onAddModule={handleAddModule}                            │
│    onAddElement={handleAddElement}                          │
│  />                                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. CALLBACKS                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  handleAddModule(screen, module) {                          │
│    // Ajouter le module à l'état                           │
│    setModules([...modules, module]);                        │
│  }                                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Hiérarchie des Composants

### CompositeElementsPanel (Composite)
```
CompositeElementsPanel
│
├── ModulesPanel
│   └── Grid de 10 types de blocs
│       ├── BlocTexte
│       ├── BlocImage
│       ├── BlocBouton
│       ├── BlocCarte
│       ├── BlocLogo
│       ├── BlocPiedDePage
│       ├── BlocSeparateur
│       ├── BlocVideo
│       ├── BlocReseauxSociaux
│       └── BlocHtml
│
└── AssetsPanel
    ├── Tab: Texte
    │   └── TextPanel
    │       ├── Catégories de polices
    │       ├── Presets de titres
    │       └── TextEffectsPanel
    │
    ├── Tab: Formes
    │   └── shapeLibrary
    │       └── 20+ formes SVG
    │
    └── Tab: Uploads
        └── Upload d'images
```

## 📦 Dépendances

### Modules → Panels
```
ModulesPanel
  └── socialIcons.ts (pour BlocReseauxSociaux)

CompositeElementsPanel
  ├── ModulesPanel
  └── AssetsPanel

AssetsPanel
  ├── TextPanel
  └── shapeLibrary.ts
```

### Panels → Panels
```
TextPanel
  └── TextEffectsPanel

AssetsPanel
  └── TextPanel
      └── TextEffectsPanel
```

## 🔀 Flux de Migration

### Avant (Duplication)
```
QuizEditor/modules/ModulesPanel.tsx
        │
        ├── Code dupliqué
        │
DesignEditor/modules/DesignModulesPanel.tsx
        │
        ├── Code dupliqué
        │
ModelEditor/panels/AssetsPanel.tsx
```

### Après (Partagé)
```
shared/modules/ModulesPanel.tsx
        │
        ├── Import
        │
QuizEditor ──┤
             │
DesignEditor ┤
             │
ModelEditor ─┘
```

## 📊 Métriques de Réutilisation

```
┌─────────────────────────────────────────────────────────┐
│                  TAUX DE RÉUTILISATION                   │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ModulesPanel:           3 éditeurs  ████████████ 100%  │
│  CompositeElementsPanel: 2 éditeurs  ████████     67%   │
│  AssetsPanel:            3 éditeurs  ████████████ 100%  │
│  TextPanel:              3 éditeurs  ████████████ 100%  │
│  TextEffectsPanel:       3 éditeurs  ████████████ 100%  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Légende

```
┌────┐
│ ✅ │ Composant partagé (shared/)
└────┘

┌────┐
│ 📦 │ Module (modules/)
└────┘

┌────┐
│ 🎨 │ Panel (panels/)
└────┘

┌────┐
│ 🔷 │ Éditeur (consommateur)
└────┘

  │
  ▼   Flux de données / Import
```

---

**Légende des symboles :**
- `│` : Connexion verticale
- `├──` : Branche
- `└──` : Dernière branche
- `▼` : Flux descendant
- `█` : Barre de progression

