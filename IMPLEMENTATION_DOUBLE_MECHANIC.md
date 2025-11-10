# ✅ Implémentation du Système de Double Mécanique - Résumé

## 🎯 Objectif

Implémenter un système de double mécanique pour les jeux (Roue, Jackpot, Carte à gratter) permettant :
- Une mécanique **100% perdante** par défaut
- Une mécanique **100% gagnante** activée à des dates/heures précises
- Attribution d'un lot au premier participant qui joue au moment exact

## 📦 Fichiers créés

### 1. Interface de configuration
- **`src/pages/CampaignSettings/DotationStep.tsx`**
  - Nouvel onglet "Dotation" dans les paramètres de campagne
  - Interface de gestion des lots programmés
  - Formulaires pour ajouter/modifier/supprimer des lots
  - Prévisualisation des dates d'attribution

### 2. Service de logique métier
- **`src/services/DoubleMechanicService.ts`**
  - `checkDoubleMechanic()` : Vérifie quelle mécanique utiliser
  - `markPrizeAsClaimed()` : Marque un lot comme réclamé
  - `getClaimedPrizes()` : Récupère les lots réclamés
  - `resetClaimedPrizes()` : Réinitialise (tests uniquement)

### 3. Composants de jeu
- **`src/components/GameTypes/DoubleMechanicWheel.tsx`**
  - Roue de la fortune avec double mécanique
  - Segments perdants/gagnants dynamiques
  - Indicateur de debug en développement

- **`src/components/GameTypes/DoubleMechanicJackpot.tsx`**
  - Machine à sous avec double mécanique
  - Interception des callbacks win/lose
  - Gestion de l'attribution selon la mécanique

- **`src/components/GameTypes/DoubleMechanicScratch.tsx`**
  - Carte à gratter avec double mécanique
  - Canvas interactif de grattage
  - Révélation du résultat selon la mécanique

### 4. Documentation
- **`DOUBLE_MECHANIC_SYSTEM.md`**
  - Documentation technique complète
  - Architecture et flux de données
  - Exemples d'utilisation

- **`GUIDE_DOTATION.md`**
  - Guide utilisateur
  - Instructions pas à pas
  - Exemples de stratégies

## 🔧 Fichiers modifiés

### 1. Modale de paramètres
**`src/components/DesignEditor/modals/CampaignSettingsModal.tsx`**
- Import de `DotationStep`
- Ajout de l'onglet "Dotation" dans le tableau `steps`
- Sauvegarde du champ `dotation` dans le payload

### 2. Hook de paramètres
**`src/hooks/useCampaignSettings.ts`**
- Ajout du champ `dotation?: any` dans le type `CampaignSettings`

## 🎨 Interface utilisateur

### Onglet Dotation
L'onglet "Dotation" apparaît dans les paramètres de campagne entre "Paramètres" et "Sortie".

**Fonctionnalités :**
- ✅ Section d'information expliquant le système
- ✅ Liste des lots programmés
- ✅ Bouton "Ajouter un lot"
- ✅ Formulaire par lot avec :
  - Nom du lot
  - Description
  - Date d'attribution (input date)
  - Heure d'attribution (input time)
  - Checkbox actif/inactif
  - Bouton supprimer
- ✅ Prévisualisation de la date d'attribution
- ✅ Section d'avertissement avec les règles importantes

