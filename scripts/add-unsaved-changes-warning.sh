#!/bin/bash

# Script pour ajouter la confirmation avant fermeture dans tous les DesignToolbar

TOOLBARS=(
  "FormEditor/DesignToolbar.tsx"
  "JackpotEditor/DesignToolbar.tsx"
  "PollEditor/DesignToolbar.tsx"
  "ProEditor/DesignToolbar.tsx"
  "QuizEditor/DesignToolbar.tsx"
  "ReferenceEditor/DesignToolbar.tsx"
  "ScratchCardEditor/DesignToolbar.tsx"
  "SwiperEditor/DesignToolbar.tsx"
  "SwiperEditor/ReferenceEditor/DesignToolbar.tsx"
  "WebEditor/DesignToolbar.tsx"
)

BASE_DIR="/Users/jonathannzaumakoso/Desktop/Leadya/Test3/pilmedia-lp-wizardry-forge/src/components"

for toolbar in "${TOOLBARS[@]}"; do
  FILE="$BASE_DIR/$toolbar"
  
  if [ -f "$FILE" ]; then
    echo "Processing $toolbar..."
    
    # 1. Ajouter l'import du hook (après les autres imports)
    if ! grep -q "useUnsavedChangesWarning" "$FILE"; then
      sed -i '' '/import { useEditorStore } from/a\
import { useUnsavedChangesWarning } from '\''@/hooks/useUnsavedChangesWarning'\'';
' "$FILE"
    fi
    
    # 2. Ajouter la détection des modifications et le hook (après les labels)
    if ! grep -q "hasUnsavedChanges" "$FILE"; then
      sed -i '' '/const saveMobileLabel = /a\
\
  // Détecter les modifications non sauvegardées (basé sur canUndo)\
  const hasUnsavedChanges = canUndo;\
  const { handleClose } = useUnsavedChangesWarning(hasUnsavedChanges);
' "$FILE"
    fi
    
    # 3. Remplacer navigate('/dashboard') par handleClose('/dashboard')
    sed -i '' "s/onClick={() => navigate('\/dashboard')}/onClick={() => handleClose('\/dashboard')}/g" "$FILE"
    
    echo "✓ $toolbar updated"
  else
    echo "✗ $toolbar not found"
  fi
done

echo ""
echo "All toolbars updated!"
