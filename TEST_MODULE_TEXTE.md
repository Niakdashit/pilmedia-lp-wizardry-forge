# 🧪 Test du Module Texte - Guide de Vérification

## 🎯 Objectif

Vérifier que les modifications de police et couleur s'appliquent correctement au module BlocTexte dans le canvas.

## 📋 Procédure de Test

### 1. Ouvrir `/design-editor`
```
http://localhost:8081/design-editor
```

### 2. Ajouter un Module Texte
1. Cliquez sur l'onglet **"Éléments"** (icône +)
2. Cliquez sur **"Bloc Texte"**
3. Un module texte devrait apparaître dans le canvas

### 3. Sélectionner le Module Texte
1. **Cliquez sur le module texte** dans le canvas
2. ✅ **Vérification** : L'onglet "Design" devrait s'ouvrir automatiquement
3. ✅ **Vérification** : L'interface avec Style + Effects devrait être visible

### 4. Tester le Changement de Couleur
1. Dans l'onglet **"Style"**, section **"COULEURS DE TEXTE"**
2. Cliquez sur une couleur (ex: rouge, bleu, vert)
3. ✅ **Vérification** : Le texte dans le canvas devrait changer de couleur immédiatement

**Logs attendus dans la console :**
```
🎨 applyColor called: { color: "#FF0000", ... }
🔧 [HybridSidebar] updateForBackground appelé pour BlocTexte: module-id { color: "#FF0000" }
🔧 [DesignEditorLayout] handleModuleUpdate appelé: { moduleId: "module-id", updates: { color: "#FF0000" } }
✅ [DesignEditorLayout] Module mis à jour: { screenId: "screen1", ... }
```

### 5. Tester le Changement de Police
1. Dans l'onglet **"Style"**, section **"CATÉGORIES DE POLICES"**
2. Sélectionnez une catégorie (ex: **Business**, **Calm**, **Cute**)
3. Cliquez sur une police (ex: **Roboto**, **Open Sans**, **Montserrat**)
4. ✅ **Vérification** : La police du texte dans le canvas devrait changer immédiatement

**Logs attendus dans la console :**
```
🔧 [HybridSidebar] updateForBackground appelé pour BlocTexte: module-id { fontFamily: "Roboto" }
🔧 [DesignEditorLayout] handleModuleUpdate appelé: { moduleId: "module-id", updates: { fontFamily: "Roboto" } }
✅ [DesignEditorLayout] Module mis à jour: { oldModule: { fontFamily: undefined }, newModule: { fontFamily: "Roboto" } }
```

### 6. Tester les Effets de Texte
1. Cliquez sur l'onglet **"Effects"**
2. Testez les effets rapides :
   - **Ombres** : Devrait ajouter une ombre au texte
   - **Contour** : Devrait ajouter un contour au texte
   - **Néon** : Devrait ajouter un effet néon
3. ✅ **Vérification** : Les effets devraient s'appliquer immédiatement au texte

### 7. Tester la Rotation
1. Dans l'onglet **"Effects"**, section **"Rotation"**
2. Déplacez le slider (ex: 45°, 90°, 180°)
3. ✅ **Vérification** : Le texte devrait pivoter dans le canvas

## 🐛 Dépannage

### Problème : Le texte ne change pas de couleur
**Causes possibles :**
1. `onModuleUpdate` n'est pas appelé
2. Le module n'est pas trouvé dans `modularPage`
3. Le canvas ne se re-rend pas

**Solution :**
- Vérifiez les logs dans la console
- Vérifiez que `handleModuleUpdate` est bien appelé
- Vérifiez que le module existe dans `modularPage.screens.screen1`

### Problème : Le texte ne change pas de police
**Causes possibles :**
1. La police n'est pas chargée (Google Fonts)
2. `fontFamily` n'est pas appliqué au rendu

**Solution :**
- Vérifiez que le module a bien `fontFamily` dans ses propriétés
- Vérifiez que DesignModuleRenderer utilise `fontFamily` pour le rendu

### Problème : L'onglet Design ne s'ouvre pas automatiquement
**Causes possibles :**
1. L'événement `designModularModuleSelected` n'est pas dispatché
2. `sidebarRef.current` est null

**Solution :**
- Vérifiez les logs : "🎯 Module sélectionné depuis le canvas"
- Vérifiez : "✅ BlocTexte détecté - Ouverture onglet Design"

## 📊 Logs de Debug

### Logs Attendus (Flux Complet)

```
1. Clic sur module dans canvas
   🎯 Module sélectionné depuis le canvas: { id: "...", type: "BlocTexte" }
   🎯 Type du module: BlocTexte
   ✅ BlocTexte détecté - Ouverture onglet Design

2. Rendu du BackgroundPanel
   🎨 [HybridSidebar] Rendu BackgroundPanel: { isBlocTexte: true, ... }
   🎨🎨🎨 BackgroundPanel MOUNTED with props: { selectedElementType: "BlocTexte", ... }

3. Changement de couleur
   🎨 applyColor called: { color: "#FF0000", isTextSelected: true, ... }
   🎨 Updating text color: #FF0000
   🔧 [HybridSidebar] updateForBackground appelé pour BlocTexte: module-id { color: "#FF0000" }
   🔧 [DesignEditorLayout] handleModuleUpdate appelé: { moduleId: "...", updates: { color: "#FF0000" } }
   ✅ [DesignEditorLayout] Module mis à jour: { screenId: "screen1", ... }

4. Changement de police
   🔧 [HybridSidebar] updateForBackground appelé pour BlocTexte: module-id { fontFamily: "Roboto" }
   🔧 [DesignEditorLayout] handleModuleUpdate appelé: { moduleId: "...", updates: { fontFamily: "Roboto" } }
   ✅ [DesignEditorLayout] Module mis à jour: { oldModule: { fontFamily: undefined }, newModule: { fontFamily: "Roboto" } }
```

## ✅ Résultat Attendu

Après ces tests, vous devriez avoir :
- ✅ Ouverture automatique de l'onglet Design au clic sur BlocTexte
- ✅ Changement de couleur instantané
- ✅ Changement de police instantané
- ✅ Application des effets en temps réel
- ✅ Rotation fonctionnelle

---

**Si un test échoue, partagez les logs de la console pour diagnostic !**
