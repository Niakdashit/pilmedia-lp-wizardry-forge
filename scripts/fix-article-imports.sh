#!/bin/bash

# Script pour supprimer les imports ArticleFunnelView et ArticleEditorDetector

echo "🔧 Suppression des imports ArticleFunnelView et ArticleEditorDetector..."

# Trouver tous les fichiers TypeScript/TSX
find src -type f \( -name "*.tsx" -o -name "*.ts" \) ! -name "*.backup" | while read -r file; do
  # Vérifier si le fichier contient les imports à supprimer
  if grep -q "ArticleFunnelView\|ArticleEditorDetector" "$file"; then
    echo "📝 Traitement de: $file"
    
    # Supprimer la ligne d'import ArticleFunnelView
    sed -i '' '/import.*ArticleFunnelView.*from/d' "$file"
    
    # Supprimer la ligne d'import ArticleEditorDetector
    sed -i '' '/import.*ArticleEditorDetector.*from/d' "$file"
    
    echo "   ✅ Imports supprimés"
  fi
done

echo ""
echo "✨ Terminé !"
echo ""
echo "⚠️  Note: Les composants ArticleFunnelView doivent être remplacés manuellement par PreviewRenderer"
