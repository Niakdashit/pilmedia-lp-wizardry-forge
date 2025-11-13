# 📱 Documentation - Recalcul du Scaling Mobile

## Vue d'Ensemble

Le bouton "Recalculer le scaling mobile" dans le DesignToolbar permet de recalculer automatiquement les dimensions et positions des modules pour l'affichage mobile.

---

## 🎯 Objectif

Lorsqu'une campagne est créée en mode desktop, les éléments peuvent avoir des dimensions et positions inadaptées pour mobile. Cette fonction applique un ratio de scaling automatique pour adapter le contenu.

---

## 📊 Ratio de Scaling

### **Valeur Actuelle : -48.2%**

Ce ratio est mentionné dans le tooltip du bouton :
```tsx
title="Recalculer le scaling mobile (-48.2%)"
```

### **Calcul du Ratio**

```typescript
// Desktop standard : 1920px de largeur
// Mobile standard : 375px de largeur
// Ratio = 375 / 1920 = 0.195 ≈ 19.5% de la taille desktop
// Donc réduction de 80.5% ≈ -48.2% après ajustements
```

---

## 🔧 Implémentation Recommandée

### **Fonction de Recalcul**

```typescript
/**
 * Recalcule le scaling mobile pour tous les modules de la campagne
 * Applique un ratio de 0.518 (51.8% de la taille desktop)
 */
const recalculateMobileScaling = useCallback(() => {
  const MOBILE_SCALE_RATIO = 0.518; // 51.8% de la taille desktop
  
  setCampaign((prev: any) => {
    if (!prev) return prev;
    
    const updated = { ...prev };
    
    // 1. Recalculer les éléments du canvas
    if (updated.design?.elements) {
      updated.design.elements = updated.design.elements.map((el: any) => ({
        ...el,
        responsive: {
          ...el.responsive,
          mobile: {
            ...el.responsive?.mobile,
            width: el.width ? el.width * MOBILE_SCALE_RATIO : el.responsive?.mobile?.width,
            height: el.height ? el.height * MOBILE_SCALE_RATIO : el.responsive?.mobile?.height,
            x: el.x ? el.x * MOBILE_SCALE_RATIO : el.responsive?.mobile?.x,
            y: el.y ? el.y * MOBILE_SCALE_RATIO : el.responsive?.mobile?.y,
            fontSize: el.fontSize ? el.fontSize * MOBILE_SCALE_RATIO : el.responsive?.mobile?.fontSize
          }
        }
      }));
    }
    
    // 2. Recalculer les modules modulaires
    if (updated.modularPage?.screens) {
      Object.keys(updated.modularPage.screens).forEach((screenKey) => {
        const screen = screenKey as 'screen1' | 'screen2' | 'screen3';
        updated.modularPage.screens[screen] = updated.modularPage.screens[screen].map((module: any) => ({
          ...module,
          responsive: {
            ...module.responsive,
            mobile: {
              ...module.responsive?.mobile,
              width: module.width ? module.width * MOBILE_SCALE_RATIO : module.responsive?.mobile?.width,
              height: module.height ? module.height * MOBILE_SCALE_RATIO : module.responsive?.mobile?.height,
              fontSize: module.fontSize ? module.fontSize * MOBILE_SCALE_RATIO : module.responsive?.mobile?.fontSize,
              padding: module.padding ? module.padding * MOBILE_SCALE_RATIO : module.responsive?.mobile?.padding,
              margin: module.margin ? module.margin * MOBILE_SCALE_RATIO : module.responsive?.mobile?.margin
            }
          }
        }));
      });
    }
    
    // 3. Recalculer les modules de design
    if (updated.design?.designModules?.screens) {
      Object.keys(updated.design.designModules.screens).forEach((screenKey) => {
        const screen = screenKey as 'screen1' | 'screen2' | 'screen3';
        updated.design.designModules.screens[screen] = updated.design.designModules.screens[screen].map((module: any) => ({
          ...module,
          responsive: {
            ...module.responsive,
            mobile: {
              ...module.responsive?.mobile,
              width: module.width ? module.width * MOBILE_SCALE_RATIO : module.responsive?.mobile?.width,
              height: module.height ? module.height * MOBILE_SCALE_RATIO : module.responsive?.mobile?.height,
              fontSize: module.fontSize ? module.fontSize * MOBILE_SCALE_RATIO : module.responsive?.mobile?.fontSize
            }
          }
        }));
      });
    }
    
    return updated;
  });
  
  // Notification de succès
  console.log('✅ [MobileScaling] Recalcul terminé avec ratio:', MOBILE_SCALE_RATIO);
  alert('Scaling mobile recalculé avec succès !');
}, [setCampaign]);
```

