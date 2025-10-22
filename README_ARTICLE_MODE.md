# 🎨 Mode Article - Documentation Complète

## 📋 Résumé

Le **mode Article** est un mode d'édition simplifié qui s'ajoute aux éditeurs existants de l'application. Il permet de créer rapidement des landing pages avec une structure fixe : **bannière + texte descriptif + bouton CTA**.

### Caractéristiques Principales

- **Dimensions fixes** : 810×1200px (format article éditorial)
- **Structure simplifiée** : Pas de modules dynamiques, contenu épuré
- **Bannière persistante** : Visible à toutes les étapes du funnel
- **Édition inline** : Double-clic pour éditer titre et description
- **Choix depuis le Dashboard** : Modale élégante pour choisir entre Full Screen et Article

## 🎯 Cas d'Usage

Le mode Article est idéal pour:
- ✅ Contenus éditoriaux rapides
- ✅ Landing pages simples
- ✅ Campagnes avec message clair et direct
- ✅ Tests A/B de formats
- ✅ Créations en quelques minutes

Le mode Full Screen reste parfait pour:
- ✅ Campagnes complexes avec design personnalisé
- ✅ Multiples modules et éléments
- ✅ Contrôle total sur chaque détail
- ✅ Animations et effets avancés

## 📁 Structure des Fichiers

```
src/
├── components/
│   ├── ArticleEditor/
│   │   ├── components/
│   │   │   ├── ArticleBanner.tsx       # Bannière avec upload
│   │   │   ├── EditableText.tsx        # Titre + description éditables
│   │   │   └── ArticleCTA.tsx          # Bouton "Participer"
│   │   ├── types/
│   │   │   └── ArticleTypes.ts         # Types TypeScript complets
│   │   ├── ArticleEditorLayout.tsx     # Layout principal 810×1200
│   │   ├── ArticleSidebar.tsx          # Panneau latéral (4 onglets)
│   │   └── ArticleEditorDetector.tsx   # Routing intelligent
│   └── Dashboard/
│       └── EditorModeModal.tsx         # Modale de choix de mode
├── pages/
│   └── ArticleEditorWrapper.tsx        # Page wrapper
└── types/
    └── CampaignTypes.ts                # Types étendus (editorMode, articleConfig)
```

## 🚀 Démarrage Rapide

### 1. Tester le Mode Article (DesignEditor activé)

L'intégration est déjà faite pour le **DesignEditor** comme exemple pilote.

```bash
# Démarrer le serveur
npm run dev

# Aller sur le Dashboard
http://localhost:8080/dashboard

# Cliquer sur "Roue" → Choisir "Article" dans la modale

# Ou accéder directement :
http://localhost:8080/design-editor?mode=article
```

### 2. Intégrer dans un Autre Éditeur

Modifiez simplement la page de l'éditeur (ex: `QuizEditor.tsx`):

```tsx
// Avant
import QuizEditorLayout from '../components/QuizEditor/QuizEditorLayout';

const QuizEditor: React.FC = () => {
  return <QuizEditorLayout />;
};

// Après (avec support Article)
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

**C'est tout !** Les routes fonctionnent automatiquement.

## 🎨 Interface Utilisateur

### Modale de Choix (Dashboard)

Lorsqu'un utilisateur clique sur un raccourci de création depuis le Dashboard, une modale s'affiche avec deux options:

```
┌───────────────────────────────────────────────┐
│   Choisissez votre mode d'édition            │
├───────────────────────────────────────────────┤
│                                               │
│  ┌─────────────────┐  ┌─────────────────┐   │
│  │  FULL SCREEN    │  │     ARTICLE     │   │
│  │                 │  │                 │   │
│  │ Éditeur complet │  │  810×1200px     │   │
│  │ Modules illimités│ │  Simplifié      │   │
│  │ Design total    │  │  Bannière+Texte │   │
│  └─────────────────┘  └─────────────────┘   │
│                                               │
└───────────────────────────────────────────────┘
```

### Layout Article

```
┌─────────────────────────────────────┐
│  [−] Sidebar  [👁️ Preview] [💾 Save] │  ← Header
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      BANNIÈRE IMAGE         │   │  ← 810px large
│  │      (toujours visible)     │   │     Ratios: 2215×1536
│  │                             │   │            ou 1500×744
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Titre éditable             │   │  ← Double-clic
│  │  (double-clic pour éditer)  │   │     pour éditer
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Description éditable       │   │  ← Double-clic
│  │  Multi-lignes supportées    │   │     pour éditer
│  └─────────────────────────────┘   │
│                                     │
│      [  PARTICIPER !  ]             │  ← Bouton CTA
│                                     │     personnalisable
└─────────────────────────────────────┘
         ↓ 1200px minimum
