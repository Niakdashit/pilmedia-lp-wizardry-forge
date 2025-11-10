# 🎮 Guide d'Intégration du Système de Dotation dans les Jeux

## 📋 Vue d'Ensemble

Ce guide explique comment intégrer le système d'attribution des lots dans les 3 jeux principaux :
- 🎡 Roue de la Fortune
- 🎰 Jackpot
- 🎫 Carte à Gratter

## 🎯 Principe Général

L'attribution des lots se fait **après** que le joueur ait terminé le jeu, en appelant le moteur d'attribution `PrizeAttributionEngine`.

### Flux Standard

```
1. Joueur joue (spin, grattage, etc.)
2. Animation du jeu
3. ⚡ Appel du moteur d'attribution
4. Affichage du résultat (gagné ou perdu)
5. Sauvegarde dans l'historique
```

## 🎡 Intégration Roue de la Fortune

### Fichier à Modifier
`src/components/DesignEditor/SmartWheelWrapper.tsx`

### Code à Ajouter

```typescript
import { createAttributionEngine } from '@/services/PrizeAttributionEngine';

// Dans le composant SmartWheelWrapper
const handleSpinComplete = async (winningSegmentIndex: number) => {
  console.log('🎡 [Wheel] Spin completed, checking prize attribution');

  try {
    // 1. Créer le moteur d'attribution
    const engine = await createAttributionEngine(campaignId);
    
    if (!engine) {
      console.warn('⚠️ [Wheel] No dotation config found, using default behavior');
      // Comportement par défaut si pas de config dotation
      showWinningSegment(winningSegmentIndex);
      return;
    }

    // 2. Récupérer les infos du participant
    const participantEmail = getUserEmail(); // À implémenter selon votre système
    const ipAddress = await getUserIP(); // À implémenter
    
    // 3. Appeler le moteur d'attribution
    const result = await engine.attributePrize({
      campaignId,
      participantEmail,
      ipAddress,
      userAgent: navigator.userAgent,
      deviceFingerprint: getDeviceFingerprint(), // À implémenter
      timestamp: new Date().toISOString()
    });

    // 4. Afficher le résultat
    if (result.isWinner && result.prize) {
      console.log('🎉 [Wheel] Winner!', result.prize);
      showWinningPrize(result.prize);
    } else {
      console.log('❌ [Wheel] No prize:', result.reason);
      showLoseMessage(result.reason);
    }

  } catch (error) {
    console.error('❌ [Wheel] Attribution error:', error);
    // Fallback : comportement par défaut
    showWinningSegment(winningSegmentIndex);
  }
};
```

### Fonctions Utilitaires à Créer

```typescript
// Récupérer l'email du participant (depuis le formulaire)
const getUserEmail = (): string => {
  // Récupérer depuis le state ou le localStorage
  return localStorage.getItem('participant_email') || '';
};

// Récupérer l'IP (via API externe)
const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '';
  }
};

// Générer une empreinte d'appareil
const getDeviceFingerprint = (): string => {
  // Simple fingerprint basé sur le user agent et la résolution
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  return btoa(`${ua}-${screen}`);
};
```

## 🎰 Intégration Jackpot

### Fichier à Modifier
`src/components/JackpotEditor/JackpotGame.tsx`

### Code à Ajouter

```typescript
import { createAttributionEngine } from '@/services/PrizeAttributionEngine';

const handleJackpotSpin = async () => {
  console.log('🎰 [Jackpot] Spin started');

  try {
    // 1. Créer le moteur d'attribution
    const engine = await createAttributionEngine(campaignId);
    
    if (!engine) {
      console.warn('⚠️ [Jackpot] No dotation config, using default behavior');
      playDefaultAnimation();
      return;
    }

    // 2. Appeler le moteur d'attribution
    const result = await engine.attributePrize({
      campaignId,
      participantEmail: getUserEmail(),
      ipAddress: await getUserIP(),
      userAgent: navigator.userAgent,
      deviceFingerprint: getDeviceFingerprint(),
      timestamp: new Date().toISOString()
    });

    // 3. Animer le jackpot selon le résultat
    if (result.isWinner && result.prize) {
      console.log('🎉 [Jackpot] Winner!', result.prize);
      animateJackpotWin(result.prize);
    } else {
      console.log('❌ [Jackpot] No prize:', result.reason);
      animateJackpotLose();
    }

  } catch (error) {
    console.error('❌ [Jackpot] Attribution error:', error);
    playDefaultAnimation();
  }
};
```

