# ✅ Checklist de Tests et Validation Post-Corrections

**Date**: 24 Octobre 2025  
**Status**: 🧪 À TESTER

---

## 🎯 Tests Prioritaires (À Effectuer Immédiatement)

### 1. Test du Bouton "Paramètres" (CRITIQUE) ✅

**Objectif**: Vérifier que le message d'erreur "Sauvegarde distante échouée" n'apparaît plus.

#### Scénario 1: Nouvelle Campagne Quiz
```
1. ✅ Aller sur /quiz-editor (sans ?campaign= dans l'URL)
2. ✅ Attendre que la page charge
3. ✅ Cliquer sur "Paramètres" dans la toolbar
4. ✅ Vérifier:
   - Modale "Paramètres de la campagne" s'ouvre
   - Pas de message d'erreur
   - Onglets fonctionnent (Canaux, Paramètres, Sortie, Viralité)
5. ✅ Remplir le formulaire:
   - Nom de campagne: "Test Quiz 1"
   - Date début: 30/09/2025, 16:44
   - Date fin: 09/11/2025, 16:45
6. ✅ Cliquer "Enregistrer"
7. ✅ Vérifier:
   - Modale se ferme
   - Pas de message "Sauvegarde distante échouée"
   - Console montre: "[useCampaignSettings] Campaign created: [UUID]"
```

**Résultat attendu**: ✅ SUCCÈS sans erreur

---

#### Scénario 2: Campagne Existante
```
1. ✅ Aller sur /quiz-editor?campaign=[UUID existant]
2. ✅ Cliquer sur "Paramètres"
3. ✅ Vérifier:
   - Modale s'ouvre avec les paramètres existants chargés
   - Pas de message d'erreur
4. ✅ Modifier un paramètre (ex: changer le nom)
5. ✅ Cliquer "Enregistrer"
6. ✅ Vérifier:
   - Modale se ferme
   - Modification sauvegardée en BDD
   - Console montre: UPDATE réussi
```

**Résultat attendu**: ✅ SUCCÈS sans erreur

---

### 2. Test Multi-Éditeurs (CRITIQUE) ✅

**Objectif**: Vérifier que tous les éditeurs ont le même comportement corrigé.

#### Test Roue de la Fortune (DesignEditor)
```
1. ✅ /design-editor (sans campaign)
2. ✅ Cliquer "Paramètres"
3. ✅ Vérifier création auto + ouverture modale
4. ✅ Sauvegarder → Vérifier succès
```

#### Test Formulaire (FormEditor)
```
1. ✅ /form-editor (sans campaign)
2. ✅ Cliquer "Paramètres"
3. ✅ Vérifier création auto + ouverture modale
4. ✅ Sauvegarder → Vérifier succès
```

#### Test Jackpot (JackpotEditor)
```
1. ✅ /jackpot-editor (sans campaign)
2. ✅ Cliquer "Paramètres"
3. ✅ Vérifier création auto + ouverture modale
4. ✅ Sauvegarder → Vérifier succès
```

#### Test Carte à Gratter (ScratchCardEditor)
```
1. ✅ /scratch-editor (sans campaign)
2. ✅ Cliquer "Paramètres"
3. ✅ Vérifier création auto + ouverture modale
4. ✅ Sauvegarder → Vérifier succès
```

#### Test Modèle (ModelEditor)
```
1. ✅ /model-editor (sans campaign)
2. ✅ Cliquer "Paramètres"
3. ✅ Vérifier création auto + ouverture modale
4. ✅ Sauvegarder → Vérifier succès
```

**Résultat attendu**: ✅ TOUS fonctionnent de manière identique

---

### 3. Test Base de Données (CRITIQUE) ✅

**Objectif**: Vérifier que les données sont bien écrites en BDD et non en localStorage.

#### Vérification directe en BDD
```sql
-- 1. Vérifier les campagnes créées
SELECT id, name, type, status, created_by, created_at 
FROM public.campaigns 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 2. Vérifier les campaign_settings associés
SELECT cs.campaign_id, cs.publication, cs.created_at, c.name
FROM public.campaign_settings cs
JOIN public.campaigns c ON c.id = cs.campaign_id
WHERE cs.created_at > NOW() - INTERVAL '1 hour'
ORDER BY cs.created_at DESC;

-- 3. Vérifier l'ownership
SELECT c.id, c.name, c.created_by, u.email
FROM public.campaigns c
LEFT JOIN auth.users u ON u.id = c.created_by
WHERE c.created_at > NOW() - INTERVAL '1 hour';
```

**Résultat attendu**: 
- ✅ Campagnes créées avec `created_by` = user actuel
- ✅ `campaign_settings` existe pour chaque campagne
- ✅ Dates/horaires sauvegardés dans `publication` (JSONB)

---

#### Vérification localStorage (doit être vide)
```javascript
// Ouvrir DevTools Console
// Exécuter:
Object.keys(localStorage)
  .filter(k => k.includes('campaign') || k.includes('draft'))
  .forEach(k => console.log(k, localStorage.getItem(k)));
```

