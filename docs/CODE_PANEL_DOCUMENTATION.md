# 📝 Documentation - CodePanel

## Vue d'Ensemble

Le **CodePanel** est un éditeur de code intégré permettant aux utilisateurs avancés de personnaliser leurs campagnes via HTML, CSS, JavaScript et JSON.

---

## 🎯 Fonctionnalités

### 1. **Éditeur Multi-Langages**

Le panel supporte 4 types de code :

| Type | Description | Icône | Utilisation |
|------|-------------|-------|-------------|
| **HTML** | Structure de la campagne | `FileCode` | Modifier le contenu et la structure |
| **CSS** | Styles visuels | `FileCode` | Personnaliser l'apparence |
| **JavaScript** | Interactions et animations | `Code2` | Ajouter des comportements dynamiques |
| **JSON** | Configuration complète | `FileJson` | Modifier la structure de données |

### 2. **Génération Automatique de Code**

Le panel génère automatiquement du code basé sur l'état actuel de la campagne :

#### **HTML Généré**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campagne - screen1</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="campaign-container" data-screen="screen1">
    <div class="campaign-content">
      <!-- Éléments générés dynamiquement -->
    </div>
  </div>
  <script src="script.js"></script>
</body>
</html>
```

#### **CSS Généré**
```css
.campaign-container {
  width: 100%;
  min-height: 100vh;
  background: /* Depuis campaign.design.background */;
  display: flex;
  align-items: center;
  justify-content: center;
}

.element-button button {
  background: #44444d;
  color: #ffffff;
  /* ... */
}
```

#### **JavaScript Généré**
```javascript
document.addEventListener('DOMContentLoaded', function() {
  // Gestion des clics sur les boutons
  // Animation d'entrée des éléments
  // Tracking des interactions
});
```

#### **JSON Généré**
```json
{
  "id": "campaign-id",
  "name": "Ma Campagne",
  "type": "wheel",
  "design": { /* ... */ },
  "prizes": [ /* ... */ ]
}
```

### 3. **Aperçu Live**

- **Iframe isolée** : Prévisualisation sécurisée du code
- **Sandbox** : `allow-scripts allow-same-origin`
- **Mise à jour en temps réel** : Changements visibles immédiatement

### 4. **Application au Canvas**

Deux modes d'application :

#### **Mode 1 : Aperçu Live (checkbox "Aperçu live")**
- Affiche le code dans une iframe
- Isolé du reste de l'application
- Sécurisé et sans impact sur l'éditeur

#### **Mode 2 : Application au Canvas (checkbox "Appliquer au canvas")**
- **CSS** : Injecté dans `<head>` avec scoping automatique
- **JavaScript** : Injecté dans `<body>` et exécuté
- **HTML** : Overlay absolu au-dessus du canvas
- ⚠️ **Attention** : Peut affecter l'éditeur entier

### 5. **Persistance et Cache**

Le code édité est sauvegardé :

- **LocalStorage** : Clé `codepanel:{campaignId}:{screen}:{type}`
- **Cache mémoire** : `editedCache` pour les changements en cours
- **Restauration automatique** : Au changement d'écran ou de type

---

## 🔧 Architecture Technique

### **Props**

```typescript
interface CodePanelProps {
  campaign: any;                    // État de la campagne
  currentScreen?: 'screen1' | 'screen2' | 'screen3';
  onCampaignChange?: (campaign: any) => void;
}
```

### **États Internes**

```typescript
const [activeCodeType, setActiveCodeType] = useState<CodeType>('html');
const [editableCode, setEditableCode] = useState<string>('');
const [isDirty, setIsDirty] = useState<boolean>(false);
const [editedCache, setEditedCache] = useState<Record<string, string>>({});
const [previewEnabled, setPreviewEnabled] = useState<boolean>(true);
const [applyToCanvas, setApplyToCanvas] = useState<boolean>(false);
```

### **Fonctions Clés**

#### **1. Génération de Code**

```typescript
const generateHTML = () => { /* ... */ };
const generateCSS = () => { /* ... */ };
const generateJavaScript = () => { /* ... */ };
const generateJSON = () => { /* ... */ };
```

#### **2. Scoping CSS**

```typescript
const scopeCssToOverlay = (css: string): string => {
  // Transforme body/html en #codepanel-live-html
  // Évite les conflits avec l'éditeur
};
```

#### **3. Injection dans le Canvas**

```typescript
// CSS injection
const styleEl = document.createElement('style');
styleEl.id = 'codepanel-live-style';
styleEl.textContent = scopeCssToOverlay(css);
document.head.appendChild(styleEl);

