# 🔍 Audit WYSIWYG - Comparaison Preview Éditeurs

## Objectif

Cet audit Playwright compare automatiquement les modes preview des éditeurs pour détecter les différences visuelles et fonctionnelles par rapport à **design-editor** (référence validée).

## Éditeurs Audités

- ✅ **design-editor** (Référence validée)
- 🔍 **jackpot-editor** (À comparer)
- 🔍 **scratch-editor** (À comparer)

## Devices Testés

- 📱 **Mobile** (430×932px - iPhone 14 Pro Max)
- 📱 **Tablet** (820×1180px)
- 🖥️ **Desktop** (1700×850px)

## Scénario de Test

Pour chaque éditeur et chaque device :

1. **Chargement** de l'éditeur
2. **Sélection** du device (mobile/tablet/desktop)
3. **Ajout** de 2-3 modules aléatoires (texte, image, bouton)
4. **Passage** en mode preview
5. **Capture** de screenshot + métriques
6. **Comparaison** avec design-editor (référence)

## Métriques Comparées

### Dimensions Canvas
- Largeur et hauteur du canvas
- Tolérance : ±5px

### Éléments
- Nombre d'éléments
- Positions (x, y) - Tolérance : ±10px
- Tailles (width, height)
- Styles (fontSize, color, backgroundColor)

### Visuel
- Screenshots complets
- Comparaison pixel par pixel (optionnel)

## Installation

```bash
# Installer Playwright
npm install -D @playwright/test

# Installer les navigateurs
npx playwright install chromium
```

## Lancement de l'Audit

### Méthode 1 : Script Automatique (Recommandé)

```bash
# 1. Démarrer le serveur de dev dans un terminal
npm run dev

# 2. Dans un autre terminal, lancer l'audit
./scripts/run-audit.sh
```

### Méthode 2 : Commande Manuelle

```bash
# Lancer tous les tests
npx playwright test tests/audit-preview-wysiwyg.spec.ts

# Lancer un device spécifique
npx playwright test tests/audit-preview-wysiwyg.spec.ts -g "mobile"

# Mode debug
npx playwright test tests/audit-preview-wysiwyg.spec.ts --debug

# Mode headed (voir le navigateur)
npx playwright test tests/audit-preview-wysiwyg.spec.ts --headed
```

## Résultats

### Structure des Résultats

```
test-results/
├── audit-preview/
│   ├── design-editor-mobile.png
│   ├── design-editor-tablet.png
│   ├── design-editor-desktop.png
│   ├── jackpot-editor-mobile.png
│   ├── jackpot-editor-tablet.png
│   ├── jackpot-editor-desktop.png
│   ├── scratch-editor-mobile.png
│   ├── scratch-editor-tablet.png
│   ├── scratch-editor-desktop.png
│   ├── report-mobile.json
│   ├── report-tablet.json
│   └── report-desktop.json
├── html-report/
│   └── index.html
└── results.json
```

### Consulter le Rapport HTML

```bash
npx playwright show-report test-results/html-report
```

Le rapport HTML s'ouvre automatiquement dans le navigateur avec :
- ✅ Tests réussis / ❌ Tests échoués
- 📸 Screenshots de chaque éditeur
- 📊 Métriques détaillées
- ⚠️ Différences détectées

### Rapport JSON

Les fichiers `report-{device}.json` contiennent :

```json
{
  "device": "mobile",
  "results": [
    {
      "editor": "design-editor",
      "device": "mobile",
      "screenshotPath": "...",
      "metrics": {
        "canvasWidth": 430,
        "canvasHeight": 932,
        "backgroundColor": "rgb(44, 44, 53)",
        "elementsCount": 3,
        "elements": [...]
      }
    },
    ...
  ],
  "reference": { ... }
}
```

## Interprétation des Résultats

### ✅ WYSIWYG Parfait

```
✅ Aucune différence détectée - WYSIWYG parfait!
```

Aucune différence entre l'éditeur testé et design-editor.

### ⚠️ Différences Mineures (Acceptables)

```
⚠️ 2 différence(s) détectée(s):
   ⚠️ Largeur canvas: 432px vs 430px (diff: 2px)
   ⚠️ Élément 0: Position (105, 52) vs (100, 50) - diff: (5px, 2px)
```

Différences < 10px → Probablement dues aux arrondis ou animations.

### ❌ Différences Majeures (À Corriger)