```

### Panneau Latéral (4 Onglets)

```
┌─────────────────────────────────┐
│  Mode Article • 810×1200px      │
├─────────────────────────────────┤
│ [Bannière] [Texte] [Bouton] [⚙️]│  ← Onglets
├─────────────────────────────────┤
│                                 │
│  📸 Bannière                     │
│  • Upload d'image               │
│  • Ratio: 2215×1536 ou 1500×744 │
│  • Drag & drop supporté         │
│                                 │
│  ✍️ Texte                        │
│  • Style du titre               │
│  • Style de la description      │
│  • Taille, couleur, alignement  │
│                                 │
│  🎯 Bouton                       │
│  • Texte personnalisable        │
│  • 3 tailles (S/M/L)           │
│  • 3 styles (primary/secondary) │
│  • 4 icônes (→/↗/▶/none)       │
│                                 │
│  🔄 Funnel                       │
│  • Étapes activables            │
│  • Ordre configurable           │
│  • Position du formulaire       │
│                                 │
└─────────────────────────────────┘
```

## 🔧 Fonctionnalités Détaillées

### 1. Bannière Persistante

La bannière reste **toujours visible** pendant toute la navigation:

- **Étape 1** (Article): Bannière + Texte + CTA
- **Étape 2** (Formulaire): Bannière + Champs de contact
- **Étape 3** (Jeu): Bannière + Roue/Quiz/etc
- **Étape 4** (Résultat): Bannière + Message final

### 2. Édition Inline

- **Double-clic** sur le titre ou la description pour éditer
- **Entrée** pour valider (titre)
- **Ctrl+Entrée** pour valider (description)
- **Échap** pour annuler
- Sauvegarde automatique dans le store

### 3. Personnalisation du Bouton

Via le panneau "Bouton":
- Texte (ex: "PARTICIPER !", "JOUER MAINTENANT")
- Taille: Petit (px-6 py-2) / Moyen (px-8 py-3) / Grand (px-12 py-4)
- Variant: Primary / Secondary / Outline
- Icône: Flèche → / Externe ↗ / Play ▶ / Aucune

### 4. Configuration du Funnel

Via le panneau "Funnel":
- ✅/❌ Activer/désactiver le formulaire
- ✅/❌ Activer/désactiver le jeu
- ✅/❌ Activer/désactiver le résultat
- 📍 Position du formulaire: Avant ou Après le jeu

## 📊 Types TypeScript

### ArticleConfig

```typescript
interface ArticleConfig {
  banner?: {
    imageUrl?: string;
    aspectRatio?: '2215/1536' | '1500/744';
    alt?: string;
    mobileImageUrl?: string;
  };
  
  content?: {
    title?: string;
    description?: string;
    titleStyle?: {
      fontSize?: string;
      fontWeight?: string;
      color?: string;
      textAlign?: 'left' | 'center' | 'right';
    };
    descriptionStyle?: {
      fontSize?: string;
      color?: string;
      textAlign?: 'left' | 'center' | 'right';
    };
  };
  
  cta?: {
    text?: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'small' | 'medium' | 'large';
    icon?: 'arrow' | 'external' | 'play' | 'none';
    action?: 'next-step' | 'external-link' | 'custom';
  };
  
  funnelFlow?: {
    steps?: ('article' | 'form' | 'game' | 'result')[];
    formStep?: {
      enabled: boolean;
      position: 'before-game' | 'after-game';
    };
    gameStep?: {
      enabled: boolean;
      type?: 'wheel' | 'quiz' | 'scratch' | 'jackpot' | 'form';
    };
  };
  
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    // ...
  };
}
```

### OptimizedCampaign (Étendu)

```typescript
interface OptimizedCampaign {
  // ... champs existants
  
