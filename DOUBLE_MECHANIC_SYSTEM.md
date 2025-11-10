# 🎯 Système de Double Mécanique - Documentation Complète

## Vue d'ensemble

Le système de double mécanique permet de gérer deux versions d'un jeu (Roue, Jackpot, Carte à gratter) :
- **Mécanique perdante** : Active par défaut, 100% des participants perdent
- **Mécanique gagnante** : Activée uniquement à des dates/heures précises, garantit un gain

## Principe de fonctionnement

### Comportement par défaut
- Tous les participants tombent sur une mécanique **100% perdante**
- Aucun lot n'est distribué

### Attribution temporelle
- L'administrateur configure des lots avec date et heure précises
- **Seul le premier participant** qui joue exactement à cette date/heure gagne le lot
- Une fois le lot attribué, la mécanique perdante reprend automatiquement

### Exemple concret
```
Configuration : Lot "iPhone 15 Pro" le 13/11/2025 à 13:54

Timeline:
- 13/11/2025 13:53 → Participant A joue → PERD (mécanique perdante)
- 13/11/2025 13:54 → Participant B joue → GAGNE (mécanique gagnante activée)
- 13/11/2025 13:54 → Participant C joue → PERD (lot déjà réclamé)
- 13/11/2025 13:55 → Participant D joue → PERD (mécanique perdante)
```

## Architecture technique

### 1. Service de gestion (`DoubleMechanicService.ts`)

#### Fonctions principales

**`checkDoubleMechanic(timedPrizes, claimedPrizeIds)`**
- Vérifie si la date/heure actuelle correspond à un lot programmé
- Retourne le type de mécanique à utiliser
- Vérifie que le lot n'a pas déjà été réclamé

**`markPrizeAsClaimed(campaignId, prizeId)`**
- Marque un lot comme réclamé dans le localStorage
- Empêche les attributions multiples

**`getClaimedPrizes(campaignId)`**
- Récupère la liste des lots déjà réclamés
- Utilisé pour la vérification

**`resetClaimedPrizes(campaignId)`**
- Réinitialise les lots réclamés (tests uniquement)

### 2. Composants de jeu

#### DoubleMechanicWheel
- Roue de la fortune avec double mécanique
- Segments perdants par défaut
- Segments gagnants dynamiques selon le lot

#### DoubleMechanicJackpot
- Machine à sous avec double mécanique
- Intercepte les callbacks win/lose
- Force le résultat selon la mécanique active

#### DoubleMechanicScratch
- Carte à gratter avec double mécanique
- Révèle le gain ou la perte selon la mécanique
- Canvas interactif de grattage

### 3. Interface de configuration

#### Onglet "Dotation" (DotationStep.tsx)
Accessible dans **Paramètres de la campagne** :

**Fonctionnalités :**
- Ajouter/supprimer des lots programmés
- Configurer nom, description, date et heure
- Activer/désactiver des lots
- Prévisualisation de la date d'attribution

**Champs par lot :**
- Nom du lot (ex: "iPhone 15 Pro")
- Description (optionnel)
- Date d'attribution (format: YYYY-MM-DD)
- Heure d'attribution (format: HH:mm)
- État actif/inactif

## Flux de données

### 1. Configuration
```
Admin → Paramètres campagne → Onglet Dotation
     → Ajoute lot avec date/heure
     → Sauvegarde dans campaign.settings.dotation.timed_prizes
```

### 2. Vérification au chargement du jeu
```
Participant arrive sur le jeu
     → DoubleMechanicService.checkDoubleMechanic()
     → Vérifie date/heure actuelle
     → Compare avec lots programmés
     → Vérifie lots déjà réclamés
     → Retourne type de mécanique
```

### 3. Jeu et attribution
```
Participant joue
     → Si mécanique gagnante:
          → Affiche segments/résultat gagnant
          → Marque lot comme réclamé
          → Notifie onFinish('win')
     → Si mécanique perdante:
          → Affiche segments/résultat perdant
          → Notifie onFinish('lose')
```

## Structure de données

### TimedPrize
```typescript
interface TimedPrize {
  id: string;              // Identifiant unique
  name: string;            // Nom du lot
  description: string;     // Description
  date: string;            // YYYY-MM-DD
  time: string;            // HH:mm
  enabled: boolean;        // Actif/inactif
}
```

