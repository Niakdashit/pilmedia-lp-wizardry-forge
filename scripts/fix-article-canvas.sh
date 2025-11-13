#!/bin/bash

# Script pour supprimer les imports et usages d'ArticleCanvas

echo "🔧 Suppression des imports ArticleCanvas..."

# Trouver tous les fichiers TypeScript/TSX
find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "*.backup" | while read -r file; do
  # Vérifier si le fichier contient ArticleCanvas
  if grep -q "ArticleCanvas" "$file"; then
    echo "📝 Traitement de: $file"
    
    # Supprimer la ligne d'import ArticleCanvas
    sed -i '' '/import.*ArticleCanvas.*from/d' "$file"
    
    # Supprimer aussi l'import DEFAULT_ARTICLE_CONFIG si présent
    sed -i '' '/import.*DEFAULT_ARTICLE_CONFIG.*from/d' "$file"
    
    echo "   ✅ Imports supprimés"
  fi
done

echo ""
echo "✨ Terminé !"
echo ""
echo "⚠️  Note: Les composants <ArticleCanvas /> doivent être remplacés manuellement"
echo "   par <PreviewRenderer /> dans les fichiers concernés"
