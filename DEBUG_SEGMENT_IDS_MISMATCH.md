# 🐛 Problème Identifié : Segments Différents entre Éditeur et Preview

## ❌ Problème

Les segments dans le **preview** ne correspondent PAS aux segments dans l'**éditeur** :

### Dans l'Éditeur
- Segment 0: "GAGNANT" (avec prizeId)
- Segment 1-5: "PERDANT"

### Dans le Preview
- Segment 0 (ID='1'): "Prix 1" ❌
- Segment 1 (ID='2'): "Dommage"
- Segment 2 (ID='3'): "Prix 2"
- Segment 3 (ID='4'): "Dommage"
- Segment 4 (ID='5'): "Prix 3"
- Segment 5 (ID='6'): "Dommage"

## 🔍 Cause

Les segments ne sont **pas sauvegardés correctement** dans Supabase, ou ils sont **écrasés** par des segments par défaut lors du chargement.

## ✅ Solution

1. Vérifier que les segments sont bien sauvegardés dans `game_config.wheelSegments`
2. S'assurer que le preview charge les segments depuis `game_config.wheelSegments` et non depuis des valeurs par défaut
3. Corriger le chargement des segments dans `PreviewRenderer` ou `StandardizedWheel`

## 🔧 Actions à Faire

1. Vérifier dans Supabase la table `campaigns` → colonne `game_config` → `wheelSegments`
2. Vérifier que les labels sont bien "GAGNANT" et "PERDANT"
3. Si les segments sont corrects dans la DB, le problème est dans le chargement
4. Si les segments sont incorrects dans la DB, le problème est dans la sauvegarde
