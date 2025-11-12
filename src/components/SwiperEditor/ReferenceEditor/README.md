# ReferenceEditor - Éditeur de Référence Vide

## 📋 Description

ReferenceEditor est un éditeur de base créé à partir de QuizEditor mais entièrement vidé de toute logique spécifique au quiz. Il sert de **template propre** pour créer de nouvelles mécaniques de jeu.

## 🎯 Objectif

Fournir une base solide et standardisée pour développer rapidement de nouveaux types de jeux sans partir de zéro.

## 🏗️ Structure

### Composants Principaux

#### 1. **DesignEditorLayout.tsx**
- Layout principal de l'éditeur
- Gestion des 3 écrans (screen1, screen2, screen3)
- **Screen2 vide** : Remplacé par `EmptyGamePreview`
- Système de preview intégré

#### 2. **HybridSidebar.tsx**
- Sidebar avec onglets : Design, Éléments, Formulaire, **Jeu**, Sortie, Code
- **Onglet "Jeu" vide** : Affiche `GamePanel` (message informatif)

#### 3. **panels/GamePanel.tsx**
- Panel vide pour l'onglet "Jeu"
- Message explicatif pour les développeurs
- Prêt à recevoir les composants de configuration du jeu

#### 4. **components/EmptyGamePreview.tsx**
- Composant vide pour le screen2 et le mode preview
- Interface claire indiquant l'espace réservé au jeu

## 🚀 Utilisation

### Accès
```
http://localhost:5173/reference-editor
```

### Pour Créer un Nouveau Jeu

1. **Dupliquer ReferenceEditor**
   ```bash
   cp -r src/components/ReferenceEditor src/components/MonNouveauJeuEditor
   ```

2. **Remplacer les composants vides**
   - `panels/GamePanel.tsx` → Configuration du jeu
   - `components/EmptyGamePreview.tsx` → Rendu du jeu

3. **Ajouter la logique spécifique**
   - Types de données dans `/types`
   - Services dans `/services`
   - Hooks personnalisés dans `/hooks`

4. **Créer la route**
   ```typescript
   // Dans src/App.tsx
   const MonNouveauJeuEditor = lazy(() => import('./pages/MonNouveauJeuEditor'));
   
   <Route path="/mon-nouveau-jeu-editor" element={
     <LoadingBoundary fallback={<EditorLoader />}>
       <MonNouveauJeuEditor />
     </LoadingBoundary>
   } />
   ```

## 📦 Fichiers Clés

```
ReferenceEditor/
├── DesignEditorLayout.tsx          # Layout principal
├── HybridSidebar.tsx               # Sidebar avec onglets
├── DesignToolbar.tsx               # Toolbar d'édition
├── DesignCanvas.tsx                # Canvas d'édition
├── panels/
│   ├── GamePanel.tsx               # ⭐ Panel Jeu VIDE
│   ├── BackgroundPanel.tsx         # Configuration fond
│   ├── FormFieldsPanel.tsx         # Configuration formulaire
│   └── MessagesPanel.tsx           # Messages de sortie
├── components/
│   ├── EmptyGamePreview.tsx        # ⭐ Preview Jeu VIDE
│   ├── MobileStableEditor.tsx      # Wrapper mobile
│   └── ZoomSlider.tsx              # Contrôle zoom
└── README.md                       # Cette documentation
```

## ✅ Fonctionnalités Incluses

- ✅ **Screen1** : Canvas d'édition classique (texte, images, formes)
- ✅ **Screen2** : Espace vide pour le jeu
- ✅ **Screen3** : Canvas pour messages de sortie
- ✅ **Formulaire** : Configuration des champs de contact
- ✅ **Design** : Gestion des fonds et couleurs
- ✅ **Preview** : Mode aperçu desktop/mobile/tablette
- ✅ **Sauvegarde** : Auto-save et sauvegarde manuelle
- ✅ **Undo/Redo** : Historique des modifications
- ✅ **Responsive** : Support mobile, tablette, desktop

## 🎨 Personnalisation

### Modifier le Panel Jeu

```typescript
// panels/GamePanel.tsx
const GamePanel: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Ajoutez vos contrôles de configuration ici */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">
          Configuration du Jeu
        </h3>
        {/* Vos inputs, sliders, etc. */}
      </div>
    </div>
  );
};
```

### Modifier le Preview du Jeu

```typescript
// components/EmptyGamePreview.tsx
const GamePreview: React.FC<{ config: any }> = ({ config }) => {
  return (
    <div className="w-full h-full">
      {/* Rendu de votre jeu ici */}
      <MonComposantDeJeu config={config} />
    </div>
  );
};
```

## 🔧 Intégration avec le Système

### Types de Campagne

Ajoutez votre type dans `/src/types/campaign.ts` :
```typescript
export type CampaignType = 
  | 'wheel' 
  | 'quiz' 
  | 'jackpot' 
  | 'scratch'
  | 'mon-nouveau-jeu'; // ← Ajoutez ici
```

### Routing

Ajoutez la fonction de routing dans `/src/utils/editorRouting.ts` :
```typescript
export function getEditorRoute(type: string | null | undefined): string {
  switch (type) {
    case 'mon-nouveau-jeu':
      return '/mon-nouveau-jeu-editor';
    // ...
  }
}
```

## 📝 Notes Importantes

- **Ne modifiez PAS ReferenceEditor directement** pour créer un nouveau jeu
- **Dupliquez-le** et renommez tous les composants
- **Conservez la structure** pour maintenir la cohérence
- **Testez la compilation** après chaque modification majeure

## 🎯 Exemples de Jeux Créés

- **QuizEditor** : Basé sur ce template
- **WheelEditor** : Roue de la fortune
- **JackpotEditor** : Machine à sous
- **ScratchEditor** : Cartes à gratter

## 🚦 Prochaines Étapes

1. Dupliquer ReferenceEditor
2. Renommer tous les fichiers et composants
3. Implémenter la logique du jeu dans GamePanel
4. Créer le composant de rendu du jeu
5. Ajouter les types et services nécessaires
6. Tester en local
7. Créer la route dans App.tsx
8. Compiler et déployer

## 📚 Ressources

- [Documentation QuizEditor](../QuizEditor/README.md)
- [Guide des Hooks](../../hooks/README.md)
- [Architecture Modulaire](../../types/modularEditor.ts)

---

**Créé le** : 12 novembre 2025  
**Basé sur** : QuizEditor v2.0  
**Objectif** : Template pour nouveaux jeux
