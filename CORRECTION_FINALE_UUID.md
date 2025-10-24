# 🎯 CORRECTION FINALE - Filtrage des IDs de Preview

## Problème Identifié

Les éditeurs utilisent des IDs hardcodés comme `"quiz-design-preview"`, `"jackpot-design-preview"`, etc. au lieu d'UUIDs valides.

Quand on passe `(campaignState as any)?.id` à la modale, on passe ces IDs de preview qui ne sont PAS des UUIDs valides, donc `resolveCampaignId()` retourne `null`.

## Solution Appliquée

Ajouter une validation UUID avant de passer l'ID à la modale :

```typescript
// Helper: vérifier si c'est un UUID valide (pas un ID de preview)
const isValidUuid = (id?: string) => {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

// Récupérer l'ID réel (UUID) depuis le store ou la prop
const realCampaignId = isValidUuid((campaignState as any)?.id) 
  ? (campaignState as any)?.id 
  : (isValidUuid(campaignId) ? campaignId : undefined);
```

Puis passer `realCampaignId` à la modale au lieu de `(campaignState as any)?.id`.

## Fichiers à Corriger

1. ✅ QuizEditor/DesignToolbar.tsx (FAIT)
2. ⏳ DesignEditor/DesignToolbar.tsx
3. ⏳ FormEditor/DesignToolbar.tsx
4. ⏳ JackpotEditor/DesignToolbar.tsx
5. ⏳ ScratchCardEditor/DesignToolbar.tsx
6. ⏳ ModelEditor/DesignToolbar.tsx

## Test Après Correction

```
1. Ouvrir /form-editor
2. Cliquer "Paramètres"
3. Remplir nom
4. Cliquer "Enregistrer"
5. Vérifier: PAS de message d'erreur
```

## Logs Attendus

```
[CampaignSettingsModal] effectiveCampaignId: <UUID valide>
[useCampaignSettings.upsertSettings] START - campaignId: <UUID valide>
[useCampaignSettings.upsertSettings] realId after resolve: <UUID valide>
SUCCESS
```
