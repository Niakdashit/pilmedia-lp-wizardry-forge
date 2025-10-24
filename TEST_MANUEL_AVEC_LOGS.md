# 🔍 Test Manuel avec Logs Console

## Instructions pour Débugger

### 1. Ouvrir l'Application
```
http://localhost:8080/form-editor
```

### 2. Ouvrir la Console du Navigateur
- **Chrome/Edge**: `Cmd+Option+J` (Mac) ou `F12` (Windows)
- **Firefox**: `Cmd+Option+K` (Mac) ou `F12` (Windows)
- **Safari**: `Cmd+Option+C` (Mac)

### 3. Effectuer le Test
1. Cliquer sur le bouton **"Paramètres"** dans la toolbar
2. Attendre que la modale s'ouvre
3. Remplir le nom de campagne (ex: "FORM TEST")
4. Cliquer sur **"Enregistrer"**

### 4. Observer les Logs Console

Vous devriez voir ces logs dans l'ordre :

```
[CampaignSettingsModal] handleSaveAndClose - effectiveCampaignId: <UUID>
[CampaignSettingsModal] Calling upsertSettings with ID: <UUID>
[useCampaignSettings.upsertSettings] START - campaignId: <UUID>
[useCampaignSettings.upsertSettings] realId after resolve: <UUID>
```

### 5. Vérifier le Résultat

#### ✅ Si SUCCÈS
- Pas de message d'erreur
- Modale se ferme
- Logs montrent un UUID valide à chaque étape

#### ❌ Si ÉCHEC
- Message "Sauvegarde distante échouée..."
- Logs montrent:
  - `effectiveCampaignId: ""` (vide) OU
  - `realId after resolve: null` OU
  - Une erreur spécifique

### 6. Copier les Logs

**Copiez TOUS les logs console** et partagez-les pour analyse.

---

## Logs Attendus (Succès)

```javascript
[JackpotToolbar] handleOpenSettings - campaignId: undefined
[JackpotToolbar] Creating new campaign...
[saveCampaignToDB] Payload: { name: "Nouvelle campagne jackpot", type: "jackpot", ... }
[saveCampaignToDB] Campaign created with ID: abc123-def456-...
[JackpotToolbar] Campaign created, ID: abc123-def456-...
[CampaignSettingsModal] effectiveCampaignId: abc123-def456-...
[CampaignSettingsModal] handleSaveAndClose - effectiveCampaignId: abc123-def456-...
[useCampaignSettings.upsertSettings] START - campaignId: abc123-def456-...
[useCampaignSettings.upsertSettings] realId after resolve: abc123-def456-...
[useCampaignSettings.upsertSettings] Upserting to campaign_settings...
[useCampaignSettings.upsertSettings] SUCCESS
```

---

## Logs Problématiques (Échec)

### Scénario 1: effectiveCampaignId vide
```javascript
[CampaignSettingsModal] handleSaveAndClose - effectiveCampaignId: ""
[CampaignSettingsModal] ERROR: effectiveCampaignId is empty!
```
**Cause**: Le `campaignId` n'est pas passé correctement à la modale

---

### Scénario 2: realId null
```javascript
[CampaignSettingsModal] handleSaveAndClose - effectiveCampaignId: abc123-...
[useCampaignSettings.upsertSettings] START - campaignId: abc123-...
[useCampaignSettings.upsertSettings] realId after resolve: null
[useCampaignSettings.upsertSettings] ERROR: realId is null/undefined
```
**Cause**: `resolveCampaignId()` ne reconnaît pas l'UUID

---

### Scénario 3: Campagne pas en BDD
```javascript
[useCampaignSettings.upsertSettings] realId after resolve: abc123-...
[useCampaignSettings] Campaign not found, creating minimal row...
Error: RLS policy violation
```
**Cause**: La campagne n'existe pas en BDD ou problème RLS

---

## Actions selon les Logs

| Log Observé | Problème | Action |
|-------------|----------|--------|
| `effectiveCampaignId: ""` | Prop pas passée | Vérifier `campaignId={(campaignState as any)?.id \|\| campaignId}` |
| `realId: null` | UUID invalide | Vérifier format UUID (regex) |
| `Campaign not found` | Pas en BDD | Vérifier que `handleOpenSettings` crée bien la campagne |
| `RLS policy violation` | Permissions | Vérifier policies Supabase |

---

## Commandes Utiles

### Vérifier localStorage
```javascript
// Dans la console
Object.keys(localStorage).filter(k => k.includes('campaign'))
```

### Vérifier le store Zustand
```javascript
// Dans la console (si accessible)
window.__ZUSTAND_STORE__?.getState()?.campaign
```

### Forcer un refresh
```javascript
window.location.reload()
```

---

**Effectuez ce test et partagez les logs console complets !**