**Résultat attendu**: 
- ✅ Aucun brouillon `campaign:settings:draft:*`
- ✅ Aucune campagne `campaign:draft:*`
- ⚠️ Si des brouillons existent → BUG, ils devraient être en BDD

---

### 4. Test Policies RLS (CRITIQUE) ✅

**Objectif**: Vérifier que les policies empêchent l'accès non autorisé.

#### Test 1: Création avec utilisateur A
```
1. ✅ Se connecter comme User A (email: user-a@example.com)
2. ✅ Créer une campagne via /quiz-editor
3. ✅ Ouvrir "Paramètres" et sauvegarder
4. ✅ Noter l'UUID de la campagne: [UUID-A]
```

#### Test 2: Tentative d'accès par utilisateur B
```
1. ✅ Se déconnecter
2. ✅ Se connecter comme User B (email: user-b@example.com)
3. ✅ Tenter d'accéder /quiz-editor?campaign=[UUID-A]
4. ✅ Vérifier:
   - Campagne ne se charge PAS (RLS bloque)
   - Console montre erreur d'accès
5. ✅ Tenter d'ouvrir "Paramètres" pour [UUID-A]
6. ✅ Vérifier:
   - Erreur "Campaign owners can view their campaign settings" (RLS bloque)
```

**Résultat attendu**: 
- ✅ User B ne peut PAS voir/modifier la campagne de User A
- ✅ RLS fonctionne correctement

---

### 5. Test Boutons "Sauvegarder et Quitter" (IMPORTANT) ✅

**Objectif**: Vérifier que la sauvegarde + navigation fonctionne.

#### Scénario: Workflow complet
```
1. ✅ /quiz-editor (créer nouvelle campagne)
2. ✅ Cliquer "Paramètres" → Configurer → Sauvegarder → Fermer modale
3. ✅ Ajouter une question au quiz
4. ✅ Cliquer "Sauvegarder et quitter"
5. ✅ Vérifier:
   - Redirection vers /dashboard
   - Campagne apparaît dans la liste
   - Question sauvegardée (vérifier en ré-ouvrant)
```

**Résultat attendu**: ✅ Sauvegarde complète + navigation réussie

---

## 🧪 Tests Secondaires (Validation Approfondie)

### 6. Test Performances et Logs ⏱️

**Objectif**: Vérifier qu'il n'y a pas de ralentissements ou erreurs console.

#### Surveillance Console
```
1. ✅ Ouvrir DevTools → Console
2. ✅ Filtrer par "Error" et "Warning"
3. ✅ Effectuer tous les tests ci-dessus
4. ✅ Vérifier:
   - Aucune erreur rouge
   - Warnings acceptables uniquement (ex: deprecation notices)
   - Pas de "Failed to fetch"
```

#### Surveillance Network
```
1. ✅ DevTools → Network
2. ✅ Créer campagne + sauvegarder paramètres
3. ✅ Vérifier:
   - POST /rest/v1/campaigns → 201 Created
   - POST /rest/v1/campaign_settings → 201 Created
   - GET /rest/v1/campaigns?select=* → 200 OK
   - Aucun 403 Forbidden (RLS)
   - Aucun 500 Internal Server Error
```

**Résultat attendu**: 
- ✅ Toutes les requêtes réussissent
- ✅ Temps de réponse < 500ms

---

### 7. Test Edge Cases (Robustesse) 🔧

#### Edge Case 1: Double-clic rapide sur "Paramètres"
```
1. ✅ /quiz-editor (sans campaign)
2. ✅ Double-cliquer rapidement sur "Paramètres" (2x en 100ms)
3. ✅ Vérifier:
   - Une seule campagne créée (pas de doublon)
   - Une seule modale ouverte
   - Pas de race condition
```

#### Edge Case 2: Campagne sans nom
```
1. ✅ /quiz-editor
2. ✅ Cliquer "Paramètres" immédiatement (avant que la campagne auto-créée ait un nom)
3. ✅ Vérifier:
   - Campagne créée avec nom par défaut "Nouvelle campagne quiz"
   - Modale s'ouvre normalement
   - Possibilité de renommer dans les paramètres
```

#### Edge Case 3: Déconnexion pendant sauvegarde
```
1. ✅ /quiz-editor
2. ✅ Cliquer "Paramètres"
3. ✅ Remplir formulaire
4. ✅ Dans DevTools → Application → Clear site data (ou se déconnecter)
5. ✅ Cliquer "Enregistrer"
6. ✅ Vérifier:
   - Erreur claire: "Utilisateur non authentifié"
   - Pas de crash
   - Redirection vers login
```

**Résultat attendu**: ✅ Gestion propre de tous les cas limites

---

### 8. Test Multi-Device (Responsive) 📱

**Objectif**: Vérifier que tout fonctionne sur mobile/tablet.

