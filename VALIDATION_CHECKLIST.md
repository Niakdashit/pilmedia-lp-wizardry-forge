# ✅ Checklist de Validation des Intégrations

## Tests à effectuer

### 1. JavaScript Integration ✅
- [ ] Ouvrir une campagne dans `/campaign/:id/settings`
- [ ] Aller dans l'onglet "Canaux"
- [ ] Cliquer sur l'onglet "Javascript"
- [ ] Vérifier que le code contient:
  - `prosplay_insert_place_{campaignId}`
  - `createElement('iframe')`
  - L'URL de la campagne
- [ ] Copier le code et tester dans une page HTML locale
- [ ] Vérifier que l'iframe se charge correctement

**Résultat attendu:** ✅ Code JavaScript valide qui crée un iframe dynamiquement

---

### 2. HTML Integration ✅
- [ ] Dans le même onglet "Intégrations"
- [ ] Cliquer sur "HTML"
- [ ] Vérifier que le code contient:
  - `<iframe src="..."`
  - `class="prosplay_iframe_tag"`
  - `width="100%"`
  - `height="2000"`
- [ ] Copier le code et tester dans une page HTML
- [ ] Vérifier que l'iframe s'affiche

**Résultat attendu:** ✅ Iframe HTML statique fonctionnelle

---

### 3. Webview Integration ✅
- [ ] Cliquer sur l'onglet "Webview"
- [ ] Vérifier que l'URL de la campagne est affichée
- [ ] Copier l'URL
- [ ] Tester dans un navigateur
- [ ] Vérifier que la campagne se charge

**Résultat attendu:** ✅ URL directe vers la campagne

---

### 4. oEmbed Integration ✅ **NOUVEAU**
- [ ] Cliquer sur l'onglet "oEmbed"
- [ ] Vérifier que deux URLs sont affichées (JSON et XML)
- [ ] Copier l'URL JSON
- [ ] Ouvrir dans un nouvel onglet
- [ ] Vérifier la réponse JSON contient:
  ```json
  {
    "version": "1.0",
    "type": "rich",
    "provider_name": "Prosplay",
    "html": "<iframe..."
  }
  ```
- [ ] Copier l'URL XML
- [ ] Ouvrir dans un nouvel onglet
- [ ] Vérifier la réponse XML contient:
  ```xml
  <?xml version="1.0"?>
  <oembed>
    <version>1.0</version>
    <type>rich</type>
    ...
  </oembed>
  ```

**Résultat attendu:** ✅ Endpoints oEmbed JSON et XML fonctionnels

**Test direct:**
```bash
# JSON
curl "http://localhost:8080/oembed?format=json&url=http%3A%2F%2Flocalhost%3A8080%2Fcampaign%2Ftest&id=test"

# XML
curl "http://localhost:8080/oembed?format=xml&url=http%3A%2F%2Flocalhost%3A8080%2Fcampaign%2Ftest&id=test"
```

---

### 5. Smart URL Integration ✅ **AMÉLIORÉ**
- [ ] Cliquer sur l'onglet "Smart URL"
- [ ] Vérifier que le code contient:
  - Détection de device (`isMobile`, `isTablet`)
  - Logique conditionnelle (mobile vs desktop)
  - `window.location.href` pour mobile
  - `createElement('iframe')` pour desktop
- [ ] Copier le code
- [ ] Tester sur desktop → doit créer un iframe
- [ ] Tester sur mobile (ou simuler) → doit rediriger

**Résultat attendu:** ✅ Code intelligent avec détection de device

---

### 6. Page de Test Automatique ✅
- [ ] Naviguer vers `http://localhost:8080/integrations-test`
- [ ] Cliquer sur "Lancer tous les tests"
- [ ] Vérifier que tous les tests passent:
  - ✅ JavaScript Integration
  - ✅ HTML Integration
  - ✅ oEmbed JSON
  - ✅ oEmbed XML
  - ✅ Smart URL
- [ ] Vérifier les résultats visuels dans chaque section

**Résultat attendu:** ✅ Tous les tests passent avec succès

---

## Tests de régression

### Test 1: Création d'une nouvelle campagne
- [ ] Créer une nouvelle campagne
- [ ] Aller dans les settings
- [ ] Vérifier que l'URL est auto-générée
- [ ] Vérifier que toutes les intégrations utilisent la bonne URL

### Test 2: Campagne avec URL personnalisée
- [ ] Créer/éditer une campagne
- [ ] Définir une URL personnalisée
- [ ] Vérifier que les intégrations utilisent l'URL personnalisée
- [ ] Vérifier le badge "URL personnalisée" s'affiche

### Test 3: Copier-coller
- [ ] Pour chaque intégration, cliquer sur "Copier"
- [ ] Vérifier que le code est copié dans le presse-papier
- [ ] Coller dans un éditeur de texte
- [ ] Vérifier que le code est complet et valide

---

## Tests de compatibilité

### Navigateurs
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Plateformes
- [ ] WordPress (via oEmbed)
- [ ] Site HTML statique
- [ ] React/Vue/Angular app
- [ ] Application mobile (WebView)

---

## Vérifications de sécurité

- [ ] Les URLs sont correctement encodées
- [ ] Pas d'injection XSS possible
- [ ] Les iframes ont les bonnes restrictions
- [ ] Les headers CORS sont corrects
- [ ] Les endpoints oEmbed valident les paramètres

---

## Documentation

- [ ] `IntegrationsGuide.md` est à jour
- [ ] `INTEGRATIONS_FIXES.md` documente tous les changements
- [ ] Exemples de code sont corrects
- [ ] Instructions de test sont claires

---

## Résumé des corrections

| Intégration | Avant | Après | Statut |
|-------------|-------|-------|--------|
| JavaScript | ✅ Fonctionnelle | ✅ Fonctionnelle | Aucun changement |
| HTML | ✅ Fonctionnelle | ✅ Fonctionnelle | Aucun changement |
| Webview | ✅ Fonctionnelle | ✅ Fonctionnelle | Aucun changement |
| oEmbed | ❌ Non implémentée | ✅ **AJOUTÉE** | **CORRECTION MAJEURE** |
| Smart URL | ⚠️ Basique | ✅ **AMÉLIORÉE** | **AMÉLIORATION** |

---

## Validation finale

- [ ] Tous les tests passent
- [ ] Aucune régression détectée
- [ ] Documentation complète
- [ ] Code review effectué
- [ ] Prêt pour production

---

## Notes

**Date de validation:** [À remplir]  
**Validé par:** [À remplir]  
**Version:** 1.0.0  
**Environnement:** Development

---

## Prochaines étapes (optionnel)

- [ ] Ajouter des analytics sur l'utilisation des intégrations
- [ ] Créer des templates pré-configurés
- [ ] Ajouter un générateur d'intégration interactif
- [ ] Implémenter l'auto-découverte oEmbed (`<link rel="alternate">`)
- [ ] Ajouter des webhooks pour les événements de campagne
