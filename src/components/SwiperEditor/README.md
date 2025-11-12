# SwiperEditor - Éditeur pour Mécaniques de Swipe

## 📋 Description

SwiperEditor est un éditeur basé sur ReferenceEditor, conçu pour créer des mécaniques de jeu utilisant le **swipe** (glissement tactile). Il permet de créer des expériences interactives type Tinder, cartes à balayer, galeries d'images swipables, etc.

## 🎯 Objectif

Créer des jeux interactifs basés sur le swipe avec une interface tactile optimisée pour mobile et tablette.

## 🏗️ Structure

### Composants Principaux

#### 1. **DesignEditorLayout.tsx**
- Layout principal de l'éditeur
- Gestion des 3 écrans (screen1, screen2, screen3)
- **Screen2** : Espace pour la mécanique de swipe
- Système de preview intégré

#### 2. **HybridSidebar.tsx**
- Sidebar avec onglets : Design, Éléments, Formulaire, **Jeu**, Sortie, Code
- **Onglet "Jeu"** : Configuration de la mécanique de swipe

#### 3. **panels/GamePanel.tsx**
- Panel pour configurer le swipe
- Options : direction, sensibilité, animations, etc.

#### 4. **components/EmptyGamePreview.tsx**
- Composant pour le rendu du swipe
- Gestion des gestes tactiles

## 🚀 Utilisation

### Accès
```
http://localhost:5173/swiper-editor
```

### Mécaniques de Swipe Possibles

1. **Swipe Cards** (type Tinder)
   - Swipe gauche/droite pour trier
   - Animations de sortie
   - Pile de cartes

2. **Galerie Swipable**
   - Navigation par swipe
   - Indicateurs de position
   - Boucle infinie optionnelle

3. **Quiz Swipe**
   - Réponses par swipe
   - Feedback visuel
   - Score en temps réel

4. **Produits Swipables**
   - Découverte de produits
   - Swipe pour aimer/passer
   - Panier intégré

## 📦 Fichiers Clés

```
SwiperEditor/
├── DesignEditorLayout.tsx          # Layout principal
├── HybridSidebar.tsx               # Sidebar avec onglets
├── panels/
│   ├── GamePanel.tsx               # ⭐ Configuration Swipe
│   ├── BackgroundPanel.tsx         # Configuration fond
│   ├── FormFieldsPanel.tsx         # Configuration formulaire
│   └── MessagesPanel.tsx           # Messages de sortie
├── components/
│   ├── EmptyGamePreview.tsx        # ⭐ Rendu Swipe
│   ├── MobileStableEditor.tsx      # Wrapper mobile
│   └── ZoomSlider.tsx              # Contrôle zoom
└── README.md                       # Cette documentation
```

## ✅ Fonctionnalités à Implémenter

### Phase 1 : Configuration de Base
- [ ] Direction du swipe (horizontal/vertical/multi)
- [ ] Seuil de déclenchement (distance minimum)
- [ ] Vitesse de swipe (lent/rapide)
- [ ] Animations de transition

### Phase 2 : Cartes Swipables
- [ ] Pile de cartes
- [ ] Gestion du stack
- [ ] Animations de sortie (gauche/droite)
- [ ] Feedback visuel pendant le swipe

### Phase 3 : Interactions
- [ ] Actions par direction (gauche = non, droite = oui)
- [ ] Boutons de contrôle alternatifs
- [ ] Historique des swipes
- [ ] Annulation du dernier swipe

### Phase 4 : Gamification
- [ ] Score basé sur les swipes
- [ ] Timer optionnel
- [ ] Combos et bonus
- [ ] Résultats finaux

## 🎨 Configuration du Swipe

### Exemple de Config

```typescript
interface SwipeConfig {
  direction: 'horizontal' | 'vertical' | 'both';
  threshold: number; // Distance minimum en px
  velocity: number; // Vitesse minimum
  maxCards: number; // Nombre de cartes
  animations: {
    swipeOut: 'slide' | 'fade' | 'rotate';
    duration: number; // ms
    easing: string;
  };
  actions: {
    left: 'reject' | 'dislike' | 'no';
    right: 'accept' | 'like' | 'yes';
    up?: 'super-like' | 'favorite';
    down?: 'skip' | 'later';
  };
}
```

## 🔧 Bibliothèques Recommandées

- **react-spring** : Animations fluides
- **use-gesture** : Gestion des gestes tactiles
- **framer-motion** : Animations et transitions
- **swiper** : Composant swiper prêt à l'emploi

## 📱 Optimisation Mobile

- Touch events natifs
- Prévention du scroll pendant le swipe
- Feedback haptique (vibration)
- Gestion du multi-touch
- Performance optimisée (60fps)

## 🎯 Exemples d'Utilisation

### 1. Quiz Swipe
```
Question affichée → Swipe gauche (Faux) / droite (Vrai)
→ Carte suivante → Score final
```

### 2. Découverte Produits
```
Produit affiché → Swipe gauche (Passer) / droite (Aimer)
→ Produit suivant → Panier avec produits aimés
```

### 3. Jeu de Tri
```
Carte avec item → Swipe dans la bonne catégorie
→ Score selon la précision → Résultats
```

## 📚 Ressources

- [Documentation ReferenceEditor](../ReferenceEditor/README.md)
- [React Spring Docs](https://react-spring.dev/)
- [Use Gesture Docs](https://use-gesture.netlify.app/)
- [Swiper.js](https://swiperjs.com/)

---

**Créé le** : 12 novembre 2025  
**Basé sur** : ReferenceEditor v1.0  
**Objectif** : Mécaniques de jeu basées sur le swipe
