# 🚀 Quick Start - Audit WYSIWYG

## Installation Rapide

```bash
# Installer Playwright (une seule fois)
npm install -D @playwright/test
npx playwright install chromium
```

## Lancer l'Audit

### Terminal 1 : Serveur de Dev
```bash
npm run dev
```

### Terminal 2 : Audit
```bash
# Option 1 : Script automatique (recommandé)
./scripts/run-audit.sh

# Option 2 : Commande npm
npm run test:audit

# Option 3 : Mode visible (voir le navigateur)
npm run test:audit:headed

# Option 4 : Mode debug (pas à pas)
npm run test:audit:debug
```

## Voir les Résultats

```bash
# Ouvrir le rapport HTML
npm run test:audit:report
```

## Ce que l'Audit Fait

Pour **design-editor**, **jackpot-editor** et **scratch-editor** :

1. ✅ Charge l'éditeur
2. ✅ Sélectionne le device (mobile/tablet/desktop)
3. ✅ Ajoute 2-3 modules aléatoires
4. ✅ Passe en mode preview
5. ✅ Capture screenshot + métriques
6. ✅ Compare avec design-editor (référence)

## Résultats

### ✅ Succès
```
✅ Aucune différence détectée - WYSIWYG parfait!
```

### ⚠️ Différences Détectées
```
⚠️ 3 différence(s) détectée(s):
   ⚠️ Largeur canvas: 432px vs 430px (diff: 2px)
   ⚠️ Élément 0: Position (105, 52) vs (100, 50)
```

## Fichiers Générés

```
test-results/
├── audit-preview/
│   ├── design-editor-mobile.png      ← Screenshot référence
│   ├── jackpot-editor-mobile.png     ← Screenshot à comparer
│   ├── scratch-editor-mobile.png     ← Screenshot à comparer
│   ├── report-mobile.json            ← Métriques détaillées
│   └── ...
└── html-report/
    └── index.html                     ← Rapport visuel
```

## Dépannage

### Erreur : "Le serveur n'est pas démarré"
```bash
# Lancer le serveur dans un autre terminal
npm run dev
```

### Erreur : "Playwright not found"
```bash
npm install -D @playwright/test
npx playwright install chromium
```

### Tests trop lents
```bash
# Tester un seul device
npm run test:audit -- -g "mobile"
```

## Documentation Complète

Voir **AUDIT_WYSIWYG_README.md** pour :
- Configuration avancée
- Interprétation des résultats
- Exemples de problèmes
- CI/CD integration

---

**Temps estimé** : 2-3 minutes par device  
**Total** : ~10 minutes pour l'audit complet
