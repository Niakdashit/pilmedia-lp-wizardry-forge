#!/bin/bash

# Script pour lancer l'audit WYSIWYG avec Playwright

echo "🔍 AUDIT WYSIWYG - Comparaison Preview Éditeurs"
echo "================================================"
echo ""

# Vérifier que le serveur de dev tourne
echo "📡 Vérification du serveur de développement..."
if ! curl -s http://localhost:8080 > /dev/null; then
    echo "❌ Le serveur de développement n'est pas démarré"
    echo "💡 Lancez 'npm run dev' dans un autre terminal"
    exit 1
fi

echo "✅ Serveur de développement actif"
echo ""

# Installer Playwright si nécessaire
if [ ! -d "node_modules/@playwright" ]; then
    echo "📦 Installation de Playwright..."
    npm install -D @playwright/test
    npx playwright install chromium
fi

# Créer le dossier de résultats
mkdir -p test-results/audit-preview

# Lancer les tests
echo "🚀 Lancement de l'audit..."
echo ""

npx playwright test tests/audit-preview-wysiwyg.spec.ts --reporter=list,html

# Afficher le résumé
echo ""
echo "================================================"
echo "✅ Audit terminé!"
echo ""
echo "📊 Résultats disponibles dans:"
echo "   - test-results/audit-preview/ (screenshots)"
echo "   - test-results/html-report/ (rapport HTML)"
echo ""
echo "💡 Pour voir le rapport HTML:"
echo "   npx playwright show-report test-results/html-report"
echo ""