**Charte graphique respectée :**
- Couleurs : bg-[hsl(var(--sidebar-surface))], border-[hsl(var(--sidebar-border))]
- Boutons : bg-[#44444d] pour les actions principales
- Style cohérent avec les autres onglets

## 🔄 Flux de fonctionnement

### 1. Configuration (Admin)
```
Admin ouvre Paramètres → Onglet Dotation
  → Ajoute lot "iPhone 15 Pro"
  → Date: 13/11/2025, Heure: 13:54
  → Enregistre
  → Données sauvegardées dans campaign.settings.dotation.timed_prizes
```

### 2. Vérification (Participant)
```
Participant charge le jeu
  → DoubleMechanicService.checkDoubleMechanic()
  → Récupère timedPrizes depuis campaign.settings
  → Récupère claimedPrizes depuis localStorage
  → Compare date/heure actuelle avec lots programmés
  → Retourne { isWinningMechanic: true/false, prizeId, ... }
```

### 3. Jeu (Participant)
```
Si isWinningMechanic = true:
  → Affiche mécanique gagnante (segments/résultat gagnant)
  → Participant joue
  → Gagne automatiquement
  → markPrizeAsClaimed(campaignId, prizeId)
  → onFinish('win')

Si isWinningMechanic = false:
  → Affiche mécanique perdante (segments/résultat perdant)
  → Participant joue
  → Perd automatiquement
  → onFinish('lose')
```

## 📊 Structure de données

### TimedPrize (Interface)
```typescript
interface TimedPrize {
  id: string;              // UUID généré
  name: string;            // "iPhone 15 Pro"
  description: string;     // "Dernier modèle Apple"
  date: string;            // "2025-11-13"
  time: string;            // "13:54"
  enabled: boolean;        // true/false
}
```

### Stockage Supabase
```json
{
  "campaign_settings": {
    "dotation": {
      "timed_prizes": [
        {
          "id": "prize-1699876543210",
          "name": "iPhone 15 Pro",
          "description": "Dernier modèle Apple 256GB",
          "date": "2025-11-13",
          "time": "13:54",
          "enabled": true
        }
      ]
    }
  }
}
```

### Stockage localStorage
```json
{
  "campaign_abc123_claimed_prizes": [
    "prize-1699876543210"
  ]
}
```

## 🎮 Utilisation dans les composants

### Exemple : Roue de la fortune
```tsx
import DoubleMechanicWheel from '@/components/GameTypes/DoubleMechanicWheel';

<DoubleMechanicWheel
  config={config}
  campaign={campaign}
  isPreview={false}
  onComplete={(prize) => {
    console.log('Prize won:', prize);
  }}
  onFinish={(result) => {
    if (result === 'win') {
      // Afficher message de félicitations
    } else {
      // Afficher message de consolation
    }
  }}
  gameSize="medium"
/>
```

## 🔍 Debug et logs

### Logs console
```javascript
// Vérification de la mécanique
🎯 [DoubleMechanic] Checking at: { currentDate: "2025-11-13", currentTime: "13:54" }

// Mécanique gagnante activée
🎉 [DoubleMechanic] WINNING MECHANIC! Prize match: {
  prizeId: "prize-1699876543210",
  prizeName: "iPhone 15 Pro",
  scheduledFor: "2025-11-13 13:54"
}

// Lot réclamé
✅ [DoubleMechanic] Prize marked as claimed: prize-1699876543210

// Mécanique perdante
❌ [DoubleMechanic] No prize match, using losing mechanic
```

### Indicateur visuel (dev only)
En mode développement, un badge s'affiche en haut à droite du jeu :
- 🎉 GAGNANT : Mécanique gagnante active
- ❌ PERDANT : Mécanique perdante active

## ✅ Tests recommandés

### 1. Configuration
- [ ] Ouvrir les paramètres de campagne
- [ ] Vérifier que l'onglet "Dotation" est présent
- [ ] Ajouter un lot avec date/heure
- [ ] Vérifier la prévisualisation de la date
- [ ] Enregistrer et vérifier la persistance

### 2. Mécanique perdante
- [ ] Charger un jeu sans lot programmé
- [ ] Vérifier l'indicateur "❌ PERDANT"
- [ ] Jouer et vérifier la perte

### 3. Mécanique gagnante
- [ ] Configurer un lot pour l'heure actuelle +1 minute
- [ ] Attendre l'heure exacte
- [ ] Charger le jeu
- [ ] Vérifier l'indicateur "🎉 GAGNANT"
- [ ] Jouer et vérifier le gain
- [ ] Recharger le jeu
- [ ] Vérifier le retour à la mécanique perdante

### 4. Attribution unique
- [ ] Configurer un lot pour l'heure actuelle
- [ ] Premier participant joue → Gagne
- [ ] Deuxième participant joue → Perd
- [ ] Vérifier le localStorage (lot réclamé)

## 🚀 Prochaines étapes

### Améliorations recommandées
1. **Backend tracking** : Stocker les attributions en base de données Supabase
2. **API de vérification** : Valider la date/heure côté serveur
3. **Notifications** : Alerter l'admin quand un lot est attribué
4. **Dashboard** : Statistiques des lots attribués
5. **Fenêtre temporelle** : Permettre une fenêtre de plusieurs minutes

### Extensions possibles
- Lots multiples simultanés
- Lots récurrents (quotidien, hebdomadaire)
- Système de quota (X lots par jour)
- Probabilités variables selon l'heure

## 📝 Notes importantes

### Sécurité
⚠️ **Limitation actuelle** : Les lots réclamés sont stockés dans le localStorage
- Peut être réinitialisé par l'utilisateur
- **Solution** : Implémenter un système backend pour tracker les attributions

### Précision temporelle
- Vérification à la minute près (HH:mm)
- Pas de vérification des secondes
- Fenêtre d'attribution : 1 minute complète

### Mode preview
- Toujours en mécanique perdante
- Empêche les attributions accidentelles pendant les tests

## 📞 Support

Pour toute question ou problème :
1. Consulter `DOUBLE_MECHANIC_SYSTEM.md` (documentation technique)
2. Consulter `GUIDE_DOTATION.md` (guide utilisateur)
3. Vérifier les logs de la console (F12 → Console)
4. Vérifier la configuration dans l'onglet Dotation

---

**Implémentation complétée le 9 novembre 2025** ✅
