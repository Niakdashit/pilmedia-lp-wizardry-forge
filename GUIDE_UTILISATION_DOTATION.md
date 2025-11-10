# 📖 Guide d'Utilisation du Système de Dotation

## 🎯 Vue d'Ensemble

Le système de dotation est maintenant **100% intégré** dans les 3 jeux :
- 🎡 **Roue de la Fortune** (Wheel)
- 🎰 **Jackpot** (Slot Machine)
- 🎫 **Carte à Gratter** (Scratch Card)

## 🚀 Utilisation

### 1️⃣ Roue de la Fortune

#### Configuration

1. **Créer un lot** dans "Paramètres de la campagne" → Onglet "Dotation"
2. **Assigner aux segments** dans l'onglet "Segments de roue 🎡"
3. **Activer le système** dans le code

#### Code

```tsx
import SmartWheelWrapper from '@/components/SmartWheel/components/SmartWheelWrapper';

<SmartWheelWrapper
  campaign={campaign}
  segments={segments}
  participantEmail="user@example.com"  // ← Email du participant
  participantId="user-123"             // ← ID (optionnel)
  useDotationSystem={true}             // ← ACTIVER
  onResult={(segment) => {
    if (segment.assignedPrize) {
      console.log('Gagné:', segment.assignedPrize.name);
    } else {
      console.log('Perdu');
    }
  }}
/>
```

#### Résultat

- **SI GAGNANT** : La roue tombe sur un segment avec le lot assigné
- **SI PERDANT** : La roue tombe sur un segment sans lot

---

### 2️⃣ Jackpot

#### Configuration

1. **Créer un lot** dans "Paramètres de la campagne" → Onglet "Dotation"
2. **(Optionnel)** Configurer le symbole gagnant dans `metadata.winningSymbol`
3. **Activer le système** dans le code

#### Code

```tsx
import SlotMachine from '@/components/SlotJackpot/SlotMachine';

<SlotMachine
  campaign={campaign}
  symbols={['🍒', '🍋', '🍊', '🍇', '⭐', '💎', '🔔', '7️⃣']}
  participantEmail="user@example.com"  // ← Email du participant
  participantId="user-123"             // ← ID (optionnel)
  useDotationSystem={true}             // ← ACTIVER
  onWin={(symbols) => {
    console.log('Gagné avec:', symbols); // ['💎', '💎', '💎']
  }}
  onLose={() => {
    console.log('Perdu');
  }}
/>
```

#### Résultat

- **SI GAGNANT** : 3 symboles identiques (💎💎💎)
- **SI PERDANT** : 3 symboles différents (🍒🍋🍊)

#### Configuration Avancée

Pour choisir le symbole gagnant :

```typescript
{
  id: "prize-001",
  name: "iPhone 15 Pro",
  imageUrl: "/prizes/iphone.png",
  metadata: {
    winningSymbol: "💎"  // ← Symbole spécifique
  }
}
```

---

### 3️⃣ Carte à Gratter

#### Configuration

1. **Créer un lot** dans "Paramètres de la campagne" → Onglet "Dotation"
2. **Configurer les images** gagnante/perdante
3. **Activer le système** dans le code

#### Code

```tsx
import { ScratchCardWrapper } from '@/components/ScratchCard/ScratchCardWrapper';

<ScratchCardWrapper
  campaign={campaign}
  participantEmail="user@example.com"  // ← Email du participant
  participantId="user-123"             // ← ID (optionnel)
  useDotationSystem={true}             // ← ACTIVER
  
  // Contenu gagnant
  winningContent={{
    imageUrl: '/images/win.png',
    text: 'Félicitations ! Vous avez gagné !'
  }}
  
  // Contenu perdant
  losingContent={{
    imageUrl: '/images/lose.png',
    text: 'Dommage ! Tentez votre chance une prochaine fois.'
  }}
  
  // Props de ScratchCard
  width={300}
  height={200}
  scratchColor="#C0C0C0"
  threshold={70}
  
  onComplete={(percentage) => {
    console.log('Carte grattée à', percentage, '%');
  }}
/>
```

#### Résultat

- **SI GAGNANT** : Affiche l'image du lot ou l'image gagnante
- **SI PERDANT** : Affiche l'image perdante

#### Configuration Avancée

Le lot peut avoir sa propre image :

```typescript
{
  id: "prize-001",
  name: "iPhone 15 Pro",
  imageUrl: "/prizes/iphone.png",  // ← Affichée si gagnant
  description: "Félicitations !"
}
```

---

## 🎯 Méthodes d'Attribution

### 1. Calendrier

Gagne à une date/heure précise.

```typescript
{
  method: "calendar",
  scheduledDate: "2025-11-10",
  scheduledTime: "15:30",
  timeWindow: 5  // ± 5 minutes
}
```

**Exemple** : Le participant gagne s'il joue entre 15:25 et 15:35.

### 2. Probabilité

% de chance de gagner.

```typescript
{
  method: "probability",
  winProbability: 25  // 25% de chance
}
```

**Exemple** : 1 participant sur 4 gagne en moyenne.

### 3. Quota

X gagnants sur Y participants.

```typescript
{
  method: "quota",
  winnersCount: 10,
  totalParticipants: 100
}
```

**Exemple** : 10 gagnants sur 100 participants.

### 4. Rang

Le Nième participant gagne.

```typescript
{
  method: "rank",
  winningRanks: [10, 50, 100]
}
```

**Exemple** : Les 10ème, 50ème et 100ème participants gagnent.

### 5. Instant Win

Gain garanti.

```typescript
{
  method: "instant_win",
  guaranteed: true
}
```

