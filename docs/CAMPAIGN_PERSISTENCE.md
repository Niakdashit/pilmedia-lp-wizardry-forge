# Campaign Persistence System v2.0

## Vue d'ensemble

Le système de persistance des campagnes a été complètement refactorisé pour offrir :
- **Autosave centralisé** : Un seul hook `useCentralizedAutosave` pour tous les éditeurs
- **Synchronisation par événements** : Cache automatiquement synchronisé via `campaignEvents`
- **Retry automatique** : 3 tentatives avec backoff exponentiel en cas d'échec
- **Métriques de performance** : Suivi du temps de sauvegarde et taux de succès
- **Indicateur visuel** : Affichage en temps réel de l'état de sauvegarde

## Problème résolu (v1)

Auparavant, seuls les champs de base de la campagne étaient sauvegardés :
- `name`, `status`, `type`
- Aucune persistance de l'état de l'éditeur (canvas, modules, configurations)

## Architecture v2.0

### 1. Hook centralisé `useCentralizedAutosave`

Remplace tous les anciens systèmes d'autosave éparpillés (`useAutoSaveToSupabase`, `useEditorUnmountSave`).

**Features:**
- ✅ Debounce intelligent (2s par défaut)
- ✅ Détection de changements (évite les sauvegardes inutiles)
- ✅ Retry automatique avec backoff exponentiel (3 tentatives)
- ✅ Protection contre les sauvegardes concurrentes
- ✅ Sauvegarde au démontage (unmount protection)
- ✅ Métriques de performance en temps réel
- ✅ Gestion d'erreurs robuste

### 2. Système d'événements `campaignEvents`

Synchronisation automatique entre les composants via des événements :

```typescript
// Événements disponibles
'campaign:saved'              // Sauvegarde manuelle complète
'campaign:loaded'             // Campagne chargée depuis DB
'campaign:autosave:start'     // Début d'autosave
'campaign:autosave:complete'  // Autosave terminée
'campaign:cache:invalidate'   // Cache invalidé
```

### 3. Cache intelligent `useFastCampaignLoader`

- Cache en mémoire avec validation d'âge (30s max)
- Synchronisation automatique via événements (pas de `updateCache` manuel)
- Préchargement des images en arrière-plan
- Invalidation automatique du cache expiré

### 4. Indicateur visuel `SaveIndicator`

Composant dans le header affichant :
- 🔵 "Sauvegarde..." (pendant la sauvegarde)
- 🟢 "Sauvegardé il y a X secondes/minutes" (succès)
- 🔴 "Erreur de sauvegarde" (échec)

## Usage in Editors (v2.0)

Tous les éditeurs utilisent maintenant le système centralisé.

### 1. Importer le hook centralisé

```typescript
import { useCentralizedAutosave } from '@/hooks/useCentralizedAutosave';
import { useCampaigns } from '@/hooks/useCampaigns';
```

### 2. Dans le composant éditeur

```typescript
const DesignEditorLayout = () => {
  const { saveCampaign } = useCampaigns();
  const campaignState = useEditorStore((s) => s.campaign);
  
  // États locaux de l'éditeur
  const [canvasElements, setCanvasElements] = useState([]);
  const [modularPage, setModularPage] = useState(createEmptyModularPage());
  
  // 🔄 Hook centralisé d'autosave avec toutes les fonctionnalités
  const { 
    isSaving, 
    saveError, 
    lastSavedAt, 
    forceSave,
    metrics 
  } = useCentralizedAutosave({
    campaign: {
      ...campaignState,
      canvasElements,
      modularPage,
      screenBackgrounds,
      // Tous les états de l'éditeur
    },
    saveCampaign,
    delay: 2000, // Debounce de 2s
    enabled: true,
    maxRetries: 3, // 3 tentatives avec backoff exponentiel
    onError: (error) => {
      console.error('Autosave error:', error);
      toast.error('Erreur de sauvegarde');
    }
  });
  
  // Protection au démontage
  useEffect(() => {
    return () => {
      forceSave();
    };
  }, [forceSave]);
  
  // Passer les états au header pour l'indicateur visuel
  return (
    <div>
      <EditorHeader 
        isSaving={isSaving}
        saveError={saveError}
        lastSavedAt={lastSavedAt}
      />
      {/* ... reste de l'éditeur */}
    </div>
  );
};
```

