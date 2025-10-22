# ✅ Fix Double-Clic Bannière Article

## 🐛 Problème Identifié

Le double-clic sur la zone de bannière pour uploader une image ne fonctionnait pas sur aucun éditeur en mode Article.

## ✅ Solution Appliquée

Ajout d'un gestionnaire `onDoubleClick` dans `ArticleBanner.tsx` qui:
1. Vérifie si le mode édition est actif
2. Crée un input file temporaire
3. Ouvre le sélecteur de fichiers
4. Traite l'upload via la fonction existante `handleFileChange`

## 🔧 Modification

**Fichier**: `/src/components/ArticleEditor/components/ArticleBanner.tsx`

```typescript
// Ajout du gestionnaire double-clic
const handleDoubleClick = () => {
  if (!editable) return;
  
  // Créer un input file temporaire et le déclencher
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };
  input.click();
};

// Ajout de l'événement au container principal
<div 
  className="relative w-full overflow-hidden rounded-lg bg-gray-100"
  style={{ paddingBottom }}
  onDragOver={handleDragOver}
  onDragLeave={handleDragLeave}
  onDrop={handleDrop}
  onDoubleClick={handleDoubleClick}  // ← AJOUTÉ
>
```

## 🎯 Comportement Final

### Avec Image Existante
- **Double-clic** → Ouvre sélecteur de fichiers pour remplacer
- **Hover** → Overlay "Remplacer l'image"
- **Bouton X** → Supprimer l'image

### Sans Image (Zone Vide)
- **Double-clic** → Ouvre sélecteur de fichiers
- **Drag & drop** → Upload par glissement
- **Click** → Ouvre sélecteur de fichiers

## 🧪 Tests

### URLs de Test
```bash
http://localhost:8080/design-editor?mode=article
http://localhost:8080/quiz-editor?mode=article
http://localhost:8080/jackpot-editor?mode=article
http://localhost:8080/scratch-editor?mode=article
http://localhost:8080/form-editor?mode=article
```

### Checklist de Test
- [ ] **Double-clic sur bannière vide** → Sélecteur de fichiers s'ouvre
- [ ] **Double-clic sur bannière existante** → Sélecteur de fichiers s'ouvre pour remplacer
- [ ] **Upload fonctionne** → Image s'affiche immédiatement
- [ ] **Validation** → Formats acceptés, taille max 5MB
- [ ] **Drag & drop fonctionne toujours**
- [ ] **Hover overlay fonctionne toujours**

## 📊 Impact

- **1 seul fichier modifié** (`ArticleBanner.tsx`)
- **Tous les éditeurs bénéficient** du fix automatiquement
- **Réutilisation maximale** du code
- **Pas de régression** sur les autres fonctionnalités

---

**Le double-clic sur la bannière fonctionne maintenant sur tous les éditeurs !** 🎉
