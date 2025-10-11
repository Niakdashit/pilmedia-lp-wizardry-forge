# 📋 TODO - Système de Preview

## 🚀 Priorité Haute

- [ ] **Ajouter support Scratch Card**
  - Importer `ScratchCardCanvas` ou créer un wrapper
  - Gérer le résultat (carte révélée)
  - Tester le flux complet

- [ ] **Ajouter support Jackpot**
  - Importer le composant Jackpot existant
  - Gérer les slots et l'animation
  - Tester le flux complet

- [ ] **Tester la roue**
  - Vérifier que la roue tourne après clic
  - Vérifier le passage à screen3 après résultat
  - Vérifier le bouton "Rejouer"

## 🎨 Améliorations UI/UX

- [ ] **Animations de transition**
  - Fade in/out entre écrans
  - Slide animations
  - Bounce effect sur le bouton "Participer"

- [ ] **Loading states**
  - Spinner pendant le jeu
  - Skeleton screens
  - Progress indicators

- [ ] **Messages de feedback**
  - Toast notifications
  - Success/Error messages
  - Animations de célébration (confetti pour win)

## 🔧 Fonctionnalités

- [ ] **Système de formulaire optionnel**
  - Ajouter un flag `requireForm` dans la config
  - Modal de formulaire avant screen2
  - Validation des champs
  - Sauvegarde des données

- [ ] **Gestion des résultats**
  - Sauvegarder dans localStorage
  - API call pour enregistrer la participation
  - Afficher l'historique des parties

- [ ] **Mode preview vs production**
  - Désactiver les API calls en mode preview
  - Afficher des badges "PREVIEW MODE"
  - Mock data pour les tests

## 📱 Responsive

- [ ] **Optimisations mobile**
  - Touch gestures
  - Swipe entre écrans
  - Haptic feedback

- [ ] **Optimisations tablet**
  - Layout adapté
  - Taille des boutons
  - Espacement

## 🧪 Tests

- [ ] **Tests unitaires**
  - PreviewRenderer component
  - Navigation entre écrans
  - Gestion des résultats

- [ ] **Tests E2E**
  - Flux complet utilisateur
  - Tous les types de jeux
  - Tous les devices

- [ ] **Tests de performance**
  - Temps de chargement
  - Animations fluides
  - Memory leaks

## 📚 Documentation

- [ ] **Vidéos tutoriels**
  - Comment ajouter un nouveau jeu
  - Comment personnaliser les écrans
  - Comment débugger

- [ ] **Exemples de code**
  - Plus d'exemples dans QUICK_START.md
  - Code snippets pour cas courants
  - Best practices

## 🐛 Bugs Connus

- [ ] Aucun bug connu pour le moment

## 💡 Idées Futures

- [ ] **Multi-langue**
  - i18n support
  - Traductions automatiques
  - RTL support

- [ ] **Thèmes**
  - Dark mode
  - Custom themes
  - Theme switcher

- [ ] **Analytics**
  - Tracking des événements
  - Heatmaps
  - A/B testing

- [ ] **Accessibilité**
  - ARIA labels
  - Keyboard navigation
  - Screen reader support

## 📝 Notes

### Décisions Techniques

- **Pourquoi un seul composant ?**
  - Simplicité et maintenabilité
  - Moins de props drilling
  - Code plus facile à comprendre

- **Pourquoi pas de formulaire modal ?**
  - Complexité inutile
  - Mauvaise UX
  - Difficile à maintenir

- **Pourquoi 3 écrans ?**
  - Flux utilisateur clair
  - Facile à étendre
  - Correspond aux besoins métier

### Leçons Apprises

- ✅ Toujours privilégier la simplicité
- ✅ Documenter dès le début
- ✅ Tester régulièrement
- ✅ Écouter les retours utilisateurs

---

**Dernière mise à jour** : 10 Octobre 2025  
**Contributeurs** : Cascade AI
