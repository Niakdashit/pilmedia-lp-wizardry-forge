# 🔧 Simplification - Gestion des Panels Temporaires

## Problème Actuel

La gestion des panels temporaires dans `HybridSidebar.tsx` est complexe et fragile :

```tsx
const handleTabClick = (tabId: string) => {
  // TOUJOURS fermer TOUS les panneaux temporaires
  onEffectsPanelChange?.(false);
  onAnimationsPanelChange?.(false);
  onPositionPanelChange?.(false);
  onQuizPanelChange?.(false);
  onWheelPanelChange?.(false);
  onDesignPanelChange?.(false);
  
  // Puis ouvrir le panneau correspondant
  if (tabId === 'background') {
    onDesignPanelChange?.(true);
  } else if (tabId === 'effects') {
    onEffectsPanelChange?.(true);
  }
  // ... etc
}
```

### **Problèmes Identifiés**

1. ❌ **Callbacks multiples** : 6+ callbacks pour gérer les panels
2. ❌ **Logique répétitive** : Fermer tous puis ouvrir un
3. ❌ **Risque de flicker** : Fermeture/ouverture rapide
4. ❌ **Difficile à maintenir** : Ajouter un panel = modifier plusieurs endroits
5. ❌ **États incohérents** : Plusieurs sources de vérité

---

## ✅ Solution Recommandée

### **Approche : State Unique Centralisé**

Remplacer les 6+ callbacks par un seul state :

```typescript
type PanelType = 'effects' | 'animations' | 'position' | 'quiz' | 'wheel' | 'design' | null;

const [activePanel, setActivePanel] = useState<PanelType>(null);
```

### **Avantages**

✅ **Un seul state** : Source de vérité unique  
✅ **Pas de callbacks multiples** : Un seul setter  
✅ **Pas de flicker** : Changement atomique  
✅ **Facile à maintenir** : Ajouter un panel = ajouter un type  
✅ **Logique simplifiée** : `setActivePanel('effects')` au lieu de 6 appels

---

## 🔧 Implémentation

### **1. Créer un Hook Personnalisé**

```typescript
// src/hooks/usePanelManager.ts

import { useState, useCallback } from 'react';

export type PanelType = 
  | 'effects' 
  | 'animations' 
  | 'position' 
  | 'quiz' 
  | 'wheel' 
  | 'design' 
  | null;

export function usePanelManager(initialPanel: PanelType = null) {
  const [activePanel, setActivePanel] = useState<PanelType>(initialPanel);
  
  const openPanel = useCallback((panel: PanelType) => {
    console.log(`[PanelManager] Opening panel: ${panel}`);
    setActivePanel(panel);
  }, []);
  
  const closePanel = useCallback(() => {
    console.log('[PanelManager] Closing all panels');
    setActivePanel(null);
  }, []);
  
  const togglePanel = useCallback((panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
  }, []);
  
  const isPanelOpen = useCallback((panel: PanelType) => {
    return activePanel === panel;
  }, [activePanel]);
  
  return {
    activePanel,
    openPanel,
    closePanel,
    togglePanel,
    isPanelOpen
  };
}
```

### **2. Utiliser dans HybridSidebar**

