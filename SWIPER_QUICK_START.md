# 🚀 Guide de démarrage rapide - SwiperEditor

## Accès rapide

```
URL: http://localhost:5173/swiper-editor
```

## Création d'une campagne Swiper en 5 étapes

### 1️⃣ Configuration globale
- **Titre principal** : "Looking for Healthy Skin Tips?"
- **Sous-titre** : (optionnel)
- **Couleur de fond** : #FF6B9D (rose)
- **Couleur d'accent** : #FF6B9D

### 2️⃣ Options d'affichage
- ✅ Afficher le bouton "J'aime" (❤️)
- ✅ Afficher le bouton "Rejeter" (❌)
- ✅ Afficher le bouton "Suivant" (➡️)
- ✅ Activer le swipe tactile
- ✅ Effet de pile de cartes

### 3️⃣ Ajout de cartes
Cliquez sur **"Ajouter une carte"** et configurez :
- **URL de l'image** : Lien vers l'image du produit
- **Titre de la carte** : Nom visible en bas
- **Nom du produit** : Texte sur l'image (overlay)
- **Description** : Description du produit
- **Couleur de fond** : Couleur de la carte

### 4️⃣ Aperçu
Cliquez sur le bouton **"Aperçu"** (œil) pour tester :
- Swipez les cartes à gauche/droite
- Ou utilisez les boutons
- Testez sur mobile et desktop

### 5️⃣ Sauvegarde
- Cliquez sur **"Sauvegarder"**
- La campagne est prête !

## Exemples d'utilisation

### 🎨 Produits de beauté
```
Titre: "Looking for Healthy Skin Tips?"
Fond: #FF6B9D (rose)
Cartes: Produits cosmétiques avec images
```

### 👗 Collection mode
```
Titre: "Découvrez notre nouvelle collection"
Fond: #2C3E50 (bleu foncé)
Cartes: Vêtements de la collection
```

### 🍔 Menu restaurant
```
Titre: "Nos spécialités du jour"
Fond: #F39C12 (orange)
Cartes: Plats avec photos
```

## Raccourcis clavier

- **Espace** : Swipe suivant
- **←** : Rejeter (swipe gauche)
- **→** : Aimer (swipe droite)
- **Échap** : Fermer l'aperçu

## Intégration dans un funnel

Le jeu Swiper peut être intégré dans un funnel article :

```
Article → Formulaire → Swiper → Résultat
```

## Résultats collectés

À la fin du jeu :
- **Cartes aimées** : IDs des produits likés
- **Cartes rejetées** : IDs des produits rejetés
- **Cartes passées** : IDs des produits skippés
- **Date de complétion**

## Tips & Astuces

### 📸 Images
- **Format recommandé** : 800x1200px (ratio 2:3)
- **Poids max** : 500KB pour performance
- **Formats** : JPG, PNG, WebP

### 🎨 Couleurs
- **Contraste** : Assurez-vous que le texte est lisible
- **Cohérence** : Utilisez les couleurs de votre marque
- **Accent** : Couleur pour le bouton "J'aime"

### 📱 Mobile
- **Swipe** : Activez toujours le swipe tactile
- **Boutons** : Gardez les 3 boutons pour accessibilité
- **Taille** : Les cartes s'adaptent automatiquement

### ⚡ Performance
- **Nombre de cartes** : 5-10 cartes idéal
- **Images optimisées** : Compressez vos images
- **Animations** : Activez l'effet de pile pour plus de dynamisme

## Troubleshooting

### Les images ne s'affichent pas
- Vérifiez l'URL de l'image (doit être accessible publiquement)
- Testez l'URL dans un nouvel onglet
- Vérifiez les CORS si hébergement externe

### Le swipe ne fonctionne pas
- Vérifiez que "Activer le swipe tactile" est coché
- Testez sur un appareil tactile réel
- Vérifiez la console pour les erreurs

### Les couleurs ne s'appliquent pas
- Utilisez le format hexadécimal (#FF6B9D)
- Vérifiez que les couleurs sont bien sauvegardées
- Rafraîchissez l'aperçu

## Support

Pour toute question ou problème :
1. Consultez la documentation complète (`SWIPER_EDITOR_CREATION.md`)
2. Vérifiez les logs de la console (F12)
3. Testez avec un template prédéfini

---

**Bon swipe ! 🎴**
