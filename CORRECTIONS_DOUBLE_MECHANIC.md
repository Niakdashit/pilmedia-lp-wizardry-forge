# 🔧 Corrections du Système de Double Mécanique

## 🐛 Problèmes identifiés

### 1. Les composants DoubleMechanic n'étaient pas utilisés
**Symptôme** : Le jeu affichait "Félicitations" même quand il devrait perdre
**Cause** : Les éditeurs utilisaient encore les anciens composants (WheelPreview, Jackpot, ScratchPreview)
**Solution** : Intégration des composants DoubleMechanic dans GameRenderer

### 2. Les settings de campagne n'étaient pas chargés
**Symptôme** : Les lots programmés disparaissaient après sauvegarde
**Cause** : Les settings (incluant dotation) n'étaient pas chargés dans le jeu
**Solution** : Ajout du chargement des settings via useCampaignSettings

## ✅ Corrections appliquées

### Fichier modifié : `src/components/funnels/components/GameRenderer.tsx`

#### 1. Imports mis à jour
```typescript
// Ajout des composants DoubleMechanic
import DoubleMechanicWheel from '../../GameTypes/DoubleMechanicWheel';
import DoubleMechanicJackpot from '../../GameTypes/DoubleMechanicJackpot';
import DoubleMechanicScratch from '../../GameTypes/DoubleMechanicScratch';

// Ajout du hook pour charger les settings
import { useCampaignSettings } from '../../../hooks/useCampaignSettings';
```

#### 2. Chargement des settings de campagne
```typescript
const { getSettings } = useCampaignSettings();
const [campaignSettings, setCampaignSettings] = useState<any>(null);

// Charger les settings de campagne incluant dotation
useEffect(() => {
  if (campaign?.id) {
    getSettings(campaign.id).then(settings => {
      if (settings) {
        setCampaignSettings(settings);
        console.log('🎯 [GameRenderer] Campaign settings loaded:', settings);
      }
    });
  }
}, [campaign?.id, getSettings]);
```

#### 3. Enrichissement de la campagne avec les settings
```typescript
// Créer une campagne enrichie avec les settings
const enrichedCampaign = {
  ...campaign,
  settings: campaignSettings
};
```

#### 4. Utilisation des composants DoubleMechanic
```typescript
case 'wheel':
  return (
    <DoubleMechanicWheel
      config={{}}
      campaign={enrichedCampaign}  // ← Settings inclus
      isPreview={false}
      onComplete={(prize) => {
        console.log('Prize won:', prize);
      }}
      onFinish={handleGameComplete}
      onStart={handleGameStartInternal}
      disabled={!formValidated}
      gameSize={gameSize}
    />
  );

case 'scratch':
  return (
    <DoubleMechanicScratch
      config={campaign.gameConfig?.scratch || {}}
      campaign={enrichedCampaign}  // ← Settings inclus
      isPreview={false}
      onFinish={handleGameComplete}
    />
  );

case 'jackpot':
  return (
    <DoubleMechanicJackpot
      campaign={enrichedCampaign}  // ← Settings inclus
      isPreview={false}
      onFinish={handleGameComplete}
      disabled={!formValidated}
    />
  );
```

## 🧪 Tests à effectuer

### 1. Vérifier la sauvegarde des lots
1. Ouvrir une campagne
2. Paramètres → Dotation
3. Ajouter un lot avec date/heure
4. Enregistrer
5. Fermer et rouvrir les paramètres
6. **Vérifier que le lot est toujours là** ✅

### 2. Vérifier la mécanique perdante
1. Créer un lot pour demain
2. Jouer maintenant
3. **Vérifier que vous perdez** ✅
4. Vérifier les logs console :
   ```
   ❌ [DoubleMechanic] No prize match, using losing mechanic
   ❌ [DoubleMechanicWheel] Using losing mechanic
   ```