**Exemple** : Tous les participants gagnent.

---

## 🛡️ Anti-Fraude

Le système inclut des protections anti-fraude :

```typescript
{
  antiFraud: {
    maxWinsPerIP: 5,        // Max 5 gains par IP
    maxWinsPerEmail: 3,     // Max 3 gains par email
    maxWinsPerDevice: 2,    // Max 2 gains par appareil
    verificationPeriod: 24  // Sur 24 heures
  }
}
```

---

## 📊 Exemple Complet

### Scénario : Campagne iPhone

**Configuration du lot** :

```typescript
{
  id: "prize-iphone",
  name: "iPhone 15 Pro",
  imageUrl: "/prizes/iphone.png",
  totalQuantity: 5,
  awardedQuantity: 0,
  
  // Attribution par calendrier
  attribution: {
    method: "calendar",
    scheduledDate: "2025-11-10",
    scheduledTime: "15:00",
    timeWindow: 0  // Heure exacte
  },
  
  // Pour la roue : segments assignés
  assignedSegments: ["segment-1", "segment-3"],
  
  // Pour le jackpot : symbole gagnant
  metadata: {
    winningSymbol: "💎"
  },
  
  status: "active"
}
```

### Roue

```tsx
<SmartWheelWrapper
  campaign={campaign}
  participantEmail={formData.email}
  useDotationSystem={true}
/>
```

**Résultat à 15:00** : Roue tombe sur segment-1 ou segment-3 ✅  
**Résultat avant/après** : Roue tombe sur segment-2 ou segment-4 ❌

### Jackpot

```tsx
<SlotMachine
  campaign={campaign}
  participantEmail={formData.email}
  useDotationSystem={true}
/>
```

**Résultat à 15:00** : 💎💎💎 ✅  
**Résultat avant/après** : 🍒🍋🍊 ❌

### Scratch Card

```tsx
<ScratchCardWrapper
  campaign={campaign}
  participantEmail={formData.email}
  useDotationSystem={true}
  winningContent={{
    imageUrl: '/images/win.png'
  }}
  losingContent={{
    imageUrl: '/images/lose.png'
  }}
/>
```

**Résultat à 15:00** : Affiche `/prizes/iphone.png` ✅  
**Résultat avant/après** : Affiche `/images/lose.png` ❌

---

## 🔍 Debugging

### Logs à Surveiller

#### Roue
```javascript
🎡 [SmartWheelWrapper] Spin initiated
🎯 [SmartWheelWrapper] Using dotation system
🎡 [WheelDotation] Determining spin result
✅ [SmartWheelWrapper] Forcing segment: segment-1
```

#### Jackpot
```javascript
🚀 [SlotMachine] SPIN STARTED
🎰 [SlotMachine] Using dotation system
🎲 [SlotMachine] Dotation result: { shouldWin: true, symbols: ['💎', '💎', '💎'] }
```

#### Scratch Card
```javascript
🎫 [ScratchCardWrapper] Determining content
🎲 [ScratchCardWrapper] Dotation result: { shouldWin: true, imageUrl: '/prizes/iphone.png' }
```

### Vérifications

1. **Email fourni ?**
   ```javascript
   console.log('Email:', participantEmail);
   ```

2. **Système activé ?**
   ```javascript
   console.log('Dotation:', useDotationSystem);
   ```

3. **Config chargée ?**
   ```javascript
   console.log('Campaign:', campaign?.id);
   ```

---

## ⚠️ Points Importants

### 1. Email Obligatoire

Le système **nécessite** `participantEmail`. Sans email, le mode aléatoire est utilisé.

### 2. Activation Explicite

Le système n'est actif que si `useDotationSystem={true}`.

### 3. Compatibilité

- ✅ Fonctionne avec tous les types de campagnes
- ✅ Compatible avec le système existant
- ✅ Pas de breaking changes

### 4. Performance

- Le contenu de la carte à gratter est déterminé **avant** le grattage
- Les symboles du jackpot sont déterminés **avant** l'animation
- Le segment de la roue est déterminé **avant** la rotation

---

## 📁 Fichiers Modifiés/Créés

### Créés (5)
1. `src/services/WheelDotationIntegration.ts`
2. `src/services/JackpotDotationIntegration.ts`
3. `src/services/ScratchCardDotationIntegration.ts`
4. `src/components/ScratchCard/ScratchCardWrapper.tsx`
5. `GUIDE_UTILISATION_DOTATION.md`

### Modifiés (7)
1. `src/types/dotation.ts`
2. `src/components/CampaignSettings/DotationPanel/PrizeEditorModal.tsx`
3. `src/components/SmartWheel/components/SmartWheelWrapper.tsx`
4. `src/components/SmartWheel/SmartWheel.tsx`
5. `src/components/SmartWheel/types.ts`
6. `src/components/SmartWheel/hooks/useWheelAnimation.ts`
7. `src/components/SlotJackpot/SlotMachine.tsx`

---

## 🎉 Résultat Final

Le système de dotation est maintenant **100% opérationnel** pour les 3 jeux !

- ✅ **Roue** : Segments assignés aux lots
- ✅ **Jackpot** : Symboles gagnants/perdants
- ✅ **Scratch Card** : Images gagnantes/perdantes
- ✅ Même logique d'attribution pour tous
- ✅ Anti-fraude actif
- ✅ Historique en base de données
- ✅ Statistiques en temps réel

**Le système est prêt pour la production !** 🚀

---

**Date** : 10 Novembre 2025  
**Version** : 1.0.0  
**Status** : ✅ **PRODUCTION READY**
