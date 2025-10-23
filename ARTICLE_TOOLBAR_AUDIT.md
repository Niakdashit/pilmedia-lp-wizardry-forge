# Audit de la Toolbar en Mode Article

## 📋 Résumé Exécutif

Date: 23 octobre 2025
Fichier audité: `/src/components/ArticleEditor/components/EditableText.tsx`

## ✅ Icônes et Représentation Visuelle

### Boutons Conformes
| Bouton | Icône | Représentation | Statut |
|--------|-------|----------------|--------|
| Format | Dropdown "Format" | ✅ Claire | OK |
| Couleur | A ▾ + carré couleur | ✅ Standard | OK |
| Gras | **B** | ✅ Standard | OK |
| Italique | *I* (serif) | ✅ Standard | OK |
| Souligné | <u>U</u> | ✅ Standard | OK |
| Indice | x₂ | ✅ Claire | OK |
| Aligner gauche | SVG lignes alignées gauche | ✅ Standard | OK |
| Centrer | SVG lignes centrées | ✅ Standard | OK |
| Aligner droite | SVG lignes alignées droite | ✅ Standard | OK |
| Justifier | SVG lignes justifiées | ✅ Standard | OK |
| Lien | SVG chaîne | ✅ Standard | OK |
| Délier | SVG | ⚠️ Peu claire | À AMÉLIORER |
| Image | SVG image | ✅ Standard | OK |
| Tableau | Ω (Omega) | ⚠️ Non standard | À AMÉLIORER |
| Source | Texte "Source" | ✅ Claire | OK |

### Boutons à Améliorer

#### 1. **Liste Numérotée** ❌
- **Problème**: Icône identique à liste à puces
- **Recommandation**: Utiliser icône avec "1. 2. 3." ou numéros visibles
```tsx
// Suggestion d'icône améliorée
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  <text x="2" y="7" fontSize="6">1.</text>
  <path d="M7 5h10v2H7V5z"/>
  <text x="2" y="12" fontSize="6">2.</text>
  <path d="M7 10h10v2H7v-2z"/>
  <text x="2" y="17" fontSize="6">3.</text>
  <path d="M7 15h10v2H7v-2z"/>
</svg>
```

#### 2. **Liste à Puces** ⚠️
- **Problème**: Icône actuelle montre des lignes, pas des puces
- **Recommandation**: Utiliser des cercles/points visibles
```tsx
// Icône actuelle (correcte)
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  <path d="M7 5h10v2H7V5zm0 5h10v2H7v-2zm0 5h10v2H7v-2z"/>
  <circle cx="4" cy="6" r="1.5" />
  <circle cx="4" cy="11" r="1.5" />
  <circle cx="4" cy="16" r="1.5" />
</svg>
```

#### 3. **Tableau** ⚠️
- **Problème**: Symbole Ω pas universellement reconnu pour tableau
- **Recommandation**: Utiliser grille visuelle
```tsx
// Suggestion d'icône améliorée
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  <rect x="2" y="2" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5"/>
  <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="1.5"/>
  <line x1="2" y1="14" x2="18" y2="14" stroke="currentColor" strokeWidth="1.5"/>
  <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="1.5"/>
</svg>
```

#### 4. **Délier/Unlink** ⚠️
- **Problème**: Icône actuelle peu claire
- **Recommandation**: Utiliser chaîne brisée
```tsx
// Suggestion d'icône améliorée
<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" transform="rotate(45 10 10)"/>
  <line x1="3" y1="3" x2="17" y2="17" stroke="red" strokeWidth="2"/>
</svg>
```

## 🐛 Problèmes Fonctionnels Identifiés

### 1. **Listes (Numérotée et À Puces)** ❌ CRITIQUE
**Statut**: Ne fonctionnent pas de manière fiable

**Problèmes**:
- `execCommand('insertOrderedList')` échoue souvent
- Fallback manuel ne s'applique pas correctement
- Sélection perdue après clic

