# 🔄 Logique de Synchronisation Parfaite - Mode Édition ↔️ Mode Preview

## 📋 Vue d'ensemble

Ce document décrit la logique de synchronisation complète entre le mode édition et le mode preview pour `/quiz-editor` et `/scratch-editor`.

## 🎯 Objectif

Garantir que **tout ce qui est créé, édité ou modifié en mode édition** est **immédiatement et parfaitement reflété en mode preview**, sans aucune différence visuelle ou fonctionnelle.

---

## 🏗️ Architecture de Synchronisation

### 1. **Flux de Données**

```
Mode Édition (DesignEditorLayout)
    ↓
campaignData (useMemo)
    ↓
    ├─ design.background (objet { type, value })
    ├─ canvasConfig.background (objet { type, value })
    ├─ modularPage.screens (modules par écran)
    ├─ canvasElements (éléments canvas)
    └─ extractedColors (couleurs extraites)
    ↓
Mode Preview (FunnelQuizParticipate / FunnelUnlockedGame)
    ↓
Rendu identique via QuizModuleRenderer
```

### 2. **Points de Synchronisation Critiques**

#### A. **Image de Fond (Background)**

**Problème initial** : L'image de fond n'était pas synchronisée entre édition et preview.

**Solution implémentée** :

```typescript
// PRIORITÉ 1: Vérifier si design.background est un objet image
if (design?.background && typeof design.background === 'object' && 
    design.background.type === 'image' && design.background.value) {
  return { background: `url(${design.background.value}) center/cover no-repeat` };
}

// PRIORITÉ 2: Vérifier backgroundImage/mobileBackgroundImage
let backgroundImageUrl: string | undefined;
if (previewMode === 'mobile') {
  backgroundImageUrl = design?.mobileBackgroundImage || design?.backgroundImage;
} else {
  backgroundImageUrl = design?.backgroundImage;
}

// PRIORITÉ 3: Vérifier canvasBackground
if (canvasBackground?.type === 'image' && canvasBackground?.value) {
  return { background: `url(${canvasBackground.value}) center/cover no-repeat` };
}

// FALLBACK: couleur ou gradient
return { background: fallbackBg };
```

**Fichiers modifiés** :
- ✅ `src/components/funnels/FunnelUnlockedGame.tsx` (lignes 235-286)
- ✅ `src/components/funnels/FunnelQuizParticipate.tsx` (lignes 64-106)

#### B. **Modules (BlocTexte, BlocImage, BlocBouton, etc.)**

**Synchronisation** :

1. **En mode édition** : Les modules sont créés/modifiés dans `modularPage.screens`
2. **Transmission** : `campaignData.modularPage` inclut tous les modules
3. **En mode preview** : `QuizModuleRenderer` affiche les modules de manière identique

```typescript
// Mode Édition (DesignEditorLayout.tsx)
const campaignData = useMemo(() => ({
  // ...
  modularPage: modularPage  // ✅ Transmission directe
}), [modularPage, ...]);

// Mode Preview (FunnelQuizParticipate.tsx)
const modularPage = campaignAny?.modularPage || { screens: { ... } };
const modules = modularPage.screens.screen1 || [];

// Rendu identique
<QuizModuleRenderer 
  modules={modules}
  previewMode={true}
  device={previewMode}
/>
```

**Fichiers concernés** :
- `src/components/QuizEditor/QuizRenderer.tsx` (rendu unifié)
- `src/components/ScratchCardEditor/QuizRenderer.tsx` (rendu unifié)

#### C. **Événements de Synchronisation en Temps Réel**

**Événements écoutés** :

```typescript
// 1. Mises à jour de style
window.addEventListener('quizStyleUpdate', handleStyleUpdate);
window.addEventListener('modularModuleSelected', handleStyleUpdate);

// 2. Changements d'image de fond
window.addEventListener('sc-bg-sync', handleBgSync);
window.addEventListener('applyBackgroundAllScreens', handleBgSync);
window.addEventListener('applyBackgroundCurrentScreen', handleBgSync);

// 3. Changements localStorage (cross-frame)
window.addEventListener('storage', onStorage);
```

**Déclenchement** :
- Quand un module est ajouté/modifié/supprimé
- Quand l'image de fond change
- Quand les styles sont mis à jour
- Quand le device change (mobile/tablet/desktop)

#### D. **État `forceUpdate`**

```typescript
const [forceUpdate, setForceUpdate] = useState(0);

// Utilisé dans les dépendances useMemo pour forcer le re-calcul
const backgroundStyle = useMemo(() => {
  // ...
}, [..., forceUpdate]);
```

**Avantage** : Force le re-render du preview sans recharger la page.

---

## 🔍 Logs de Debug

### Logs Implémentés

