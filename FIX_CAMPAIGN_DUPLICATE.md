# 🔧 Fix: Erreur "campaign already declared"

## ❌ Erreur Rencontrée

```
Identifier 'campaign' has already been declared. (52:2)
```

Dans `src/components/SlotJackpot/SlotMachine.tsx`

## 🔍 Cause

La variable `campaign` était déclarée **deux fois** :

1. **Ligne 52** : Comme prop du composant
2. **Ligne 129** : Récupérée depuis le store avec `useEditorStore`

```typescript
// ❌ Conflit
const SlotMachine = ({ campaign, ... }) => {
  // ...
  const campaign = useEditorStore((s) => s.campaign); // ❌ Redéclaration
}
```

## ✅ Solution Appliquée

### 1. Renommer la Prop

```typescript
// ✅ Renommer la prop
const SlotMachine = ({ 
  campaign: campaignProp,  // ← Renommé
  ...
}) => {
```

### 2. Utiliser la Prop en Priorité

```typescript
// Récupérer depuis le store
const campaignFromStore = useEditorStore?.((s: any) => s.campaign);

// Utiliser la prop en priorité, sinon le store
const campaign = campaignProp || campaignFromStore;
```

### 3. Mettre à Jour les Dépendances

```typescript
}, [
  isSpinning, 
  disabled, 
  hasPlayed, 
  symbols, 
  currentTemplate, 
  finalizeSpin, 
  clearFinishTimers, 
  useDotationSystem, 
  campaign,           // ← Variable fusionnée
  participantEmail, 
  participantId,
  campaignProp        // ← Prop originale
]);
```

## 🎯 Résultat

Maintenant, le composant :
- ✅ Accepte `campaign` comme prop
- ✅ Utilise le store comme fallback
- ✅ Pas de conflit de déclaration
- ✅ Compatible avec le système de dotation

## 📝 Utilisation

```tsx
// Avec prop (prioritaire)
<SlotMachine
  campaign={myCampaign}
  useDotationSystem={true}
  participantEmail="user@example.com"
/>

// Sans prop (utilise le store)
<SlotMachine
  useDotationSystem={true}
  participantEmail="user@example.com"
/>
```

---

**Date** : 10 Novembre 2025  
**Status** : ✅ **CORRIGÉ**