### 3. Système d'événements

Le système utilise des événements pour synchroniser automatiquement le cache :

```typescript
// Événements émis automatiquement
emitCampaignEvent('campaign:autosave:start', { campaignId, source });
emitCampaignEvent('campaign:autosave:complete', { campaignId, data, source });
emitCampaignEvent('campaign:saved', { campaignId, data, source });

// Le loader se synchronise automatiquement
useEffect(() => {
  const unsubscribe = onCampaignEvent('campaign:saved', ({ data }) => {
    updateCampaignCache(campaignId, data); // Mise à jour automatique du cache
  });
  return unsubscribe;
}, [campaignId]);
```

## Structure de sauvegarde complète

Tous les états de l'éditeur sont sauvegardés :

```typescript
{
  id: string,
  name: string,
  type: 'wheel' | 'quiz' | 'form' | 'jackpot' | 'scratch',
  status: 'draft' | 'active' | 'ended',
  
  // Configuration complète de l'éditeur
  config: {
    // Configuration du canvas (éléments, backgrounds)
    canvasConfig: {
      elements: [...],              // Éléments dessinés sur le canvas
      background: {...},             // Image/couleur de fond desktop
      mobileBackground: {...},       // Image/couleur de fond mobile
      screenBackgrounds: {...},      // Backgrounds par écran
      device: 'desktop' | 'tablet' | 'mobile',
      zoom: number
    },
    
    // Structure modulaire (modules par écran)
    modularPage: {
      screens: {
        screen1: [...],
        screen2: [...],
        screen3: [...]
      },
      _updatedAt: timestamp
    },
    
    // Configurations spécifiques
    campaignConfig: {...},
    buttonConfig: {...},
    screens: {...}
  },
  
  // Configuration du jeu (spécifique à chaque type)
  game_config: {
    wheel: {...},      // Pour type='wheel'
    quiz: {...},       // Pour type='quiz'
    scratch: {...},    // Pour type='scratch'
    jackpot: {...}     // Pour type='jackpot'
  },
  
  // Configuration du design
  design: {
    backgroundImage: string,           // Image de fond desktop
    mobileBackgroundImage: string,     // Image de fond mobile
    background: string,                // Couleur/gradient de fond
    screenBackgrounds: {...},          // Backgrounds par écran
    extractedColors: [...],            // Couleurs extraites des images
    customColors: {...},               // Couleurs personnalisées
    designModules: {...},              // Modules de design
    customTexts: [...],                // Textes personnalisés
    customImages: [...],               // Images personnalisées
    borderStyle: {...},                // Style de bordure
    wheelBorderStyle: {...}            // Style de bordure roue
  },
  
  // Champs du formulaire
  form_fields: [...]
}
```

## API Reference v2.0

### `useCentralizedAutosave(options)`

Hook principal pour gérer l'autosave de manière centralisée.

**Options:**
```typescript
{
  campaign: any;              // État complet de la campagne
  saveCampaign: Function;     // Fonction de sauvegarde Supabase
  delay?: number;             // Délai de debounce (défaut: 2000ms)
  enabled?: boolean;          // Activer/désactiver (défaut: true)
  maxRetries?: number;        // Nombre de tentatives (défaut: 3)
  onError?: (error) => void;  // Callback d'erreur
}
```

**Returns:**
```typescript
{
  isSaving: boolean;          // État de sauvegarde en cours
  saveError: Error | null;    // Dernière erreur
  lastSavedAt: Date;          // Date de dernière sauvegarde
  forceSave: () => Promise;   // Sauvegarde immédiate
  waitForSave: () => Promise; // Attendre la sauvegarde en cours
  cancelPendingSave: () => void; // Annuler le debounce
  metrics: SaveMetrics;       // Métriques de performance
}
```

### `useFastCampaignLoader(options)`

Hook pour charger les campagnes avec cache intelligent.

**Options:**
```typescript
{
  campaignId: string | null;
  enabled?: boolean;
}
```

**Returns:**
```typescript
{
  campaign: any;              // Campagne chargée
  isLoading: boolean;         // État de chargement
  error: Error | null;        // Erreur de chargement
  reload: () => Promise;      // Recharger
  invalidateCache: () => void; // Invalider le cache
}
```

