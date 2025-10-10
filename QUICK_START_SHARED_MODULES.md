# 🚀 Guide Rapide - Modules Partagés

## 📦 Import Simple

```typescript
import { 
  ModulesPanel,
  CompositeElementsPanel,
  AssetsPanel,
  TextPanel,
  TextEffectsPanel 
} from '@/components/shared';
```

## 🎯 Cas d'Usage Courants

### 1. Ajouter un Panneau de Modules
```typescript
import { ModulesPanel } from '@/components/shared';

<ModulesPanel 
  currentScreen="screen1"
  onAdd={(screen, module) => {
    // Ajouter le module à votre état
    console.log('Module ajouté:', module);
  }}
/>
```

### 2. Panneau Composite (Modules + Assets)
```typescript
import { CompositeElementsPanel } from '@/components/shared';

<CompositeElementsPanel
  currentScreen="screen1"
  onAddModule={(screen, module) => handleAddModule(screen, module)}
  onAddElement={(element) => handleAddElement(element)}
  selectedElement={selectedElement}
  onElementUpdate={(updates) => handleElementUpdate(updates)}
  selectedDevice="desktop"
/>
```

### 3. Panneau Assets (Texte, Formes, Uploads)
```typescript
import { AssetsPanel } from '@/components/shared';

<AssetsPanel
  onAddElement={(element) => handleAddElement(element)}
  selectedElement={selectedElement}
  onElementUpdate={(updates) => handleElementUpdate(updates)}
  selectedDevice="desktop"
  elements={elements}
/>
```

### 4. Panneau de Texte avec Presets
```typescript
import { TextPanel } from '@/components/shared';

<TextPanel
  onAddElement={(element) => handleAddElement(element)}
  selectedElement={selectedElement}
  onElementUpdate={(updates) => handleElementUpdate(updates)}
  selectedDevice="desktop"
  elements={elements}
/>
```

### 5. Effets de Texte Avancés
```typescript
import { TextEffectsPanel } from '@/components/shared';

<TextEffectsPanel
  selectedElement={selectedElement}
  onElementUpdate={(updates) => handleElementUpdate(updates)}
  onAddElement={(element) => handleAddElement(element)}
/>
```

## 🔧 Types Disponibles

```typescript
// Types de modules
type ModuleType = 
  | 'BlocTexte' 
  | 'BlocImage' 
  | 'BlocBouton' 
  | 'BlocSeparateur' 
  | 'BlocVideo' 
  | 'BlocReseauxSociaux' 
  | 'BlocHtml' 
  | 'BlocCarte' 
  | 'BlocLogo' 
  | 'BlocPiedDePage';

// Identifiants d'écran
type ScreenId = 'screen1' | 'screen2' | 'screen3';

// Interface Module
interface Module {
  id: string;
  type: ModuleType;
  [key: string]: any;
}
```

## 📝 Exemples Complets

### Créer un Nouvel Éditeur

```typescript
import React, { useState } from 'react';
import { CompositeElementsPanel } from '@/components/shared';

export const MonNouvelEditeur = () => {
  const [currentScreen, setCurrentScreen] = useState<'screen1' | 'screen2' | 'screen3'>('screen1');
  const [modules, setModules] = useState<any[]>([]);
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const handleAddModule = (screen: string, module: any) => {
    setModules(prev => [...prev, { ...module, screen }]);
  };

  const handleAddElement = (element: any) => {
    setElements(prev => [...prev, element]);
  };

  const handleElementUpdate = (updates: any) => {
    if (selectedElement) {
      setElements(prev => prev.map(el => 
        el.id === selectedElement.id ? { ...el, ...updates } : el
      ));
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 text-white">
        <CompositeElementsPanel
          currentScreen={currentScreen}
          onAddModule={handleAddModule}
          onAddElement={handleAddElement}
          selectedElement={selectedElement}
          onElementUpdate={handleElementUpdate}
          selectedDevice="desktop"
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-100">
        {/* Votre canvas ici */}
      </div>
    </div>
  );
};
```

## ⚠️ Règles Importantes

### ✅ À FAIRE
```typescript
// BON - Import depuis shared
import { ModulesPanel } from '@/components/shared';

// BON - Utiliser les types exportés
import type { Module, ScreenId } from '@/components/shared/modules';
```

### ❌ À ÉVITER
```typescript
// MAUVAIS - Import depuis un éditeur spécifique
import ModulesPanel from '../QuizEditor/modules/ModulesPanel';

// MAUVAIS - Dupliquer le code
// Ne copiez jamais un module partagé dans votre éditeur
```

## 🐛 Dépannage Rapide

### Erreur: "Cannot find module '@/components/shared'"
```bash
# Vérifier que l'alias @ est configuré dans tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erreur: Type incompatibility
```typescript
// Utiliser les types depuis shared
import type { Module, ScreenId } from '@/components/shared/modules';

// Pas de types personnalisés incompatibles
```

### Module ne se met pas à jour
```bash
# Redémarrer le serveur de développement
npm run dev
```

## 📚 Documentation Complète

- **Architecture détaillée :** [MODULES_ARCHITECTURE.md](/MODULES_ARCHITECTURE.md)
- **Résumé visuel :** [ARCHITECTURE_SUMMARY.md](/ARCHITECTURE_SUMMARY.md)
- **README shared :** [src/components/shared/README.md](/src/components/shared/README.md)

## 💡 Conseils Pro

1. **Toujours tester dans plusieurs éditeurs** après modification d'un module partagé
2. **Utiliser des props optionnelles** pour les fonctionnalités spécifiques
3. **Documenter les changements** dans les modules partagés
4. **Maintenir la rétrocompatibilité** avec les éditeurs existants

---

**Besoin d'aide ?** Consultez la documentation complète ou contactez l'équipe de développement.