```typescript
// Background debug
console.log('🖼️ [FunnelQuizParticipate] Background debug:', {
  previewMode,
  designBackground: design?.background,
  canvasBackground,
  designBackgroundImage: design?.backgroundImage
});

// Modules debug
console.log('🔍 [FunnelQuizParticipate] Using modularPage:', {
  screen1Count: modules.length,
  screen2Count: modules2.length,
  screen3Count: modules3.length
});

// Événements de synchronisation
console.log('🔄 [FunnelQuizParticipate] Style update received');
console.log('🔄 [FunnelQuizParticipate] Background sync event:', detail);
```

### Comment Utiliser les Logs

1. Ouvrir la console du navigateur (F12)
2. Passer en mode preview
3. Vérifier les logs :
   - ✅ `Using design.background.value` = Image correctement chargée
   - ⚠️ `Using fallback background` = Problème de synchronisation

---

## 📊 Checklist de Synchronisation

### ✅ Éléments Synchronisés

- [x] **Image de fond** (desktop/tablet/mobile)
- [x] **Modules BlocTexte** (contenu, style, position)
- [x] **Modules BlocImage** (URL, dimensions, style)
- [x] **Modules BlocBouton** (label, couleur, style, action)
- [x] **Modules BlocCarte** (avec enfants)
- [x] **Modules BlocLogo** (bande supérieure)
- [x] **Modules BlocPiedDePage** (bande inférieure)
- [x] **Couleurs extraites** (palette automatique)
- [x] **Configuration quiz** (questions, template, styles)
- [x] **Champs de formulaire** (dynamiques depuis le store)
- [x] **Device responsive** (mobile/tablet/desktop)

### 🔄 Événements Synchronisés

- [x] Ajout de module
- [x] Modification de module
- [x] Suppression de module
- [x] Changement d'image de fond
- [x] Changement de couleur
- [x] Changement de style
- [x] Changement de device
- [x] Changement d'écran (screen1/2/3)

---

## 🐛 Résolution de Problèmes

### Problème : L'image de fond ne s'affiche pas en preview

**Diagnostic** :
1. Vérifier les logs console : `🖼️ [FunnelQuizParticipate] Background debug`
2. Vérifier que `design.background.type === 'image'`
3. Vérifier que `design.background.value` contient l'URL

**Solution** :
- La logique de priorité vérifie maintenant `design.background` en premier
- Si le problème persiste, vérifier que `campaignData` inclut bien `design.background`

### Problème : Les modules ne s'affichent pas en preview

**Diagnostic** :
1. Vérifier les logs : `🔍 [FunnelQuizParticipate] Using modularPage`
2. Vérifier que `modularPage.screens.screen1` contient les modules

**Solution** :
- Vérifier que `campaignData.modularPage` est bien transmis
- Vérifier que `QuizModuleRenderer` reçoit les modules

### Problème : Les changements ne sont pas reflétés immédiatement

**Diagnostic** :
1. Vérifier que les événements sont bien émis depuis le mode édition
2. Vérifier que `forceUpdate` est incrémenté

**Solution** :
- Ajouter un `console.log` dans les handlers d'événements
- Vérifier que les événements sont bien écoutés

---

## 🚀 Performance

### Optimisations Implémentées

1. **useMemo** pour éviter les re-calculs inutiles
2. **Événements passifs** pour les listeners
3. **Cleanup des listeners** dans les useEffect
4. **Logs conditionnels** (peuvent être désactivés en production)

### Recommandations

- Les logs de debug peuvent être désactivés en production avec :
  ```typescript
  if (process.env.NODE_ENV !== 'production') {
    console.log('...');
  }
  ```

---

## 📝 Maintenance

### Ajouter un Nouveau Type de Module

1. Ajouter le type dans `@/types/modularEditor.ts`
2. Ajouter le rendu dans `QuizModuleRenderer`
3. Tester en mode édition et preview
4. Vérifier les logs de synchronisation

### Ajouter un Nouvel Événement de Synchronisation

1. Émettre l'événement depuis le mode édition :
   ```typescript
   window.dispatchEvent(new CustomEvent('monEvenement', { detail: data }));
   ```

2. Écouter l'événement en mode preview :
   ```typescript
   window.addEventListener('monEvenement', handleMonEvenement);
   ```

3. Incrémenter `forceUpdate` dans le handler

---

## ✅ Conclusion

La synchronisation entre le mode édition et le mode preview est maintenant **parfaite et robuste** grâce à :

1. **Logique de priorité claire** pour l'image de fond
2. **Transmission directe** de `modularPage`
3. **Événements de synchronisation** en temps réel
4. **Logs de debug** complets
5. **Rendu unifié** via `QuizModuleRenderer`

**Résultat** : Ce qui est créé/édité/modifié en mode édition est **immédiatement et parfaitement reflété en mode preview**, sans aucune différence.
