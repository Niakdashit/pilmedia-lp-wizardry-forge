# 🔧 Guide de Débogage - Formulaire Quiz

## 🚨 Problème Constaté

Le quiz passe **directement** de la dernière question à l'écran de résultat, **sans afficher le formulaire**.

```
❌ Flux actuel observé :
Quiz → Résultat (direct)

✅ Flux attendu :
Quiz → Formulaire → Résultat
```

---

## 🔍 Diagnostic Étape par Étape

### Étape 1 : Vérifier que vous êtes en Mode Preview

**Important :** Le formulaire ne s'affiche que dans le **mode preview**, pas dans le mode édition.

1. Cliquez sur le bouton **"Aperçu"** dans la toolbar (en haut)
2. Ou accédez directement à l'URL de preview
3. Le mode édition affiche les questions pour configuration, pas le flux complet

---

### Étape 2 : Vérifier le Toggle dans l'Onglet Formulaire

1. **Ouvrir le Quiz Editor** (`/quiz-editor`)
2. **Cliquer sur l'onglet "Formulaire"** dans le sidebar (icône FormInput)
3. **Vérifier le toggle en haut du panneau** :

```
┌─────────────────────────────────────────────┐
│  ☑️ Afficher le formulaire après le quiz   │
│                                             │
│  Si activé, le formulaire de participation │
│  s'affichera entre la dernière question    │
│  du quiz et l'écran de résultat.           │
└─────────────────────────────────────────────┘
```

4. **S'assurer que la case est COCHÉE** ✅
5. Si elle n'est pas cochée, la cocher et **sauvegarder la campagne**

---

### Étape 3 : Vérifier les Logs de Console

Ouvrez la **Console du navigateur** (F12 ou Cmd+Option+I) et cherchez ces messages :

#### Logs Attendus Quand le Quiz se Termine :

```
🎯 [FunnelQuizParticipate] Quiz completed
📋 [FunnelQuizParticipate] Current phase: quiz
📝 [FunnelQuizParticipate] Fields: [...]
🔍 [FunnelQuizParticipate] Campaign object: {...}
🔍 [FunnelQuizParticipate] showFormBeforeResult: true
🔍 [FunnelQuizParticipate] Raw campaign.showFormBeforeResult: true
⚠️ [FunnelQuizParticipate] FORCING FORM DISPLAY - showFormBeforeResult is TRUE by default
✅ [FunnelQuizParticipate] Transitioning to form phase
```

#### Si le Formulaire s'Affiche :

```
📝 [FunnelQuizParticipate] Rendering FORM phase
📋 Fields to render: [...]
⚠️ [FunnelQuizParticipate] FORM PHASE IS ACTIVE - YOU SHOULD SEE THE FORM NOW
```

#### Si Vous Voyez Ceci (Problème) :

```
⏭️ [FunnelQuizParticipate] Skipping form, going directly to thank you
```

→ Cela signifie que `showFormBeforeResult` est `false`

---

### Étape 4 : Vérifier l'Indicateur Visuel

Quand le formulaire s'affiche, vous devriez voir un **badge vert** en haut à gauche :

```
┌──────────────────────────────────┐
│ ✅ FORMULAIRE ACTIF (phase=form) │
└──────────────────────────────────┘
```

Si vous ne voyez **pas** ce badge, le formulaire ne s'affiche pas.

---

## 🛠️ Solutions selon le Problème

### Problème A : Toggle Non Coché

**Symptôme :** Log console montre `showFormBeforeResult: false`

**Solution :**
1. Aller dans l'onglet **"Formulaire"**
2. **Cocher** la case "Afficher le formulaire après le quiz"
3. **Sauvegarder** la campagne (bouton Enregistrer en haut)
4. **Rafraîchir** le mode preview

---

### Problème B : Campagne Non Sauvegardée

**Symptôme :** Toggle coché mais log montre `showFormBeforeResult: undefined`

**Solution :**
1. **Cliquer sur "Enregistrer"** dans la toolbar
2. Attendre la confirmation de sauvegarde
3. **Rafraîchir** le mode preview
4. Retester le quiz

---

### Problème C : Mode Édition au lieu de Preview

**Symptôme :** Vous voyez "Mode édition" en haut à droite

**Solution :**
1. **Cliquer sur "Aperçu"** dans la toolbar
2. Ou fermer le mode édition
3. Le flux complet ne fonctionne qu'en mode preview

---

### Problème D : Cache du Navigateur

**Symptôme :** Aucun log dans la console

**Solution :**
1. **Vider le cache** (Cmd+Shift+R ou Ctrl+Shift+R)
2. **Rafraîchir** la page
3. **Rouvrir** la console
4. Retester le quiz

