# 🚀 Quick Start - Nouveau Système de Preview

## Utilisation Basique

```tsx
import PreviewRenderer from '@/components/preview/PreviewRenderer';

function MyComponent() {
  return (
    <PreviewRenderer
      campaign={campaign}
      previewMode="desktop" // 'desktop' | 'tablet' | 'mobile'
      wheelModalConfig={wheelModalConfig}
    />
  );
}
```

## Ajouter un Nouveau Type de Jeu

### Étape 1 : Créer votre composant de jeu

```tsx
// /components/GameTypes/MonNouveauJeu.tsx
interface MonNouveauJeuProps {
  onFinish: (result: 'win' | 'lose') => void;
  disabled?: boolean;
}

export const MonNouveauJeu: React.FC<MonNouveauJeuProps> = ({ onFinish, disabled }) => {
  const handlePlay = () => {
    // Logique du jeu
    const isWin = Math.random() > 0.5;
    onFinish(isWin ? 'win' : 'lose');
  };

  return (
    <button onClick={handlePlay} disabled={disabled}>
      Jouer !
    </button>
  );
};
```

### Étape 2 : Ajouter dans PreviewRenderer

```tsx
// Dans PreviewRenderer.tsx, section Screen 2

{currentScreen === 'screen2' && (
  <div className="flex flex-col items-center justify-center min-h-full space-y-6">
    {/* Modules de l'écran 2 */}
    {modules2.length > 0 && (
      <div className="w-full">
        <ModuleRenderer modules={modules2 as any} previewMode device={previewMode} />
      </div>
    )}

    {/* Roue */}
    {campaign.type === 'wheel' && (
      <StandardizedWheel ... />
    )}

    {/* VOTRE NOUVEAU JEU */}
    {campaign.type === 'mon-nouveau-jeu' && (
      <MonNouveauJeu
        onFinish={handleGameFinish}
        disabled={false}
      />
    )}
  </div>
)}
```

### Étape 3 : C'est tout ! 🎉

Le système gère automatiquement :
- ✅ Navigation entre écrans
- ✅ Affichage du résultat
- ✅ Bouton "Rejouer"
- ✅ Synchronisation avec l'éditeur

## Personnaliser les Écrans

### Screen 1 (Accueil)

Les modules de `screen1` s'affichent automatiquement. Pour personnaliser le bouton "Participer", modifiez vos modules dans l'éditeur.

### Screen 2 (Jeu)

Vous pouvez ajouter des modules de fond qui s'affichent derrière le jeu :

```tsx
// Dans l'éditeur, ajoutez des modules à screen2
// Exemple : titre, description, image de fond, etc.
```

### Screen 3 (Résultat)

Les modules de `screen3` s'affichent automatiquement. Créez différents modules pour "win" et "lose" en utilisant des conditions dans vos modules.

## Gestion du Background

Le background est automatiquement synchronisé depuis l'éditeur :

```tsx
// Le hook useEditorPreviewSync gère tout automatiquement
const { getCanonicalPreviewData } = useEditorPreviewSync();
const canonicalData = getCanonicalPreviewData();
const background = canonicalData.background; // { type: 'color' | 'image', value: string }
```

## Debugging

Pour voir les logs de debug :

```tsx
// Ouvrir la console du navigateur
// Les logs sont préfixés par :
// 🎮 - Actions utilisateur
// 🎯 - Résultats de jeu
// 🔄 - Synchronisation
```

## Exemples

### Exemple 1 : Jeu Simple

```tsx
{campaign.type === 'dice' && (
  <DiceGame
    onFinish={(result) => handleGameFinish(result)}
  />
)}
```

### Exemple 2 : Jeu avec Configuration

```tsx
{campaign.type === 'memory' && (
  <MemoryGame
    cards={campaign.gameConfig?.memory?.cards || []}
    difficulty={campaign.gameConfig?.memory?.difficulty || 'easy'}
    onFinish={handleGameFinish}
  />
)}
```

### Exemple 3 : Jeu avec Animation

```tsx
{campaign.type === 'slot' && (
  <SlotMachine
    symbols={campaign.gameConfig?.slot?.symbols || []}
    onFinish={handleGameFinish}
    onSpin={() => console.log('🎰 Spinning...')}
  />
)}
```

## FAQ

### Q: Comment désactiver le jeu avant une action ?

R: Utilisez la prop `disabled` :

```tsx
const [isReady, setIsReady] = useState(false);

<MonJeu
  disabled={!isReady}
  onFinish={handleGameFinish}
/>
```

### Q: Comment ajouter un formulaire avant le jeu ?

R: Créez un module de formulaire dans screen1 ou utilisez un état local :

```tsx
const [formSubmitted, setFormSubmitted] = useState(false);

{currentScreen === 'screen2' && !formSubmitted && (
  <FormComponent onSubmit={() => setFormSubmitted(true)} />
)}

{currentScreen === 'screen2' && formSubmitted && (
  <MonJeu onFinish={handleGameFinish} />
)}
```

### Q: Comment personnaliser les transitions ?

R: Ajoutez des classes Tailwind avec transitions :

```tsx
<div className="transition-all duration-500 ease-in-out">
  {currentScreen === 'screen1' && <Screen1 />}
</div>
```

## Support

Pour toute question ou problème :
1. Consultez le README.md
2. Vérifiez les logs de la console
3. Regardez les exemples ci-dessus
4. Créez une issue sur GitHub

---

Bon développement ! 🚀
