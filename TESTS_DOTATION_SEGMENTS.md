# 🧪 Tests de Validation - Système de Dotation et Segments

## ✅ Corrections Appliquées

### 1. **Persistance des Segments** ✅
- **Problème** : Les noms de segments ("ON GAGNE", "ON PERD") disparaissaient après sauvegarde
- **Cause** : `wheelConfig.segments` n'était pas sauvegardé dans `game_config`
- **Solution** : Ajout de `wheelSegments` dans `game_config` lors de la sauvegarde
- **Fichiers modifiés** :
  - `src/hooks/useModernCampaignEditor/saveHandler.ts` (lignes 259-283)
  - `src/hooks/useModernCampaignEditor/campaignLoader.ts` (lignes 306-314)

### 2. **Persistance des Lots** ✅
- **Problème** : Les lots configurés disparaissaient après sauvegarde
- **Cause** : `campaign.prizes` n'était pas sauvegardé dans `game_config`
- **Solution** : Ajout de `prizes` dans `game_config` lors de la sauvegarde
- **Fichiers modifiés** :
  - `src/hooks/useModernCampaignEditor/saveHandler.ts` (lignes 285-289)
  - `src/hooks/useModernCampaignEditor/campaignLoader.ts` (lignes 312-314)

### 3. **Attribution Calendrier Exacte** ✅
- **Problème** : Le lot calendrier était attribué à n'importe quel moment au lieu de l'heure exacte
- **Cause** : `isPrizeActive()` vérifiait une fenêtre temporelle au lieu d'un moment précis
- **Solution** : Nouvelle fonction `isExactCalendarMoment()` avec tolérance de 1 minute
- **Fichiers modifiés** :
  - `src/utils/PrizeValidation.ts` (lignes 296-327)
  - `src/services/ProbabilityEngine.ts` (lignes 49-73)

### 4. **Logs de Debug Améliorés** ✅
- Ajout de logs détaillés pour tracer :
  - Sauvegarde des segments et prizes
  - Vérification des dates/heures calendrier
  - Attribution des lots aux segments

---

## 📋 Plan de Tests

### Test 1 : Persistance des Noms de Segments

#### **Étapes**
1. Ouvrir l'éditeur de roue
2. Aller dans l'onglet "Jeu" → "Segments"
3. Renommer les segments :
   - Segment 1 : "ON GAGNE"
   - Segment 2-6 : "ON PERD"
4. Cliquer sur "Sauvegarder" (Cmd+S)
5. Fermer l'onglet et rouvrir la campagne

#### **Résultat Attendu**
✅ Les noms "ON GAGNE" et "ON PERD" doivent être conservés

#### **Logs à Vérifier**
```
🎯 [saveCampaignToDB] Building game_config with segments and prizes:
  segmentsCount: 6
  segmentsPreview: [
    { id: "segment-1", label: "ON GAGNE", prizeId: "..." },
    { id: "segment-2", label: "ON PERD", prizeId: undefined }
  ]
```

---

### Test 2 : Attribution de Lot à un Segment

#### **Étapes**
1. Aller dans l'onglet "Dotation" → "Lots disponibles"
2. Créer un lot :
   - Nom : "Test Nouveau lot"
   - Quantité : 5
   - Méthode : "Calendrier"
   - Date : 10/11/2025
   - Heure : 14:22
3. Aller dans l'onglet "Segments de roue"
4. Cocher le segment "ON GAGNE" (Segment 1)
5. Cliquer sur "Enregistrer"
6. Sauvegarder la campagne (Cmd+S)
7. Fermer et rouvrir

#### **Résultat Attendu**
✅ Le lot "Test Nouveau lot" doit rester assigné au segment "ON GAGNE"

#### **Logs à Vérifier**
```
🎯 [saveCampaignToDB] Building game_config with segments and prizes:
  prizesCount: 1
  prizesPreview: [
    {
      id: "prize_...",
      name: "Test Nouveau lot",
      method: "calendar",
      startDate: "2025-11-10",
      startTime: "14:22"
    }
  ]
```

---

### Test 3 : Attribution Calendrier à l'Heure Exacte

#### **Étapes**
1. Créer un lot calendrier avec :
   - Date : Aujourd'hui
   - Heure : Dans 2 minutes (ex: si 14:20 → mettre 14:22)
2. Assigner ce lot au segment "ON GAGNE"
3. Sauvegarder
4. Attendre l'heure programmée (14:22)
5. Tester la roue (cliquer sur "Participer")

#### **Résultat Attendu**
✅ À 14:22 (±1 minute), le lot doit être attribué et la roue doit tomber sur "ON GAGNE"
❌ Avant 14:21 ou après 14:23, la roue ne doit PAS tomber sur "ON GAGNE"

#### **Logs à Vérifier**
```
🎯 Exact calendar moment check: Test Nouveau lot
  targetDate: "2025-11-10"
  targetTime: "14:22"
  targetMoment: "2025-11-10T14:22:00.000Z"
  currentMoment: "2025-11-10T14:22:15.000Z"
  timeDiffMs: 15000
  timeDiffSeconds: 15
  toleranceSeconds: 60
  isExactMoment: true

📅 Calendar prize check: Test Nouveau lot
  isCalendar: true
  isExactMoment: true
  isAvailable: true

🎯 CALENDAR MODE: 1 active prizes
```

---

### Test 4 : Compteur de Lots Remportés

