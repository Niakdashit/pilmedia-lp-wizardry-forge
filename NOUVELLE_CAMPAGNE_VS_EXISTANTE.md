# 🆕 Distinction Nouvelle Campagne vs Campagne Existante

## 🔍 Problème Identifié

Lorsque vous créiez une **nouvelle campagne** (sans `?campaign=id` dans l'URL), le store `editorStore` conservait l'état de la campagne précédente en mémoire, incluant :
- ✗ Les modules ajoutés
- ✗ Le fond d'écran
- ✗ La configuration de jeu
- ✗ Les éléments du canvas

**Résultat** : Les nouvelles campagnes héritaient des données des campagnes précédentes.

## ✅ Solution Implémentée

### 1. **Nouvelle Fonction dans editorStore**

**Fichier** : `/src/stores/editorStore.ts`

Ajout de la fonction `initializeNewCampaign(type: string)` qui crée une campagne complètement vierge :

```typescript
initializeNewCampaign: (type: string) => {
  console.log('🆕 [EditorStore] Initializing fresh new campaign of type:', type);
  const validType = ['wheel', 'scratch', 'jackpot', 'quiz', 'dice', 'form', 'memory', 'puzzle'].includes(type) 
    ? type as OptimizedCampaign['type']
    : 'wheel';
  
  const freshCampaign: OptimizedCampaign = {
    id: undefined,
    name: 'Nouvelle campagne',
    type: validType,
    design: {
      background: '#ffffff',
      customTexts: [],
      customImages: []
    },
    gameConfig: {},
    buttonConfig: {},
    _lastUpdate: Date.now(),
    _version: 1,
    _initialized: true
  };
  
  set({
    campaign: freshCampaign,
    isModified: false,
    selectedElementId: null,
    updateCounter: 0,
    lastUpdateTime: Date.now()
  });
}
```

### 2. **Modification de Tous les Éditeurs**

#### ✅ **FormEditor**
```typescript
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const campaignId = params.get('campaign');
  
  if (!campaignId) {
    // Nouvelle campagne : initialiser avec un état vierge
    console.log('🆕 [FormEditor] Mount: no campaign id → initializing fresh campaign');
    initializeNewCampaign('form');
  } else {
    // Campagne existante : sera chargée par useCampaignFromUrl
    console.log('📂 [FormEditor] Mount: campaign id detected, will load from URL');
  }
}, []);
```

#### ✅ **DesignEditor (Wheel)**
```typescript
useEffect(() => {
  const searchParams = new URLSearchParams(location.search);
  const campaignId = searchParams.get('campaign');
  const isValidUuid = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  if (!campaignId || !isValidUuid(campaignId)) {
    console.log('🆕 [DesignEditor] No valid campaign ID → initializing fresh campaign');
    initializeNewCampaign('wheel');
  } else {
    console.log('📂 [DesignEditor] Valid UUID in URL, will load campaign:', campaignId);
  }
}, [location.search]);
```

#### ✅ **JackpotEditor**
```typescript
initializeNewCampaign('jackpot');
```

#### ✅ **ScratchCardEditor**
```typescript
initializeNewCampaign('scratch');
```

#### ✅ **ModelEditor**
```typescript
initializeNewCampaign('wheel'); // Template de base
```

## 📋 Flux Complet

### **Nouvelle Campagne** (sans `?campaign=id`)
```
1. Utilisateur ouvre l'éditeur sans ID
   ↓
2. useEffect détecte l'absence d'ID
   ↓
3. initializeNewCampaign(type) est appelé
   ↓
4. Campagne vierge créée en mémoire
   ↓
5. État complètement propre :
   - Pas de modules
   - Fond blanc par défaut
   - Aucune configuration
   - Canvas vide
```

### **Campagne Existante** (avec `?campaign=uuid`)
```
1. Utilisateur ouvre l'éditeur avec ID
   ↓
2. useEffect détecte la présence d'un UUID valide
   ↓
3. useCampaignFromUrl charge la campagne depuis Supabase
   ↓
4. Campagne restaurée avec toutes ses données :
   - Modules sauvegardés
   - Fond personnalisé
   - Configuration de jeu
   - Éléments du canvas
```

## 🎯 Différences Clés

| Aspect | Nouvelle Campagne | Campagne Existante |
|--------|------------------|-------------------|
| **ID** | `undefined` | UUID valide |
| **Nom** | "Nouvelle campagne" | Nom sauvegardé |
| **Design** | Fond blanc, vide | Design sauvegardé |
| **Modules** | Aucun | Modules sauvegardés |
| **GameConfig** | `{}` vide | Configuration sauvegardée |
| **Canvas** | Vide | Éléments sauvegardés |
| **Sauvegarde** | Pas encore en BDD | Déjà en BDD |

## 🚀 Avantages de la Solution

### ✅ **Isolation Complète**
- Chaque nouvelle campagne démarre avec un état vierge
- Aucune pollution de données entre campagnes

### ✅ **Type-Safe**
- Validation du type de campagne
- Structure TypeScript stricte

### ✅ **Performance**
- Pas de chargement inutile depuis la BDD
- Initialisation instantanée en mémoire

### ✅ **Debugging Facile**
- Logs clairs dans la console
- Distinction visuelle entre nouvelle et existante

### ✅ **Cohérence**
- Même logique dans tous les éditeurs
- Comportement prévisible

## 🧪 Comment Tester

### Test 1 : Nouvelle Campagne
1. Ouvrir `/form-editor` (sans paramètre)
2. Vérifier dans la console : `🆕 [FormEditor] Mount: no campaign id → initializing fresh campaign`
3. Vérifier que le canvas est vide
4. Vérifier qu'il n'y a pas de modules de campagnes précédentes

### Test 2 : Campagne Existante
1. Créer et sauvegarder une campagne
2. Ouvrir `/form-editor?campaign=uuid`
3. Vérifier dans la console : `📂 [FormEditor] Mount: campaign id detected, will load from URL`
4. Vérifier que tous les modules sont restaurés

### Test 3 : Navigation Entre Campagnes
1. Ouvrir une campagne existante avec des modules
2. Naviguer vers `/form-editor` (nouvelle campagne)
3. Vérifier que le canvas est vide (pas de modules de la précédente)
4. Retourner à la campagne existante
5. Vérifier que les modules sont toujours là

## 📝 Fichiers Modifiés

1. ✅ `/src/stores/editorStore.ts` - Fonction `initializeNewCampaign`
2. ✅ `/src/components/FormEditor/DesignEditorLayout.tsx`
3. ✅ `/src/components/DesignEditor/DesignEditorLayout.tsx`
4. ✅ `/src/components/JackpotEditor/JackpotEditorLayout.tsx`
5. ✅ `/src/components/ScratchCardEditor/ScratchCardEditorLayout.tsx`
6. ✅ `/src/components/ModelEditor/DesignEditorLayout.tsx`

## ⚠️ Notes Importantes

- **Pas de sauvegarde automatique** : Les nouvelles campagnes ne sont pas sauvegardées en BDD tant que l'utilisateur ne clique pas sur "Sauvegarder"
- **État en mémoire** : La campagne vierge existe uniquement dans le store Zustand
- **Type par défaut** : Si le type n'est pas valide, 'wheel' est utilisé par défaut
- **Validation UUID** : Le DesignEditor valide que l'ID est un UUID valide avant de charger

## ✅ Résultat Final

**Les nouvelles campagnes sont maintenant complètement vierges et ne conservent plus les données des campagnes précédentes !**
