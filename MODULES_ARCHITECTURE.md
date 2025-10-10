# 🏗️ Architecture des Modules Partagés

## 📋 Vue d'ensemble

Ce document décrit la nouvelle architecture unifiée des modules et panels partagés entre tous les éditeurs de l'application.

## 🎯 Objectif

Uniformiser tous les éditeurs pour :
- ✅ Éviter la duplication de code
- ✅ Garantir la cohérence des fonctionnalités
- ✅ Faciliter la maintenance
- ✅ Accélérer le développement de nouveaux éditeurs

## 📁 Structure des Modules Partagés

```
src/components/shared/
├── modules/
│   ├── ModulesPanel.tsx          # Panneau de modules unifié
│   ├── CompositeElementsPanel.tsx # Panneau composite (Modules + Assets)
│   ├── socialIcons.ts            # Icônes et presets réseaux sociaux
│   └── index.ts                  # Exports centralisés
├── panels/
│   ├── AssetsPanel.tsx           # Panneau assets (Texte, Formes, Uploads)
│   ├── TextPanel.tsx             # Panneau de texte avec presets
│   ├── TextEffectsPanel.tsx      # Effets de texte avancés
│   └── index.ts                  # Exports centralisés
├── shapes/
│   └── shapeLibrary.ts           # Bibliothèque de formes SVG
└── index.ts                      # Export principal
```

## 🔧 Modules Disponibles

### 1. **ModulesPanel**
Panneau unifié pour ajouter des modules aux écrans :
- Bloc Texte
- Bloc Image
- Bloc Bouton
- Bloc Carte
- Bloc Logo
- Bloc Pied de page
- Bloc Séparateur
- Bloc Vidéo
- Bloc Réseaux sociaux
- Bloc HTML

**Import :**
```typescript
import { ModulesPanel } from '@/components/shared';
```

### 2. **CompositeElementsPanel**
Panneau composite combinant ModulesPanel et AssetsPanel.

**Import :**
```typescript
import { CompositeElementsPanel } from '@/components/shared';
```

### 3. **AssetsPanel**
Panneau avec 3 onglets :
- **Texte** : Presets de titres et effets
- **Formes** : Bibliothèque de formes SVG
- **Uploads** : Upload d'images personnalisées

**Import :**
```typescript
import { AssetsPanel } from '@/components/shared';
```

### 4. **TextPanel**
Panneau de texte avec :
- Catégories de polices (Business, Calm, Cute, Fancy, Playful, Artistic)
- Presets de titres
- Titres composites
- Intégration TextEffectsPanel

**Import :**
```typescript
import { TextPanel } from '@/components/shared';
```

### 5. **TextEffectsPanel**
Effets de texte avancés :
- 30+ effets (Hollow, Splice, Outline, Neon, etc.)
- Contrôles avancés (épaisseur, couleur, ombre, etc.)
- Application directe sur texte sélectionné

**Import :**
```typescript
import { TextEffectsPanel } from '@/components/shared';
```

## 📝 Migration des Éditeurs

### Avant (Code dupliqué)
```typescript
// QuizEditor/modules/ModulesPanel.tsx
// DesignEditor/modules/DesignModulesPanel.tsx
// ModelEditor/panels/TextPanel.tsx
// ... Code identique dupliqué dans chaque éditeur
```

### Après (Code partagé)
```typescript
// Dans n'importe quel éditeur
import { 
  ModulesPanel, 
  CompositeElementsPanel,
  AssetsPanel,
  TextPanel,
  TextEffectsPanel 
} from '@/components/shared';
```

## 🔄 Éditeurs Migrés

### ✅ QuizEditor
- `CompositeElementsPanel` → `@/components/shared`
- `TextEffectsPanel` → `@/components/shared`

### ✅ DesignEditor
- `ModulesPanel` → `@/components/shared`
- `TextEffectsPanel` → `@/components/shared`
- `AssetsPanel` → `@/components/shared`

### ✅ ModelEditor
- `AssetsPanel` → `@/components/shared`
- `TextEffectsPanel` → `@/components/shared`

### 🔄 À migrer
- GameEditor
- ScratchCardEditor
- ModernEditor

## 🎨 Types et Interfaces

### Types Communs
```typescript
export type ModuleType = 
  | 'BlocTexte' 
  | 'BlocImage' 
  | 'BlocBouton' 
  | 'BlocSeparateur' 
  | 'BlocVideo' 
  | 'BlocReseauxSociaux' 
  | 'BlocHtml' 
  | 'BlocCarte' 
  | 'BlocLogo' 
  | 'BlocPiedDePage';

export type ScreenId = 'screen1' | 'screen2' | 'screen3';

export interface Module {
  id: string;
  type: ModuleType;
  [key: string]: any;
}
```

## 🚀 Avantages

### 1. **Maintenance Simplifiée**
- Un seul fichier à modifier pour tous les éditeurs
- Corrections de bugs propagées automatiquement
- Nouvelles fonctionnalités disponibles partout

### 2. **Cohérence Garantie**
- Même comportement dans tous les éditeurs
- Interface utilisateur uniforme
- Expérience utilisateur cohérente

### 3. **Développement Accéléré**
- Nouveaux éditeurs créés plus rapidement
- Réutilisation maximale du code
- Moins de tests nécessaires

### 4. **Taille du Bundle Optimisée**
- Code partagé = moins de duplication
- Meilleure compression
- Chargement plus rapide

## 📚 Bonnes Pratiques

### 1. **Toujours utiliser les modules partagés**
```typescript
// ✅ BON
import { ModulesPanel } from '@/components/shared';

// ❌ MAUVAIS
import ModulesPanel from '../QuizEditor/modules/ModulesPanel';
```

### 2. **Ne pas modifier les modules locaux**
Si vous avez besoin d'une fonctionnalité spécifique :
1. Ajoutez-la au module partagé avec une prop optionnelle
2. Ou créez un wrapper spécifique à votre éditeur

### 3. **Documenter les changements**
Tout changement dans `/src/components/shared` affecte tous les éditeurs.
Testez soigneusement avant de commit.

## 🔍 Dépannage

### Erreur : "Cannot find module '@/components/shared'"
**Solution :** Vérifiez que le chemin d'alias `@` est configuré dans `tsconfig.json`

### Erreur : Type incompatibility
**Solution :** Utilisez les types exportés depuis `@/components/shared/modules`

### Composant ne se met pas à jour
**Solution :** Vérifiez que vous utilisez bien la version partagée, pas une copie locale

## 📞 Support

Pour toute question sur l'architecture des modules partagés :
1. Consultez ce document
2. Vérifiez les exemples dans les éditeurs migrés
3. Contactez l'équipe de développement

---

**Dernière mise à jour :** 2025-10-07
**Version :** 1.0.0
