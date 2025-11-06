# 🔍 Audit du Système de Sauvegarde/Chargement des Campagnes

## 📊 Problèmes Identifiés

### 🔴 CRITIQUE : Cache Désynchronisé

**Fichier** : `src/hooks/useFastCampaignLoader.ts`

**Problème** :
```typescript
// Cache en mémoire qui n'est jamais invalidé lors des sauvegardes
const campaignCache = new Map<string, any>();

// ❌ Le cache n'est invalidé que manuellement via invalidateCache()
// ❌ Les sauvegardes dans saveHandler.ts n'invalident JAMAIS le cache
// ❌ Résultat : données obsolètes affichées après rechargement
```

**Impact** :
- 🔥 **Haute priorité** : Les utilisateurs voient des données anciennes même après sauvegarde
- Le cache peut contenir des données de plusieurs minutes en arrière
- Aucune synchronisation entre sauvegarde et cache

**Solution** :
1. Invalider le cache après chaque sauvegarde réussie
2. Utiliser un système d'événements pour synchroniser cache et sauvegardes
3. Ajouter un timestamp de validation du cache

---

### 🟡 MAJEUR : Conflits entre Multiples Systèmes d'Autosave

**Occurrences** : 127 appels à `saveCampaignToDB` dans 28 fichiers

**Systèmes d'autosave actifs simultanément** :
1. **useOptimizedCampaignState** : Debounce 3000ms
2. **useEditorUnmountSave** : Sauvegarde au démontage
3. **Autosaves dans chaque éditeur** :
   - FormEditor: L679-716 (modules) + L640-677 (canvas)
   - QuizEditor: Multiples useEffect avec timeouts
   - JackpotEditor: Autosave séparé
   - ScratchEditor: Autosave séparé

**Problème** :
```typescript
// FormEditor a 2 autosaves qui peuvent se chevaucher :
useEffect(() => {
  // Autosave 1 : Complete state (1500ms)
  const t = setTimeout(() => saveCampaignToDB(...), 1500);
}, [campaignState]);

useEffect(() => {
  // Autosave 2 : Modules only (1500ms)  
  const t = setTimeout(() => saveCampaignToDB(...), 1500);
}, [modularPage]);

// ❌ Les deux peuvent se déclencher en même temps
// ❌ Race condition : lequel arrive en premier à la DB ?
```

**Impact** :
- 🔥 **Haute priorité** : Sauvegardes qui s'écrasent mutuellement
- Perte de données si un autosave écrase l'autre
- Performances dégradées (trop de requêtes DB)

**Solution** :
1. Centraliser l'autosave dans un seul système
2. Utiliser le lock existant de `saveHandler.ts` partout
3. Coordonner tous les autosaves via un gestionnaire unique

---

### 🟡 MAJEUR : Race Conditions Debounce + Unmount

**Fichiers** :
- `useOptimizedCampaignState.ts` : Debounce 3000ms
- `useEditorUnmountSave.ts` : Sauvegarde immédiate au démontage

**Problème** :
```typescript
// useOptimizedCampaignState.ts
const debouncedSave = debounce(async (campaign) => {
  setIsSaving(true);
  await onSave(campaign); // ⏱️ Prend 500-1000ms
  setIsSaving(false);
}, 3000); // ⏱️ + 3000ms de délai

// useEditorUnmountSave.ts
useEffect(() => {
  return () => {
    // ❌ Ne vérifie pas si debouncedSave est en cours
    void saveCampaignToDB(payload, saveCampaign);
  };
}, []);

// 💥 Scénario de perte de données :
// 1. Utilisateur modifie quelque chose → debouncedSave commence (3s)
// 2. Utilisateur quitte 2s après → unmountSave démarre
// 3. debouncedSave se termine → écrase les données de unmountSave
```

**Impact** :
- 🔥 **Haute priorité** : Perte des dernières modifications
- Comportement imprévisible : dépend du timing exact
- Frustration utilisateur : "mes changements disparaissent"

**Solution** :
1. Annuler le debounce lors de l'unmount
2. Attendre la fin d'un autosave en cours avant l'unmount save
3. Utiliser un flag global pour indiquer qu'un save est en cours

---

### 🟢 MOYEN : Pas de Feedback Visuel de Sauvegarde

**Problème** :
```typescript
// Les états isSaving existent mais ne sont pas affichés à l'utilisateur
const [isSaving, setIsSaving] = useState(false);

// ❌ Aucun indicateur visuel dans l'UI
// ❌ L'utilisateur ne sait pas si ses données sont sauvées
```

**Impact** :
- UX dégradée : incertitude sur l'état de sauvegarde
- Utilisateurs quittent avant la fin de l'autosave
- Pas de feedback lors des sauvegardes longues

**Solution** :
1. Ajouter un indicateur "Sauvegarde en cours..." dans le header
2. Afficher "Sauvegardé ✓" après une sauvegarde réussie
3. Afficher une erreur si la sauvegarde échoue

