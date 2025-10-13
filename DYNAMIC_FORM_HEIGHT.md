# 📏 Hauteur Dynamique du Formulaire de Contact

## 🎯 Objectif

Adapter automatiquement la hauteur de la modal du formulaire de contact en fonction du **nombre de champs configurés** dans l'onglet "Formulaire".

---

## ✅ Implémentation

### 1. **Composant Modal** (`/src/components/common/Modal.tsx`)

#### Nouvelle Prop `maxHeight`
```typescript
interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
  maxHeight?: string; // ✅ NOUVEAU : Contrôle de la hauteur max
}
```

#### Hauteur Adaptative
```typescript
<div 
  className="px-6 pb-6 pt-2 overflow-y-auto"
  style={{
    maxHeight: maxHeight || '70vh' // Hauteur adaptative (70% de l'écran par défaut)
  }}
>
  {children}
</div>
```

**Avant :** `max-h-96` (384px fixe) ❌  
**Après :** `maxHeight` dynamique (70vh par défaut) ✅

---

### 2. **Composant FormHandler** (`/src/components/funnels/components/FormHandler.tsx`)

#### Calcul Dynamique de la Hauteur
```typescript
// Calculer la hauteur dynamique en fonction du nombre de champs
const calculateMaxHeight = () => {
  const baseHeight = 200; // Hauteur pour le titre et le bouton
  const fieldHeight = 100; // Hauteur approximative par champ (label + input + espacement)
  const calculatedHeight = baseHeight + (fields.length * fieldHeight);
  const maxScreenHeight = window.innerHeight * 0.85; // Max 85% de la hauteur de l'écran
  
  return `${Math.min(calculatedHeight, maxScreenHeight)}px`;
};
```

#### Utilisation dans la Modal
```typescript
<Modal
  onClose={onClose}
  title={campaign.screens?.[1]?.title || 'Vos informations'}
  maxHeight={calculateMaxHeight()} // ✅ Hauteur calculée dynamiquement
>
  <DynamicContactForm fields={fields} ... />
</Modal>
```

---

### 3. **Composant PreviewRenderer** (`/src/components/preview/PreviewRenderer.tsx`)

#### Calcul Dynamique Inline
```typescript
{showContactForm && (() => {
  // Calculer la hauteur dynamique en fonction du nombre de champs
  const baseHeight = 200;
  const fieldHeight = 100;
  const calculatedHeight = baseHeight + (contactFields.length * fieldHeight);
  const maxScreenHeight = window.innerHeight * 0.85;
  const maxHeight = `${Math.min(calculatedHeight, maxScreenHeight)}px`;
  
  return (
    <Modal
      onClose={...}
      title={campaign?.screens?.[1]?.title || 'Vos informations'}
      maxHeight={maxHeight} // ✅ Hauteur calculée dynamiquement
    >
      <DynamicContactForm fields={contactFields} ... />
    </Modal>
  );
})()}
```

---

## 📐 Formule de Calcul

### Hauteur Totale = Hauteur de Base + (Nombre de Champs × Hauteur par Champ)

```
Hauteur de base : 200px
  ├─ Titre de la modal : ~60px
  ├─ Padding : ~40px
  └─ Bouton de soumission : ~100px

Hauteur par champ : 100px
  ├─ Label : ~25px
  ├─ Input : ~40px
  ├─ Espacement (margin) : ~20px
  └─ Message d'erreur (si présent) : ~15px

Limite maximale : 85% de la hauteur de l'écran
  └─ Garantit que la modal reste visible même avec beaucoup de champs
```

### Exemples de Calcul

