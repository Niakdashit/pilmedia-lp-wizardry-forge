# 🎯 Système d'Attribution des Lots - Guide Complet

## 📋 Vue d'Ensemble

Système professionnel d'attribution des lots pour les jeux Jackpot, Roue de la Fortune et Carte à Gratter, basé sur les meilleures pratiques de l'industrie du gaming et des loteries en ligne.

## 🏗️ Architecture

### 1. Types TypeScript (`src/types/dotation.ts`)
- **5 méthodes d'attribution** : Calendrier, Probabilité, Quota, Rang, Gain Instantané
- **Système anti-fraude** : Limites par IP, email, appareil
- **Historique complet** : Traçabilité de toutes les attributions
- **Statistiques en temps réel** : Taux d'attribution, taux de gain, etc.

### 2. Base de Données Supabase

#### Tables créées:
- `dotation_configs` : Configuration de dotation par campagne
- `attribution_history` : Historique de toutes les attributions
- `dotation_stats` : Statistiques en temps réel

#### Fonctionnalités:
- **Triggers automatiques** : Mise à jour des stats après chaque attribution
- **Row Level Security (RLS)** : Sécurité au niveau des lignes
- **Indexes optimisés** : Performance maximale

### 3. Moteur d'Attribution (`src/services/PrizeAttributionEngine.ts`)

Algorithmes professionnels basés sur:
- **Provably Fair Gaming** (Bitcoin Casinos)
- **Google Lottery System**
- **Amazon Giveaway Algorithm**

## 🎲 Méthodes d'Attribution

### 1. Attribution par Calendrier 📅
**Principe**: Le lot est attribué à une date et heure précises.

**Configuration**:
```typescript
{
  method: 'calendar',
  scheduledDate: '2025-12-25',
  scheduledTime: '12:00',
  timeWindow: 5  // ±5 minutes
}
```

**Cas d'usage**: 
- Événements spéciaux (Noël, Black Friday)
- Lots premium à heure fixe
- Campagnes marketing programmées

### 2. Attribution Probabiliste 🎲
**Principe**: Chaque participant a X% de chance de gagner.

**Configuration**:
```typescript
{
  method: 'probability',
  winProbability: 10,  // 10% de chance
  maxWinners: 100,     // Max 100 gagnants
  distribution: 'uniform'
}
```

**Algorithme**: Utilise `crypto.getRandomValues()` pour un aléatoire cryptographiquement sûr.

**Cas d'usage**:
- Lots nombreux (goodies, codes promo)
- Distribution équitable
- Contrôle du taux de gain

### 3. Attribution par Quota 👥
**Principe**: X gagnants sur Y participants.

**Configuration**:
```typescript
{
  method: 'quota',
  winnersCount: 10,
  totalParticipants: 1000,
  selectionStrategy: 'random' | 'first' | 'last' | 'distributed'
}
```

**Stratégies**:
- `random`: Sélection aléatoire avec probabilité dynamique
- `first`: Les X premiers gagnent
- `last`: Les X derniers gagnent
- `distributed`: Distribution uniforme (tous les N participants)

**Cas d'usage**:
- Campagnes avec budget fixe
- Lots limités de grande valeur
- Contrôle précis du nombre de gagnants

### 4. Attribution par Rang 🏆
**Principe**: Le Nième participant gagne.

**Configuration**:
```typescript
{
  method: 'rank',
  winningRanks: [100, 500, 1000],
  tolerance: 2  // ±2 participants
}
```

**Cas d'usage**:
- Milestones (100ème, 1000ème participant)
- Gamification (rangs spéciaux)
- Événements communautaires

### 5. Gain Instantané 🎁
**Principe**: Tous les participants gagnent (dans la limite du stock).

**Configuration**:
```typescript
{
  method: 'instant_win',
  guaranteed: true
}
```

**Cas d'usage**:
- Codes promo illimités
- Lots virtuels (ebooks, PDFs)
- Campagnes de fidélisation

