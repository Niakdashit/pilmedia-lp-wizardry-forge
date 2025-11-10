# 🎰🎫 Intégration du Système de Dotation pour Jackpot et Scratch Card

## ✅ Services Créés

### 1. **JackpotDotationIntegration** (`src/services/JackpotDotationIntegration.ts`)

Service pour déterminer les symboles du Jackpot selon le système de dotation.

#### Fonctionnement

```typescript
const result = await jackpotDotationIntegration.determineJackpotSpin(
  {
    campaignId: '...',
    participantEmail: 'user@example.com',
    participantId: 'user-123'
  },
  ['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣'] // Symboles disponibles
);

// Si GAGNANT
result = {
  shouldWin: true,
  symbols: ['💎', '💎', '💎'], // 3 symboles identiques
  prize: { ... },
  reason: 'WIN_CALENDAR'
}

// Si PERDANT
result = {
  shouldWin: false,
  symbols: ['🍒', '🍋', '🍊'], // 3 symboles différents
  reason: 'LOSE_NO_MATCH'
}
```

#### Logique de Sélection des Symboles

**Symbole Gagnant** (priorité) :
1. `prize.metadata.winningSymbol` (si configuré)
2. `prize.imageUrl` (utiliser l'image comme symbole)
3. Premier symbole "premium" (💎, ⭐, 7️⃣)
4. Premier symbole disponible

**Symboles Perdants** :
- 3 symboles différents choisis aléatoirement

### 2. **ScratchCardDotationIntegration** (`src/services/ScratchCardDotationIntegration.ts`)

Service pour déterminer le contenu de la carte à gratter selon le système de dotation.

#### Fonctionnement

```typescript
const result = await scratchCardDotationIntegration.determineScratchResult(
  {
    campaignId: '...',
    participantEmail: 'user@example.com',
    participantId: 'user-123'
  },
  {
    // Contenu gagnant
    text: 'Félicitations !',
    imageUrl: '/images/win.png',
    customContent: <WinComponent />
  },
  {
    // Contenu perdant
    text: 'Dommage !',
    imageUrl: '/images/lose.png',
    customContent: <LoseComponent />
  }
);

// Si GAGNANT
result = {
  shouldWin: true,
  content: 'iPhone 15 Pro',
  imageUrl: '/prizes/iphone.png',
  prize: { ... },
  reason: 'WIN_CALENDAR'
}

// Si PERDANT
result = {
  shouldWin: false,
  content: 'Dommage !',
  imageUrl: '/images/lose.png',
  reason: 'LOSE_NO_MATCH'
}
```

#### Logique de Sélection du Contenu

**Contenu Gagnant** (priorité) :
1. `prize.imageUrl` + `prize.name`
2. `winningContent.customContent`
3. `winningContent.imageUrl` + `winningContent.text`
4. `winningContent.text` ou texte par défaut

**Contenu Perdant** (priorité) :
1. `losingContent.customContent`
2. `losingContent.imageUrl` + `losingContent.text`
3. `losingContent.text` ou texte par défaut

## 🔧 Intégration dans les Composants

### Jackpot (`SlotMachine.tsx`)

#### Avant
```typescript
const spin = useCallback(() => {
  // ...
  const finals = [0, 1, 2].map(() => 
    symbols[Math.floor(Math.random() * symbols.length)]
  );
  finalsRef.current = finals;
  // ...
}, []);
```

#### Après
```typescript
import { jackpotDotationIntegration } from '@/services/JackpotDotationIntegration';

interface SlotMachineProps {
  // ... props existantes
  participantEmail?: string;
  participantId?: string;
  useDotationSystem?: boolean;
}

const spin = useCallback(async () => {
  // ...
  
  let finals: string[];
  
  if (useDotationSystem && campaign?.id && participantEmail) {
    // Utiliser le système de dotation
    const result = await jackpotDotationIntegration.determineJackpotSpin(
      {
        campaignId: campaign.id,
        participantEmail,
        participantId,
        userAgent: navigator.userAgent
      },
      symbols
    );
    
    finals = result.symbols;
    console.log('🎰 [Jackpot] Dotation result:', result);
  } else {
    // Mode aléatoire (par défaut)
    finals = [0, 1, 2].map(() => 
      symbols[Math.floor(Math.random() * symbols.length)]
    );
  }
  
  finalsRef.current = finals;
  // ...
}, [useDotationSystem, campaign, participantEmail, participantId, symbols]);
```

### Scratch Card (`ScratchCard.tsx`)

#### Avant
```typescript
<ScratchCard
  revealContent={
    <div>Contenu révélé</div>
  }
  onComplete={() => {
    // Déterminer si gagnant ou perdant
  }}
/>
```

#### Après
```typescript
import { scratchCardDotationIntegration } from '@/services/ScratchCardDotationIntegration';

const [revealContent, setRevealContent] = useState<React.ReactNode>(null);

useEffect(() => {
  if (useDotationSystem && campaign?.id && participantEmail) {
    // Déterminer le contenu avant le grattage
    scratchCardDotationIntegration.determineScratchResult(
      {
        campaignId: campaign.id,
        participantEmail,
        participantId,
        userAgent: navigator.userAgent
      },
      {
        // Contenu gagnant
        imageUrl: campaign.scratchCard?.winImage,
        text: campaign.scratchCard?.winText
      },
      {
        // Contenu perdant
        imageUrl: campaign.scratchCard?.loseImage,
        text: campaign.scratchCard?.loseText
      }
    ).then(result => {
      if (result.imageUrl) {
        setRevealContent(
          <div>
            <img src={result.imageUrl} alt={result.shouldWin ? 'Gagné' : 'Perdu'} />
            <p>{result.content}</p>
          </div>
        );
      } else {
        setRevealContent(<div>{result.content}</div>);
      }
    });
  } else {
    // Mode aléatoire
    const isWin = Math.random() < 0.5;
    setRevealContent(
      <div>{isWin ? 'Gagné !' : 'Perdu !'}</div>
    );
  }
}, [useDotationSystem, campaign, participantEmail]);

<ScratchCard
  revealContent={revealContent}
  onComplete={() => {
    console.log('Carte grattée !');
  }}
/>
```

## 📊 Configuration des Lots

### Pour Jackpot

Dans l'éditeur de lot, ajouter dans les métadonnées :

```typescript
{
  id: "prize-001",
  name: "iPhone 15 Pro",
  imageUrl: "/prizes/iphone.png", // Optionnel : image du lot
  metadata: {
    winningSymbol: "💎" // Optionnel : symbole spécifique pour le jackpot
  }
}
```

### Pour Scratch Card

Dans l'éditeur de lot, utiliser l'image du lot :

```typescript
{
  id: "prize-001",
  name: "iPhone 15 Pro",
  imageUrl: "/prizes/iphone.png", // Image affichée sur la carte
  description: "Félicitations ! Vous avez gagné un iPhone 15 Pro !"
}
```

## 🎯 Exemple Complet

### Jackpot

```tsx
<SlotMachine
  campaign={campaign}
  symbols={['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣']}
  participantEmail="user@example.com"
  participantId="user-123"
  useDotationSystem={true}
  onWin={(symbols) => {
    console.log('Gagné avec:', symbols);
  }}
  onLose={() => {
    console.log('Perdu');
  }}
/>
```

### Scratch Card

```tsx
<ScratchCardWrapper
  campaign={campaign}
  participantEmail="user@example.com"
  participantId="user-123"
  useDotationSystem={true}
  winningContent={{
    imageUrl: '/images/win.png',
    text: 'Félicitations !'
  }}
  losingContent={{
    imageUrl: '/images/lose.png',
    text: 'Dommage !'
  }}
/>
```

## 🔄 Flux Complet

### Jackpot

```
1. Participant clique "Jouer"
   ↓
2. SlotMachine.spin() appelé
   ↓
3. jackpotDotationIntegration.determineJackpotSpin()
   ├─ Utilise wheelDotationIntegration.determineWheelSpin()
   ├─ PrizeAttributionEngine détermine si gagnant
   ↓
4. SI GAGNANT:
   ├─ Sélectionne le symbole gagnant (💎, ⭐, ou image du lot)
   ├─ Retourne [symbole, symbole, symbole]
   └─ Les 3 rouleaux affichent le même symbole
   ↓
5. SI PERDANT:
   ├─ Sélectionne 3 symboles différents
   └─ Les 3 rouleaux affichent des symboles différents
   ↓
6. onWin() ou onLose() appelé
   ↓
7. Historique enregistré en base de données
```

### Scratch Card

```
1. Composant monté
   ↓
2. scratchCardDotationIntegration.determineScratchResult()
   ├─ Utilise wheelDotationIntegration.determineWheelSpin()
   ├─ PrizeAttributionEngine détermine si gagnant
   ↓
3. SI GAGNANT:
   ├─ Récupère l'image du lot ou l'image gagnante
   ├─ Prépare le contenu gagnant
   └─ setRevealContent(<WinContent />)
   ↓
4. SI PERDANT:
   ├─ Récupère l'image perdante
   ├─ Prépare le contenu perdant
   └─ setRevealContent(<LoseContent />)
   ↓
5. Participant gratte la carte
   ↓
6. Contenu révélé (déjà déterminé)
   ↓
7. onComplete() appelé
   ↓
8. Historique enregistré en base de données
```

## ⚠️ Points Importants

### 1. Jackpot

- **Symboles identiques** = Gagnant
- **Symboles différents** = Perdant
- Le symbole gagnant peut être configuré dans `prize.metadata.winningSymbol`
- Si le lot a une image, elle peut être utilisée comme symbole

### 2. Scratch Card

- Le contenu est **déterminé AVANT** le grattage
- L'image du lot est affichée si disponible
- Sinon, utiliser les images gagnante/perdante configurées
- Le participant ne peut pas "tricher" en grattant plusieurs fois

### 3. Système de Dotation

- Les deux jeux utilisent le **même système** que la roue
- Même logique d'attribution (calendrier, probabilité, quota, etc.)
- Même anti-fraude (max gains par IP/email/appareil)
- Même historique en base de données

## 📁 Fichiers Créés

1. `src/services/JackpotDotationIntegration.ts`
2. `src/services/ScratchCardDotationIntegration.ts`
3. `INTEGRATION_JACKPOT_SCRATCH.md`

## 🚀 Prochaines Étapes

### Pour Jackpot

1. Modifier `src/components/SlotJackpot/SlotMachine.tsx`
2. Ajouter les props `participantEmail`, `participantId`, `useDotationSystem`
3. Modifier la fonction `spin()` pour utiliser `jackpotDotationIntegration`
4. Tester avec un lot configuré

### Pour Scratch Card

1. Créer un wrapper `ScratchCardWrapper.tsx`
2. Ajouter les props `participantEmail`, `participantId`, `useDotationSystem`
3. Déterminer le contenu avant le montage avec `scratchCardDotationIntegration`
4. Passer le contenu à `<ScratchCard revealContent={...} />`
5. Tester avec un lot configuré

## 🎉 Résultat Final

Avec cette intégration :
- ✅ **Jackpot** : 3 symboles identiques si gagnant, différents si perdant
- ✅ **Scratch Card** : Image/texte gagnant si gagnant, perdant sinon
- ✅ Même système de dotation que la roue
- ✅ Historique et statistiques enregistrés
- ✅ Anti-fraude actif

---

**Date** : 10 Novembre 2025  
**Status** : ✅ **SERVICES CRÉÉS**  
**Prochaine étape** : Intégration dans les composants
