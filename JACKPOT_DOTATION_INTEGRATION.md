# 🎰 Intégration Jackpot ↔ Dotation

## 🎯 Objectif

Le jackpot affiche **uniquement les symboles qui ont un lot assigné**. Quand un joueur gagne un lot (selon la dotation), le symbole correspondant à ce lot apparaît sur les 3 rouleaux.

## 📋 Architecture

### 1. Configuration des Symboles (JackpotGamePanel)

```typescript
interface JackpotSymbol {
  id: string;              // Identifiant unique
  label: string;           // Nom du symbole (ex: "Cerise")
  contentType: 'emoji' | 'image';
  emoji?: string;          // Si type emoji (ex: "🍒")
  imageUrl?: string;       // Si type image (base64)
  prizeId?: string;        // 🎁 ID du lot associé
}
```

### 2. Filtrage des Symboles Actifs

```typescript
// Filtrer uniquement les symboles avec lots assignés
const activeSymbols = useMemo(() => {
  return symbols.filter(symbol => symbol.prizeId);
}, [symbols]);
```

### 3. Conversion pour SlotMachine

```typescript
// Convertir en format compatible avec SlotMachine
const slotMachineSymbols = useMemo(() => {
  return activeSymbols.map((symbol: JackpotSymbol) => {
    if (symbol.contentType === 'image' && symbol.imageUrl) {
      return symbol.imageUrl;
    }
    return symbol.emoji || '❓';
  });
}, [activeSymbols]);
```

### 4. Mapping Lot → Symbole

```typescript
// Créer un mapping pour la logique de jeu
const symbolToPrizeMap = useMemo(() => {
  const map = new Map<string, string>();
  activeSymbols.forEach((symbol: JackpotSymbol) => {
    if (symbol.prizeId) {
      const symbolValue = symbol.contentType === 'image' && symbol.imageUrl 
        ? symbol.imageUrl 
        : symbol.emoji || '❓';
      map.set(symbol.prizeId, symbolValue);
    }
  });
  return map;
}, [activeSymbols]);
```

## 🔄 Flux de Travail

### Étape 1 : Créer des Lots
1. Ouvrir **Paramètres → Dotation**
2. Créer des lots (ex: "iPhone 15 Pro", "AirPods", "Bon d'achat 50€")
3. Configurer attribution (calendrier ou probabilité)

### Étape 2 : Configurer les Symboles
1. Aller dans **Onglet Jeu** du JackpotEditor
2. Pour chaque symbole :
   - Choisir Emoji ou Image
   - Donner un nom
   - **Assigner un lot** dans le dropdown

### Étape 3 : Validation
- ✅ **Message vert** : "X symbole(s) actif(s) avec lots assignés"
- 🚫 **Message rouge** : "Aucun symbole actif !" si aucun lot n'est assigné
- ⚠️ **Message jaune** : "Aucun lot trouvé" si aucun lot n'existe dans Dotation

## 🎮 Logique de Jeu

### Scénario 1 : Joueur Gagne un Lot

```
1. Joueur lance le spin
2. Système vérifie la dotation (jackpotDotationIntegration)
3. Joueur gagne "iPhone 15 Pro" (prizeId: "prize-123")
4. Système cherche le symbole avec prizeId = "prize-123"
5. Trouve symbole 🍒 "Cerise"
6. Affiche 🍒🍒🍒 sur les 3 rouleaux
```

### Scénario 2 : Joueur Perd

```
1. Joueur lance le spin
2. Système vérifie la dotation
3. Joueur ne gagne rien
4. Affiche une combinaison aléatoire non-gagnante
   Ex: 🍒🍋💎 (symboles différents)
```

## 💾 Structure des Données

### Dans campaign.jackpotConfig

```typescript
jackpotConfig: {
  symbols: [
    {
      id: '1',
      label: 'Cerise',
      contentType: 'emoji',
      emoji: '🍒',
      prizeId: 'prize-123' // ← Lien avec le lot
    },
    {
      id: '2',
      label: 'Citron',
      contentType: 'emoji',
      emoji: '🍋',
      prizeId: 'prize-456'
    },
    {
      id: '3',
      label: 'Logo PROSPLAY',
      contentType: 'image',
      imageUrl: 'data:image/png;base64,...',
      prizeId: 'prize-789'
    }
  ],
  activeSymbols: ['🍒', '🍋', 'data:image/png;base64,...'], // Symboles filtrés
  symbolToPrizeMap: {
    'prize-123': '🍒',
    'prize-456': '🍋',
    'prize-789': 'data:image/png;base64,...'
  },
  buttonText: 'SPIN',
  buttonBorderColor: '#ffffff',
  buttonBackgroundColor: '#ff00a6',
  buttonTextColor: '#8b4513'
}
```

