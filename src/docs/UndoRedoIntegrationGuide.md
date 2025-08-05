# Guide d'Intégration Undo/Redo

Ce guide vous explique comment intégrer rapidement la fonctionnalité undo/redo dans votre application Leadya.

## 📁 Fichiers Créés

1. **`/src/hooks/useUndoRedo.ts`** - Hook principal pour la gestion undo/redo
2. **`/src/components/shared/UndoRedoButtons.tsx`** - Composants UI pour les boutons
3. **`/src/examples/UndoRedoIntegrationExample.tsx`** - Exemple complet d'intégration

## 🚀 Intégration Rapide

### Étape 1: Importer le hook dans votre composant

```tsx
import { useUndoRedo, useUndoRedoShortcuts } from '../hooks/useUndoRedo';
import { UndoRedoButtons } from '../components/shared/UndoRedoButtons';
```

### Étape 2: Configurer le hook dans votre composant

```tsx
const YourComponent = () => {
  const [yourState, setYourState] = useState(initialState);

  // Configuration undo/redo
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    onUndo: (restoredState) => {
      setYourState(restoredState);
    },
    onRedo: (restoredState) => {
      setYourState(restoredState);
    }
  });

  // Raccourcis clavier
  useUndoRedoShortcuts(undo, redo);

  // Fonction pour mettre à jour l'état avec historique
  const updateState = (newState, action = 'modify') => {
    setYourState(newState);
    addToHistory(newState, action);
  };

  return (
    <div>
      {/* Vos boutons undo/redo */}
      <UndoRedoButtons
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      
      {/* Votre interface */}
    </div>
  );
};
```

### Étape 3: Remplacer vos setState par updateState

Au lieu de :
```tsx
setState(newValue);
```

Utilisez :
```tsx
updateState(newValue, 'action_description');
```

## 🎯 Intégration dans DesignEditorLayout

Pour intégrer dans votre éditeur existant, remplacez l'ancien système :

```tsx
// Dans DesignEditorLayout.tsx
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';

// Remplacez l'ancien useHistoryManager par :
const {
  addToHistory,
  undo,
  redo,
  canUndo,
  canRedo
} = useUndoRedo({
  onUndo: (restoredCampaign) => {
    setCampaign(restoredCampaign);
    setSelectedElement(null);
  },
  onRedo: (restoredCampaign) => {
    setCampaign(restoredCampaign);
    setSelectedElement(null);
  }
});

// Raccourcis clavier
useUndoRedoShortcuts(undo, redo);

// Dans vos fonctions de modification :
const handleElementUpdate = (element, updates) => {
  const updatedCampaign = {
    ...campaign,
    elements: campaign.elements.map(el => 
      el.id === element.id ? { ...el, ...updates } : el
    )
  };
  
  setCampaign(updatedCampaign);
  addToHistory(updatedCampaign, 'update_element');
};
```

## 🎨 Styles des Boutons

Le composant `UndoRedoButtons` supporte plusieurs variantes :

```tsx
// Boutons par défaut
<UndoRedoButtons {...props} />

// Boutons compacts pour toolbar
<CompactUndoRedoButtons {...props} />

// Boutons avec séparateurs
<ToolbarUndoRedoButtons {...props} withSeparator={true} />

// Personnalisés
<UndoRedoButtons
  {...props}
  size="lg"
  variant="outline"
  orientation="vertical"
  className="custom-class"
/>
```

## ⌨️ Raccourcis Clavier

Les raccourcis sont automatiquement configurés :

- **Windows/Linux** : `Ctrl+Z` (undo), `Ctrl+Y` ou `Ctrl+Shift+Z` (redo)
- **Mac** : `Cmd+Z` (undo), `Cmd+Shift+Z` (redo)

## 🔧 Configuration Avancée

```tsx
const { ... } = useUndoRedo({
  maxHistorySize: 100,        // Taille max de l'historique
  onUndo: (state) => { ... }, // Callback undo
  onRedo: (state) => { ... }, // Callback redo
  onStateChange: (state, action) => {
    console.log(`Action: ${action}`, state);
  }
});
```

## 📊 Informations sur l'Historique

```tsx
const {
  canUndo,      // boolean
  canRedo,      // boolean
  historySize,  // number
  lastAction,   // string
  currentIndex, // number
  getHistoryInfo, // function
  clearHistory  // function
} = useUndoRedo({ ... });
```

## 🎯 Actions Recommandées

Utilisez des noms d'actions descriptifs :

```tsx
addToHistory(state, 'add_element');
addToHistory(state, 'delete_element');
addToHistory(state, 'move_element');
addToHistory(state, 'resize_element');
addToHistory(state, 'change_color');
addToHistory(state, 'change_font');
```

## 🐛 Dépannage

### Problème : L'historique ne se met pas à jour
**Solution** : Vérifiez que vous appelez `addToHistory` après chaque modification d'état.

### Problème : Les raccourcis ne fonctionnent pas
**Solution** : Assurez-vous d'appeler `useUndoRedoShortcuts(undo, redo)` dans votre composant.

### Problème : Performance dégradée
**Solution** : Réduisez `maxHistorySize` ou optimisez la sérialisation de vos états.

## 📝 Exemple Complet

Consultez `/src/examples/UndoRedoIntegrationExample.tsx` pour un exemple complet et fonctionnel.

## 🔄 Migration depuis l'Ancien Système

Si vous utilisez déjà `useHistoryManager`, remplacez simplement :

```tsx
// Ancien
const { addToHistory, undo, redo } = useHistoryManager({ ... });

// Nouveau
const { addToHistory, undo, redo, canUndo, canRedo } = useUndoRedo({ ... });
```

Les APIs sont compatibles, vous bénéficiez en plus des nouvelles fonctionnalités !