### DoubleMechanicResult
```typescript
interface DoubleMechanicResult {
  isWinningMechanic: boolean;
  prizeId?: string;
  prizeName?: string;
  prizeDescription?: string;
  reason: 'default_losing' | 'timed_prize_match' | 
          'timed_prize_already_claimed' | 'no_active_prizes';
}
```

### Stockage
```typescript
// Dans campaign.settings
{
  dotation: {
    timed_prizes: TimedPrize[]
  }
}

// Dans localStorage
{
  [`campaign_${campaignId}_claimed_prizes`]: string[] // Liste des IDs réclamés
}
```

## Intégration dans les éditeurs

### Fichiers modifiés

1. **CampaignSettingsModal.tsx**
   - Ajout de l'onglet "Dotation"
   - Import de DotationStep
   - Sauvegarde du champ dotation

2. **useCampaignSettings.ts**
   - Ajout du type dotation dans CampaignSettings

3. **Nouveaux composants**
   - `DoubleMechanicWheel.tsx`
   - `DoubleMechanicJackpot.tsx`
   - `DoubleMechanicScratch.tsx`
   - `DotationStep.tsx`
   - `DoubleMechanicService.ts`

## Utilisation

### 1. Configuration d'une campagne

```typescript
// Dans l'éditeur de campagne
1. Ouvrir "Paramètres de la campagne"
2. Aller dans l'onglet "Dotation"
3. Cliquer sur "Ajouter un lot"
4. Remplir les informations :
   - Nom : "iPhone 15 Pro"
   - Description : "Dernier modèle Apple"
   - Date : 13/11/2025
   - Heure : 13:54
5. Cocher "Actif"
6. Enregistrer
```

### 2. Utilisation dans un composant

```typescript
import DoubleMechanicWheel from '@/components/GameTypes/DoubleMechanicWheel';

<DoubleMechanicWheel
  config={config}
  campaign={campaign}
  isPreview={false}
  onComplete={(prize) => console.log('Prize:', prize)}
  onFinish={(result) => console.log('Result:', result)}
  gameSize="medium"
/>
```

### 3. Debug en développement

En mode développement, un indicateur visuel s'affiche :
- 🎉 GAGNANT : Mécanique gagnante active
- ❌ PERDANT : Mécanique perdante active

## Sécurité et limitations

### Stockage local
- Les lots réclamés sont stockés dans le localStorage
- **Limitation** : Peut être réinitialisé par l'utilisateur
- **Solution recommandée** : Implémenter un système backend pour tracker les attributions

### Précision temporelle
- Vérification à la minute près (HH:mm)
- Pas de vérification des secondes
- Fenêtre d'attribution : 1 minute exacte

### Mode preview
- Toujours en mécanique perdante
- Empêche les attributions accidentelles pendant les tests

## Logs et debugging

### Console logs
```javascript
// Vérification de la mécanique
🎯 [DoubleMechanic] Checking at: { currentDate, currentTime }

// Mécanique gagnante activée
🎉 [DoubleMechanic] WINNING MECHANIC! Prize match: { prizeId, prizeName }

// Mécanique perdante
❌ [DoubleMechanic] No prize match, using losing mechanic

// Lot réclamé
✅ [DoubleMechanic] Prize marked as claimed: prizeId
```

## Améliorations futures

### Recommandations
1. **Backend tracking** : Stocker les attributions en base de données
2. **Fenêtre temporelle** : Permettre une fenêtre de plusieurs minutes
3. **Notifications** : Alerter l'admin quand un lot est attribué
4. **Statistiques** : Dashboard des lots attribués
5. **Vérification serveur** : Valider la date/heure côté serveur

### Extensions possibles
- Lots multiples à la même heure (premier arrivé, premier servi)
- Lots récurrents (tous les jours à 14h)
- Probabilités variables selon l'heure
- Système de quota journalier/hebdomadaire

## Support

Pour toute question ou problème :
1. Vérifier les logs de la console
2. Vérifier la configuration des lots dans l'onglet Dotation
3. Vérifier que les dates/heures sont au bon format
4. Tester en mode développement avec l'indicateur visuel
