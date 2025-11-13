# 🔧 Correction des Imports ArticleEditor

## Problème

Après la suppression de l'ArticleEditor, plusieurs fichiers contenaient encore des imports vers des composants supprimés :
- `ArticleFunnelView`
- `ArticleEditorDetector`
- `ArticleCanvas`
- `DEFAULT_ARTICLE_CONFIG`

## Actions Effectuées

### 1. Suppression des Imports

✅ **ArticleFunnelView** - Supprimé de :
- `DesignEditorLayout.tsx`
- `WebEditor/DesignEditorLayout.tsx`
- `FormEditor/DesignEditorLayout.tsx`
- `QuizEditor/DesignEditorLayout.tsx`
- `JackpotEditor/JackpotEditorLayout.tsx`
- `ReferenceEditor/DesignEditorLayout.tsx`
- `ScratchCardEditor/ScratchCardEditorLayout.tsx`
- `SwiperEditor/DesignEditorLayout.tsx`
- `SwiperEditor/ReferenceEditor/DesignEditorLayout.tsx`
- `pages/PublicCampaign.tsx`

✅ **ArticleEditorDetector** - Supprimé de :
- `pages/DesignEditor.tsx`

✅ **ArticleCanvas** - Supprimé de :
- `utils/lazyLoadComponents.tsx`
- `WebEditor/DesignCanvas.tsx`
- `FormEditor/DesignCanvas.tsx`
- `QuizEditor/DesignCanvas.tsx`
- `JackpotEditor/DesignCanvas.tsx`
- `JackpotEditor/JackpotEditorLayout.tsx`
- `ProEditor/DesignCanvas.tsx`
- `ProEditor/ProEditorLayout.tsx`
- `ReferenceEditor/DesignCanvas.tsx`
- `ScratchCardEditor/DesignCanvas.tsx`
- `ScratchCardEditor/ScratchCardEditorLayout.tsx`
- `SwiperEditor/DesignCanvas.tsx`
- `SwiperEditor/ReferenceEditor/DesignCanvas.tsx`

### 2. Remplacement dans DesignEditorLayout.tsx

**Avant :**
```tsx
import ArticleFunnelView from '@/components/ArticleEditor/ArticleFunnelView';

// ...

<ArticleFunnelView
  articleConfig={(campaignState as any)?.articleConfig || {}}
  campaignType={(campaignState as any)?.type || 'wheel'}
  campaign={campaignData}
  wheelModalConfig={wheelModalConfig}
  gameModalConfig={wheelModalConfig}
  currentStep={currentStep}
  editable={false}
  formFields={(campaignState as any)?.formFields}
  onCTAClick={handleCTAClick}
  onFormSubmit={handleFormSubmit}
  onGameComplete={handleGameComplete}
  onStepChange={setCurrentStep}
  containerClassName="p-0"
  containerStyle={{ backgroundColor: 'transparent' }}
/>
```

**Après :**
```tsx
import PreviewRenderer from '@/components/preview/PreviewRenderer';

// ...

<PreviewRenderer
  campaign={campaignData}
  device={selectedDevice}
  currentScreen={currentScreen}
/>
```

### 3. Simplification de DesignEditor.tsx

**Avant :**
```tsx
import ArticleEditorDetector from '../components/ArticleEditor/ArticleEditorDetector';

const DesignEditor: React.FC = () => {
  return (
    <ArticleEditorDetector
      campaignType="wheel"
      fullscreenLayout={<DesignEditorLayout />}
    />
  );
};
```

**Après :**
```tsx
const DesignEditor: React.FC = () => {
  return <DesignEditorLayout />;
};
```

## ⚠️ Actions Restantes

Les fichiers suivants contiennent encore des usages de `<ArticleCanvas />` qui doivent être remplacés manuellement par `<PreviewRenderer />` :

1. **JackpotEditor/JackpotEditorLayout.tsx** (2 occurrences)
2. **ScratchCardEditor/ScratchCardEditorLayout.tsx** (2 occurrences)
3. **ProEditor/ProEditorLayout.tsx** (2 occurrences)
4. **Tous les DesignCanvas.tsx** (multiples occurrences)

### Exemple de Remplacement

**Avant :**
```tsx
<ArticleCanvas
  articleConfig={(campaignState as any)?.articleConfig || {}}
  onBannerChange={() => {}}
  onBannerRemove={() => {}}
  onTitleChange={() => {}}
  onDescriptionChange={() => {}}
  onCTAClick={handleCTAClick}
  onFormSubmit={handleFormSubmit}
  onGameComplete={handleGameComplete}
  onStepChange={setCurrentStep}
/>
```

**Après :**
```tsx
<PreviewRenderer
  campaign={campaignData}
  device={selectedDevice}
  currentScreen={currentScreen}
/>
```

## 📝 Scripts Créés

1. **fix-article-imports.sh** - Supprime les imports ArticleFunnelView et ArticleEditorDetector
2. **fix-article-canvas.sh** - Supprime les imports ArticleCanvas et DEFAULT_ARTICLE_CONFIG

## ✅ Résultat

- ✅ Tous les imports supprimés
- ✅ DesignEditorLayout.tsx corrigé
- ✅ DesignEditor.tsx simplifié
- ⚠️ Quelques usages de `<ArticleCanvas />` restent à remplacer manuellement

## 🚀 Prochaines Étapes

1. Remplacer manuellement les `<ArticleCanvas />` restants par `<PreviewRenderer />`
2. Tester le build : `npm run build`
3. Tester l'application en dev : `npm run dev`
4. Vérifier que le mode article fonctionne correctement
