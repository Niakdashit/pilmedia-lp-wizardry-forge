# Guide d'Intégration du Mode Article

Ce guide explique comment intégrer le mode Article dans chaque éditeur existant de l'application.

## 📋 Vue d'ensemble

Le mode Article est un clone visuel simplifié des éditeurs existants avec:
- **Largeur fixe**: 810px
- **Hauteur fixe**: 1200px  
- **Contenu**: Bannière + Texte descriptif + Bouton CTA
- **Bannière persistante**: Visible à toutes les étapes du funnel

## 🎯 Architecture

### Composants créés

1. **ArticleEditorLayout** (`/src/components/ArticleEditor/ArticleEditorLayout.tsx`)
   - Layout principal du mode Article
   - Gère l'affichage 810×1200px
   - Contient bannière, texte, CTA et navigation funnel

2. **ArticleSidebar** (`/src/components/ArticleEditor/ArticleSidebar.tsx`)
   - Panneau latéral adapté au mode Article
   - Onglets: Bannière, Texte, Bouton, Funnel

3. **ArticleEditorDetector** (`/src/components/ArticleEditor/ArticleEditorDetector.tsx`)
   - Composant de routing intelligent
   - Détecte `?mode=article` ou `?mode=fullscreen` dans l'URL
   - Rend le layout approprié

4. **EditorModeModal** (`/src/components/Dashboard/EditorModeModal.tsx`)
   - Modale de choix entre Fullscreen et Article
   - S'affiche depuis le Dashboard

### Composants de base

- **ArticleBanner** - Bannière avec upload d'image
- **EditableText** - Titre et description éditables inline
- **ArticleCTA** - Bouton "Participer" personnalisable

## 🔧 Intégration dans un éditeur existant

### Étape 1: Modifier la page de l'éditeur

Pour chaque éditeur (ex: `DesignEditor.tsx`, `QuizEditor.tsx`, etc.), ajoutez le `ArticleEditorDetector`:

```tsx
// Avant (exemple DesignEditor.tsx)
import React from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';

const DesignEditor: React.FC = () => {
  return <DesignEditorLayout />;
};

export default DesignEditor;
```

```tsx
// Après (avec support Article)
import React from 'react';
import DesignEditorLayout from '../components/DesignEditor/DesignEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

const DesignEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="wheel"
      fullscreenLayout={<DesignEditorLayout />}
    />
  );
};

export default DesignEditor;
```

### Étape 2: Mapping des types de campagne

Assurez-vous d'utiliser le bon `campaignType` pour chaque éditeur:

| Éditeur | campaignType |
|---------|--------------|
| DesignEditor (Roue) | `"wheel"` |
| QuizEditor | `"quiz"` |
| ScratchEditor | `"scratch"` |
| JackpotEditor | `"jackpot"` |
| FormEditor | `"form"` |
| DiceEditor | `"dice"` |
| MemoryEditor | `"memory"` |
| PuzzleEditor | `"puzzle"` |

### Étape 3: Vérifier le routing

Les routes existantes fonctionnent automatiquement:

- `/design-editor?mode=fullscreen` → Mode complet existant
- `/design-editor?mode=article` → Mode Article simplifié
- `/design-editor` → Mode fullscreen par défaut

## 📱 Flow utilisateur complet

### 1. Depuis le Dashboard

```
Dashboard → Clic raccourci (ex: Roue)
    ↓
Modale EditorModeModal s'ouvre
    ↓
Utilisateur choisit:
    ├─ Full Screen → /design-editor?mode=fullscreen
    └─ Article → /design-editor?mode=article
```

### 2. Navigation dans l'Article

```
Étape 1: Article (Bannière + Texte + CTA)
    ↓ Clic "Participer"
Étape 2: Formulaire (optionnel)
    ↓ Validation
Étape 3: Mécanique de jeu
    ↓ Participation
Étape 4: Résultat
```

La bannière reste visible à toutes les étapes.

## 🎨 Personnalisation

### Types étendus

Le type `OptimizedCampaign` a été étendu avec:

```typescript
interface OptimizedCampaign {
  // ... champs existants

  // Mode de l'éditeur
  editorMode?: 'fullscreen' | 'article';

  // Configuration Article (si mode = 'article')
  articleConfig?: {
    banner?: {
      imageUrl?: string;
      aspectRatio?: '2215/1536' | '1500/744';
      // ...
    };
    content?: {
      title?: string;
      description?: string;
      // ...
    };
    cta?: {
      text?: string;
      variant?: 'primary' | 'secondary' | 'outline';
      // ...
    };
    funnelFlow?: {
      steps?: ('article' | 'form' | 'game' | 'result')[];
      // ...
    };
    theme?: {
      primaryColor?: string;
      // ...
    };
  };

  // Layout Article (810x1200 fixe)
  articleLayout?: {
    width: number;
    height: number;
    maxWidth?: number;
  };
}
```

### Panneaux latéraux

Le `ArticleSidebar` propose 4 onglets:

1. **Bannière**
   - Upload/remplacement d'image
   - Choix du ratio (2215×1536 ou 1500×744)

2. **Texte**
   - Édition des styles du titre
   - Édition des styles de la description
   - Taille, couleur, alignement

3. **Bouton**
   - Texte du bouton
   - Taille (petit/moyen/grand)
   - Style (principal/secondaire/contour)
   - Icône (flèche/externe/play/aucune)

4. **Funnel**
   - Activation/désactivation des étapes
   - Position du formulaire (avant/après jeu)
   - Type de jeu

## 🧪 Test d'un éditeur

Pour tester le mode Article sur un éditeur:

1. Lancez le serveur de dev: `npm run dev`

2. Accédez au Dashboard: `http://localhost:8080/dashboard`

3. Cliquez sur un raccourci de création (ex: Roue)

4. Dans la modale, sélectionnez **"Article"**

5. Vérifiez:
   - Layout 810×1200px centré
   - Bannière uploadable
   - Texte éditable en double-clic
   - Bouton CTA personnalisable
   - Panneaux latéraux fonctionnels

## 🔍 Checklist d'intégration

Pour chaque éditeur à adapter:

- [ ] Importer `ArticleEditorDetector` dans la page de l'éditeur
- [ ] Wrapper le layout existant avec `ArticleEditorDetector`
- [ ] Spécifier le bon `campaignType`
- [ ] Tester l'URL avec `?mode=article`
- [ ] Tester l'URL avec `?mode=fullscreen`
- [ ] Tester l'URL sans paramètre (doit afficher fullscreen par défaut)
- [ ] Vérifier que la modale du Dashboard fonctionne
- [ ] Tester le funnel complet en mode Article
- [ ] Vérifier la sauvegarde de la campagne

## 📝 Notes importantes

1. **Import dynamique**: Le code Article n'est chargé qu'en mode Article grâce au lazy loading

2. **Pas de code dupliqué**: Les éditeurs fullscreen existants ne sont pas modifiés

3. **Compatibilité**: Les deux modes utilisent le même store Zustand et la même base de données

4. **Bannière persistante**: Contrairement au mode fullscreen, la bannière reste visible à toutes les étapes

5. **Structure simplifiée**: Pas de modules dynamiques en mode Article, juste bannière + texte + CTA

## 🚀 Déploiement

Le mode Article est prêt pour la production:

- ✅ Types TypeScript complets
- ✅ Composants React optimisés
- ✅ Store Zustand intégré
- ✅ Routing automatique
- ✅ Lazy loading pour la performance
- ✅ Modale de choix intuitive

Pour activer le mode Article sur tous les éditeurs, suivez simplement le guide ci-dessus pour chaque éditeur.