**Features:**
- Cache en mémoire avec validation d'âge (30s max)
- Synchronisation automatique via événements
- Préchargement des images en arrière-plan

### `SaveIndicator` Component

Composant d'indicateur visuel dans le header.

**Props:**
```typescript
{
  isSaving: boolean;        // État de sauvegarde
  error?: Error | null;     // Erreur éventuelle
  lastSavedAt?: Date;       // Date de dernière sauvegarde
}
```

**Affichage:**
- 🔵 "Sauvegarde..." (pendant la sauvegarde)
- 🟢 "Sauvegardé il y a X" (succès)
- 🔴 "Erreur de sauvegarde" (échec)

### Métriques de performance

```typescript
const { metrics } = useCentralizedAutosave({ ... });

console.log(metrics);
// {
//   totalSaves: 42,
//   successfulSaves: 40,
//   failedSaves: 2,
//   averageSaveTime: 234,  // ms
//   lastSaveDuration: 189   // ms
// }
```

## Système de retry

En cas d'échec, le système retry automatiquement avec backoff exponentiel :
- **Tentative 1** : immédiate
- **Tentative 2** : après 1 seconde
- **Tentative 3** : après 2 secondes
- **Tentative 4** : après 4 secondes

Après 3 échecs, l'erreur est propagée à `onError` et affichée dans l'indicateur.

## Logs de debugging

Le système inclut des logs détaillés pour le debugging :

```javascript
// Autosave
💾 [CentralizedAutosave] Saving campaign: campaign-id-123
✅ [CentralizedAutosave] Save complete in 234ms: campaign-id-123
📊 [SaveMetrics] { totalSaves: 42, successRate: "95.2%", avgTime: "189ms", lastTime: "234ms" }

// Cache
📦 [FastCampaignLoader] Cache updated for campaign-id-123
⚡ [FastCampaignLoader] Using valid cache: { id: "campaign-id-123", age: 1234 }
🔄 [FastCampaignLoader] Auto-updating cache from save event

// Retry
⚠️ [CentralizedAutosave] Retry 1/3 after 1000ms
⚠️ [CentralizedAutosave] Retry 2/3 after 2000ms
❌ [CentralizedAutosave] Save failed after 5234ms
📊 [SaveMetrics] Failure rate: 4.8%
```

## Migration depuis v1

### Avant (v1)
```typescript
// Plusieurs hooks éparpillés
useAutoSaveToSupabase({ ... });
useEditorUnmountSave({ ... });

// Gestion manuelle du cache
useFastCampaignLoader({ ... }).updateCache(id, data);
```

### Après (v2)
```typescript
// Un seul hook centralisé
const { isSaving, saveError, lastSavedAt } = useCentralizedAutosave({ ... });

// Cache auto-synchronisé via événements
useFastCampaignLoader({ ... }); // Plus besoin d'updateCache manuel
```

## Tests de validation

Pour vérifier que tout fonctionne :

1. ✅ Créer une campagne complète avec tous les types d'éléments
2. ✅ Observer l'indicateur "Sauvegarde..." puis "Sauvegardé il y a X"
3. ✅ Fermer l'éditeur (vérifier unmount save dans les logs)
4. ✅ Rouvrir la campagne → Vérifier que tout est restauré
5. ✅ Simuler une erreur réseau → Vérifier les 3 retry automatiques
6. ✅ Consulter les métriques dans la console en mode dev

## Problèmes connus et solutions

### Problème : "isSaving" reste bloqué à true
**Solution** : Vérifier qu'il n'y a pas d'erreur dans `saveCampaignToDB`. Le `finally` reset toujours `isSaving`.

### Problème : Cache non synchronisé après sauvegarde
**Solution** : Vérifier que les événements `campaign:saved` sont bien émis et écoutés.

### Problème : Retry échoue même après 3 tentatives
**Solution** : Vérifier la connexion réseau et les logs Supabase pour identifier l'erreur persistante.

## Améliorations futures

- [ ] Détection de conflits de sauvegarde (vérification `updated_at`)
- [ ] Mode offline avec queue IndexedDB
- [ ] Compression des payloads pour réduire la taille
- [ ] Historique des versions avec possibilité de restauration
- [ ] Dashboard d'analytics de performance
