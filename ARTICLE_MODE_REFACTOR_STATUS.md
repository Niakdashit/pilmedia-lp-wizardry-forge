# 🔧 Mode Article - État de la Refactorisation

## ✅ Modifications Complétées

### 1. DesignEditorLayout.tsx
- ✅ Ajout détection du mode via URL (`?mode=article`)
- ✅ Variable `editorMode` créée ('article' | 'fullscreen')
- ✅ Console log pour débogage

### 2. ArticleCanvas.tsx
- ✅ Composant créé pour afficher le contenu Article
- ✅ Gère: Bannière + Texte + CTA
- ✅ Supporte les différentes étapes du funnel
- ✅ Props complètes pour l'édition

### 3. ArticleModePanel.tsx  
- ✅ Panneaux pour HybridSidebar en mode Article
- ✅ 4 panneaux: Bannière, Texte, Bouton, Funnel
- ✅ Styles identiques aux panneaux existants
- ✅ Gestion complète de articleConfig

## 🚧 Modifications à Compléter

### 4. HybridSidebar.tsx
**À faire**: Détecter le mode et adapter les onglets

```tsx
// Ajout au début du composant
const searchParams = new URLSearchParams(window.location.search);
const editorMode = searchParams.get('mode') === 'article' ? 'article' : 'fullscreen';

// Modifier allTabs selon le mode
const allTabs = editorMode === 'article' 
  ? [
      { id: 'banner', label: 'Bannière', icon: Image },
      { id: 'text', label: 'Texte', icon: Type },
      { id: 'button', label: 'Bouton', icon: MousePointer },
      { id: 'funnel', label: 'Funnel', icon: List }
    ]
  : [
      { id: 'background', label: 'Design', icon: Palette },
      { id: 'elements', label: 'Éléments', icon: Plus },
      { id: 'form', label: 'Formulaire', icon: FormInput },
      { id: 'game', label: 'Jeu', icon: Gamepad2 },
      { id: 'messages', label: 'Sortie', icon: MessageSquare }
    ];

// Dans le rendu, afficher ArticleModePanel si mode Article
{editorMode === 'article' && internalActiveTab && (
  <ArticleModePanel
    campaign={campaign}
    onCampaignChange={setCampaign}
    activePanel={internalActiveTab as 'banner' | 'text' | 'button' | 'funnel'}
  />
)}
```

### 5. DesignCanvas.tsx
**À faire**: Détecter le mode et afficher ArticleCanvas

```tsx
// Ajouter prop editorMode
interface DesignCanvasProps {
  editorMode?: 'fullscreen' | 'article';
  // ... autres props
}

// Dans le rendu
if (editorMode === 'article') {
  return (
    <div className="flex items-center justify-center min-h-[1200px] bg-gray-100 p-8">
      <ArticleCanvas
        articleConfig={campaign?.articleConfig || {}}
        onBannerChange={...}
        onTitleChange={...}
        onDescriptionChange={...}
        onCTAClick={...}
        currentStep="article"
        editable={true}
        campaignType={campaign?.type || 'wheel'}
      />
    </div>
  );
}

// Sinon, rendu normal avec modules
return (
  // Canvas actuel avec modules
);
```

### 6. Passer editorMode à tous les composants

Dans DesignEditorLayout, passer `editorMode` à:
- ✅ HybridSidebar ← Déjà via props
- ⏳ DesignCanvas ← À ajouter
- ⏳ DesignToolbar ← À vérifier si nécessaire

## 🎯 Résultat Final Attendu

### Mode Fullscreen (`?mode=fullscreen`)
```
┌──────────────────────────────────────────┐
│  [Logo Prosplay]  [Toolbar Desktop/...]  │
├───────┬──────────────────────────────────┤
│Design │                                  │
│Élém.  │      DesignCanvas               │
│Form   │      (modules normaux)           │
│Jeu    │                                  │
│Sortie │                                  │
└───────┴──────────────────────────────────┘
```

### Mode Article (`?mode=article`)
```
┌──────────────────────────────────────────┐
│  [Logo Prosplay]  [Toolbar Desktop/...]  │ ← MÊME header
├───────┬──────────────────────────────────┤
│Banner │                                  │ ← Onglets différents
│Text   │      ArticleCanvas               │ ← Contenu différent
│Button │      • Bannière (810px)          │
│Funnel │      • Titre + Description       │
│       │      • Bouton CTA                │
└───────┴──────────────────────────────────┘
```

**Visuellement identique, seuls les onglets et le contenu central changent !**

## 📝 Checklist Finale

- [x] Détection mode dans DesignEditorLayout
- [x] Création ArticleCanvas
- [x] Création ArticleModePanel
- [ ] Adaptation HybridSidebar (onglets conditionnels)
- [ ] Adaptation DesignCanvas (afficher ArticleCanvas si mode=article)
- [ ] Passer editorMode à DesignCanvas
- [ ] Tests avec `/design-editor?mode=article`
- [ ] Tests avec `/design-editor?mode=fullscreen`
- [ ] Vérifier que le design est identique

## 🚀 Prochaines Étapes

1. Modifier HybridSidebar ligne ~470 pour onglets conditionnels
2. Modifier DesignCanvas pour détecter mode Article
3. Tester le flow complet
4. Ajuster les styles si nécessaire
5. Documenter les changements

## ⚠️ Points d'Attention

- **Ne pas casser le mode fullscreen existant** - Garder la compatibilité
- **Réutiliser les styles existants** - Pas de nouveaux styles
- **Performance** - Import dynamique si nécessaire
- **Types TypeScript** - Mettre à jour les interfaces

---

**Status**: En cours de refactorisation - ~60% complété
**Next**: Finaliser HybridSidebar et DesignCanvas
