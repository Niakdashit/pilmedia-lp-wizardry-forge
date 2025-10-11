# 🎯 Nouveau Système de Preview

## Architecture Simple et Efficace

Le nouveau système de preview a été complètement refait pour être **simple, maintenable et performant**.

### Principe

Un seul composant `PreviewRenderer.tsx` gère tout le flux de preview :

```
Screen 1 (Accueil) → Screen 2 (Jeu) → Screen 3 (Résultat)
```

### Avantages

✅ **Simple** : Un seul composant au lieu de 3 funnels différents  
✅ **Maintenable** : Code clair et facile à comprendre  
✅ **Performant** : Pas de logique complexe de formulaire modal  
✅ **Flexible** : Facile d'ajouter de nouveaux types de jeux  
✅ **Synchronisé** : Utilise le hook `useEditorPreviewSync` pour la synchronisation en temps réel

### Flux Utilisateur

1. **Screen 1** : L'utilisateur voit la page d'accueil avec un bouton "Participer"
2. **Clic sur "Participer"** : Passage à l'écran 2 (jeu)
3. **Screen 2** : L'utilisateur joue (roue, scratch, etc.)
4. **Jeu terminé** : Passage automatique à l'écran 3 (résultat)
5. **Screen 3** : Affichage du résultat avec bouton "Rejouer" qui retourne à l'écran 1

### Utilisation

```tsx
import PreviewRenderer from '@/components/preview/PreviewRenderer';

<PreviewRenderer
  campaign={campaign}
  previewMode="desktop" // ou 'tablet' | 'mobile'
  wheelModalConfig={wheelModalConfig}
/>
```

### Ajout d'un Nouveau Type de Jeu

Pour ajouter un nouveau type de jeu, il suffit d'ajouter un cas dans le composant `PreviewRenderer` :

```tsx
{/* Screen 2: Jeu */}
{currentScreen === 'screen2' && (
  <>
    {campaign.type === 'wheel' && (
      <StandardizedWheel ... />
    )}
    
    {/* Ajouter votre nouveau jeu ici */}
    {campaign.type === 'nouveau-jeu' && (
      <NouveauJeu
        onFinish={handleGameFinish}
      />
    )}
  </>
)}
```

### Migration depuis l'Ancien Système

L'ancien système utilisait 3 composants différents :
- ❌ `FunnelUnlockedGame.tsx` (35KB, complexe)
- ❌ `FunnelStandard.tsx` (9KB)
- ❌ `FunnelQuizParticipate.tsx` (34KB, très complexe)

Le nouveau système utilise :
- ✅ `PreviewRenderer.tsx` (Simple, ~200 lignes)

Tous les fichiers ont été automatiquement migrés pour utiliser le nouveau système.

### Notes Techniques

- **Synchronisation** : Le composant écoute les événements de synchronisation depuis l'éditeur
- **Background** : Utilise les données canoniques du hook `useEditorPreviewSync`
- **Modules** : Supporte à la fois `DesignModuleRenderer` et `QuizModuleRenderer`
- **Safe Zone** : Gère automatiquement le padding selon le device (mobile/tablet/desktop)

### Prochaines Étapes

- [ ] Ajouter le support pour les autres types de jeux (scratch, jackpot, etc.)
- [ ] Ajouter des animations de transition entre les écrans
- [ ] Ajouter un système de formulaire optionnel pour screen1
- [ ] Améliorer la gestion des résultats (API, localStorage, etc.)
