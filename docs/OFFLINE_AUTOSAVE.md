# Phase 2: Offline-First Autosave

## Architecture

### 1. IndexedDB Storage (`src/lib/db/offlineQueue.ts`)

Stockage local persistant pour:
- **Queue de sauvegarde**: `save_queue` - Modifications en attente de synchronisation
- **Brouillons**: `drafts` - État actuel de chaque campagne

```typescript
interface QueuedSave {
  id: string;
  campaignId: string;
  data: any;
  timestamp: number;
  retries: number;
  error?: string;
}
```

### 2. Hook Offline (`src/hooks/useOfflineAutosave.ts`)

Gère:
- Détection online/offline
- Sauvegarde dans la queue
- Synchronisation automatique
- Retry avec backoff exponentiel

### 3. Hook Autosave Amélioré (`src/hooks/useEnhancedAutosave.ts`)

Autosave intelligent qui:
- Sauvegarde en ligne si connecté (avec version check)
- Sauvegarde dans IndexedDB si hors ligne
- Retry automatique (3 tentatives)
- Fallback offline en cas d'échec

### 4. Indicateur Visuel (`src/components/OfflineSyncIndicator.tsx`)

États visuels:
- ✅ **Synchronisé** (vert)
- 🔄 **Synchronisation...** (bleu, animation)
- ⚠️ **X en attente** (jaune)
- 📴 **Hors ligne** (orange)

## Utilisation

### Dans un éditeur

```typescript
import { useEnhancedAutosave } from '@/hooks/useEnhancedAutosave';

function CampaignEditor() {
  const [campaign, setCampaign] = useState(...);
  
  const {
    isSaving,
    lastSaved,
    hasUnsavedChanges,
    triggerManualSave,
    isOnline,
    queueSize,
    isSyncing,
  } = useEnhancedAutosave(campaign.id, campaign, {
    enabled: true,
    delay: 3000,
    onSuccess: () => console.log('Saved!'),
    onError: (err) => console.error('Error:', err),
  });

  return (
    <EditorHeader
      campaign={campaign}
      onSave={triggerManualSave}
      isLoading={isSaving}
      isOnline={isOnline}
      queueSize={queueSize}
      isSyncing={isSyncing}
    />
  );
}
```

## Flux de Données

### Mode Online

1. Modification détectée
2. Debounce (3s)
3. `saveWithVersionCheck` avec revision
4. Si conflit → toast erreur
5. Si succès → update lastSaved
6. Si échec → retry (3x avec backoff)
7. Si tous échecs → fallback offline

### Mode Offline

1. Modification détectée
2. Sauvegarde directe dans IndexedDB
3. Ajout à la queue
4. Toast "Modifications enregistrées localement"

### Retour Online

1. Événement `online` détecté
2. Toast "Connexion rétablie"
3. Synchronisation automatique de la queue
4. Pour chaque item:
   - Tentative de save avec version check
   - Si conflit → retry ou notification
   - Si succès → suppression de la queue
5. Clear des brouillons synchronisés

## Synchronisation

### Auto-sync
- Toutes les 30 secondes si online
- À chaque retour online
- Traite la queue dans l'ordre (FIFO)

### Retry Logic
- Maximum 3 tentatives par item
- Backoff: 1s, 2s, 4s
- Après 3 échecs → notification utilisateur

## Gestion des Conflits

Utilise le système de versioning (Phase 1):
- Chaque save vérifie `revision`
- Si conflit détecté → notification
- Options: Recharger / Écraser / Fusionner (UI à venir)

## Sécurité

- IndexedDB isolé par origine
- Pas de données sensibles stockées
- RLS Supabase toujours appliquée
- Validation côté serveur maintenue

## Performance

- Debounce 3s → max 20 saves/minute
- Queue limitée en taille (max 100 items)
- Cleanup automatique des anciens items
- Compression des données si nécessaire

## Monitoring

Console logs:
- `💾 [Autosave]` - Tentatives de save
- `✅ [Autosave]` - Succès
- `❌ [Autosave]` - Échecs
- `🔄 [OfflineAutosave]` - Sync en cours
- `📴 [OfflineAutosave]` - Mode offline

## Tests

Pour tester le mode offline:
1. Ouvrir DevTools > Network
2. Cocher "Offline"
3. Modifier une campagne
4. Voir toast "Modifications enregistrées localement"
5. Décocher "Offline"
6. Voir toast "Connexion rétablie" + sync

## Améliorations Futures (Phase 3)

- Compression des payloads (LZ-String)
- Diff-based saves (JSON Patch)
- Batch sync (multiple saves en 1 requête)
- Conflict resolution UI
- Backup export/import