// JS injection
const scriptEl = document.createElement('script');
scriptEl.id = 'codepanel-live-script';
scriptEl.text = js;
document.body.appendChild(scriptEl);

// HTML overlay
const container = document.createElement('div');
container.id = 'codepanel-live-html';
container.style.position = 'absolute';
container.style.inset = '0';
container.style.zIndex = '2000';
screenEl.appendChild(container);
```

#### **4. Matérialisation en BlocHtml**

```typescript
const upsertBlocHtmlModule = (camp: any, screen: string, htmlContent: string) => {
  // Crée ou met à jour un module BlocHtml
  // Injecté dans campaign.modularPage.screens[screen]
  // Ou dans campaign.design.designModules.screens[screen]
};
```

---

## 🎨 Interface Utilisateur

### **Layout**

```
┌─────────────────────────────────────┐
│ [HTML] [CSS] [JavaScript] [JSON]   │ ← Tabs
├─────────────────────────────────────┤
│                                     │
│  Éditeur de code (textarea)         │
│  - Fond noir                        │
│  - Police monospace                 │
│  - Coloration syntaxique (future)   │
│                                     │
├─────────────────────────────────────┤
│ [✓] Aperçu live                     │
│ [✓] Appliquer au canvas        [Appliquer] │
├─────────────────────────────────────┤
│                                     │
│  Aperçu Live (iframe)               │
│  - 320px de hauteur                 │
│  - Sandbox sécurisé                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 🚀 Cas d'Usage

### **1. Personnalisation Avancée**

Utilisateur veut ajouter des animations CSS personnalisées :

```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

.element {
  animation: slideIn 0.5s ease-out;
}
```

### **2. Tracking Analytics**

Utilisateur veut intégrer Google Analytics :

```javascript
// Tracking des interactions
function trackEvent(eventName, data) {
  gtag('event', eventName, data);
}

document.querySelectorAll('.element-button button').forEach(button => {
  button.addEventListener('click', () => {
    trackEvent('button_click', { button_text: button.textContent });
  });
});
```

### **3. Modification de Structure**

Utilisateur veut changer complètement la structure HTML :

```html
<div class="custom-layout">
  <header>
    <h1>Mon Titre Personnalisé</h1>
  </header>
  <main>
    <div class="grid">
      <!-- Contenu personnalisé -->
    </div>
  </main>
  <footer>
    <p>© 2025</p>
  </footer>
</div>
```

### **4. Export de Configuration**

Utilisateur veut exporter la config en JSON pour backup :

1. Cliquer sur onglet **JSON Config**
2. Copier le JSON généré
3. Sauvegarder dans un fichier

---

## ⚠️ Limitations et Risques

### **Risques Identifiés**

1. **Injection de code malveillant**
   - ⚠️ Pas de validation du code JavaScript
   - ⚠️ Exécution directe dans le DOM
   - ⚠️ Accès complet au document

2. **Conflits CSS**
   - ⚠️ Scoping automatique peut ne pas suffire
   - ⚠️ Peut casser l'interface de l'éditeur
   - ⚠️ Difficile à débugger

3. **Performance**
   - ⚠️ Injection/suppression répétée des scripts
   - ⚠️ Pas de debouncing sur les changements
   - ⚠️ Peut ralentir l'éditeur

4. **Persistance**
   - ⚠️ LocalStorage peut être plein
   - ⚠️ Pas de gestion d'erreur robuste
   - ⚠️ Perte de données possible

### **Limitations**

- ❌ Pas de coloration syntaxique
- ❌ Pas d'autocomplétion
- ❌ Pas de validation de syntaxe
- ❌ Pas de formatage automatique
- ❌ Pas de gestion d'erreurs JavaScript
- ❌ Pas de sourcemaps pour le debug

---

## 💡 Recommandations d'Amélioration

### **1. Sécurité** 🔴 CRITIQUE

