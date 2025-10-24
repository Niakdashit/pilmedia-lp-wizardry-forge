# 🎯 Intégration Modale Paramètres de Campagne

## Vue d'ensemble

Transformation complète de la page de paramètres de campagne indépendante en une **modale intégrée** accessible depuis tous les éditeurs (mode fullscreen et mode article).

---

## 📦 Architecture

### Nouveau Composant

**`CampaignSettingsModal.tsx`** (`/src/components/DesignEditor/modals/`)
- Modale complète avec 4 onglets : **Canaux**, **Paramètres**, **Sortie**, **Viralité**
- Réutilise les composants existants : `ChannelsStep`, `ParametersStep`, `OutputStep`, `ViralityStep`
- Gestion du state avec le hook `useCampaignSettings`
- Sauvegarde automatique avec fallback sur brouillons locaux

### Composants Modifiés

1. **`DesignToolbar.tsx`**
   - Ajout du bouton "Paramètres" avec icône `Settings`
   - State local `isSettingsModalOpen` pour gérer l'ouverture/fermeture
   - Intégration de `CampaignSettingsModal` dans le rendu
   - Prop `campaignId` pour identifier la campagne

2. **`DesignEditorLayout.tsx`**
   - Passage du `campaignId` au `DesignToolbar`
   - Récupération depuis `campaignState.id` ou paramètre URL `?campaign=`

---

## 🎨 Design de la Modale

### Dimensions
- **Largeur** : 95vw (max-width: 1024px)
- **Hauteur** : 90vh
- **Position** : Centrée avec backdrop blur

### Structure Visuelle

```
┌─────────────────────────────────────────────┐
│ 📋 Paramètres de la campagne          [X]  │ ← Header
├─────────────────────────────────────────────┤
│ [Canaux] [Paramètres] [Sortie] [Viralité]  │ ← Tabs
├─────────────────────────────────────────────┤
│                                             │
│         Contenu de l'onglet actif          │ ← Content (scrollable)
│              (scrollable)                   │
│                                             │
├─────────────────────────────────────────────┤
│              [Annuler] [Enregistrer]        │ ← Footer
└─────────────────────────────────────────────┘
```

### Styles
- **Background** : Blanc (`bg-white`)
- **Overlay** : Noir transparent avec blur (`bg-black/50 backdrop-blur-sm`)
- **Border radius** : 2xl (16px)
- **Shadow** : 2xl pour effet de profondeur
- **Z-index** : 9999 (au-dessus de tout)

---

## 🚀 Fonctionnalités

### Ouverture de la Modale
- Clic sur le bouton **"Paramètres"** dans la toolbar
- Disponible dans **tous les modes** :
  - ✅ Mode Fullscreen (roue, jackpot, quiz, etc.)
  - ✅ Mode Article

### Navigation entre Onglets
1. **Canaux** - Configuration des canaux de diffusion et snippets d'intégration
2. **Paramètres** - Limites, règlement, gagnants et informations de contact
3. **Sortie** - Destination des données, écrans de sortie, emails, redirections
4. **Viralité** - Contenu de partage, boutons sociaux, actions de sortie, emails d'invitation

### Sauvegarde
- **Bouton "Enregistrer"** dans le footer
- Appel à `useCampaignSettings.upsertSettings()`
- En cas d'échec : sauvegarde automatique d'un brouillon local
- Fermeture automatique après succès

### Fermeture
- Bouton **"Annuler"** dans le footer
- Icône **X** dans le header
- Clic sur le **backdrop** (fond transparent)

---

## 🔧 Intégration Technique

### Props du DesignToolbar

```typescript
interface DesignToolbarProps {
  // ... autres props existantes
  campaignId?: string;  // ← Nouvelle prop
}
```

### Passage du campaignId

```typescript
// Dans DesignEditorLayout.tsx
<DesignToolbar
  // ... autres props
  campaignId={
    (campaignState as any)?.id || 
    new URLSearchParams(location.search).get('campaign') || 
    undefined
  }
/>
```

### Hook useCampaignSettings

```typescript
const { getSettings, upsertSettings, loading, error, saveDraft } = useCampaignSettings();
```

**Méthodes utilisées :**
- `getSettings(campaignId)` - Charge les paramètres au montage
- `upsertSettings(campaignId, data)` - Sauvegarde les modifications
- `saveDraft(campaignId, data)` - Fallback local en cas d'échec

---

## ✅ Avantages

### UX Améliorée
- ✅ Pas besoin de quitter l'éditeur
- ✅ Contexte d'édition préservé
- ✅ Workflow fluide et rapide

### Architecture
- ✅ Réutilisation des composants existants (Steps)
- ✅ Code DRY (Don't Repeat Yourself)
- ✅ Séparation des préoccupations

### Design
- ✅ Cohérent avec le reste de l'application
- ✅ Responsive (s'adapte aux différentes tailles)
- ✅ Accessible (gestion du focus, ESC pour fermer)

### Maintenance
- ✅ Un seul point d'entrée pour les paramètres
- ✅ Facile à étendre (nouveaux onglets)
- ✅ Testable indépendamment

---

## 🎯 Résultat Final

### Avant
```
Design Editor → Bouton "Paramétrage" → Navigation vers /campaign/:id/settings
→ Page complète avec tabs → Perte du contexte d'édition
```

### Après
```
Design Editor → Bouton "Paramètres" → Modale s'ouvre
→ Modification des paramètres → Sauvegarde → Retour à l'éditeur
→ Contexte préservé ✨
```

---

## 📱 Disponibilité

| Mode | Toolbar | Bouton Paramètres | Modale |
|------|---------|-------------------|--------|
| **Fullscreen** (Roue, Jackpot, Quiz, etc.) | ✅ | ✅ | ✅ |
| **Article** | ✅ | ✅ | ✅ |
| **Preview** | ❌ | ❌ | ❌ |

> **Note** : En mode preview, la toolbar est masquée donc le bouton n'est pas accessible (comportement attendu).

---

## 🔄 Workflow Utilisateur

1. **Édition du design** dans l'éditeur
2. **Clic sur "Paramètres"** dans la toolbar
3. **Modale s'ouvre** par-dessus l'éditeur
4. **Navigation** entre les onglets (Canaux, Paramètres, Sortie, Viralité)
5. **Modification** des paramètres souhaités
6. **Sauvegarde** via le bouton "Enregistrer"
7. **Retour automatique** à l'éditeur avec contexte préservé

---

## 🎉 Statut

**✅ INTÉGRATION COMPLÈTE ET FONCTIONNELLE**

- Modale créée et stylisée
- Bouton ajouté dans la toolbar
- Disponible dans tous les éditeurs (fullscreen + article)
- Sauvegarde fonctionnelle avec fallback
- Build réussi sans erreurs

**Date de complétion** : 24 octobre 2025
