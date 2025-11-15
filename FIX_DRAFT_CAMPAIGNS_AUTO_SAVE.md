# 🐛 Fix: Campagnes Brouillon Créées Automatiquement

## Problème Identifié

Lorsqu'un utilisateur entre dans un éditeur (JackpotEditor, QuizEditor, etc.) en mode article et repart **sans sauvegarder explicitement**, des campagnes brouillon sont créées automatiquement dans la base de données.

### Cause Racine

Le système avait **3 mécanismes de sauvegarde automatique** qui s'activaient même pour les campagnes temporaires (non encore sauvegardées) :

#### 1. **Génération d'ID Temporaire** (JackpotEditorLayout.tsx:500)
```typescript
const tempId = generateTempCampaignId('jackpot');
```
Un ID temporaire est créé dès l'entrée dans l'éditeur pour permettre l'édition.

#### 2. **Auto-Save toutes les 30 secondes** (JackpotEditorLayout.tsx:373-395)
```typescript
useAutoSaveToSupabase(..., { 
  enabled: isPersistedId,  // ✅ Déjà protégé
  interval: 30000 
})
```
✅ **Ce mécanisme était déjà protégé** : il ne sauvegarde que les campagnes avec un UUID valide.

#### 3. **Sauvegarde au Unmount** (useEditorUnmountSave.ts)
```typescript
useEditorUnmountSave('jackpot', { ... }, saveCampaign);
```
❌ **PROBLÈME** : Ce hook sauvegardait **TOUJOURS** quand on quittait l'éditeur, même pour les campagnes temporaires.

## Solution Implémentée

### Modification du Hook `useEditorUnmountSave`

**Fichier modifié** : `/src/hooks/useEditorUnmountSave.ts`

**Changement** : Ajout d'une vérification pour **ne sauvegarder que les campagnes persistées** (avec UUID valide).

```typescript
// 🚫 CRITICAL: Only save if campaign has a real UUID (not temp ID)
if (!isUuid(id)) {
  console.log(`⏭️ [${campaignType}Editor] Skipping unmount save - campaign is temporary or not persisted (id: ${id})`);
  resetCampaign();
  return;
}

console.log(`💾 [${campaignType}Editor] Saving persisted campaign before unmount (id: ${id})`);
// ... suite de la sauvegarde
```

### Logique de Vérification

```typescript
const isUuid = (v?: string) => 
  !!v && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
```

Cette fonction vérifie si l'ID est un **UUID valide** (format standard des IDs Supabase).

### Types d'IDs

| Type | Format | Exemple | Sauvegarde Unmount |
|------|--------|---------|-------------------|
| **Temporaire** | `temp-{type}-{timestamp}-{random}` | `temp-jackpot-1731668400000-abc123` | ❌ Non |
| **Persisté** | UUID v4 | `550e8400-e29b-41d4-a716-446655440000` | ✅ Oui |

## Impact de la Correction

### ✅ Comportement Corrigé

1. **Entrée dans l'éditeur** : Un ID temporaire est créé
2. **Édition sans sauvegarde** : Les modifications restent en mémoire
3. **Sortie de l'éditeur** : 
   - ❌ **Avant** : Sauvegarde automatique → campagne brouillon créée
   - ✅ **Maintenant** : Pas de sauvegarde → pas de campagne brouillon

### ✅ Campagnes Sauvegardées Explicitement

1. **Utilisateur clique "Sauvegarder"** : L'ID temporaire est remplacé par un UUID
2. **Édition continue** : Auto-save toutes les 30s (déjà protégé)
3. **Sortie de l'éditeur** : Sauvegarde au unmount (maintenant protégé aussi)

## Éditeurs Concernés

La correction s'applique **automatiquement** à tous les éditeurs qui utilisent `useEditorUnmountSave` :

- ✅ **DesignEditor** (Roue de la Fortune)
- ✅ **JackpotEditor**
- ✅ **QuizEditor**
- ✅ **FormEditor**
- ✅ **ScratchCardEditor**
- ✅ **ReferenceEditor**
- ✅ **SwiperEditor**
- ✅ **WebEditor**

## Logs de Debug

### Campagne Temporaire (pas de sauvegarde)
```
🧹 [jackpotEditor] Unmounting - checking if save needed
⏭️ [jackpotEditor] Skipping unmount save - campaign is temporary or not persisted (id: temp-jackpot-1731668400000-abc123)
```

### Campagne Persistée (sauvegarde normale)
```
🧹 [jackpotEditor] Unmounting - checking if save needed
💾 [jackpotEditor] Saving persisted campaign before unmount (id: 550e8400-e29b-41d4-a716-446655440000)
✅ [jackpotEditor] Campaign saved successfully
```

## Tests Recommandés

### Test 1 : Campagne Temporaire
1. Ouvrir JackpotEditor en mode article
2. Ne rien modifier ou faire quelques modifications
3. Quitter l'éditeur sans sauvegarder
4. ✅ **Vérifier** : Aucune campagne brouillon dans `/campaigns`

### Test 2 : Campagne Sauvegardée
1. Ouvrir JackpotEditor en mode article
2. Faire des modifications
3. Cliquer sur "Sauvegarder"
4. Faire d'autres modifications
5. Quitter l'éditeur
6. ✅ **Vérifier** : Les dernières modifications sont bien sauvegardées

### Test 3 : Auto-Save
1. Ouvrir une campagne existante
2. Faire des modifications
3. Attendre 30 secondes
4. ✅ **Vérifier** : Log "Campaign auto-saved to Supabase" dans la console

## Fichiers Modifiés

- `/src/hooks/useEditorUnmountSave.ts` - Ajout de la vérification UUID

## Date de Correction

15 novembre 2025 à 12:15 UTC+01:00