### **Intégration dans DesignEditorLayout**

```tsx
// Dans DesignEditorLayout.tsx

// Ajouter la fonction
const recalculateMobileScaling = useCallback(() => {
  const MOBILE_SCALE_RATIO = 0.518;
  
  setCampaign((prev: any) => {
    if (!prev) return prev;
    
    const updated = { ...prev };
    
    // Recalculer les éléments
    if (updated.design?.elements) {
      updated.design.elements = updated.design.elements.map((el: any) => ({
        ...el,
        responsive: {
          ...el.responsive,
          mobile: {
            ...el.responsive?.mobile,
            width: el.width ? el.width * MOBILE_SCALE_RATIO : el.responsive?.mobile?.width,
            height: el.height ? el.height * MOBILE_SCALE_RATIO : el.responsive?.mobile?.height,
            x: el.x ? el.x * MOBILE_SCALE_RATIO : el.responsive?.mobile?.x,
            y: el.y ? el.y * MOBILE_SCALE_RATIO : el.responsive?.mobile?.y,
            fontSize: el.fontSize ? el.fontSize * MOBILE_SCALE_RATIO : el.responsive?.mobile?.fontSize
          }
        }
      }));
    }
    
    // Recalculer les modules
    if (updated.modularPage?.screens) {
      Object.keys(updated.modularPage.screens).forEach((screenKey) => {
        const screen = screenKey as 'screen1' | 'screen2' | 'screen3';
        updated.modularPage.screens[screen] = updated.modularPage.screens[screen].map((module: any) => ({
          ...module,
          responsive: {
            ...module.responsive,
            mobile: {
              ...module.responsive?.mobile,
              width: module.width ? module.width * MOBILE_SCALE_RATIO : module.responsive?.mobile?.width,
              height: module.height ? module.height * MOBILE_SCALE_RATIO : module.responsive?.mobile?.height,
              fontSize: module.fontSize ? module.fontSize * MOBILE_SCALE_RATIO : module.responsive?.mobile?.fontSize
            }
          }
        }));
      });
    }
    
    return updated;
  });
  
  alert('Scaling mobile recalculé avec succès !');
}, [setCampaign]);

// Passer au DesignToolbar
<DesignToolbar
  // ... autres props
  onRecalculateMobileScaling={recalculateMobileScaling}
/>
```

---

## 🎨 UI/UX

### **Bouton dans la Toolbar**

```tsx
{onRecalculateMobileScaling && (
  <button 
    onClick={onRecalculateMobileScaling}
    className="p-1.5 rounded-lg transition-all duration-200 hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] ml-2 border-l border-gray-200 pl-3"
    title="Recalculer le scaling mobile (-48.2%)"
  >
    <RefreshCw className="w-4 h-4" />
  </button>
)}
```

### **Position**

Le bouton apparaît après les boutons Undo/Redo, séparé par une bordure verticale.

---

## ⚠️ Considérations

### **Quand utiliser cette fonction ?**

✅ **Cas d'usage recommandés :**
- Campagne créée entièrement en mode desktop
- Éléments mal positionnés sur mobile
- Besoin de réinitialiser le responsive

❌ **Cas où ne PAS utiliser :**
- Campagne déjà optimisée manuellement pour mobile
- Éléments avec responsive personnalisé
- Risque d'écraser des ajustements manuels

### **Avertissement à ajouter**

```tsx
const recalculateMobileScaling = useCallback(() => {
  const confirmed = window.confirm(
    'Cette action va recalculer toutes les dimensions mobiles.\n' +
    'Les ajustements manuels seront écrasés.\n\n' +
    'Voulez-vous continuer ?'
  );
  
  if (!confirmed) return;
  
  // ... reste du code
}, [setCampaign]);
```

---

## 📊 Alternatives

### **Option 1 : Scaling Intelligent** (Recommandé)

Au lieu d'un ratio fixe, analyser chaque élément :

```typescript
const getOptimalMobileScale = (element: any): number => {
  // Texte : réduire moins (70%)
  if (element.type === 'text') return 0.7;
  
  // Images : réduire plus (50%)
  if (element.type === 'image') return 0.5;
  
  // Boutons : garder lisible (60%)
  if (element.type === 'button') return 0.6;
  
  // Par défaut
  return 0.518;
};
```