## 🛡️ Système Anti-Fraude

### Limites configurables:
```typescript
antiFraud: {
  maxWinsPerIP: 1,           // Max 1 gain par IP
  maxWinsPerEmail: 1,        // Max 1 gain par email
  maxWinsPerDevice: 1,       // Max 1 gain par appareil
  verificationPeriod: 24     // Période de vérification (heures)
}
```

### Tracking:
- **IP Address**: Détection multi-comptes
- **Email**: Validation unicité
- **Device Fingerprint**: Empreinte unique de l'appareil
- **User Agent**: Détection de bots

## 📊 Statistiques en Temps Réel

### Métriques disponibles:
- Nombre total de lots
- Quantité totale disponible
- Quantité attribuée
- Quantité restante
- **Taux d'attribution** (%)
- Nombre total de participants
- Nombre total de gagnants
- **Taux de gain** (%)
- Statistiques par lot

### Mise à jour automatique:
Les statistiques sont mises à jour automatiquement via un trigger PostgreSQL après chaque attribution.

## 🔧 Installation

### 1. Appliquer la migration Supabase

```bash
# Via Supabase CLI
supabase db push

# Ou via le Dashboard Supabase
# SQL Editor > Copier le contenu de:
# supabase/migrations/20251110000000_create_dotation_system.sql
```

### 2. Vérifier les tables

```sql
-- Vérifier que les tables existent
SELECT * FROM dotation_configs LIMIT 1;
SELECT * FROM attribution_history LIMIT 1;
SELECT * FROM dotation_stats LIMIT 1;
```

## 💻 Utilisation dans le Code

### 1. Créer une configuration de dotation

```typescript
import { supabase } from '@/integrations/supabase/client';
import { DotationConfig } from '@/types/dotation';

const config: DotationConfig = {
  campaignId: 'campaign-123',
  prizes: [
    {
      id: 'prize-1',
      name: 'iPhone 15 Pro',
      totalQuantity: 1,
      awardedQuantity: 0,
      attribution: {
        method: 'calendar',
        scheduledDate: '2025-12-25',
        scheduledTime: '12:00'
      },
      status: 'active'
    }
  ],
  antiFraud: {
    maxWinsPerIP: 1,
    maxWinsPerEmail: 1
  }
};

// Sauvegarder
await supabase.from('dotation_configs').insert({
  campaign_id: config.campaignId,
  prizes: config.prizes,
  anti_fraud: config.antiFraud
});
```

### 2. Attribuer un lot

```typescript
import { createAttributionEngine } from '@/services/PrizeAttributionEngine';

// Créer le moteur
const engine = await createAttributionEngine('campaign-123');

if (engine) {
  // Attribuer un lot
  const result = await engine.attributePrize({
    campaignId: 'campaign-123',
    participantEmail: 'user@example.com',
    ipAddress: '192.168.1.1',
    timestamp: new Date().toISOString()
  });

  if (result.isWinner) {
    console.log('🎉 Gagnant!', result.prize);
  } else {
    console.log('❌ Perdu:', result.reason);
  }
}
```

### 3. Récupérer les statistiques

```typescript
const { data: stats } = await supabase
  .from('dotation_stats')
  .select('*')
  .eq('campaign_id', 'campaign-123')
  .single();

console.log(`Taux de gain: ${stats.win_rate}%`);
console.log(`Lots restants: ${stats.total_remaining}`);
```

## 🎮 Intégration dans les Jeux

### Roue de la Fortune

```typescript
// Dans SmartWheelWrapper.tsx
import { createAttributionEngine } from '@/services/PrizeAttributionEngine';

const handleSpinComplete = async (winningSegment) => {
  const engine = await createAttributionEngine(campaignId);
  
  if (engine) {
    const result = await engine.attributePrize({
      campaignId,
      participantEmail: userEmail,
      ipAddress: await getUserIP(),
      timestamp: new Date().toISOString()
    });

    if (result.isWinner) {
      // Afficher le lot gagné
      showWinningPrize(result.prize);
    } else {
      // Afficher message de perte
      showLoseMessage();
    }
  }
};
```

