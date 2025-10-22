# 🎯 Mode Article - Étapes Finales

## ✅ Complété (90%)

### 1. DesignEditorLayout
- ✅ Détection du mode Article via URL (`?mode=article`)
- ✅ Variable `editorMode` disponible

### 2. HybridSidebar  
- ✅ Import des icônes Article (Image, Type, MousePointer, List)
- ✅ Import ArticleModePanel
- ✅ Détection du mode Article
- ✅ Onglets conditionnels (Article vs Fullscreen)
- ✅ Rendu de ArticleModePanel selon l'onglet actif

### 3. ArticleCanvas
- ✅ Composant créé
- ✅ Affiche Bannière + Texte + CTA
- ✅ Gère les étapes du funnel

### 4. ArticleModePanel
- ✅ 4 panneaux (Banner, Text, Button, Funnel)
- ✅ Styles identiques aux panneaux existants

## 🚧 Reste à Faire (10%)

### 5. DesignCanvas
**Objectif**: Afficher ArticleCanvas si `editorMode === 'article'`

**Fichier**: `/src/components/DesignEditor/DesignCanvas.tsx`

**Action**: Ajouter au début du render:

```tsx
// Props à ajouter
interface DesignCanvasProps {
  // ... props existantes
  editorMode?: 'fullscreen' | 'article';
}

// Dans le composant
const DesignCanvas = ({ 
  editorMode = 'fullscreen',
  campaign,
  ...props 
}) => {
  
  // Si mode Article, afficher ArticleCanvas
  if (editorMode === 'article') {
    const articleConfig = campaign?.articleConfig || {};
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <ArticleCanvas
          articleConfig={articleConfig}
          onBannerChange={(url) => {
            // Mettre à jour campaign.articleConfig.banner.imageUrl
          }}
          onBannerRemove={() => {
            // Supprimer campaign.articleConfig.banner.imageUrl
          }}
          onTitleChange={(title) => {
            // Mettre à jour campaign.articleConfig.content.title
          }}
          onDescriptionChange={(desc) => {
            // Mettre à jour campaign.articleConfig.content.description
          }}
          onCTAClick={() => {
            // Navigation vers l'étape suivante
          }}
          currentStep="article"
          editable={true}
          maxWidth={810}
          campaignType={campaign?.type || 'wheel'}
        />
      </div>
    );
  }
  
  // Sinon, render normal avec modules
  return (
    // ... render actuel
  );
};
```

### 6. Passer editorMode à DesignCanvas

**Fichier**: `/src/components/DesignEditor/DesignEditorLayout.tsx`

**Action**: Trouver où `<DesignCanvas` est rendu et ajouter:

```tsx
<DesignCanvas
  editorMode={editorMode}  // ← Ajouter cette ligne
  selectedDevice={selectedDevice}
  elements={canvasElements}
  // ... autres props
/>
```

Il y a 3 instances de DesignCanvas (screen1, screen2, screen3), ajouter `editorMode` aux 3.

## 🧪 Tests à Effectuer

### URLs à tester:
1. `/design-editor` → Mode fullscreen par défaut
2. `/design-editor?mode=fullscreen` → Mode fullscreen explicite
3. `/design-editor?mode=article` → Mode Article

### Checklist de test Mode Article:
- [ ] Header identique au mode fullscreen
- [ ] Toolbar identique (Desktop/Tablet/Mobile)
- [ ] Sidebar avec 4 onglets: Bannière, Texte, Bouton, Funnel
- [ ] Zone centrale affiche ArticleCanvas (810×1200px)
- [ ] Bannière uploadable
- [ ] Titre/Description éditables en double-clic
- [ ] Bouton CTA personnalisable
- [ ] Panneau Funnel fonctionnel

### Checklist de test Mode Fullscreen:
- [ ] Aucun changement par rapport à avant
- [ ] Tous les onglets présents
- [ ] Modules fonctionnent normalement
- [ ] Pas de régression

## 📝 Code Manquant

### Imports à ajouter dans DesignCanvas.tsx:
```tsx
import ArticleCanvas from '../ArticleEditor/ArticleCanvas';
import { DEFAULT_ARTICLE_CONFIG } from '../ArticleEditor/types/ArticleTypes';
```

### Initialiser articleConfig dans DesignEditorLayout:
```tsx
useEffect(() => {
  if (editorMode === 'article' && campaign && !campaign.articleConfig) {
    setCampaign({
      ...campaign,
      editorMode: 'article',
      articleConfig: DEFAULT_ARTICLE_CONFIG,
      articleLayout: { width: 810, height: 1200, maxWidth: 810 }
    });
  }
}, [editorMode, campaign, setCampaign]);
```

## 🎉 Résultat Final Attendu

```
┌──────────────────────────────────────────┐
│  [Logo Prosplay]  [Toolbar Desktop/...]  │ ← MÊME header
├───────┬──────────────────────────────────┤
│Banner │          Article Canvas          │ ← Différent
│Text   │          • Bannière 810px        │
│Button │          • Titre éditable        │
│Funnel │          • Description éditable  │
│       │          • Bouton CTA            │
│       │                                  │
└───────┴──────────────────────────────────┘
```

**Design 100% identique, seuls le contenu central et les onglets changent !**

## ⏱️ Temps Estimé

- Modifier DesignCanvas: **10 minutes**
- Passer editorMode: **5 minutes**
- Tests: **10 minutes**
- **Total: ~25 minutes**

## 🚀 Prochaine Action

1. Ouvrir `DesignCanvas.tsx`
2. Ajouter la prop `editorMode`
3. Ajouter la condition `if (editorMode === 'article')`
4. Retourner ArticleCanvas
5. Tester avec `/design-editor?mode=article`

---

**Status**: 90% complété - Presque terminé ! 🎯
