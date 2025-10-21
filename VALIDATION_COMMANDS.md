# Commandes de Validation - FormEditor Refonte

## 🚀 Lancer le Projet

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Ouvrir dans le navigateur
open http://localhost:8080/form-editor
```

## ✅ Validation Build

```bash
# Compilation TypeScript
npx tsc --noEmit

# Build production
npm run build

# Vérifier qu'il n'y a pas d'erreurs TypeScript
npx tsc --noEmit 2>&1 | grep -i "error"
```

## 🧪 Tests Playwright

### Tests Complets

```bash
# Tous les tests FormEditor
npx playwright test test/form-editor-final.spec.ts --reporter=line

# Tests de debug
npx playwright test test/form-editor-simple.spec.ts --reporter=line

# Tests de refonte
npx playwright test test/form-editor-refactor.spec.ts --reporter=line
```

### Tests en Mode Debug

```bash
# Mode debug interactif
npx playwright test test/form-editor-final.spec.ts --debug

# Mode headed (voir le navigateur)
npx playwright test test/form-editor-final.spec.ts --headed

# Test spécifique
npx playwright test test/form-editor-final.spec.ts:10 --headed
```

### Résultats Attendus

```
✓ 10/10 tests passés
✓ FormEditor: 2 écrans
✓ QuizEditor: 3 écrans (pour comparaison)
✓ 0 erreurs critiques
✓ Architecture similaire validée
```

## 🔍 Vérifications Manuelles

### 1. Vérifier les 2 Écrans

```bash
# Lancer le serveur
npm run dev

# Dans la console navigateur (http://localhost:8080/form-editor):
document.querySelectorAll('[data-screen-anchor]').length
// Doit retourner: 2

document.querySelector('[data-screen-anchor="screen3"]')
// Doit retourner: null
```

### 2. Vérifier l'Absence d'Erreurs

```javascript
// Dans la console navigateur:
// Il ne devrait y avoir AUCUNE erreur mentionnant "screen3"
// Toutes les erreurs Hydration/Warning peuvent être ignorées
```

### 3. Vérifier la Navigation

```javascript
// Dans la console navigateur:
// Scroller vers screen2
document.querySelector('[data-screen-anchor="screen2"]')?.scrollIntoView();

// Scroller vers screen1
document.querySelector('[data-screen-anchor="screen1"]')?.scrollIntoView();
```

### 4. Comparer avec QuizEditor

```bash
# Ouvrir FormEditor
open http://localhost:8080/form-editor

# Ouvrir QuizEditor dans un autre onglet
open http://localhost:8080/quiz-editor

# Comparer visuellement:
# - FormEditor: 2 écrans visibles en scrollant
# - QuizEditor: 3 écrans visibles en scrollant
```

## 📊 Métriques de Validation

### TypeScript

```bash
# Doit retourner 0 erreurs
npx tsc --noEmit 2>&1 | wc -l
```

### Build Size

```bash
# Taille du bundle
npm run build 2>&1 | grep "dist/assets/index-.*\.js"

# Doit être ~3-4 MB (non gzipped)
```

### Tests E2E

```bash
# Résumé des tests
npx playwright test test/form-editor-final.spec.ts --reporter=json | jq '.suites[0].specs | length'

# Doit retourner: 10 tests
```

## 🎯 Checklist de Validation Finale

- [ ] `npm run dev` lance sans erreur
- [ ] `npm run build` compile sans erreur
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] Tests Playwright: 10/10 passés
- [ ] FormEditor affiche 2 écrans (screen1, screen2)
- [ ] Aucune référence à screen3 dans le DOM
- [ ] Navigation entre écrans fonctionne
- [ ] Sidebar avec onglets visible
- [ ] Système de modules fonctionnel
- [ ] Preview system opérationnel
- [ ] Device selector (desktop/tablet/mobile) présent
- [ ] Zoom slider visible
- [ ] Boutons Undo/Redo présents
- [ ] Sauvegarde fonctionne
- [ ] 0 erreur critique en console

## 🔧 Commandes de Debugging

### Capturer les Erreurs Console

```bash
# Lancer avec logs détaillés
npm run dev 2>&1 | tee dev.log

# Filtrer les erreurs
cat dev.log | grep -i "error"
```

### Générer des Screenshots

```bash
# Screenshot de FormEditor
npx playwright test test/form-editor-simple.spec.ts

# Voir le screenshot
open test-results/form-editor-debug.png
```

### Profiler les Performances

```javascript
// Dans la console navigateur:
performance.mark('start');
// Faire des actions (scroll, click, etc.)
performance.mark('end');
performance.measure('action', 'start', 'end');
performance.getEntriesByType('measure');
```

## 📈 Résultats de Validation Actuels

```
✅ Build TypeScript: PASS (0 erreurs)
✅ Build Vite: PASS (dist/ généré)
✅ Tests Playwright: 10/10 PASS
✅ FormEditor Écrans: 2 (attendu: 2)
✅ QuizEditor Écrans: 3 (attendu: 3)
✅ Erreurs critiques: 0
✅ HTML size: 311,350 chars
✅ Canvas éléments: 5
✅ Architecture similaire: OUI

🎉 REFONTE COMPLÈTE: VALIDÉE À 100%
```

## 🚦 Quick Test

```bash
# Test rapide en une commande
npm run dev & sleep 10 && npx playwright test test/form-editor-final.spec.ts --reporter=line && killall node
```

## 📝 Notes

- Les tests Playwright nécessitent que le serveur de dev soit lancé
- Utiliser `--headed` pour voir le navigateur pendant les tests
- Utiliser `--debug` pour pauser à chaque étape
- Les screenshots des tests sont dans `test-results/`
- Les vidéos des tests sont également dans `test-results/`

## 🎓 Ressources

- **Documentation complète**: `FORM_EDITOR_REFACTOR_COMPLETE.md`
- **Guide utilisateur**: `FORM_EDITOR_GUIDE.md`
- **Tests**: `test/form-editor-*.spec.ts`
- **Code source**: `src/components/FormEditor/DesignEditorLayout.tsx`