```
⚠️ 5 différence(s) détectée(s):
   ⚠️ Largeur canvas: 360px vs 430px (diff: 70px)
   ⚠️ Hauteur canvas: 640px vs 932px (diff: 292px)
   ⚠️ Nombre d'éléments: 2 vs 3
   ⚠️ Élément 0: Position (50, 100) vs (100, 200) - diff: (50px, 100px)
```

Différences majeures → Problème de WYSIWYG à corriger.

## Exemples de Problèmes Détectés

### 1. Dimensions Canvas Incorrectes

**Symptôme** :
```
⚠️ Largeur canvas: 360px vs 430px (diff: 70px)
```

**Cause** : Dimensions non standard dans `CanvasGameRenderer`

**Solution** : Utiliser `STANDARD_DEVICE_DIMENSIONS`

### 2. Positions Décalées

**Symptôme** :
```
⚠️ Élément 0: Position (50, 100) vs (100, 200) - diff: (50px, 100px)
```

**Cause** : Calculs de position différents entre édition et preview

**Solution** : Harmoniser les calculs de position

### 3. Éléments Manquants

**Symptôme** :
```
⚠️ Nombre d'éléments: 2 vs 3
```

**Cause** : Synchronisation incomplète entre édition et preview

**Solution** : Vérifier `useEditorPreviewSync`

## Tests Inclus

### 1. Audit Preview (Principal)

Compare les 3 éditeurs sur les 3 devices :
- Ajoute des modules aléatoires
- Capture screenshots + métriques
- Compare avec design-editor

### 2. Régression Visuelle

Compare pixel par pixel les screenshots générés.

### 3. Vérification Dimensions Standard

Vérifie que chaque éditeur utilise les dimensions standard :
- Desktop : 1700×850px
- Tablet : 820×1180px
- Mobile : 430×932px

## Configuration

### Modifier les Éditeurs Testés

Éditer `tests/audit-preview-wysiwyg.spec.ts` :

```typescript
const EDITORS = [
  { name: 'design-editor', url: 'http://localhost:8080/design-editor', isReference: true },
  { name: 'quiz-editor', url: 'http://localhost:8080/quiz-editor', isReference: false },
  // Ajouter d'autres éditeurs...
];
```

### Modifier les Devices

```typescript
const DEVICES = ['mobile', 'tablet', 'desktop'];
```

### Modifier les Modules Ajoutés

```typescript
const MODULES_TO_ADD = [
  { type: 'text', label: 'Texte' },
  { type: 'image', label: 'Image' },
  { type: 'button', label: 'Bouton' }
];
```

## Dépannage

### Le serveur n'est pas démarré

```bash
# Terminal 1
npm run dev

# Terminal 2
./scripts/run-audit.sh
```

### Playwright n'est pas installé

```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Les tests échouent avec timeout

Augmenter le timeout dans `playwright.config.ts` :

```typescript
timeout: 180000, // 3 minutes
```

### Les sélecteurs ne fonctionnent pas

Les sélecteurs sont adaptés aux éditeurs actuels. Si la structure HTML change, mettre à jour les sélecteurs dans `audit-preview-wysiwyg.spec.ts`.

## CI/CD Integration

Pour intégrer l'audit dans un pipeline CI/CD :

```yaml
# .github/workflows/audit-wysiwyg.yml
name: Audit WYSIWYG

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install chromium
      - run: npm run dev &
      - run: npx playwright test tests/audit-preview-wysiwyg.spec.ts
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: audit-results
          path: test-results/
```

## Maintenance

### Mettre à Jour la Référence

Si design-editor évolue et devient la nouvelle référence :

1. Lancer l'audit
2. Vérifier que design-editor est toujours conforme
3. Les nouveaux tests utiliseront automatiquement la nouvelle référence

### Ajouter de Nouveaux Tests

Créer un nouveau fichier dans `tests/` :

```typescript
// tests/audit-custom.spec.ts
import { test, expect } from '@playwright/test';

test('Mon test personnalisé', async ({ page }) => {
  // ...
});
```

## Support

Pour toute question ou problème :
1. Consulter les logs dans la console
2. Vérifier les screenshots dans `test-results/audit-preview/`
3. Consulter le rapport HTML
4. Vérifier les fichiers JSON de rapport

---

**Dernière mise à jour** : 20 Octobre 2025  
**Version** : 1.0.0
