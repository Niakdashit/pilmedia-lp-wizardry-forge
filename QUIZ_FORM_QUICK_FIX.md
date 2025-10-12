# ⚡ Quick Fix - Formulaire Quiz

## 🎯 Problème

Le quiz passe directement au résultat sans afficher le formulaire.

---

## ✅ Solution Rapide (3 étapes)

### 1️⃣ Activer le Toggle

```
/quiz-editor → Onglet "Formulaire" → ☑️ Cocher le toggle
```

### 2️⃣ Sauvegarder

```
Cliquer sur "Enregistrer" en haut
```

### 3️⃣ Tester en Preview

```
Cliquer sur "Aperçu" → Lancer le quiz → Répondre aux questions
```

---

## 🔍 Ce Que Vous Devriez Voir

### Après la Dernière Question

```
┌────────────────────────────────────┐
│ ✅ FORMULAIRE ACTIF (phase=form)  │  ← Badge vert en haut à gauche
└────────────────────────────────────┘

        ┌─────────────────────────┐
        │   Vos informations      │
        │                         │
        │  [Champ Email]          │
        │  [Champ Nom]            │
        │                         │
        │  [Bouton Participer]    │
        └─────────────────────────┘
```

---

## 🚨 Causes Fréquentes

### ❌ Cause #1 : Mode Édition
**Symptôme :** Vous voyez "Mode édition" en haut à droite  
**Solution :** Cliquer sur "Aperçu"

### ❌ Cause #2 : Toggle Décoché
**Symptôme :** Pas de badge vert, passage direct au résultat  
**Solution :** Cocher le toggle dans l'onglet Formulaire

### ❌ Cause #3 : Campagne Non Sauvegardée
**Symptôme :** Toggle coché mais formulaire ne s'affiche pas  
**Solution :** Cliquer sur "Enregistrer" et rafraîchir le preview

---

## 🔧 Debug Console

Ouvrez la console (F12) et cherchez :

```
✅ Logs attendus :
🎯 [FunnelQuizParticipate] Quiz completed
✅ [FunnelQuizParticipate] Transitioning to form phase
📝 [FunnelQuizParticipate] Rendering FORM phase

❌ Log problématique :
⏭️ [FunnelQuizParticipate] Skipping form
→ Le toggle n'est pas activé
```

---

## 📋 Checklist Rapide

- [ ] Je suis en **mode preview** (pas édition)
- [ ] Le toggle est **coché** ✅
- [ ] J'ai **sauvegardé** 💾
- [ ] J'ai **rafraîchi** le preview 🔄
- [ ] J'ai **ouvert la console** F12
- [ ] Je vois le **badge vert** 🟢

---

## 🎉 Résultat Attendu

```
Lancement → Quiz → 🎉 FORMULAIRE 🎉 → Résultat
```

**Badge vert visible** = Formulaire actif ✅  
**Pas de badge** = Formulaire désactivé ❌

---

## 📞 Besoin d'Aide ?

Consultez **QUIZ_FORM_DEBUG_GUIDE.md** pour un guide détaillé.

---

## ⚙️ Configuration Technique

```typescript
// Valeur par défaut
showFormBeforeResult: true  // ✅ Activé par défaut

// Localisation
FormFieldsPanel.tsx → Toggle en haut du panneau
FunnelQuizParticipate.tsx → Logique de transition
```

---

## 🚀 Prêt !

Le formulaire devrait maintenant s'afficher entre le quiz et le résultat.

**Test final :** Lancez le quiz en mode preview et vérifiez le badge vert ! 🟢