---

### 🟢 MOYEN : Chargement avec Délai Variable

**Problème** :
```typescript
// useFastCampaignLoader.ts
const loadCampaign = async (id: string) => {
  // 1. Vérifier le cache (instantané) ✅
  const cached = campaignCache.get(id);
  if (cached) {
    setCampaign(cached);
    return cached;
  }

  // 2. Charger depuis Supabase (500-2000ms) ⏱️
  const { data } = await supabase.from('campaigns')...
  
  // ❌ Si cache est vide → délai de 500-2000ms
  // ❌ Si cache est obsolète → affiche anciennes données
};
```

**Impact** :
- Délai variable selon l'état du cache
- Expérience utilisateur inconsistante
- "Un coup ça marche, un coup non"

**Solution** :
1. Précharger les campagnes fréquemment utilisées
2. Afficher un skeleton loader pendant le chargement
3. Ajouter un cache localStorage pour persistance

---

## 🎯 Recommandations par Priorité

### 🔴 CRITIQUE (À faire immédiatement)

1. **Synchroniser cache et sauvegardes**
   ```typescript
   // Dans saveHandler.ts, après chaque sauvegarde :
   window.dispatchEvent(new CustomEvent('campaign:saved', { 
     detail: { campaignId, data: saved } 
   }));
   
   // Dans useFastCampaignLoader.ts :
   useEffect(() => {
     const handleSaved = (e: CustomEvent) => {
       updateCache(e.detail.campaignId, e.detail.data);
     };
     window.addEventListener('campaign:saved', handleSaved);
     return () => window.removeEventListener('campaign:saved', handleSaved);
   }, []);
   ```

2. **Centraliser l'autosave**
   - Créer un `useCentralizedAutosave` hook
   - Remplacer tous les autosaves éparpillés
   - Coordonner avec le lock existant

3. **Résoudre race conditions unmount**
   ```typescript
   // Attendre la fin du debounce avant unmount save
   useEffect(() => {
     return () => {
       debouncedSave.flush(); // Force le debounce à terminer
       // Puis faire l'unmount save
     };
   }, []);
   ```

### 🟡 MAJEUR (Prochaine itération)

4. **Ajouter feedback visuel**
   - Indicateur "Sauvegarde..." dans le header
   - Toast "Sauvegardé ✓" après succès
   - Message d'erreur si échec

5. **Améliorer le cache**
   - Ajouter localStorage pour persistance
   - Implémenter une stratégie de cache TTL (time-to-live)
   - Précharger les campagnes récentes

### 🟢 MOYEN (Optimisations futures)

6. **Optimiser les performances**
   - Réduire le nombre de sauvegardes (actuellement trop fréquent)
   - Batch les mises à jour (sauvegarder plusieurs changements ensemble)
   - Implémenter le "dirty checking" (ne sauvegarder que si modifié)

7. **Améliorer la fiabilité**
   - Ajouter des tests pour les race conditions
   - Implémenter un système de retry en cas d'échec
   - Logger tous les événements de sauvegarde pour debug

---

## 📈 Métriques à Surveiller

Après les corrections :

1. **Taux de succès de sauvegarde** : Doit être > 99%
2. **Temps de chargement** : Doit être < 500ms avec cache
3. **Cohérence des données** : 100% (pas de données obsolètes)
4. **Nombre de sauvegardes/minute** : Réduire de 50%

---

## 🔧 Fichiers à Modifier (Priorité)

### Critique
1. `src/hooks/useFastCampaignLoader.ts` - Synchroniser cache
2. `src/hooks/useModernCampaignEditor/saveHandler.ts` - Émettre événement
3. `src/hooks/useOptimizedCampaignState.ts` - Gérer race conditions

### Majeur
4. `src/components/FormEditor/DesignEditorLayout.tsx` - Unifier autosaves
5. `src/components/QuizEditor/DesignEditorLayout.tsx` - Unifier autosaves
6. `src/components/JackpotEditor/JackpotEditorLayout.tsx` - Unifier autosaves
7. `src/components/ScratchCardEditor/ScratchCardEditorLayout.tsx` - Unifier autosaves

---

## 🚨 Résumé Exécutif

**État actuel** : 🔴 Système instable avec multiples points de défaillance

**Problèmes critiques** :
1. Cache désynchronisé → Données obsolètes
2. Multiples autosaves → Race conditions et perte de données
3. Pas de coordination → Sauvegardes qui s'écrasent

**Solution recommandée** :
1. **Phase 1** (Urgent) : Synchroniser cache + sauvegardes
2. **Phase 2** (Important) : Centraliser tous les autosaves
3. **Phase 3** (Amélioration) : Ajouter feedback visuel + optimisations

**Temps estimé** : 4-6 heures de développement + tests
