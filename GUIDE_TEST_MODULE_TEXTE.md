# 🧪 Guide de Test - Module Texte sur /design-editor

## 📋 Pré-requis
- ✅ Serveur de développement en cours d'exécution (http://localhost:8082)
- ✅ Navigateur ouvert sur `/design-editor`

## 🎯 Test 1 : Changement de Couleur de Texte

### Étapes
1. **Ajouter un texte** :
   - Cliquer sur l'onglet **"Éléments"** dans la sidebar gauche
   - Aller dans **"Texte"** → **"Style"**
   - Ou ajouter un texte depuis la toolbar

2. **Sélectionner le texte** :
   - Cliquer sur l'élément de texte sur le canvas
   - Les poignées de sélection doivent apparaître

3. **Ouvrir le panneau Texte** :
   - Cliquer sur l'onglet **"Éléments"** dans la sidebar
   - Le sous-onglet **"Texte"** devrait être visible
   - Cliquer sur **"Style"** si ce n'est pas déjà actif

4. **Changer la couleur** :
   - Utiliser le **color picker** (carré coloré) pour choisir une couleur
   - OU entrer un code hexadécimal dans le champ texte (ex: `#FF0000`)

### ✅ Résultat Attendu
- Le texte sur le canvas change de couleur **immédiatement**
- La couleur dans le color picker reflète la couleur actuelle
- Le code hex est synchronisé avec le color picker

---

## 🎯 Test 2 : Changement de Police

### Étapes
1. **Sélectionner un texte** (voir Test 1)

2. **Ouvrir les catégories de polices** :
   - Dans l'onglet **"Éléments"** → **"Texte"** → **"Style"**
   - Scroller jusqu'à la section **"Catégories de polices"**

3. **Choisir une police** :
   - Cliquer sur n'importe quel bouton de police
   - Par exemple : **"Roboto"**, **"Montserrat"**, **"Lobster"**, etc.

### ✅ Résultat Attendu
- Le texte sur le canvas change de police **immédiatement**
- Le bouton de la police active est **surligné en violet** (#841b60)
- Le texte du bouton s'affiche dans la police correspondante

---

## 🎯 Test 3 : Application d'Effets Rapides

### Étapes
1. **Sélectionner un texte** (voir Test 1)

2. **Ouvrir l'onglet Effets** :
   - Dans l'onglet **"Éléments"** → **"Texte"**
   - Cliquer sur le sous-onglet **"Effets"**

3. **Appliquer un effet** :
   - Cliquer sur **"Fond"** (fond jaune)
   - OU cliquer sur **"Bouton Jaune"** (style bouton)

4. **Supprimer l'effet** :
   - Cliquer sur **"Aucun effet"** pour revenir au style normal

### ✅ Résultat Attendu
- L'effet s'applique **immédiatement** au texte
- **"Fond"** : Ajoute un fond jaune avec padding
- **"Bouton Jaune"** : Style bouton avec fond doré et coins arrondis
- **"Aucun effet"** : Supprime tous les effets personnalisés

---

## 🎯 Test 4 : Comportement Sans Sélection

### Étapes
1. **Désélectionner tous les éléments** :
   - Cliquer sur une zone vide du canvas

2. **Ouvrir le panneau Texte** :
   - Onglet **"Éléments"** → **"Texte"** → **"Style"**

### ✅ Résultat Attendu
- Le **color picker est désactivé** (grisé)
- Les **boutons de police sont désactivés** (opacité 50%)
- Messages d'aide affichés :
  - "Sélectionnez un élément de texte pour modifier sa couleur"
  - "Sélectionnez un élément de texte pour modifier sa police"

---

## 🎯 Test 5 : Changements Multiples

### Étapes
1. **Sélectionner un texte**

2. **Appliquer plusieurs changements** :
   - Changer la couleur en **rouge** (#FF0000)
   - Changer la police en **"Lobster"**
   - Appliquer l'effet **"Bouton Jaune"**

3. **Vérifier la persistance** :
   - Désélectionner le texte
   - Re-sélectionner le texte
   - Vérifier que tous les changements sont conservés

### ✅ Résultat Attendu
- Tous les changements s'appliquent **cumulativement**
- Les changements **persistent** après désélection
- Le color picker et les boutons reflètent l'état actuel

---

## 🎯 Test 6 : Compatibilité avec la Toolbar

### Étapes
1. **Sélectionner un texte**

2. **Utiliser la toolbar en haut** :
   - Changer la taille de police avec +/-
   - Appliquer gras, italique, souligné
   - Changer l'alignement

3. **Utiliser le panneau Texte** :
   - Changer la couleur
   - Changer la police

### ✅ Résultat Attendu
- Les changements depuis la **toolbar** et le **panneau Texte** sont **compatibles**
- Aucun conflit entre les deux interfaces
- Tous les changements s'appliquent correctement

---

## 🎯 Test 7 : Multi-Device (Desktop/Tablet/Mobile)

### Étapes
1. **Sélectionner un texte en mode Desktop**

2. **Changer la couleur et la police**

3. **Basculer en mode Tablet** :
   - Utiliser le sélecteur d'appareil dans la toolbar

4. **Vérifier les changements**

### ✅ Résultat Attendu
- Les changements de **couleur** et **police** sont **partagés** entre tous les appareils
- Les propriétés device-scoped (taille, position) peuvent être différentes
- Le panneau Texte fonctionne de la même manière sur tous les appareils

---

## 🐛 Problèmes Potentiels et Solutions

### Problème : Les changements ne s'appliquent pas
**Solutions** :
1. Vérifier qu'un texte est bien **sélectionné** (poignées visibles)
2. Rafraîchir la page (Ctrl+R ou Cmd+R)
3. Vider le cache du navigateur (Ctrl+Shift+R ou Cmd+Shift+R)

### Problème : Le color picker ne se met pas à jour
**Solutions** :
1. Désélectionner puis re-sélectionner le texte
2. Vérifier que `selectedElement.color` est bien défini dans les DevTools

### Problème : Les polices ne s'affichent pas correctement
**Solutions** :
1. Vérifier la connexion internet (polices Google Fonts)
2. Attendre quelques secondes pour le chargement des polices
3. Rafraîchir la page

---

## 📊 Checklist de Validation Complète

- [ ] ✅ Changement de couleur fonctionne
- [ ] ✅ Color picker synchronisé avec la couleur actuelle
- [ ] ✅ Input hex synchronisé avec le color picker
- [ ] ✅ Changement de police fonctionne
- [ ] ✅ Police active surlignée en violet
- [ ] ✅ Effet "Fond" s'applique correctement
- [ ] ✅ Effet "Bouton Jaune" s'applique correctement
- [ ] ✅ "Aucun effet" supprime les effets
- [ ] ✅ Contrôles désactivés sans sélection
- [ ] ✅ Messages d'aide affichés sans sélection
- [ ] ✅ Changements multiples cumulatifs
- [ ] ✅ Changements persistent après désélection
- [ ] ✅ Compatible avec la toolbar
- [ ] ✅ Fonctionne sur Desktop/Tablet/Mobile

---

## 🎉 Validation Finale

Si **tous les tests passent**, le module Texte fonctionne parfaitement ! 🚀

**Prochaines étapes** :
1. Tester en conditions réelles avec différents navigateurs
2. Vérifier la performance avec beaucoup d'éléments
3. Tester sur de vrais appareils mobiles/tablettes