**Solution Implémentée**:
```typescript
const handleOrderedList = () => {
  if (isSourceMode) return wrapSelectionInSource('<ol><li>', '</li></ol>');
  if (!wysiwygRef.current) return;
  wysiwygRef.current.focus();
  ensureEditorHasBlock();
  restoreWysiwygSelection();
  const ok = document.execCommand('insertOrderedList', false);
  if (!ok) {
    const body = wysiwygRef.current.innerHTML || '';
    if (!/\<ol\>/i.test(body)) {
      wysiwygRef.current.innerHTML = `<ol><li>${body || '&nbsp;'}</li></ol>`;
    }
  }
  // Persist state...
};
```

**Tests Requis**:
- [ ] Cliquer sur liste vide
- [ ] Cliquer sur texte existant
- [ ] Ajouter plusieurs items
- [ ] Basculer entre numérotée/puces

### 2. **Saut de Caret** ⚠️ MOYEN
**Statut**: Partiellement résolu

**Problème**: Le caret saute à la ligne lors de la frappe

**Solution Implémentée**:
- Suppression de `dangerouslySetInnerHTML` 
- Ajout de `dir="ltr"` et `text-left`
- Initialisation du contenu uniquement au changement de mode

**Tests Requis**:
- [ ] Taper rapidement "abcdefghijklmnop"
- [ ] Vérifier ordre des caractères
- [ ] Tester avec formatage (gras, italique)
- [ ] Vérifier après basculement Source/WYSIWYG

### 3. **Alignement** ⚠️ MOYEN
**Statut**: Implémenté mais non testé

**Implémentation**:
```typescript
const handleAlign = (align: 'left'|'center'|'right'|'justify') => (
  isSourceMode 
    ? wrapSelectionInSource(`<div style="text-align:${align}">`, '</div>') 
    : applyExec(`justify${align === 'left' ? 'Left' : align === 'right' ? 'Right' : align === 'center' ? 'Center' : 'Full'}`)
);
```

**Tests Requis**:
- [ ] Aligner texte à gauche
- [ ] Centrer texte
- [ ] Aligner texte à droite
- [ ] Justifier texte
- [ ] Vérifier persistance après édition

### 4. **Lien** ✅ FONCTIONNEL
**Statut**: Implémenté correctement

**Implémentation**:
```typescript
const handleLink = () => {
  const url = prompt('URL du lien:') || '';
  if (!url) return;
  if (isSourceMode) wrapSelectionInSource(`<a href="${url}">`, '</a>');
  else applyExec('createLink', url);
};
```

### 5. **Image** ✅ FONCTIONNEL
**Statut**: Implémenté correctement

**Implémentation**:
```typescript
const handleImage = () => {
  const src = prompt('URL de l\'image:') || '';
  if (!src) return;
  if (isSourceMode) wrapSelectionInSource(`<img src="${src}" alt="" />`, '');
  else applyExec('insertImage', src);
};
```

### 6. **Tableau** ⚠️ MOYEN
**Statut**: Implémenté mais insertion basique

**Implémentation**:
```typescript
const handleTable = () => {
  const html = '<table style="width:100%;border-collapse:collapse"><tr><th>Col 1</th><th>Col 2</th></tr><tr><td> </td><td> </td></tr></table>';
  if (isSourceMode) wrapSelectionInSource(html, '');
  else if (wysiwygRef.current) {
    wysiwygRef.current.focus();
    applyExec('insertHTML', html as any);
  }
};
```

**Amélioration Suggérée**: Ajouter dialogue pour choisir nombre de lignes/colonnes

### 7. **Couleur** ✅ FONCTIONNEL
**Statut**: Implémenté correctement

