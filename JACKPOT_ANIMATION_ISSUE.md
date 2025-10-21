# 🎰 Problème d'Animation du Jackpot

## 🐛 Symptôme
L'animation des rouleaux du jackpot **s'arrête brutalement** au lieu de ralentir progressivement avant de s'arrêter.

## 🔍 Diagnostic (via Playwright)

### Test Automatisé
```
📊 Changements visuels (nombre de rouleaux visibles):
[
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,  ← Animation en cours
  3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0,  ← COUPURE BRUTALE !
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
]
❌ Coupure brutale détectée: true
```

### Logs Console
```
🎯 Rouleau 0 terminé à 1761042576242
✅ completedReels mis à jour: [true, false, false]
🎯 Rouleau 1 terminé à 1761042576842
✅ completedReels mis à jour: [true, true, false]
🎰 Animation complete, setting isSpinning to false  ← ICI !
🎯 Rouleau 2 terminé à 1761042577445  ← APRÈS que isSpinning soit false
```

## 🎯 Cause Racine

### Problème 1 : Timing Incorrect
- `isSpinning` devient `false` **avant** que tous les rouleaux ne terminent
- Timeout: `Math.max(...durations) + 200` = `3200ms`
- Rouleau 2 termine à `3000ms` + temps d'animation = **après** le timeout

### Problème 2 : Rendu Basé sur `completedReels`
```tsx
{!completedReels[reelIdx] ? (
  // Animation
) : (
  // Rendu statique  ← Passage BRUTAL
)}
```

Dès que `completedReels[idx]` devient `true`, le rendu passe **immédiatement** au statique, créant un arrêt brutal.

## ✅ Solution Requise

L'animation doit :
1. **Ralentir progressivement** grâce à l'easing function
2. **Continuer à animer** jusqu'à ce que l'offset soit exactement à 0
3. **Passer au rendu statique** seulement après l'arrêt complet

### Approche Recommandée
- Utiliser `completedReels` uniquement pour **arrêter `requestAnimationFrame`**
- Le rendu doit vérifier si `reelOffsets[idx] === 0` pour passer au statique
- OU ajouter une transition CSS pour adoucir le passage

## 📊 Tests
- ✅ Test Playwright créé : `test-jackpot-animation.spec.ts`
- ✅ Vidéo capturée : `test-results/.../video.webm`
- ✅ Screenshot : `jackpot-animation-test.png`

## 🔧 Fichiers Concernés
- `src/components/SlotJackpot/SlotMachine.tsx` (lignes 453-508)
- `test-jackpot-animation.spec.ts`