```tsx
// HybridSidebar.tsx

import { usePanelManager } from '@/hooks/usePanelManager';

const HybridSidebar = forwardRef<HybridSidebarRef, HybridSidebarProps>(({
  // ... autres props
}: HybridSidebarProps, ref) => {
  
  // ✅ Remplacer tous les états de panels par un seul
  const { activePanel, openPanel, closePanel, isPanelOpen } = usePanelManager();
  
  // ✅ Simplifier handleTabClick
  const handleTabClick = (tabId: string) => {
    if (tabId === internalActiveTab) {
      closePanel(); // Fermer si on clique sur l'onglet actif
      setActiveTab(null);
    } else {
      // Mapper l'onglet au panel correspondant
      const panelMap: Record<string, PanelType> = {
        'effects': 'effects',
        'animations': 'animations',
        'position': 'position',
        'quiz': 'quiz',
        'wheel': 'wheel',
        'background': 'design'
      };
      
      const panel = panelMap[tabId];
      if (panel) {
        openPanel(panel);
      } else {
        closePanel();
      }
      
      setActiveTab(tabId);
    }
  };
  
  // ✅ Simplifier renderPanel
  const renderPanel = (tabId: string) => {
    switch (tabId) {
      case 'effects':
        if (!isPanelOpen('effects')) return null;
        return (
          <TextEffectsPanel 
            onBack={() => {
              closePanel();
              setActiveTab('elements');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      
      case 'animations':
        if (!isPanelOpen('animations')) return null;
        return (
          <LazyAnimationsPanel 
            onBack={() => {
              closePanel();
              setActiveTab('elements');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      
      // ... autres panels
      
      default:
        return null;
    }
  };
  
  // ✅ Exposer via ref
  useImperativeHandle(ref, () => ({
    setActiveTab: (tab: string) => {
      setInternalActiveTab(tab);
      const panelMap: Record<string, PanelType> = {
        'effects': 'effects',
        'animations': 'animations',
        'position': 'position',
        'quiz': 'quiz',
        'wheel': 'wheel',
        'background': 'design'
      };
      const panel = panelMap[tab];
      if (panel) {
        openPanel(panel);
      }
    }
  }), [openPanel]);
  
  // ... reste du composant
});
```

### **3. Supprimer les Props Inutiles**

```tsx
// Avant
interface HybridSidebarProps {
  showEffectsPanel?: boolean;
  onEffectsPanelChange?: (show: boolean) => void;
  showAnimationsPanel?: boolean;
  onAnimationsPanelChange?: (show: boolean) => void;
  showPositionPanel?: boolean;
  onPositionPanelChange?: (show: boolean) => void;
  showQuizPanel?: boolean;
  onQuizPanelChange?: (show: boolean) => void;
  showWheelPanel?: boolean;
  onWheelPanelChange?: (show: boolean) => void;
  showDesignPanel?: boolean;
  onDesignPanelChange?: (show: boolean) => void;
  // ... autres props
}

// Après
interface HybridSidebarProps {
  // Toutes les props de panels supprimées !
  // La gestion est interne au composant
  // ... autres props
}
```

---

## 📊 Comparaison Avant/Après

### **Avant (Complexe)**

```tsx
// 6+ états booléens
const [showEffectsPanel, setShowEffectsPanel] = useState(false);
const [showAnimationsPanel, setShowAnimationsPanel] = useState(false);
const [showPositionPanel, setShowPositionPanel] = useState(false);
const [showQuizPanel, setShowQuizPanel] = useState(false);
const [showWheelPanel, setShowWheelPanel] = useState(false);
const [showDesignPanel, setShowDesignPanel] = useState(false);

// Logique complexe
const handleTabClick = (tabId: string) => {
  // Fermer TOUS
  onEffectsPanelChange?.(false);
  onAnimationsPanelChange?.(false);
  onPositionPanelChange?.(false);
  onQuizPanelChange?.(false);
  onWheelPanelChange?.(false);
  onDesignPanelChange?.(false);
  
  // Ouvrir UN
  if (tabId === 'effects') {
    onEffectsPanelChange?.(true);
  } else if (tabId === 'animations') {
    onAnimationsPanelChange?.(true);
  }
  // ... 4 autres conditions
};
```

### **Après (Simple)**

```tsx
// 1 seul état
const { activePanel, openPanel, closePanel } = usePanelManager();

// Logique simple
const handleTabClick = (tabId: string) => {
  const panelMap = {
    'effects': 'effects',
    'animations': 'animations',
    'position': 'position',
    'quiz': 'quiz',
    'wheel': 'wheel',
    'background': 'design'
  };
  
  const panel = panelMap[tabId];
  if (panel) {
    openPanel(panel);
  } else {
    closePanel();
  }
};
```

