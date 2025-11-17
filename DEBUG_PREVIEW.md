# 🔍 Guide de Debug : Preview Vide

## 📋 Étapes de Diagnostic

### 1. Ouvrir la Console du Navigateur
- Appuyez sur **F12** (ou Cmd+Option+I sur Mac)
- Allez dans l'onglet **Console**

### 2. Chercher les Logs Clés

Cherchez ces logs dans la console :

#### A. Logs de Modules
```
📦 [FunnelQuizParticipate] Modules loaded: {
  screen1: X,  // ← Combien de modules ?
  screen2: 0,
  screen3: 0,
  source: "..."
}
```

**Question** : Combien de modules dans `screen1` ?
- Si `screen1: 0` → Les modules ne sont PAS sauvegardés
- Si `screen1: 2` → Les modules SONT sauvegardés mais pas affichés

#### B. Logs de Fond
```
🖼️ [FunnelQuizParticipate] Background debug: {
  previewMode: "desktop",
  screen1Background: {...}  // ← Est-ce défini ?
}
```

**Question** : `screen1Background` est-il défini ?
- Si `undefined` → Le fond n'est PAS sauvegardé
- Si `{ type: "gradient", value: "..." }` → Le fond EST sauvegardé mais pas affiché

#### C. Logs de Rendu
```
🎯 [FunnelQuizParticipate] Rendering screen1 - modules: X
```

**Question** : Combien de modules rendus ?

### 3. Vérifier la Campagne dans le Store

Dans la console, tapez :
```javascript
// Récupérer la campagne du store Zustand
const store = window.__ZUSTAND_STORE__;
console.log('Campaign:', JSON.stringify(store?.campaign, null, 2));
```

Cherchez dans le résultat :
- `modularPage.screens.screen1` → Contient-il vos modules ?
- `config.canvasConfig.screenBackgrounds.screen1` → Contient-il votre fond ?

### 4. Forcer la Synchronisation

Si les données sont dans le store mais pas affichées, forcez la synchronisation :

```javascript
// Forcer un re-render du preview
window.dispatchEvent(new CustomEvent('sc-modular-sync', { 
  detail: { 
    modularPage: store?.campaign?.modularPage,
    timestamp: Date.now() 
  } 
}));

window.dispatchEvent(new CustomEvent('sc-bg-sync', { 
  detail: { timestamp: Date.now() } 
}));
```

## 🐛 Scénarios Possibles

### Scénario 1 : Modules Non Sauvegardés
**Symptôme** : `screen1: 0` dans les logs

**Cause** : `persistModular` ne synchronise pas correctement

**Solution** : Vérifier que `syncModularPage` est bien appelé

### Scénario 2 : Modules Sauvegardés Mais Non Affichés
**Symptôme** : `screen1: 2` dans les logs mais rien à l'écran

**Cause** : `QuizModuleRenderer` ne rend pas les modules

**Solution** : Vérifier le rendu des modules

### Scénario 3 : Fond Non Sauvegardé
**Symptôme** : `screen1Background: undefined` dans les logs

**Cause** : `screenBackgrounds` non synchronisé

**Solution** : Vérifier la synchronisation des backgrounds

### Scénario 4 : Fond Sauvegardé Mais Non Affiché
**Symptôme** : `screen1Background: { type: "gradient", ... }` mais fond blanc

**Cause** : Style CSS non appliqué

**Solution** : Vérifier `backgroundStyle` dans le DOM

## 🔧 Actions Immédiates

### Action 1 : Vérifier les Logs Console
1. Ouvrez F12
2. Allez dans Console
3. Cherchez `[FunnelQuizParticipate]`
4. Copiez TOUS les logs et envoyez-les moi

### Action 2 : Vérifier le DOM
1. Ouvrez F12
2. Allez dans Elements (Inspecteur)
3. Cherchez l'élément avec `class="absolute inset-0"`
4. Vérifiez son attribut `style` → Contient-il un `background` ?

### Action 3 : Vérifier le Network
1. Ouvrez F12
2. Allez dans Network
3. Rafraîchissez la page
4. Cherchez les requêtes vers `/api/campaigns/...`
5. Vérifiez la réponse → Contient-elle `modularPage` et `screenBackgrounds` ?

## 📸 Ce Que Je Dois Voir

Pour vous aider, j'ai besoin de :

1. **Screenshot de la console** avec les logs `[FunnelQuizParticipate]`
2. **Screenshot de l'inspecteur** montrant l'élément avec le fond
3. **Copie des logs** dans un message texte

## 🚨 Si Rien Ne Fonctionne

Il y a peut-être un problème avec le serveur de dev. Essayez :

```bash
# Arrêter le serveur (Ctrl+C)
# Vider le cache de build
rm -rf node_modules/.vite
# Redémarrer
npm run dev
```

---

**Prochaine étape** : Envoyez-moi les logs de la console et je pourrai identifier le problème exact.

## Bug connu : modules quiz décalés entre Éditeur et Aperçu

### Symptôme
- Bouton `Participer` (ou autres modules quiz) en **mode libre (absolute)** n’a pas la même position verticale entre :
  - l’écran d’édition (`DesignCanvas` + `ModularCanvas`)
  - la modale / plein écran de preview (`PreviewRenderer`)
- Le problème apparaît sur **tous les écrans (screen1/screen2)** et **tous les devices**.

### Cause
- Dans l’éditeur, les modules absolus sont positionnés dans `ModularCanvas` avec :
  - origine verticale `top: 0` puis application de `y`.
- Dans `PreviewRenderer`, les overlays absolus utilisaient :
  - `top: safeZonePadding` + `transform: translate(-50%, y)`.
- Résultat : un **offset vertical fixe** (= `safeZonePadding`) était ajouté par la preview.

### Fichiers impliqués
- `src/components/QuizEditor/DesignCanvas.tsx`
  - Référence : conteneur des modules quiz (`ModularCanvas`) avec `safeZonePadding`.
- `src/components/QuizEditor/modules/ModularCanvas.tsx`
  - Référence : logique de positionnement des modules (y depuis `top: 0`).
- `src/components/preview/PreviewRenderer.tsx`
  - **Point de correction** pour le mirroring.

### Solution
1. **Séparer les modules de screen2 comme dans l’éditeur** :
   - `logoModules2` : `BlocLogo`
   - `footerModules2` : `BlocPiedDePage`
   - `absoluteModules2` : modules avec `absolute === true` (hors logo/footer)
   - `modules2` : modules réguliers (non absolus)

2. **Rendre les modules réguliers en arrière-plan** derrière le jeu :
   - Overlay `absolute inset-0` centré avec `max-w-[1500px]` (comme le canvas).

3. **Corriger l’origine des modules absolus (screen1 & screen2)** dans `PreviewRenderer.tsx` :
   - `top` passé de `top: safeZonePadding` à **`top: 0`**.
   - Conserver : `left: '50%'` + `transform: translate(-50%, y)`.

### Résultat attendu
- La position des modules quiz (dont le bouton `Participer` en mode libre) est **pixel-perfect** entre :
  - le canvas d’édition (`DesignCanvas` / `ModularCanvas`)
  - la preview (`PreviewRenderer`, écran 1 et 2, desktop & mobile).