### Animation Conditionnelle

```typescript
const animateJackpotWin = (prize: Prize) => {
  // 1. Animation de victoire
  setIsSpinning(true);
  
  // 2. Afficher les symboles gagnants
  setTimeout(() => {
    setSymbols(['🎰', '🎰', '🎰']); // Triple symbole
    setIsSpinning(false);
    
    // 3. Afficher le lot gagné
    setTimeout(() => {
      showPrizeModal(prize);
    }, 1000);
  }, 3000);
};

const animateJackpotLose = () => {
  // Animation de perte (symboles différents)
  setIsSpinning(true);
  
  setTimeout(() => {
    setSymbols(['🍒', '🍋', '🍊']); // Symboles différents
    setIsSpinning(false);
    
    setTimeout(() => {
      showLoseMessage();
    }, 1000);
  }, 3000);
};
```

## 🎫 Intégration Carte à Gratter

### Fichier à Modifier
`src/components/ScratchCardEditor/ScratchCard.tsx`

### Code à Ajouter

```typescript
import { createAttributionEngine } from '@/services/PrizeAttributionEngine';

const handleScratchComplete = async (scratchPercentage: number) => {
  // Attendre que le joueur ait gratté au moins 70%
  if (scratchPercentage < 70) return;

  console.log('🎫 [Scratch] Card fully scratched');

  try {
    // 1. Créer le moteur d'attribution
    const engine = await createAttributionEngine(campaignId);
    
    if (!engine) {
      console.warn('⚠️ [Scratch] No dotation config, using default behavior');
      revealDefaultResult();
      return;
    }

    // 2. Appeler le moteur d'attribution
    const result = await engine.attributePrize({
      campaignId,
      participantEmail: getUserEmail(),
      ipAddress: await getUserIP(),
      userAgent: navigator.userAgent,
      deviceFingerprint: getDeviceFingerprint(),
      timestamp: new Date().toISOString()
    });

    // 3. Révéler le résultat sous la carte
    if (result.isWinner && result.prize) {
      console.log('🎉 [Scratch] Winner!', result.prize);
      revealWinningPrize(result.prize);
    } else {
      console.log('❌ [Scratch] No prize:', result.reason);
      revealLoseMessage();
    }

  } catch (error) {
    console.error('❌ [Scratch] Attribution error:', error);
    revealDefaultResult();
  }
};
```

### Révélation du Résultat

```typescript
const revealWinningPrize = (prize: Prize) => {
  // Afficher le lot sous la zone grattée
  setRevealedContent({
    type: 'win',
    message: `Félicitations ! Vous avez gagné :`,
    prize: {
      name: prize.name,
      description: prize.description,
      imageUrl: prize.imageUrl,
      value: prize.value
    }
  });
  
  // Animation de confettis
  triggerConfetti();
};

const revealLoseMessage = () => {
  // Afficher un message de perte
  setRevealedContent({
    type: 'lose',
    message: 'Dommage ! Tentez votre chance une prochaine fois.',
    prize: null
  });
};
```

## 🔧 Fonctions Utilitaires Communes

Créer un fichier `src/utils/prizeAttribution.ts` :

```typescript
/**
 * Utilitaires pour l'attribution des lots
 */

/**
 * Récupère l'email du participant depuis le localStorage
 */
export const getUserEmail = (): string => {
  return localStorage.getItem('participant_email') || '';
};

/**
 * Récupère l'IP du participant via API externe
 */
export const getUserIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return '';
  }
};

/**
 * Génère une empreinte unique de l'appareil
 */
export const getDeviceFingerprint = (): string => {
  const ua = navigator.userAgent;
  const screen = `${window.screen.width}x${window.screen.height}`;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const fingerprint = `${ua}-${screen}-${language}-${timezone}`;
  return btoa(fingerprint);
};

/**
 * Sauvegarde l'email du participant
 */
export const saveUserEmail = (email: string): void => {
  localStorage.setItem('participant_email', email);
};

/**
 * Efface les données du participant
 */
export const clearUserData = (): void => {
  localStorage.removeItem('participant_email');
};
```