#### **Étapes**
1. Créer un lot avec :
   - Quantité totale : 5
   - Méthode : Probabilité 100%
2. Assigner au segment "ON GAGNE"
3. Sauvegarder
4. Tester la roue 3 fois (gagner 3 fois)
5. Vérifier le compteur dans l'onglet "Dotation"

#### **Résultat Attendu**
✅ Le compteur doit afficher "2 / 5" (2 lots restants sur 5)
✅ Après 5 gains, le compteur doit afficher "0 / 5"
✅ Après épuisement, la roue ne doit plus tomber sur "ON GAGNE"

#### **Logs à Vérifier**
```
🎁 Prize availability check: Test Nouveau lot
  totalUnits: 5
  awardedUnits: 3
  remaining: 2
  isAvailable: true

❌ Prize Test Nouveau lot is EXHAUSTED - no more units available
  (après 5 gains)
```

---

### Test 5 : Paramètres Avancés Dotation

#### **Étapes**
1. Aller dans "Dotation" → "Paramètres avancés"
2. Configurer :
   - Fenêtre temporelle : 5 minutes
   - Autres paramètres
3. Sauvegarder
4. Fermer et rouvrir

#### **Résultat Attendu**
✅ Les paramètres avancés doivent être conservés

---

## 🐛 Problèmes Connus Résolus

### ❌ Problème 1 : Segments perdent leur nom
**Status** : ✅ RÉSOLU
- Les segments sont maintenant sauvegardés dans `game_config.wheelSegments`
- Restaurés correctement dans `campaignLoader.ts`

### ❌ Problème 2 : Lots non attribués après sauvegarde
**Status** : ✅ RÉSOLU
- Les lots sont maintenant sauvegardés dans `game_config.prizes`
- Restaurés correctement avec toutes leurs propriétés

### ❌ Problème 3 : Attribution calendrier aléatoire
**Status** : ✅ RÉSOLU
- Nouvelle fonction `isExactCalendarMoment()` avec tolérance de 1 minute
- Vérifie la date/heure EXACTE au lieu d'une fenêtre temporelle

### ❌ Problème 4 : Compteur de lots ne s'incrémente pas
**Status** : ⚠️ À VÉRIFIER
- Le système vérifie `totalUnits - awardedUnits`
- Nécessite que `awardedUnits` soit incrémenté après chaque gain
- **À tester** : Vérifier que l'incrémentation fonctionne dans `SmartWheelWrapper.tsx`

### ❌ Problème 5 : Paramètres avancés non sauvegardés
**Status** : ⚠️ À IMPLÉMENTER
- Les paramètres avancés ne sont pas encore sauvegardés
- **TODO** : Ajouter `dotationConfig` dans `game_config`

---

## 🔍 Commandes de Debug Console

### Vérifier les segments sauvegardés
```javascript
// Dans la console du navigateur
const campaign = window.__CAMPAIGN__;
console.log('Segments:', campaign?.wheelConfig?.segments);
console.log('Prizes:', campaign?.prizes);
```

### Vérifier l'attribution calendrier
```javascript
// Forcer la date/heure pour tester
const testDate = new Date('2025-11-10T14:22:00');
console.log('Test date:', testDate.toISOString());
```

### Vérifier le store Zustand
```javascript
// Récupérer le store
const store = window.__ZUSTAND_STORES__?.editorStore;
const state = store?.getState();
console.log('Campaign state:', state?.campaign);
console.log('Segments:', state?.campaign?.wheelConfig?.segments);
console.log('Prizes:', state?.campaign?.prizes);
```

---

## 📝 Notes Importantes

### Tolérance Calendrier
- **Fenêtre d'attribution** : ±1 minute autour de l'heure programmée
- **Exemple** : Lot programmé à 14:22
  - ✅ Attribué entre 14:21:00 et 14:23:00
  - ❌ Pas attribué avant 14:21:00 ou après 14:23:00

### Format des Dates/Heures
- **Date** : YYYY-MM-DD (ex: 2025-11-10)
- **Heure** : HH:MM (ex: 14:22)
- **Stockage** : ISO 8601 (ex: 2025-11-10T14:22:00.000Z)

### Priorité des Lots
1. **Lots calendrier actifs** : 100% de probabilité si à l'heure exacte
2. **Lots à 100%** : 100% de probabilité si disponibles
3. **Lots probabilistes** : Distribution selon les pourcentages configurés

---

## ✅ Checklist de Validation

- [ ] Test 1 : Persistance des noms de segments
- [ ] Test 2 : Attribution de lot à un segment
- [ ] Test 3 : Attribution calendrier à l'heure exacte
- [ ] Test 4 : Compteur de lots remportés
- [ ] Test 5 : Paramètres avancés dotation
- [ ] Vérifier les logs de sauvegarde
- [ ] Vérifier les logs d'attribution
- [ ] Tester avec plusieurs lots calendrier
- [ ] Tester l'épuisement des lots
- [ ] Tester la restauration après fermeture/réouverture

---

## 🚀 Prochaines Étapes

1. **Tester les corrections** avec le plan ci-dessus
2. **Vérifier les logs** dans la console pour confirmer la sauvegarde
3. **Signaler tout problème persistant** avec les logs complets
4. **Implémenter l'incrémentation de `awardedUnits`** si non fonctionnelle
5. **Ajouter la sauvegarde des paramètres avancés** si nécessaire
