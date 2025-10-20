# 🎯 Problème: Zones de Sécurité Non Synchronisées Entre Mode Édition et Preview

## Observation

**Mode Aperçu (avec sidebar)**: Le bouton "Participer" respecte une marge en haut (zone de sécurité)  
**Mode Édition (fullscreen)**: Le bouton "Participer" est collé tout en haut sans marge

## Cause Racine

### PreviewRenderer (Mode Aperçu)
```tsx
// Ligne 276
const safeZonePadding = previewMode === 'mobile' ? 28 : previewMode === 'tablet' ? 40 : 56;

// Ligne 468 - Padding appliqué directement sur la section des modules
<section 
  className="space-y-6" 
  data-screen="screen1"
  style={{ padding: safeZonePadding, boxSizing: 'border-box' }}
>
  <ModuleRenderer modules={modules1} />
</section>
```

### DesignCanvas (Mode Édition)
```tsx
// Ligne 33
const SAFE_ZONE_PADDING: Record<DeviceType, number> = {
  desktop: 56,
  tablet: 40,
  mobile: 28
};

// Ligne 2577-2586 - Padding appliqué sur un conteneur parent
<div
  className="w-full flex justify-center mb-6"
  style={{
    paddingLeft: safeZonePadding,
    paddingRight: safeZonePadding,
    paddingTop: safeZonePadding + (logoVisualHeight * 0.7),
    paddingBottom: safeZonePadding + (footerVisualHeight * 0.7),
    boxSizing: 'border-box'
  }}
>
  <div className="w-full max-w-[1500px] flex">
    <ModularCanvas
      screen={screenId}
      modules={regularModules}
      // ... Le canvas ne reçoit pas le padding
    />
  </div>
</div>
```

## Différence Clé

| Aspect | PreviewRenderer | DesignCanvas |
|--------|----------------|--------------|
| **Padding appliqué sur** | `<section>` contenant `ModuleRenderer` | `<div>` parent du `ModularCanvas` |
| **Modules reçoivent padding** | ✅ Oui, directement | ❌ Non, seulement le conteneur |
| **Résultat** | Modules respectent zone de sécurité | Modules ignorent zone de sécurité |

## Solution Proposée

### Option 1: Appliquer le padding sur ModularCanvas (Recommandé)

Modifier `DesignCanvas.tsx` pour appliquer le padding directement sur le `ModularCanvas` ou sa section parente :

```tsx
<div className="w-full max-w-[1500px] flex" style={{ minHeight: effectiveCanvasSize?.height || 640 }}>
  <div 
    className="w-full"
    style={{
      padding: `${safeZonePadding}px`,
      boxSizing: 'border-box'
    }}
  >
    <ModularCanvas
      screen={screenId as any}
      modules={regularModules}
      // ...
    />
  </div>
</div>
```

### Option 2: Passer safeZonePadding comme prop à ModularCanvas

Modifier `ModularCanvas` pour accepter un prop `safeZonePadding` et l'appliquer en interne :

```tsx
// Dans DesignCanvas
<ModularCanvas
  screen={screenId as any}
  modules={regularModules}
  safeZonePadding={safeZonePadding}  // Nouveau prop
  // ...
/>

// Dans ModularCanvas.tsx
<div style={{ padding: safeZonePadding, boxSizing: 'border-box' }}>
  {/* Rendu des modules */}
</div>
```

### Option 3: Utiliser une classe CSS globale

Créer une classe CSS qui applique le padding selon le device :

```css
.safe-zone-mobile { padding: 28px; }
.safe-zone-tablet { padding: 40px; }
.safe-zone-desktop { padding: 56px; }
```

## Impact

**Fichiers à modifier**:
- `/src/components/DesignEditor/DesignCanvas.tsx`
- `/src/components/QuizEditor/DesignCanvas.tsx`
- `/src/components/ScratchCardEditor/DesignCanvas.tsx`
- `/src/components/JackpotEditor/DesignCanvas.tsx`
- `/src/components/ModelEditor/DesignCanvas.tsx`

Ou alternativement :
- `/src/components/QuizEditor/modules/ModularCanvas.tsx` (si Option 2)

## Vérification

Après correction, vérifier que :
- [ ] Mode édition: bouton "Participer" a une marge en haut (28px sur mobile)
- [ ] Mode aperçu: bouton "Participer" a la même marge (28px sur mobile)
- [ ] Les deux modes affichent les modules aux mêmes positions
- [ ] La zone de sécurité en pointillés correspond au padding réel

## Recommandation

**Option 1** est la plus simple et la plus rapide à implémenter. Elle garantit que tous les modules respectent la zone de sécurité sans modifier le composant `ModularCanvas`.