#### Test Mobile
```
1. ✅ DevTools → Toggle device toolbar (Cmd+Shift+M)
2. ✅ Choisir "iPhone 14 Pro"
3. ✅ Répéter Test 1 (Paramètres)
4. ✅ Vérifier:
   - Modale responsive (max-w-5xl adapté)
   - Boutons cliquables
   - Pas de débordement horizontal
```

#### Test Tablet
```
1. ✅ DevTools → "iPad Pro"
2. ✅ Répéter Test 1
3. ✅ Vérifier même comportement
```

**Résultat attendu**: ✅ Interface adaptée à tous les devices

---

## 🐛 Tests de Régression (Non-Breaking Changes)

### 9. Fonctionnalités Existantes (Doivent Toujours Fonctionner) ✅

#### Dashboard
```
1. ✅ /dashboard
2. ✅ Vérifier liste des campagnes
3. ✅ Cliquer sur une campagne → Ouvre éditeur approprié
4. ✅ Bouton "Supprimer" → Confirmation → Suppression
5. ✅ Bouton "Dupliquer" → Crée copie
6. ✅ Filtres (status, type) → Fonctionnent
```

#### Navigation
```
1. ✅ Bouton "Fermer" dans toolbar → Retour /dashboard
2. ✅ Liens dans sidebar → Changent de page
3. ✅ Breadcrumbs → Fonctionnent
```

#### Édition Campagne
```
1. ✅ Drag & drop d'éléments → Fonctionne
2. ✅ Modification de texte → Persiste
3. ✅ Upload d'images → Fonctionne
4. ✅ Undo/Redo → Fonctionne
5. ✅ Preview → Affiche correctement
```

**Résultat attendu**: ✅ Aucune régression, tout fonctionne comme avant

---

## 📊 Rapport de Tests Final

### Matrice de Validation

| Test | Status | Blocker | Notes |
|------|--------|---------|-------|
| 1. Bouton Paramètres | 🔄 À TESTER | ✅ Oui | Test prioritaire #1 |
| 2. Multi-Éditeurs | 🔄 À TESTER | ✅ Oui | 6 éditeurs à vérifier |
| 3. Base de Données | 🔄 À TESTER | ✅ Oui | Vérifier écriture BDD |
| 4. Policies RLS | 🔄 À TESTER | ✅ Oui | Sécurité critique |
| 5. Sauvegarder et Quitter | 🔄 À TESTER | ⚠️ Important | Workflow complet |
| 6. Performances | 🔄 À TESTER | ❌ Non | Validation qualité |
| 7. Edge Cases | 🔄 À TESTER | ❌ Non | Robustesse |
| 8. Multi-Device | 🔄 À TESTER | ❌ Non | UX |
| 9. Régression | 🔄 À TESTER | ⚠️ Important | Non-breaking changes |

---

## 🚨 Procédure en Cas d'Échec

### Si Test 1 Échoue (Bouton Paramètres)
```
1. Vérifier console pour l'erreur exacte
2. Vérifier Network → Quelle requête échoue ?
3. Vérifier Supabase Dashboard:
   - Table campaigns existe ?
   - Table campaign_settings existe ?
   - Policies RLS activées ?
4. Vérifier code:
   - handleOpenSettings() bien appelé ?
   - saveCampaignToDB() reçoit bonnes données ?
   - useEditorStore.setCampaign() met à jour l'ID ?
```

### Si Test 3 Échoue (BDD)
```
1. Vérifier migrations appliquées:
   supabase db reset (ATTENTION: efface toutes les données)
   supabase db push
2. Vérifier connexion Supabase:
   src/integrations/supabase/client.ts
3. Vérifier variables d'environnement:
   .env.local contient VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY
```

### Si Test 4 Échoue (RLS)
```
1. Vérifier policies via SQL:
   SELECT * FROM pg_policies WHERE tablename = 'campaign_settings';
2. Vérifier auth.uid() dans Supabase:
   SELECT auth.uid();
3. Vérifier created_by dans campaigns:
   SELECT id, created_by FROM campaigns WHERE id = '[UUID]';
```

---

## ✅ Validation Finale

### Critères de Succès
- [ ] TOUS les tests prioritaires (1-5) passent
- [ ] AUCUNE erreur console critique
- [ ] AUCUN fallback localStorage activé
- [ ] Toutes les requêtes BDD réussissent (201/200)
- [ ] RLS fonctionne correctement
- [ ] Aucune régression détectée

### Sign-Off
```
✅ Tests effectués par: [Nom]
✅ Date: [Date]
✅ Environnement: Production / Staging / Dev
✅ Statut global: PASS / FAIL / PARTIAL
✅ Notes:
```

---

## 🎉 Si Tous les Tests Passent

**FÉLICITATIONS !** 🎊

Le système est maintenant:
- ✅ 100% fonctionnel
- ✅ Sécurisé (RLS)
- ✅ Performant
- ✅ Sans bugs critiques
- ✅ Prêt pour la production

**Prochaines étapes**:
1. Déployer en staging
2. Tests utilisateurs beta
3. Déploiement production
4. Monitoring continu