### 3. Vérifier la mécanique gagnante
1. Créer un lot pour maintenant +2 minutes
2. Attendre l'heure exacte
3. Jouer
4. **Vérifier que vous gagnez** ✅
5. Vérifier les logs console :
   ```
   🎉 [DoubleMechanic] WINNING MECHANIC! Prize match
   🎉 [DoubleMechanicWheel] WINNING MECHANIC ACTIVATED!
   ```

### 4. Vérifier l'attribution unique
1. Créer un lot pour maintenant
2. Premier joueur joue → **Gagne** ✅
3. Deuxième joueur joue → **Perd** ✅
4. Vérifier les logs :
   ```
   ✅ [DoubleMechanic] Prize marked as claimed
   ⏭️ [DoubleMechanic] Prize already claimed
   ```

## 📊 Flux de données corrigé

### Avant (❌ Bugué)
```
Participant joue
  → WheelPreview (ancien composant)
  → Logique instant_winner aléatoire
  → Résultat aléatoire (pas de dotation)
```

### Après (✅ Corrigé)
```
Participant joue
  → GameRenderer charge campaign.settings
  → DoubleMechanicWheel reçoit enrichedCampaign
  → DoubleMechanicService.checkDoubleMechanic()
  → Vérifie timedPrizes depuis campaign.settings.dotation
  → Retourne mécanique (winning/losing)
  → Affiche le bon résultat
```

## 🔍 Vérification dans la console

### Logs attendus au chargement du jeu
```javascript
🎯 [GameRenderer] Campaign settings loaded: {
  dotation: {
    timed_prizes: [
      {
        id: "prize-xxx",
        name: "iPhone 15 Pro",
        date: "2025-11-09",
        time: "22:04",
        enabled: true
      }
    ]
  }
}

🎯 [DoubleMechanic] Checking at: {
  currentDate: "2025-11-09",
  currentTime: "22:02"
}

❌ [DoubleMechanic] No prize match, using losing mechanic
```

### Logs attendus à l'heure exacte
```javascript
🎯 [DoubleMechanic] Checking at: {
  currentDate: "2025-11-09",
  currentTime: "22:04"
}

🎉 [DoubleMechanic] WINNING MECHANIC! Prize match: {
  prizeId: "prize-xxx",
  prizeName: "iPhone 15 Pro",
  scheduledFor: "2025-11-09 22:04"
}

🎉 [DoubleMechanicWheel] WINNING MECHANIC ACTIVATED!
```

## ⚠️ Points d'attention

### 1. Cache du navigateur
Si les changements ne sont pas visibles :
- **Hard refresh** : Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
- Vider le cache du navigateur
- Redémarrer le serveur de développement

### 2. Vérification de la base de données
Pour vérifier que les données sont bien sauvegardées :
```sql
SELECT 
  campaign_id,
  dotation
FROM campaign_settings
WHERE dotation IS NOT NULL;
```

### 3. localStorage
Les lots réclamés sont stockés dans le localStorage :
```javascript
// Vérifier dans la console
localStorage.getItem('campaign_YOUR_CAMPAIGN_ID_claimed_prizes')
```

## 🚀 Prochaines étapes

### Améliorations recommandées
1. **Backend tracking** : Stocker les lots réclamés en base de données au lieu du localStorage
2. **Validation serveur** : Vérifier la date/heure côté serveur
3. **Notifications** : Alerter l'admin quand un lot est attribué
4. **Dashboard** : Statistiques des lots attribués

### Tests en production
1. Tester sur différents navigateurs
2. Tester sur mobile/tablette
3. Tester avec plusieurs participants simultanés
4. Vérifier les fuseaux horaires

## 📝 Checklist de déploiement

- [ ] Migration SQL exécutée
- [ ] Code déployé
- [ ] Tests de sauvegarde OK
- [ ] Tests de mécanique perdante OK
- [ ] Tests de mécanique gagnante OK
- [ ] Tests d'attribution unique OK
- [ ] Logs console vérifiés
- [ ] Documentation à jour

---

**Corrections appliquées le 9 novembre 2025**