## 📝 Intégration avec le Formulaire

Dans le composant de formulaire, sauvegarder l'email :

```typescript
import { saveUserEmail } from '@/utils/prizeAttribution';

const handleFormSubmit = (formData: FormData) => {
  const email = formData.get('email') as string;
  
  // Sauvegarder l'email pour l'attribution
  saveUserEmail(email);
  
  // Continuer le flux normal
  onFormComplete(formData);
};
```

## 🎨 Composants UI pour Afficher les Résultats

### Modal de Lot Gagné

```typescript
interface PrizeModalProps {
  prize: Prize;
  onClose: () => void;
}

const PrizeModal: React.FC<PrizeModalProps> = ({ prize, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-4">
          🎉 Félicitations !
        </h2>
        
        {prize.imageUrl && (
          <img
            src={prize.imageUrl}
            alt={prize.name}
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
        )}
        
        <h3 className="text-xl font-semibold text-center mb-2">
          {prize.name}
        </h3>
        
        {prize.description && (
          <p className="text-gray-600 text-center mb-4">
            {prize.description}
          </p>
        )}
        
        {prize.value && (
          <p className="text-lg font-bold text-[#841b60] text-center mb-6">
            Valeur : {prize.value}
          </p>
        )}
        
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d1550] transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
```

## 🧪 Tests

### Test Manuel

1. **Créer une campagne de test**
2. **Configurer un lot** avec méthode "Gain instantané"
3. **Jouer au jeu**
4. **Vérifier** que le lot est attribué
5. **Vérifier** dans Supabase :
   - Table `attribution_history` : nouvelle ligne
   - Table `dotation_stats` : stats mises à jour

### Test Anti-Fraude

1. **Configurer** `maxWinsPerEmail: 1`
2. **Jouer 2 fois** avec le même email
3. **Vérifier** que le 2ème essai est refusé

### Test Probabilité

1. **Configurer** `winProbability: 50`
2. **Jouer 10 fois**
3. **Vérifier** qu'environ 50% gagnent

## 📊 Monitoring

### Logs à Surveiller

```typescript
// Dans la console du navigateur
🎯 [PrizeAttribution] Starting attribution process
🎲 [Probability] Random: 45.23%, Threshold: 50%
🎉 [Wheel] Winner! { name: "iPhone 15 Pro", ... }
```

### Dashboard Supabase

1. **Table `attribution_history`** : Voir toutes les attributions
2. **Table `dotation_stats`** : Voir les statistiques en temps réel
3. **SQL Query** :
```sql
-- Voir les dernières attributions
SELECT * FROM attribution_history 
ORDER BY created_at DESC 
LIMIT 10;

-- Voir les stats d'une campagne
SELECT * FROM dotation_stats 
WHERE campaign_id = 'CAMPAIGN_ID';
```

## ✅ Checklist d'Intégration

- [ ] Créer `src/utils/prizeAttribution.ts`
- [ ] Modifier `SmartWheelWrapper.tsx` (Roue)
- [ ] Modifier `JackpotGame.tsx` (Jackpot)
- [ ] Modifier `ScratchCard.tsx` (Scratch)
- [ ] Créer le composant `PrizeModal`
- [ ] Intégrer avec le formulaire
- [ ] Tester chaque jeu
- [ ] Tester l'anti-fraude
- [ ] Vérifier les logs Supabase

## 🚀 Prochaines Améliorations

1. **Notifications Email** : Envoyer un email au gagnant
2. **Codes Promo** : Générer des codes uniques
3. **Export des Gagnants** : CSV des gagnants
4. **Analytics** : Dashboard de statistiques
5. **A/B Testing** : Tester différentes probabilités

---

**Le système est maintenant prêt à être intégré dans les jeux !** 🎉