### Jackpot

```typescript
// Dans JackpotGame.tsx
const handleJackpotSpin = async () => {
  const engine = await createAttributionEngine(campaignId);
  
  const result = await engine.attributePrize({
    campaignId,
    participantEmail: userEmail,
    timestamp: new Date().toISOString()
  });

  // Animer le jackpot selon le résultat
  animateJackpot(result.isWinner);
};
```

### Carte à Gratter

```typescript
// Dans ScratchCard.tsx
const handleScratchComplete = async () => {
  const engine = await createAttributionEngine(campaignId);
  
  const result = await engine.attributePrize({
    campaignId,
    participantEmail: userEmail,
    timestamp: new Date().toISOString()
  });

  // Révéler le résultat sous la carte
  revealResult(result.isWinner ? result.prize : null);
};
```

## 📱 Interface Utilisateur (DotationPanel)

### Onglet "Dotation" dans les Paramètres de Campagne

**Fonctionnalités**:
- ✅ Liste des lots avec progression
- ✅ Ajout/Modification/Suppression de lots
- ✅ Configuration de la méthode d'attribution
- ✅ Paramètres anti-fraude
- ✅ Notifications admin
- ✅ Statistiques en temps réel

**Accès**: 
Paramètres de la campagne > Onglet "Dotation"

## 🔒 Sécurité

### Row Level Security (RLS)
- Les utilisateurs ne peuvent voir que leurs propres configurations
- Les utilisateurs ne peuvent modifier que leurs propres campagnes
- L'historique est accessible uniquement au propriétaire de la campagne

### Anti-Fraude
- Détection multi-comptes (IP, email, device)
- Limites configurables par période
- Historique complet pour audit

### Aléatoire Cryptographique
- Utilisation de `crypto.getRandomValues()`
- Pas de `Math.random()` pour les attributions
- Provably fair gaming

## 📈 Bonnes Pratiques

### 1. Définir des quotas réalistes
```typescript
// ❌ Mauvais: Trop généreux
{ method: 'probability', winProbability: 90 }

// ✅ Bon: Équilibré
{ method: 'probability', winProbability: 10, maxWinners: 100 }
```

### 2. Utiliser l'anti-fraude
```typescript
// ✅ Toujours activer l'anti-fraude
antiFraud: {
  maxWinsPerIP: 1,
  maxWinsPerEmail: 1,
  maxWinsPerDevice: 1,
  verificationPeriod: 24
}
```

### 3. Monitorer les statistiques
```typescript
// Vérifier régulièrement les stats
const stats = await getStats(campaignId);
if (stats.win_rate > 50) {
  console.warn('⚠️ Taux de gain trop élevé!');
}
```

### 4. Tester avant le lancement
```typescript
// Créer une campagne de test
const testConfig = {
  ...config,
  prizes: config.prizes.map(p => ({
    ...p,
    totalQuantity: 1000 // Quantité élevée pour tests
  }))
};
```

## 🚀 Prochaines Étapes

1. ✅ Appliquer la migration Supabase
2. ✅ Créer l'onglet "Dotation" dans CampaignSettingsModal
3. ✅ Intégrer dans les 3 jeux (Wheel, Jackpot, Scratch)
4. ✅ Tester avec des campagnes réelles
5. ✅ Monitorer les performances

## 📞 Support

Pour toute question ou problème:
- Consulter les logs dans la console (`🎯 [PrizeAttribution]`)
- Vérifier l'historique dans `attribution_history`
- Analyser les statistiques dans `dotation_stats`

---

**Version**: 1.0.0  
**Date**: 10 Novembre 2025  
**Auteur**: Système d'Attribution Professionnel