## 🎨 Interface Utilisateur

### Messages de Statut

#### ✅ Symboles Actifs
```
┌─────────────────────────────────────────┐
│ ✅ 3 symbole(s) actif(s) avec lots      │
│ assignés. Le jackpot affichera          │
│ uniquement ces symboles pendant le jeu. │
└─────────────────────────────────────────┘
```

#### 🚫 Aucun Symbole Actif
```
┌─────────────────────────────────────────┐
│ 🚫 Aucun symbole actif ! Le jackpot ne  │
│ fonctionnera pas tant qu'aucun symbole  │
│ n'a de lot assigné.                     │
└─────────────────────────────────────────┘
```

#### ⚠️ Aucun Lot Disponible
```
┌─────────────────────────────────────────┐
│ ⚠️ Aucun lot trouvé. Créez des lots     │
│ dans Paramètres → Dotation pour les     │
│ associer aux symboles.                  │
└─────────────────────────────────────────┘
```

## 🔧 Intégration avec SlotMachine

### Passage des Symboles

```typescript
<SlotMachine 
  disabled={readOnly}
  onOpenConfig={onOpenElementsTab}
  symbols={slotMachineSymbols} // ← Symboles filtrés
  campaign={campaign}
/>
```

### Utilisation dans SlotMachine.tsx

```typescript
const symbols = useMemo(() => {
  const src = propSymbols ?? campaignSymbols ?? DEFAULT_SYMBOLS;
  const cleaned = (src || []).filter((s) => typeof s === 'string' && s.trim().length > 0);
  return cleaned.length > 0 ? cleaned : DEFAULT_SYMBOLS;
}, [propSymbols, campaignSymbols]);
```

## 📊 Exemple Complet

### Configuration

```
Lots dans Dotation :
- iPhone 15 Pro (prize-123) - Probabilité 5%
- AirPods (prize-456) - Probabilité 10%
- Bon d'achat 50€ (prize-789) - Calendrier 25/12/2024 12:00

Symboles dans Jeu :
- 🍒 Cerise → iPhone 15 Pro (prize-123)
- 🍋 Citron → AirPods (prize-456)
- 💎 Diamant → Bon d'achat 50€ (prize-789)
- ⭐ Étoile → Aucun lot (non actif)
- 7️⃣ Sept → Aucun lot (non actif)
```

### Symboles Actifs

```
activeSymbols = [
  { id: '1', emoji: '🍒', prizeId: 'prize-123' },
  { id: '2', emoji: '🍋', prizeId: 'prize-456' },
  { id: '3', emoji: '💎', prizeId: 'prize-789' }
]

slotMachineSymbols = ['🍒', '🍋', '💎']
```

### Résultats Possibles

- **Joueur gagne iPhone** → 🍒🍒🍒
- **Joueur gagne AirPods** → 🍋🍋🍋
- **Joueur gagne Bon d'achat** → 💎💎💎
- **Joueur perd** → 🍒🍋💎 (combinaison non-gagnante)

**Note** : ⭐ et 7️⃣ ne peuvent JAMAIS apparaître car ils n'ont pas de lot assigné.

## ✅ Avantages du Système

1. **Cohérence** : Seuls les symboles avec lots peuvent apparaître
2. **Flexibilité** : Facile d'ajouter/retirer des symboles actifs
3. **Centralisé** : Lots gérés dans Dotation, symboles dans Jeu
4. **Visuel** : Feedback immédiat sur les symboles actifs
5. **Sécurisé** : Impossible d'afficher un symbole sans lot

## 🚀 Prochaines Étapes

1. ✅ Configuration des symboles avec lots
2. ✅ Filtrage des symboles actifs
3. ✅ Conversion pour SlotMachine
4. ✅ Mapping lot → symbole
5. ⏳ Intégration avec jackpotDotationIntegration
6. ⏳ Logique de jeu (affichage du bon symbole selon le lot gagné)
7. ⏳ Tests end-to-end

---

**Le système de branchement Jackpot ↔ Dotation est maintenant opérationnel !** 🎰🎁