---

## 🎯 Migration Progressive

### **Étape 1 : Créer le Hook**

Créer `src/hooks/usePanelManager.ts` avec le code ci-dessus.

### **Étape 2 : Tester dans un Éditeur**

Commencer par un seul éditeur (ex: DesignEditor) :

1. Importer `usePanelManager` dans `HybridSidebar.tsx`
2. Remplacer les états de panels par le hook
3. Simplifier `handleTabClick`
4. Tester toutes les interactions

### **Étape 3 : Nettoyer les Props**

Une fois testé et validé :

1. Supprimer les props de panels de `HybridSidebarProps`
2. Supprimer les callbacks dans `DesignEditorLayout`
3. Supprimer les états dans le parent

### **Étape 4 : Répliquer aux Autres Éditeurs**

Appliquer la même logique à :
- QuizEditor
- JackpotEditor
- ScratchCardEditor
- FormEditor
- Etc.

---

## ⚠️ Points d'Attention

### **1. Synchronisation avec le Parent**

Si le parent doit savoir quel panel est ouvert :

```tsx
// Ajouter un callback optionnel
const { activePanel, openPanel } = usePanelManager();

useEffect(() => {
  onActivePanelChange?.(activePanel);
}, [activePanel, onActivePanelChange]);
```

### **2. Panels Multiples Simultanés**

Si besoin d'ouvrir plusieurs panels en même temps :

```tsx
// Utiliser un Set au lieu d'un state unique
const [activePanels, setActivePanels] = useState<Set<PanelType>>(new Set());

const openPanel = (panel: PanelType) => {
  setActivePanels(prev => new Set(prev).add(panel));
};

const closePanel = (panel: PanelType) => {
  setActivePanels(prev => {
    const next = new Set(prev);
    next.delete(panel);
    return next;
  });
};
```

### **3. Animations de Transition**

Ajouter des transitions fluides :

```tsx
const [isTransitioning, setIsTransitioning] = useState(false);

const openPanel = (panel: PanelType) => {
  setIsTransitioning(true);
  setActivePanel(panel);
  setTimeout(() => setIsTransitioning(false), 300);
};
```

---

## 📈 Bénéfices Attendus

### **Code**
- ✅ **-200 lignes** : Suppression de logique répétitive
- ✅ **-12 props** : Nettoyage de l'interface
- ✅ **+1 hook** : Logique réutilisable

### **Performance**
- ✅ **Moins de re-renders** : Un seul state au lieu de 6+
- ✅ **Pas de flicker** : Changement atomique
- ✅ **Meilleure UX** : Transitions plus fluides

### **Maintenance**
- ✅ **Plus facile** : Ajouter un panel = 1 ligne
- ✅ **Plus clair** : Logique centralisée
- ✅ **Moins de bugs** : Moins d'états à synchroniser

---

## 🚀 Implémentation Immédiate

### **Fichiers à Créer**

1. `src/hooks/usePanelManager.ts` - Hook de gestion

### **Fichiers à Modifier**

1. `src/components/DesignEditor/HybridSidebar.tsx`
2. `src/components/DesignEditor/DesignEditorLayout.tsx`
3. Répéter pour les autres éditeurs

### **Tests à Effectuer**

- [ ] Ouvrir/fermer chaque panel
- [ ] Basculer entre panels
- [ ] Vérifier les transitions
- [ ] Tester sur mobile
- [ ] Vérifier la persistance d'état

---

## 📝 Conclusion

La simplification de la gestion des panels temporaires apportera :

1. **Code plus maintenable** : Moins de complexité
2. **Meilleure performance** : Moins de re-renders
3. **UX améliorée** : Transitions plus fluides
4. **Moins de bugs** : Logique centralisée

**Recommandation** : Implémenter progressivement, en commençant par un éditeur, puis répliquer aux autres une fois validé.
