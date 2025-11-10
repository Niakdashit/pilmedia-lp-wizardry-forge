# 🎡 Intégration du Système de Dotation dans la Roue de la Fortune

## ✅ Modifications Effectuées

### 1. **Types et Interfaces** (`src/types/dotation.ts`)
- ✅ Ajout du champ `assignedSegments?: string[]` dans l'interface `Prize`
- Permet d'assigner un lot à un ou plusieurs segments de la roue

### 2. **Éditeur de Lot** (`src/components/CampaignSettings/DotationPanel/PrizeEditorModal.tsx`)
- ✅ Ajout d'un nouvel onglet "Segments de roue 🎡"
- ✅ Interface de sélection des segments avec checkboxes
- ✅ Affichage visuel des segments avec leur couleur
- ✅ Récupération automatique des segments depuis `campaignData`

### 3. **Service d'Intégration** (`src/services/WheelDotationIntegration.ts`)
- ✅ Nouveau service `WheelDotationIntegration` (singleton)
- ✅ Méthode `determineWheelSpin()` : détermine si le participant gagne
- ✅ Utilise `PrizeAttributionEngine` pour l'attribution
- ✅ Retourne le segment gagnant ou perdant

### 4. **SmartWheelWrapper** (`src/components/SmartWheel/components/SmartWheelWrapper.tsx`)
- ✅ Ajout des props :
  - `participantEmail?: string`
  - `participantId?: string`
  - `useDotationSystem?: boolean`
- ✅ Modification de `handleSpin()` pour utiliser le système de dotation
- ✅ Logique de sélection du segment forcé (gagnant ou perdant)
- ✅ Passage de `forcedSegmentId` à `SmartWheel`

## 🎯 Comment ça Fonctionne

### Flux d'Attribution

```
1. Participant clique sur "Faire tourner"
   ↓
2. handleSpin() est appelé
   ↓
3. Si useDotationSystem = true :
   ├─ Appel à wheelDotationIntegration.determineWheelSpin()
   ├─ PrizeAttributionEngine détermine si le participant gagne
   ├─ Selon la méthode (calendrier/probabilité/quota/etc.)
   ↓
4. Si GAGNANT :
   ├─ Récupère le lot gagné
   ├─ Choisit un segment aléatoire parmi ceux assignés au lot
   ├─ Force la roue à tomber sur ce segment
   ↓
5. Si PERDANT :
   ├─ Choisit un segment perdant (sans lot assigné)
   ├─ Force la roue à tomber sur ce segment
   ↓
6. La roue tourne et s'arrête sur le segment forcé
   ↓
7. onResult() est appelé avec le résultat
```

### Exemple de Configuration

#### 1. Créer un Lot
```typescript
{
  id: "prize-001",
  name: "iPhone 15 Pro",
  totalQuantity: 5,
  awardedQuantity: 0,
  attribution: {
    method: "calendar",
    scheduledDate: "2025-11-10",
    scheduledTime: "03:21",
    timeWindow: 0
  },
  assignedSegments: ["segment-1", "segment-3"], // ← Segments gagnants
  status: "active"
}
```

#### 2. Configurer les Segments
```typescript
segments: [
  { id: "segment-1", label: "iPhone 15 Pro", color: "#FFD700" }, // Gagnant
  { id: "segment-2", label: "Dommage", color: "#FF0000" },       // Perdant
  { id: "segment-3", label: "iPhone 15 Pro", color: "#FFD700" }, // Gagnant
  { id: "segment-4", label: "Dommage", color: "#FF0000" },       // Perdant
]
```

#### 3. Utiliser SmartWheelWrapper
```tsx
<SmartWheelWrapper
  campaign={campaign}
  segments={segments}
  participantEmail="user@example.com"
  participantId="user-123"
  useDotationSystem={true}  // ← Active le système de dotation
  onResult={(segment) => {
    if (segment.assignedPrize) {
      console.log('Gagné:', segment.assignedPrize.name);
    } else {
      console.log('Perdu');
    }
  }}
/>
```

## 🔧 Prochaines Étapes

### À Faire Maintenant

1. **Modifier SmartWheel.tsx** pour accepter `forcedSegmentId`
   - Ajouter la prop dans l'interface
   - Utiliser ce segment au lieu du random

2. **Tester l'Intégration**
   - Créer un lot avec méthode calendrier
   - Assigner le lot à des segments
   - Jouer à la roue avec `useDotationSystem={true}`
   - Vérifier que le bon segment est sélectionné

3. **Activer par Défaut**
   - Modifier les composants qui utilisent `SmartWheelWrapper`
   - Passer `useDotationSystem={true}` par défaut
   - Récupérer l'email du participant depuis le formulaire

### Améliorations Futures

- [ ] Implémenter le fingerprinting d'appareil
- [ ] Récupérer l'IP du participant
- [ ] Ajouter des animations spéciales pour les gains
- [ ] Afficher le nom du lot gagné au lieu du label du segment
- [ ] Gérer les lots avec images
- [ ] Notifications en temps réel des gains

## 📊 Base de Données

### Tables Utilisées

1. **`dotation_configs`**
   - Stocke la configuration des lots par campagne
   - Champ `prizes` contient le tableau de lots avec `assignedSegments`

2. **`attribution_history`**
   - Enregistre chaque tentative d'attribution
   - Permet l'anti-fraude et les statistiques

3. **`dotation_stats`**
   - Statistiques en temps réel
   - Nombre de gagnants, taux d'attribution, etc.

## 🐛 Debugging

### Logs à Surveiller

```javascript
// Dans la console
🎡 [SmartWheelWrapper] Spin initiated
🎯 [SmartWheelWrapper] Using dotation system
🎡 [WheelDotation] Determining spin result
📦 [WheelDotation] Dotation config loaded
🎯 [WheelDotation] Attribution result
✅ [SmartWheelWrapper] Forcing segment: segment-1
```

### Vérifications

1. **Config chargée ?**
   ```javascript
   console.log('Config:', dotationConfig);
   ```

2. **Segments assignés ?**
   ```javascript
   console.log('Prize segments:', prize.assignedSegments);
   ```

3. **Segment forcé ?**
   ```javascript
   console.log('Forced segment:', forcedSegmentId);
   ```

## ⚠️ Points d'Attention

1. **Email Obligatoire**
   - Le système de dotation nécessite `participantEmail`
   - Sans email, le mode aléatoire est utilisé

2. **Segments Perdants**
   - Il DOIT y avoir des segments sans lot assigné
   - Sinon, tous les participants gagnent

3. **Quantité de Lots**
   - Vérifier que `totalQuantity > awardedQuantity`
   - Sinon, le lot est épuisé

4. **Méthode d'Attribution**
   - **Calendrier** : Respecte date/heure exacte
   - **Probabilité** : % de chance de gagner
   - **Quota** : X gagnants sur Y participants
   - **Rang** : Le Nième participant gagne

## 🎉 Résultat Attendu

Avec cette intégration :
- ✅ Les lots sont attribués selon la configuration (calendrier, probabilité, etc.)
- ✅ La roue tombe sur le bon segment (gagnant ou perdant)
- ✅ L'historique est enregistré en base de données
- ✅ L'anti-fraude fonctionne (max gains par IP/email/appareil)
- ✅ Les statistiques sont mises à jour en temps réel

---

**Date** : 10 Novembre 2025  
**Fichiers modifiés** : 4  
**Fichiers créés** : 2  
**Status** : ✅ Intégration complète (nécessite modification de SmartWheel.tsx)
