# 📦 Composants Partagés

Ce dossier contient tous les modules et panels partagés entre les différents éditeurs de l'application.

## 🎯 Principe

**Un seul code source pour tous les éditeurs** - Évite la duplication et garantit la cohérence.

## 📂 Structure

```
shared/
├── modules/          # Modules de construction de pages
├── panels/           # Panels de configuration
├── shapes/           # Bibliothèque de formes
└── index.ts          # Export principal
```

## 🚀 Utilisation

### Import Simple
```typescript
import { ModulesPanel, AssetsPanel, TextEffectsPanel } from '@/components/shared';
```

### Import Spécifique
```typescript
import { ModulesPanel } from '@/components/shared/modules';
import { AssetsPanel } from '@/components/shared/panels';
```

## ⚠️ Règles Importantes

### ✅ À FAIRE
- Utiliser les composants partagés dans tous les nouveaux éditeurs
- Ajouter des props optionnelles pour les fonctionnalités spécifiques
- Tester dans tous les éditeurs après modification
- Documenter les changements

### ❌ À NE PAS FAIRE
- Dupliquer le code dans un éditeur spécifique
- Modifier sans tester tous les éditeurs
- Créer des dépendances circulaires
- Casser la compatibilité avec les éditeurs existants

## 📋 Composants Disponibles

### Modules
- **ModulesPanel** - Panneau de modules (Texte, Image, Bouton, etc.)
- **CompositeElementsPanel** - Panneau composite (Modules + Assets)

### Panels
- **AssetsPanel** - Panneau assets (Texte, Formes, Uploads)
- **TextPanel** - Panneau de texte avec presets
- **TextEffectsPanel** - Effets de texte avancés

### Shapes
- **shapeLibrary** - Bibliothèque de formes SVG

## 🔧 Développement

### Ajouter un Nouveau Composant
1. Créer le composant dans le bon dossier (`modules/` ou `panels/`)
2. Exporter depuis le fichier `index.ts` local
3. Tester dans au moins 2 éditeurs différents
4. Mettre à jour la documentation

### Modifier un Composant Existant
1. Vérifier l'impact sur tous les éditeurs
2. Ajouter des props optionnelles si nécessaire
3. Maintenir la rétrocompatibilité
4. Tester exhaustivement

## 📚 Documentation Complète

Voir [MODULES_ARCHITECTURE.md](/MODULES_ARCHITECTURE.md) à la racine du projet.