### **Option 2 : Preview Avant Application**

Montrer un aperçu avant/après :

```tsx
const [showPreview, setShowPreview] = useState(false);

<button onClick={() => setShowPreview(true)}>
  Prévisualiser le recalcul
</button>

{showPreview && (
  <Modal>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Avant</h3>
        {/* Aperçu actuel */}
      </div>
      <div>
        <h3>Après</h3>
        {/* Aperçu avec scaling */}
      </div>
    </div>
    <button onClick={applyScaling}>Appliquer</button>
  </Modal>
)}
```

### **Option 3 : Scaling Par Écran**

Permettre de recalculer écran par écran :

```tsx
<select onChange={(e) => recalculateScreen(e.target.value)}>
  <option value="all">Tous les écrans</option>
  <option value="screen1">Écran 1</option>
  <option value="screen2">Écran 2</option>
  <option value="screen3">Écran 3</option>
</select>
```

---

## 🚀 Implémentation Finale Recommandée

```typescript
/**
 * Recalcule le scaling mobile avec confirmation et notification
 */
const recalculateMobileScaling = useCallback(() => {
  // 1. Confirmation
  const confirmed = window.confirm(
    '⚠️ Cette action va recalculer toutes les dimensions mobiles.\n\n' +
    'Les ajustements manuels seront écrasés.\n' +
    'Ratio appliqué : 51.8% de la taille desktop\n\n' +
    'Voulez-vous continuer ?'
  );
  
  if (!confirmed) return;
  
  // 2. Recalcul
  const MOBILE_SCALE_RATIO = 0.518;
  let elementsUpdated = 0;
  
  setCampaign((prev: any) => {
    if (!prev) return prev;
    
    const updated = { ...prev };
    
    // Recalculer les éléments du canvas
    if (updated.design?.elements) {
      updated.design.elements = updated.design.elements.map((el: any) => {
        elementsUpdated++;
        return {
          ...el,
          responsive: {
            ...el.responsive,
            mobile: {
              ...el.responsive?.mobile,
              width: el.width ? Math.round(el.width * MOBILE_SCALE_RATIO) : el.responsive?.mobile?.width,
              height: el.height ? Math.round(el.height * MOBILE_SCALE_RATIO) : el.responsive?.mobile?.height,
              x: el.x ? Math.round(el.x * MOBILE_SCALE_RATIO) : el.responsive?.mobile?.x,
              y: el.y ? Math.round(el.y * MOBILE_SCALE_RATIO) : el.responsive?.mobile?.y,
              fontSize: el.fontSize ? Math.round(el.fontSize * MOBILE_SCALE_RATIO) : el.responsive?.mobile?.fontSize
            }
          }
        };
      });
    }
    
    // Recalculer les modules
    if (updated.modularPage?.screens) {
      Object.keys(updated.modularPage.screens).forEach((screenKey) => {
        const screen = screenKey as 'screen1' | 'screen2' | 'screen3';
        updated.modularPage.screens[screen] = updated.modularPage.screens[screen].map((module: any) => {
          elementsUpdated++;
          return {
            ...module,
            responsive: {
              ...module.responsive,
              mobile: {
                ...module.responsive?.mobile,
                width: module.width ? Math.round(module.width * MOBILE_SCALE_RATIO) : module.responsive?.mobile?.width,
                height: module.height ? Math.round(module.height * MOBILE_SCALE_RATIO) : module.responsive?.mobile?.height,
                fontSize: module.fontSize ? Math.round(module.fontSize * MOBILE_SCALE_RATIO) : module.responsive?.mobile?.fontSize
              }
            }
          };
        });
      });
    }
    
    return updated;
  });
  
  // 3. Notification
  console.log(`✅ [MobileScaling] ${elementsUpdated} éléments recalculés`);
  alert(`✅ Scaling mobile recalculé avec succès !\n\n${elementsUpdated} éléments mis à jour.`);
  
  // 4. Sauvegarder automatiquement
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('editor-request-save'));
  }, 100);
}, [setCampaign]);
```

---

## 📝 TODO

- [ ] Implémenter la fonction dans DesignEditorLayout
- [ ] Ajouter confirmation avant application
- [ ] Tester avec différents types d'éléments
- [ ] Ajouter logs détaillés
- [ ] Créer des tests unitaires
- [ ] Documenter dans le guide utilisateur