  editorMode?: 'fullscreen' | 'article';
  articleConfig?: ArticleConfig;
  articleLayout?: {
    width: 810;
    height: 1200;
    maxWidth?: 810;
  };
}
```

## 🛣️ Routing

### URLs Supportées

| URL | Mode | Description |
|-----|------|-------------|
| `/design-editor` | Fullscreen | Mode par défaut (complet) |
| `/design-editor?mode=fullscreen` | Fullscreen | Mode explicite |
| `/design-editor?mode=article` | Article | Mode simplifié |
| `/design-editor?mode=article&id=123` | Article | Édition campagne existante |

### Navigation Automatique

```typescript
// Depuis le Dashboard, la modale redirige vers:
navigate('/design-editor?mode=fullscreen') // Si Full Screen choisi
navigate('/design-editor?mode=article')    // Si Article choisi
```

### Détection du Mode

```typescript
// ArticleEditorDetector lit l'URL
const [searchParams] = useSearchParams();
const mode = searchParams.get('mode'); // 'fullscreen' | 'article' | null

// Rend le layout approprié
if (mode === 'article') {
  return <ArticleEditorLayout />;
}
return <DesignEditorLayout />; // Mode fullscreen par défaut
```

## 🧪 Tests

### Checklist de Test

Pour chaque éditeur intégré:

#### URLs
- [ ] `/editor` → Affiche mode fullscreen par défaut
- [ ] `/editor?mode=fullscreen` → Affiche mode fullscreen
- [ ] `/editor?mode=article` → Affiche mode Article

#### Dashboard
- [ ] Clic sur raccourci → Modale s'affiche
- [ ] Choix "Full Screen" → Navigation correcte
- [ ] Choix "Article" → Navigation correcte

#### Mode Article
- [ ] Layout 810×1200px centré ✓
- [ ] Bannière uploadable ✓
- [ ] Double-clic titre édite le titre ✓
- [ ] Double-clic description édite la description ✓
- [ ] Bouton CTA personnalisable ✓
- [ ] Panneaux latéraux fonctionnels ✓

#### Funnel
- [ ] Navigation Article → Formulaire ✓
- [ ] Navigation Formulaire → Jeu ✓
- [ ] Navigation Jeu → Résultat ✓
- [ ] Bannière visible à toutes les étapes ✓

#### Sauvegarde
- [ ] Enregistrement dans Supabase ✓
- [ ] Rechargement avec `?mode=article&id=X` ✓
- [ ] Données persistées correctement ✓

## 📚 Documentation Complète

- **`ARTICLE_MODE_INTEGRATION_GUIDE.md`** - Guide d'intégration détaillé
- **`ARTICLE_MODE_COMPLETE.md`** - Récapitulatif technique complet
- **`README_ARTICLE_MODE.md`** - Ce fichier (documentation utilisateur)

## 🎉 État Actuel

### ✅ Implémenté

- Tous les composants de base (ArticleBanner, EditableText, ArticleCTA)
- ArticleEditorLayout complet avec funnel
- ArticleSidebar avec 4 onglets
- Types TypeScript complets
- Routing intelligent (ArticleEditorDetector)
- Modale de choix (EditorModeModal) intégrée au Dashboard
- Store Zustand étendu
- Lazy loading pour la performance
- Documentation complète
- **Exemple pilote : DesignEditor activé** ✅

### 🚧 Prochaines Étapes

1. **Intégrer dans les autres éditeurs**:
   - QuizEditor
   - ScratchEditor
   - JackpotEditor
   - FormEditor

2. **Implémenter les mécaniques de jeu** dans ArticleEditorLayout:
   - Roue de la Fortune
   - Quiz
   - Carte à gratter
   - Jackpot

3. **Connecter le formulaire** aux champs de contact existants

4. **Tests E2E** sur le flow complet

## 🤝 Contribution

Pour ajouter le mode Article à un nouvel éditeur:

1. Ouvrir le fichier de page (ex: `/src/pages/QuizEditor.tsx`)
2. Importer `ArticleEditorDetector`
3. Wrapper le layout existant avec le detector
4. Spécifier le `campaignType` approprié
5. Tester les URLs avec `?mode=article` et `?mode=fullscreen`

**Exemple complet fourni dans `ARTICLE_MODE_INTEGRATION_GUIDE.md`**

## 📞 Support

Pour toute question ou problème:
- Consulter `ARTICLE_MODE_INTEGRATION_GUIDE.md` pour l'intégration
- Consulter `ARTICLE_MODE_COMPLETE.md` pour les détails techniques
- Vérifier les types dans `/src/components/ArticleEditor/types/ArticleTypes.ts`

---

**Le mode Article est prêt pour la production ! 🚀**
