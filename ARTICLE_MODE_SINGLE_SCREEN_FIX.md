# ✅ Mode Article - Fix 1 Seul Écran

## 🐛 Problème Identifié

En mode Article, **3 ArticleCanvas** s'affichaient (un par écran: screen1, screen2, screen3) au lieu d'un seul.

**Cause**: Les éditeurs ont 3 écrans pour le mode fullscreen (Article + Jeu + Résultat), mais en mode Article on n'a besoin que d'**un seul écran**.

## ✅ Solution Appliquée

J'ai enveloppé les screen2 et screen3 dans une condition `{editorMode === 'fullscreen' && (...)}` pour ne les afficher qu'en mode fullscreen.

### Modifications

Pour chaque éditeur:

```tsx
// AVANT
<div className="min-h-full flex flex-col">
  {/* Premier Canvas - Screen 1 */}
  <DesignCanvas screenId="screen1" ... />
  
  {/* Deuxième Canvas - Screen 2 */}
  <DesignCanvas screenId="screen2" ... />
  
  {/* Troisième Canvas - Screen 3 */}
  <DesignCanvas screenId="screen3" ... />
</div>

// APRÈS
<div className="min-h-full flex flex-col">
  {/* Premier Canvas - Screen 1 - TOUJOURS AFFICHÉ */}
  <DesignCanvas screenId="screen1" ... />
  
  {/* Deuxième Canvas - Screen 2 - SEULEMENT EN FULLSCREEN */}
  {editorMode === 'fullscreen' && (
    <DesignCanvas screenId="screen2" ... />
  )}
  
  {/* Troisième Canvas - Screen 3 - SEULEMENT EN FULLSCREEN */}
  {editorMode === 'fullscreen' && (
    <DesignCanvas screenId="screen3" ... />
  )}
</div>
```

## 📝 Fichiers Modifiés

### 1. DesignEditor ✅
**Fichier**: `/src/components/DesignEditor/DesignEditorLayout.tsx`

**Lignes modifiées**:
- Ligne ~2131: Ajout `{editorMode === 'fullscreen' && (` avant screen2
- Ligne ~2244: Ajout `)}` après screen2
- Ligne ~2247: Ajout `{editorMode === 'fullscreen' && (` avant screen3
- Ligne ~2369: Ajout `)}` après screen3

### 2. QuizEditor ✅
**Fichier**: `/src/components/QuizEditor/DesignEditorLayout.tsx`

**Lignes modifiées**:
- Ligne ~3027: Ajout `{editorMode === 'fullscreen' && (` avant screen2
- Ligne ~3133: Ajout `)}` après screen2
- Ligne ~3136: Ajout `{editorMode === 'fullscreen' && (` avant screen3
- Ligne ~3250: Ajout `)}` après screen3

### 3. JackpotEditor ⏳
**Fichier**: `/src/components/JackpotEditor/JackpotEditorLayout.tsx`
- À faire (même pattern)

### 4. ScratchCardEditor ⏳
**Fichier**: `/src/components/ScratchCardEditor/ScratchCardEditorLayout.tsx`
- À faire (même pattern)

### 5. FormEditor ⏳
**Fichier**: `/src/components/FormEditor/DesignEditorLayout.tsx`
- À faire (même pattern, mais seulement 2 écrans)

## 🎯 Résultat Attendu

### Mode Article (`?mode=article`)
```
┌──────────────────────────────────────────┐
│  [Logo]  [Toolbar Desktop/Tablet/Mobile] │
├───────┬──────────────────────────────────┤
│Banner │                                  │
│Text   │      1 SEUL ArticleCanvas        │
│Button │      (810×1200px)                │
│Funnel │                                  │
└───────┴──────────────────────────────────┘
```

### Mode Fullscreen (par défaut)
```
┌──────────────────────────────────────────┐
│  [Logo]  [Toolbar Desktop/Tablet/Mobile] │
├───────┬──────────────────────────────────┤
│Design │  Screen 1 (Article)              │
│Élém.  │  ↓                                │
│Form   │  Screen 2 (Jeu)                  │
│Jeu    │  ↓                                │
│Sortie │  Screen 3 (Résultat)             │
└───────┴──────────────────────────────────┘
```

## 🧪 Tests

### URLs de Test

```bash
# DesignEditor
http://localhost:8080/design-editor?mode=article   # ← 1 seul écran
http://localhost:8080/design-editor                # ← 3 écrans

# QuizEditor
http://localhost:8080/quiz-editor?mode=article     # ← 1 seul écran
http://localhost:8080/quiz-editor                  # ← 3 écrans
```

### Checklist

#### Mode Article
- [ ] **1 seul ArticleCanvas** affiché
- [ ] **Pas de scroll vertical** (sauf si contenu dépasse)
- [ ] **Pas de screen2 ou screen3** visibles
- [ ] **ArticleCanvas centré** (810×1200px)

#### Mode Fullscreen
- [ ] **3 écrans affichés** (screen1, screen2, screen3)
- [ ] **Scroll vertical** entre les écrans
- [ ] **Navigation** entre écrans fonctionne
- [ ] **Aucune régression**

## ⚠️ Points Importants

1. **Screen1 toujours affiché**
   - En mode Article: Affiche ArticleCanvas
   - En mode Fullscreen: Affiche le canvas normal

2. **Screen2 et Screen3 conditionnels**
   - Seulement en mode Fullscreen
   - Masqués en mode Article

3. **Pas de régression**
   - Mode fullscreen fonctionne exactement comme avant
   - Les 3 écrans sont toujours là en fullscreen

4. **Performance**
   - Pas de rendu inutile en mode Article
   - Moins de composants à gérer

## 📊 Impact

### Avant (❌)
- **Mode Article**: 3 ArticleCanvas affichés
- **Scroll**: Beaucoup de scroll vertical
- **UX**: Confus, répétitif

### Après (✅)
- **Mode Article**: 1 seul ArticleCanvas
- **Scroll**: Minimal (juste le contenu)
- **UX**: Clair, épuré

## 🚀 Prochaines Étapes

Appliquer le même fix aux 3 éditeurs restants:
1. JackpotEditor
2. ScratchCardEditor
3. FormEditor (seulement 2 écrans)

**Pattern à suivre**:
```tsx
{/* Screen 2 */}
{editorMode === 'fullscreen' && (
  <DesignCanvas screenId="screen2" ... />
)}

{/* Screen 3 */}
{editorMode === 'fullscreen' && (
  <DesignCanvas screenId="screen3" ... />
)}
```

---

**Status**: DesignEditor et QuizEditor fixés ✅
**Temps**: ~10 minutes
**Lignes modifiées**: ~8 lignes par éditeur