**Implémentation**:
```typescript
const handleForeColor = (color?: string) => {
  const c = color || colorInputRef.current?.value || '#000000';
  if (isSourceMode) wrapSelectionInSource(`<span style=\"color:${c}\">`, '</span>');
  else applyExec('foreColor', c);
};
```

### 8. **Format (H1, H2, P)** ✅ FONCTIONNEL
**Statut**: Implémenté correctement

**Implémentation**:
```typescript
const handleFormat = (tag: 'p'|'h1'|'h2') => {
  if (isSourceMode) wrapSelectionInSource(`<${tag}>`, `</${tag}>`);
  else applyExec('formatBlock', tag);
};
```

### 9. **Source/WYSIWYG Toggle** ✅ FONCTIONNEL
**Statut**: Implémenté correctement

**Comportement**:
- Bascule entre textarea (HTML source) et contentEditable (WYSIWYG)
- Préserve le contenu lors du basculement
- Bouton change de "Source" à "WYSIWYG"

## 🎯 Recommandations Prioritaires

### Priorité 1 - CRITIQUE ❌
1. **Fixer les listes (numérotée et à puces)**
   - Implémenter une solution robuste qui fonctionne dans tous les cas
   - Tester sur éditeur vide, texte existant, et multiples items
   - Considérer une approche DOM directe plutôt que execCommand

### Priorité 2 - HAUTE ⚠️
2. **Améliorer les icônes**
   - Liste numérotée: ajouter numéros visibles
   - Tableau: utiliser grille au lieu de Ω
   - Délier: utiliser chaîne brisée

3. **Stabiliser le caret**
   - Ajouter tests automatisés pour détecter les sauts
   - Déboguer le comportement lors de la frappe rapide

### Priorité 3 - MOYENNE 📋
4. **Améliorer le dialogue tableau**
   - Ajouter sélection du nombre de lignes/colonnes
   - Permettre l'ajout d'en-têtes optionnels

5. **Tester tous les boutons d'alignement**
   - Vérifier que les 4 alignements fonctionnent
   - S'assurer de la persistance

### Priorité 4 - BASSE ℹ️
6. **Ajouter tooltips plus descriptifs**
   - Ajouter raccourcis clavier dans les tooltips
   - Exemple: "Gras (Ctrl+B)"

7. **Améliorer l'accessibilité**
   - Ajouter aria-labels
   - Support clavier complet
   - Annonces pour lecteurs d'écran

## 📊 Score Global

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| **Icônes** | 7/10 | Bonnes mais quelques améliorations nécessaires |
| **Fonctionnalité** | 6/10 | Listes ne fonctionnent pas de manière fiable |
| **UX** | 7/10 | Bonne mais caret peut sauter |
| **Accessibilité** | 5/10 | Manque aria-labels et support clavier |
| **Code Quality** | 8/10 | Bien structuré, quelques optimisations possibles |

**Score Total**: **6.6/10**

## 🔧 Actions Immédiates Requises

1. ✅ **Créer test Playwright** pour validation automatique
2. ❌ **Fixer les listes** (numérotée et à puces) - BLOQUANT
3. ⚠️ **Améliorer icônes** liste numérotée et tableau
4. ⚠️ **Stabiliser caret** lors de la frappe
5. ℹ️ **Documenter** les raccourcis clavier disponibles

## 📝 Notes de Test Manuel

Pour tester manuellement:
```bash
# 1. Démarrer le serveur
npm run dev

# 2. Naviguer vers
http://localhost:5173/design-editor?mode=article

# 3. Tester chaque bouton:
- Taper du texte
- Sélectionner le texte
- Cliquer sur chaque bouton de la toolbar
- Vérifier le résultat dans l'éditeur
- Basculer en mode Source pour voir le HTML généré
```

## 🎬 Prochaines Étapes

1. Implémenter les corrections prioritaires
2. Lancer les tests Playwright après démarrage du serveur
3. Valider chaque bouton individuellement
4. Créer une checklist de validation utilisateur
5. Documenter les raccourcis clavier