```typescript
// Ajouter validation et sanitization
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['div', 'p', 'span', 'button', 'img', 'a'],
    ALLOWED_ATTR: ['class', 'id', 'src', 'href']
  });
};

// Limiter les APIs JavaScript accessibles
const sandboxScript = (js: string) => {
  // Wrapper dans une fonction isolée
  return `(function() { 
    'use strict';
    ${js}
  })();`;
};
```

### **2. Éditeur de Code Professionnel** 🟠 IMPORTANT

Remplacer le `<textarea>` par **Monaco Editor** (VS Code) :

```bash
npm install @monaco-editor/react
```

```tsx
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  language={activeCodeType === 'json' ? 'json' : activeCodeType}
  theme="vs-dark"
  value={editableCode}
  onChange={(value) => setEditableCode(value || '')}
  options={{
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on',
    formatOnPaste: true,
    formatOnType: true
  }}
/>
```

**Avantages :**
- ✅ Coloration syntaxique
- ✅ Autocomplétion
- ✅ Validation en temps réel
- ✅ Formatage automatique
- ✅ Recherche/remplacement
- ✅ Multi-curseurs

### **3. Validation et Linting** 🟡 MOYEN

```typescript
// Valider le CSS
import postcss from 'postcss';

const validateCSS = async (css: string) => {
  try {
    await postcss().process(css, { from: undefined });
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
};

// Valider le JavaScript
import { parse } from '@babel/parser';

const validateJS = (js: string) => {
  try {
    parse(js, { sourceType: 'module' });
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
};
```

### **4. Debouncing et Performance** 🟡 MOYEN

```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedSave = useDebouncedCallback((code: string) => {
  const memKey = `${currentScreen}:${activeCodeType}`;
  const lsKey = getCacheKey(currentScreen, activeCodeType);
  setEditedCache((prev) => ({ ...prev, [memKey]: code }));
  try { localStorage.setItem(lsKey, code); } catch {}
}, 500);

// Dans le onChange
onChange={(e) => {
  const next = e.target.value;
  setEditableCode(next);
  debouncedSave(next);
}}
```

### **5. Gestion d'Erreurs** 🟡 MOYEN

```typescript
const [errors, setErrors] = useState<string[]>([]);

// Afficher les erreurs dans l'UI
{errors.length > 0 && (
  <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
    <h4 className="text-red-800 font-medium mb-2">Erreurs détectées :</h4>
    <ul className="text-red-600 text-sm space-y-1">
      {errors.map((err, i) => (
        <li key={i}>• {err}</li>
      ))}
    </ul>
  </div>
)}
```

---

## 📊 Utilisation Actuelle

### **Où est-il utilisé ?**

Le CodePanel est intégré dans la **HybridSidebar** de tous les éditeurs :

```tsx
// HybridSidebar.tsx
case 'code':
  return (
    <CodePanel 
      campaign={campaign}
      currentScreen={currentScreen}
      onCampaignChange={setCampaign}
    />
  );
```

### **Onglets disponibles**

**Mode Article :**
- Design
- Formulaire
- Jeu
- Sortie
- **Code** ← CodePanel

**Mode Fullscreen :**
- Design
- Éléments
- Formulaire
- Jeu
- Sortie
- **Code** ← CodePanel

---

## 🎯 Conclusion

### **Points Forts**

✅ **Flexibilité** : Permet une personnalisation totale  
✅ **Puissance** : Accès complet au HTML/CSS/JS  
✅ **Aperçu** : Visualisation en temps réel  
✅ **Persistance** : Sauvegarde automatique

### **Points Faibles**

❌ **Sécurité** : Risque d'injection de code  
❌ **UX** : Éditeur basique sans coloration  
❌ **Performance** : Pas de debouncing  
❌ **Validation** : Aucune vérification du code

### **Recommandation Finale**

Le CodePanel est un outil **puissant mais dangereux** dans son état actuel. Il devrait être :

1. **Réservé aux utilisateurs avancés** (rôle admin/développeur)
2. **Amélioré avec Monaco Editor** pour une meilleure UX
3. **Sécurisé avec validation et sanitization** pour éviter les injections
4. **Optimisé avec debouncing** pour améliorer les performances

**Alternative recommandée :**
- Créer un système de **templates personnalisés** plus sûr
- Limiter les modifications à des **propriétés CSS prédéfinies**
- Offrir un **système de plugins** avec API contrôlée
