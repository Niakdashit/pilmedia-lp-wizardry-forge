# 🚀 Mode Article - Quick Start

## ✨ En 3 Minutes

Le mode Article est **déjà implémenté et prêt à l'emploi** ! Voici comment l'utiliser :

### 1️⃣ Tester Immédiatement (DesignEditor Activé)

```bash
# Démarrer le serveur
npm run dev

# Option A : Depuis le Dashboard
# http://localhost:8080/dashboard
# → Cliquer sur "Roue" → Choisir "Article"

# Option B : URL Directe
# http://localhost:8080/design-editor?mode=article
```

### 2️⃣ Activer pour un Autre Éditeur (30 secondes)

**Exemple : QuizEditor**

```tsx
// Fichier: /src/pages/QuizEditor.tsx

import QuizEditorLayout from '../components/QuizEditor/QuizEditorLayout';
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

const QuizEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="quiz"
      fullscreenLayout={<QuizEditorLayout />}
    />
  );
};
```

**C'est tout !** Le routing fonctionne automatiquement.

### 3️⃣ Utiliser le Mode Article

1. **Dashboard** → Clic sur un raccourci (ex: Roue)
2. **Modale** → Sélectionner "Article"
3. **Éditer** :
   - Upload de bannière (drag & drop)
   - Double-clic sur titre/description pour éditer
   - Personnaliser le bouton via le panneau latéral
4. **Preview** → Tester le parcours complet
5. **Enregistrer** → Sauvegarder dans Supabase

## 📋 Mapping des Types

| Éditeur | campaignType |
|---------|--------------|
| DesignEditor (Roue) | `"wheel"` ✅ Activé |
| QuizEditor | `"quiz"` |
| ScratchEditor | `"scratch"` |
| JackpotEditor | `"jackpot"` |
| FormEditor | `"form"` |
| DiceEditor | `"dice"` |
| MemoryEditor | `"memory"` |
| PuzzleEditor | `"puzzle"` |

## 🎯 Différences Clés

### Mode Full Screen (Existant)
- ✅ Éditeur complet avec tous les modules
- ✅ Design totalement personnalisable
- ✅ Modules illimités (textes, images, formes, etc.)
- ✅ Contrôle avancé des animations et effets

### Mode Article (Nouveau)
- ✅ Structure fixe : Bannière + Texte + Bouton
- ✅ Dimensions : 810×1200px
- ✅ Édition inline (double-clic)
- ✅ Création rapide (quelques minutes)
- ✅ Bannière visible à toutes les étapes

## 📁 Fichiers Créés

### Composants Principaux
```
src/components/ArticleEditor/
├── components/
│   ├── ArticleBanner.tsx         # Bannière avec upload
│   ├── EditableText.tsx          # Titre + description
│   └── ArticleCTA.tsx            # Bouton CTA
├── ArticleEditorLayout.tsx       # Layout 810×1200
├── ArticleSidebar.tsx            # Panneau latéral
└── ArticleEditorDetector.tsx     # Routing intelligent
```

### Modale Dashboard
```
src/components/Dashboard/
└── EditorModeModal.tsx           # Modale de choix
```

### Types
```
src/components/ArticleEditor/types/
└── ArticleTypes.ts               # Types complets

src/components/ModernEditor/types/
└── CampaignTypes.ts              # Types étendus
```

## 🔗 URLs Fonctionnelles

| URL | Résultat |
|-----|----------|
| `/design-editor` | Mode fullscreen (défaut) |
| `/design-editor?mode=fullscreen` | Mode fullscreen (explicite) |
| `/design-editor?mode=article` | Mode Article simplifié |

## ✅ Checklist d'Activation

Pour activer sur un nouvel éditeur :

- [ ] Importer `ArticleEditorDetector`
- [ ] Wrapper le layout existant
- [ ] Spécifier le `campaignType`
- [ ] Tester avec `?mode=article`
- [ ] Tester avec `?mode=fullscreen`
- [ ] Vérifier la modale du Dashboard

## 📚 Documentation Complète

- **Quick Start** : `ARTICLE_MODE_QUICK_START.md` (ce fichier)
- **Guide d'intégration** : `ARTICLE_MODE_INTEGRATION_GUIDE.md`
- **Récapitulatif technique** : `ARTICLE_MODE_COMPLETE.md`
- **Documentation utilisateur** : `README_ARTICLE_MODE.md`

## 🎨 Aperçu Visuel

```
┌──────────────────────────────────────┐
│  Dashboard                           │
│  ┌────────┐  ┌────────┐             │
│  │  Roue  │  │  Quiz  │  ...        │
│  └────────┘  └────────┘             │
└──────────────────────────────────────┘
         ↓ Clic
┌──────────────────────────────────────┐
│  Choisissez votre mode               │
│  ┌──────────────┐  ┌──────────────┐ │
│  │ Full Screen  │  │   Article    │ │
│  │   Complet    │  │  Simplifié   │ │
│  └──────────────┘  └──────────────┘ │
└──────────────────────────────────────┘
         ↓ Article
┌──────────────────────────────────────┐
│  Mode Article • 810×1200px           │
│  ┌──────────────────────────────┐   │
│  │     BANNIÈRE IMAGE           │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Titre éditable (double-clic)│   │
│  │  Description éditable        │   │
│  └──────────────────────────────┘   │
│       [ PARTICIPER ! ]               │
└──────────────────────────────────────┘
```

## 🚨 Important

- **Pas de code dupliqué** : Les éditeurs existants restent intacts
- **Lazy loading** : Code Article chargé uniquement si nécessaire
- **Compatibilité** : Même store Zustand, même base de données
- **Performance** : Aucun impact sur le mode fullscreen

## 🎉 Prêt à l'Emploi !

Le mode Article est **100% fonctionnel**. Le DesignEditor est activé comme exemple pilote. Il suffit de suivre le modèle pour activer les autres éditeurs.

**Temps d'intégration par éditeur : ~30 secondes** ⚡