---

## 🧪 Test de Validation

### Procédure de Test Complète

1. **Ouvrir `/quiz-editor`**
2. **Onglet "Formulaire"** → Cocher le toggle
3. **Configurer au moins 1 champ** (ex: Email)
4. **Sauvegarder** la campagne
5. **Cliquer sur "Aperçu"**
6. **Ouvrir la console** (F12)
7. **Lancer le quiz** (bouton "Participer")
8. **Répondre à toutes les questions**
9. **Observer** :
   - ✅ Badge vert "FORMULAIRE ACTIF"
   - ✅ Carte blanche avec formulaire
   - ✅ Bouton "Participer" (ou texte personnalisé)
10. **Remplir le formulaire**
11. **Soumettre**
12. **Voir l'écran de résultat**

---

## 📊 Valeurs par Défaut

### Configuration par Défaut

```typescript
showFormBeforeResult: true  // Formulaire ACTIVÉ par défaut
```

**Cela signifie :**
- Si la propriété n'existe pas → Formulaire s'affiche
- Si la propriété est `true` → Formulaire s'affiche
- Si la propriété est `false` → Formulaire masqué

---

## 🔍 Vérification Manuelle de la Campagne

Si vous avez accès à la base de données ou au store Zustand :

```typescript
// Dans la console du navigateur
console.log(campaign.showFormBeforeResult);
// Devrait afficher : true
```

Ou dans le code :

```typescript
// Dans FunnelQuizParticipate.tsx
console.log('Campaign:', campaign);
console.log('showFormBeforeResult:', campaign?.showFormBeforeResult);
```

---

## 🚀 Checklist de Résolution

- [ ] Je suis en **mode preview** (pas en mode édition)
- [ ] Le toggle est **coché** dans l'onglet Formulaire
- [ ] J'ai **sauvegardé** la campagne après avoir coché le toggle
- [ ] J'ai **rafraîchi** le mode preview
- [ ] J'ai **ouvert la console** pour voir les logs
- [ ] Je vois les logs `🎯 Quiz completed`
- [ ] Je vois le log `✅ Transitioning to form phase`
- [ ] Je vois le log `📝 Rendering FORM phase`
- [ ] Je vois le **badge vert** "FORMULAIRE ACTIF"
- [ ] Je vois la **carte blanche** avec le formulaire

---

## 📞 Si le Problème Persiste

### Informations à Fournir

1. **Copie des logs console** (tous les messages `[FunnelQuizParticipate]`)
2. **Capture d'écran** de l'onglet Formulaire (avec toggle visible)
3. **Capture d'écran** du mode preview après la dernière question
4. **Valeur de `campaign.showFormBeforeResult`** (depuis la console)

### Commande de Debug Rapide

Collez ceci dans la console du navigateur :

```javascript
// Vérifier l'état de la campagne
const campaign = window.__CAMPAIGN__;
console.log('Campaign showFormBeforeResult:', campaign?.showFormBeforeResult);
console.log('Campaign form_fields:', campaign?.form_fields);
console.log('Campaign formFields:', campaign?.formFields);
```

---

## 🎯 Résultat Attendu

Après avoir suivi ce guide, vous devriez voir :

```
1. Écran de lancement
   ↓ (clic "Participer")
2. Questions du quiz
   ↓ (réponse à toutes les questions)
3. 🎉 FORMULAIRE DE PARTICIPATION 🎉
   - Badge vert "FORMULAIRE ACTIF"
   - Carte blanche centrée
   - Champs configurés
   - Bouton avec style harmonisé
   ↓ (soumission du formulaire)
4. Écran de résultat
   - Message de confirmation
   - Score (si activé)
   - Bouton "Rejouer" (si activé)
```

---

## 🔧 Modifications Apportées pour le Debug

### Logs Ajoutés

1. **Dans `handleQuizComplete()`** :
   - Log de l'objet campaign complet
   - Log de la valeur brute de `showFormBeforeResult`
   - Warning visible pour forcer l'affichage

2. **Dans le rendu du formulaire** :
   - Badge vert visible en haut à gauche
   - Log console warning quand le formulaire s'affiche

### Valeur par Défaut Forcée

```typescript
const showFormBeforeResult = campaign?.showFormBeforeResult ?? true;
```

→ Si `undefined`, la valeur par défaut est `true` (formulaire activé)

---

## ✅ Conclusion

Le formulaire **devrait s'afficher** par défaut. Si ce n'est pas le cas, suivez les étapes de ce guide pour identifier le problème.

**La cause la plus probable :** Vous êtes en mode édition au lieu du mode preview.

**Prochaine étape :** Testez en mode preview et vérifiez les logs console ! 🚀
