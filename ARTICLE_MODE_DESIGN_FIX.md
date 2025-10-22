# 🎨 Mode Article - Correction du Design

## ❌ Problème Identifié

Le mode Article créé a **un design complètement différent** alors que l'objectif était de **reprendre exactement le design des éditeurs existants**.

### Ce qui ne va pas:
- Header différent (simple au lieu du header DesignEditor)
- Sidebar différente (ArticleSidebar au lieu de HybridSidebar)
- Pas de toolbar
- Styles complètement différents
- Zone centrale différente

## ✅ Ce Qu'il Faut Faire

Le mode Article doit **réutiliser à 100% les composants visuels** du DesignEditor:

1. **Même Header** - Logo Prosplay + boutons de navigation
2. **Même Toolbar** - DesignToolbar avec les options
3. **Même HybridSidebar** - Panneaux latéraux avec les mêmes styles
4. **Même zone de canvas** - Avec zoom, scroll, etc.
5. **Seul changement**: Remplacer le contenu des modules par ArticleCanvas

## 🔧 Solution Technique

### Option 1: Wrapper le DesignCanvas (Recommandé)

Au lieu de créer un nouveau layout, **modifier le DesignEditor** pour détecter le mode Article et afficher ArticleCanvas au lieu des modules:

```tsx
// Dans DesignCanvas.tsx
const DesignCanvas = ({ campaign, editorMode, ... }) => {
  
  // Si mode Article, afficher ArticleCanvas
  if (editorMode === 'article') {
    return <ArticleCanvas {...articleProps} />;
  }
  
  // Sinon, afficher les modules normalement
  return (
    <div>
      {/* Modules existants */}
    </div>
  );
};
```

### Option 2: Adapter le HybridSidebar

Ajouter des onglets conditionnels dans HybridSidebar en fonction du mode:

```tsx
// Dans HybridSidebar.tsx
const tabs = editorMode === 'article'
  ? ['Bannière', 'Texte', 'Bouton', 'Funnel'] // Onglets Article
  : ['Background', 'Elements', 'Wheel', ...]; // Onglets normaux
```

### Option 3: Créer ArticleDesignCanvas

Créer un composant ArticleDesignCanvas qui **hérite de DesignCanvas** mais avec un contenu simplifié:

```tsx
const ArticleDesignCanvas = (props) => {
  return (
    <DesignCanvas
      {...props}
      // Forcer l'affichage de ArticleCanvas
      renderMode="article"
      // Désactiver certaines fonctionnalités
      allowModules={false}
      allowTemplates={false}
    />
  );
};
```

## 📝 Plan d'Action

### Étape 1: Modifier DesignEditorLayout

Ajouter la détection du mode Article:

```tsx
const DesignEditorLayout = ({ ... }) => {
  const [searchParams] = useSearchParams();
  const editorMode = searchParams.get('mode') === 'article' ? 'article' : 'fullscreen';
  
  // Passer editorMode à tous les composants
  return (
    <div>
      <DesignToolbar editorMode={editorMode} />
      <HybridSidebar editorMode={editorMode} />
      <DesignCanvas editorMode={editorMode} />
    </div>
  );
};
```

### Étape 2: Adapter HybridSidebar

Modifier les onglets selon le mode:

```tsx
const HybridSidebar = ({ editorMode, ... }) => {
  const tabs = useMemo(() => {
    if (editorMode === 'article') {
      return [
        { id: 'banner', label: 'Bannière', icon: Image },
        { id: 'text', label: 'Texte', icon: Type },
        { id: 'button', label: 'Bouton', icon: MousePointer },
        { id: 'funnel', label: 'Funnel', icon: List },
      ];
    }
    
    // Onglets normaux pour fullscreen
    return [
      { id: 'background', label: 'Background', ... },
      { id: 'elements', label: 'Elements', ... },
      // ...
    ];
  }, [editorMode]);
  
  // Rendre le contenu selon l'onglet actif
  if (editorMode === 'article') {
    return renderArticlePanelContent(activeTab);
  }
  
  return renderNormalPanelContent(activeTab);
};
```

### Étape 3: Adapter DesignCanvas

Afficher ArticleCanvas en mode Article:

```tsx
const DesignCanvas = ({ editorMode, campaign, ... }) => {
  if (editorMode === 'article') {
    return (
      <div className="article-canvas-wrapper" style={{ width: 810, minHeight: 1200 }}>
        <ArticleCanvas
          articleConfig={campaign.articleConfig}
          onBannerChange={...}
          onTitleChange={...}
          onDescriptionChange={...}
          onCTAClick={...}
        />
      </div>
    );
  }
  
  // Canvas normal avec modules
  return (
    <div>
      {modularModules.map(module => ...)}
    </div>
  );
};
```

## 🎯 Résultat Attendu

Avec ces modifications, l'utilisateur verra:

### Mode Fullscreen (`?mode=fullscreen`)
```
┌─────────────────────────────────────────────┐
│  [Logo] DesignToolbar                       │ ← Même header
├────────┬────────────────────────────────────┤
│        │                                    │
│ Hybrid │     DesignCanvas (modules)        │ ← Même canvas
│ Sidebar│                                    │   avec modules
│        │                                    │
│        │                                    │
└────────┴────────────────────────────────────┘
```

### Mode Article (`?mode=article`)
```
┌─────────────────────────────────────────────┐
│  [Logo] DesignToolbar                       │ ← MÊME header
├────────┬────────────────────────────────────┤
│ Banner │                                    │
│ Text   │     ArticleCanvas (810×1200)      │ ← Contenu Article
│ Button │     • Bannière                     │   au lieu de modules
│ Funnel │     • Titre + Description          │
│        │     • Bouton CTA                   │
└────────┴────────────────────────────────────┘
```

**Visuellement identique, seul le contenu central change !**

## ⚠️ Important

- **Ne PAS créer de nouveau layout** - Réutiliser DesignEditorLayout
- **Ne PAS créer de nouvelle sidebar** - Adapter HybridSidebar
- **Ne PAS créer de nouveau header** - Garder le header existant
- **Seul ArticleCanvas est nouveau** - Le reste est réutilisé

## 🚀 Prochaine Étape

Je vais refactoriser le code pour implémenter cette approche et garantir que le mode Article ait **exactement le même design** que le mode fullscreen.
