# 🔍 Debug: Où sont les segments ?

## Étape 1: Ouvrir la Console

1. Ouvrez l'application dans le navigateur
2. Appuyez sur **F12** (ou **Cmd+Option+I** sur Mac)
3. Allez dans l'onglet **Console**

## Étape 2: Inspecter campaignData

Dans la console, tapez :

```javascript
// Récupérer le store
const store = window.__ZUSTAND_STORES__?.editorStore || {};
const campaignData = store.getState?.()?.campaignData;

console.log('📦 CampaignData:', campaignData);
console.log('📦 Keys:', Object.keys(campaignData || {}));

// Chercher les segments
console.log('🔍 segments:', campaignData?.segments);
console.log('🔍 gameConfig:', campaignData?.gameConfig);
console.log('🔍 gameConfig.wheel:', campaignData?.gameConfig?.wheel);
console.log('🔍 gameConfig.segments:', campaignData?.gameConfig?.segments);
console.log('🔍 config:', campaignData?.config);
console.log('🔍 config.segments:', campaignData?.config?.segments);
console.log('🔍 config.roulette:', campaignData?.config?.roulette);
```

## Étape 3: Chercher "Segment 1"

Si les logs ci-dessus ne montrent rien, cherchons dans toute la structure :

```javascript
function findSegments(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  
  for (let key in obj) {
    const value = obj[key];
    const currentPath = path ? `${path}.${key}` : key;
    
    // Si c'est un tableau qui contient des objets avec "Segment"
    if (Array.isArray(value) && value.length > 0) {
      const first = value[0];
      if (first && (first.label?.includes('Segment') || first.text?.includes('Segment'))) {
        console.log('✅ TROUVÉ:', currentPath, value);
      }
    }
    
    // Récursion
    if (typeof value === 'object') {
      findSegments(value, currentPath);
    }
  }
}

findSegments(campaignData);
```

## Étape 4: Copier le Résultat

Une fois que vous avez trouvé où sont les segments, copiez le chemin (ex: `gameConfig.wheel.segments`) et envoyez-le moi.

## Alternative: Inspecter depuis l'Éditeur

Dans l'éditeur de roue (image 2), ouvrez la console et tapez :

```javascript
// Récupérer le state de l'éditeur actuel
const editorState = window.__EDITOR_STATE__;
console.log('🎡 Editor State:', editorState);
```

---

**Envoyez-moi les résultats de ces commandes pour que je puisse corriger le chemin !**