| Nombre de Champs | Hauteur Calculée | Hauteur Finale |
|------------------|------------------|----------------|
| 3 champs | 200 + (3 × 100) = **500px** | 500px |
| 5 champs | 200 + (5 × 100) = **700px** | 700px |
| 8 champs | 200 + (8 × 100) = **1000px** | 850px (limité à 85% de l'écran) |
| 10 champs | 200 + (10 × 100) = **1200px** | 850px (limité à 85% de l'écran) |

*Exemple basé sur une hauteur d'écran de 1000px*

---

## 🎨 Comportement Visuel

### Avec 3 Champs (Prénom, Nom, Email)
```
┌─────────────────────────┐
│  Vos informations    ×  │ ← Titre
├─────────────────────────┤
│                         │
│  Prénom *               │ ← Champ 1
│  [____________]         │
│                         │
│  Nom *                  │ ← Champ 2
│  [____________]         │
│                         │
│  Email *                │ ← Champ 3
│  [____________]         │
│                         │
│  [   Participer   ]     │ ← Bouton
│                         │
└─────────────────────────┘
Hauteur : ~500px
```

### Avec 7 Champs
```
┌─────────────────────────┐
│  Vos informations    ×  │ ← Titre
├─────────────────────────┤
│  Prénom *               │
│  [____________]         │
│  Nom *                  │
│  [____________]         │
│  Email *                │
│  [____________]         │
│  Téléphone              │ ← Scroll commence ici
│  [____________]         │ ↓
│  Adresse                │ ↓
│  [____________]         │ ↓
│  Ville                  │ ↓
│  [____________]         │ ↓
│  Code Postal            │ ↓
│  [____________]         │
│  [   Participer   ]     │
└─────────────────────────┘
Hauteur : ~900px (avec scroll)
```

---

## 🔄 Comportement Responsive

### Desktop (Écran 1920×1080)
- **Hauteur max** : 1080 × 0.85 = **918px**
- **Champs visibles sans scroll** : ~7 champs
- **Au-delà** : Scroll automatique

### Tablet (Écran 768×1024)
- **Hauteur max** : 1024 × 0.85 = **870px**
- **Champs visibles sans scroll** : ~6 champs
- **Au-delà** : Scroll automatique

### Mobile (Écran 375×667)
- **Hauteur max** : 667 × 0.85 = **567px**
- **Champs visibles sans scroll** : ~3 champs
- **Au-delà** : Scroll automatique

---

## 🧪 Comment Tester

### 1. **Avec Peu de Champs (3 champs)**
   - Aller dans l'onglet "Formulaire"
   - Configurer seulement 3 champs (Prénom, Nom, Email)
   - Ouvrir le preview
   - **Vérifier** : La modal est compacte (~500px), pas de scroll

### 2. **Avec Beaucoup de Champs (8+ champs)**
   - Ajouter 8 champs dans l'onglet "Formulaire"
   - Ouvrir le preview
   - **Vérifier** : La modal s'agrandit mais reste limitée à 85% de l'écran
   - **Vérifier** : Un scroll apparaît automatiquement

### 3. **Test Responsive**
   - Changer le mode preview (Desktop → Tablet → Mobile)
   - **Vérifier** : La hauteur s'adapte à chaque taille d'écran
   - **Vérifier** : Le scroll fonctionne correctement sur mobile

---

## 📊 Avantages

### ✅ **Adaptabilité**
- La modal s'adapte automatiquement au contenu
- Plus besoin de hauteur fixe

### ✅ **Expérience Utilisateur**
- Formulaires courts : Modal compacte, pas de scroll inutile
- Formulaires longs : Scroll automatique, tout reste accessible

### ✅ **Responsive**
- S'adapte à toutes les tailles d'écran
- Limite de 85% garantit la visibilité

### ✅ **Maintenabilité**
- Calcul centralisé dans une fonction
- Facile à ajuster (modifier `baseHeight` ou `fieldHeight`)

---

## 🔧 Personnalisation

### Ajuster la Hauteur par Champ
```typescript
const fieldHeight = 120; // Au lieu de 100px
```

### Ajuster la Hauteur de Base
```typescript
const baseHeight = 250; // Au lieu de 200px
```

### Ajuster la Limite Maximale
```typescript
const maxScreenHeight = window.innerHeight * 0.90; // 90% au lieu de 85%
```

---

## 📝 Fichiers Modifiés

1. **`/src/components/common/Modal.tsx`**
   - ✅ Ajout prop `maxHeight`
   - ✅ Remplacement `max-h-96` par hauteur dynamique

2. **`/src/components/funnels/components/FormHandler.tsx`**
   - ✅ Fonction `calculateMaxHeight()`
   - ✅ Passage de `maxHeight` à la Modal

3. **`/src/components/preview/PreviewRenderer.tsx`**
   - ✅ Calcul inline de `maxHeight`
   - ✅ Passage de `maxHeight` à la Modal

---

## 🎉 Résultat Final

**La modal du formulaire s'adapte maintenant automatiquement au nombre de champs !**

✅ 3 champs → Modal compacte (~500px)  
✅ 5 champs → Modal moyenne (~700px)  
✅ 8+ champs → Modal grande avec scroll (~850px max)  
✅ Responsive sur tous les appareils  
✅ Scroll automatique si nécessaire  
✅ Expérience utilisateur optimale
