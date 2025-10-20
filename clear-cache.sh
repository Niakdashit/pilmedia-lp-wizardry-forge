#!/bin/bash

echo "🧹 Nettoyage complet du cache..."

# 1. Supprimer le cache Vite
echo "📦 Suppression du cache Vite..."
rm -rf node_modules/.vite
rm -rf .vite

# 2. Supprimer le cache TypeScript
echo "📦 Suppression du cache TypeScript..."
rm -rf tsconfig.tsbuildinfo
rm -rf tsconfig.app.tsbuildinfo
rm -rf tsconfig.node.tsbuildinfo

# 3. Supprimer dist
echo "📦 Suppression de dist..."
rm -rf dist

echo "✅ Cache nettoyé !"
echo ""
echo "🚀 Redémarrez maintenant le serveur avec:"
echo "   npm run dev"
echo ""
echo "🌐 Puis dans Chrome:"
echo "   1. Ouvrir DevTools (Cmd+Option+I)"
echo "   2. Clic droit sur le bouton de rechargement"
echo "   3. 'Vider le cache et effectuer une actualisation forcée'"
echo ""
echo "   OU utilisez Cmd+Shift+R (hard refresh)"
