# TypeformEditor - Éditeur de Formulaires Style Typeform

## 📋 Description

TypeformEditor est un éditeur de formulaires moderne inspiré de Typeform.com, conçu pour créer des formulaires de collecte de leads avec une expérience utilisateur conversationnelle et engageante.

## 🎯 Objectif

Permettre la création de formulaires interactifs avec :
- Interface conversationnelle (une question à la fois)
- Transitions fluides entre questions
- Logique conditionnelle
- Design personnalisable
- Expérience mobile optimale

## 🏗️ Structure

### Composants Principaux

#### 1. **DesignEditorLayout.tsx**
- Layout principal de l'éditeur
- Gestion des écrans de formulaire
- Système de preview intégré
- Navigation entre questions

#### 2. **HybridSidebar.tsx**
- Sidebar avec onglets : Design, Questions, Logique, Formulaire, Sortie
- **Onglet "Questions"** : Configuration des questions
- **Onglet "Logique"** : Logique conditionnelle

#### 3. **panels/QuestionsPanel.tsx**
- Panel pour gérer les questions
- Ajout/suppression/réorganisation
- Configuration des types de champs

#### 4. **components/TypeformPreview.tsx**
- Composant de preview style Typeform
- Navigation entre questions
- Animations de transition

## 🚀 Utilisation

### Accès
```
http://localhost:5173/typeform-editor
```

### Types de Questions Disponibles

1. **Texte Court** - Réponse en une ligne
2. **Texte Long** - Réponse multi-lignes
3. **Email** - Validation email
4. **Téléphone** - Format téléphone
5. **Nombre** - Valeur numérique
6. **Date** - Sélecteur de date
7. **Choix Unique** - Radio buttons
8. **Choix Multiples** - Checkboxes
9. **Dropdown** - Liste déroulante
10. **Échelle** - Notation 1-5 ou 1-10

### Créer un Formulaire

1. **Ajouter des questions**
   - Cliquer sur "Ajouter une question"
   - Choisir le type
   - Configurer le texte et les options

2. **Configurer la logique**
   - Définir les conditions de navigation
   - Créer des branches conditionnelles
   - Personnaliser les messages

3. **Personnaliser le design**
   - Couleurs et polices
   - Images de fond
   - Animations

4. **Prévisualiser**
   - Tester l'expérience utilisateur
   - Vérifier les transitions
   - Valider la logique

5. **Publier**
   - Sauvegarder la campagne
   - Obtenir le lien de partage

## 📦 Fichiers Clés

```
TypeformEditor/
├── DesignEditorLayout.tsx          # Layout principal
├── HybridSidebar.tsx               # Sidebar avec onglets
├── panels/
│   ├── QuestionsPanel.tsx          # ⭐ Gestion des questions
│   ├── LogicPanel.tsx              # ⭐ Logique conditionnelle
│   ├── FormFieldsPanel.tsx         # Configuration formulaire
│   └── MessagesPanel.tsx           # Messages de sortie
├── components/
│   ├── TypeformPreview.tsx         # ⭐ Preview style Typeform
│   ├── QuestionEditor.tsx          # Éditeur de question
│   └── LogicBuilder.tsx            # Constructeur de logique
└── README.md                       # Cette documentation
```

## ✅ Fonctionnalités

- ✅ **Questions conversationnelles** : Une question à la fois
- ✅ **Transitions fluides** : Animations entre questions
- ✅ **Logique conditionnelle** : Navigation dynamique
- ✅ **Validation en temps réel** : Vérification des réponses
- ✅ **Design personnalisable** : Couleurs, polices, images
- ✅ **Preview responsive** : Desktop, tablette, mobile
- ✅ **Sauvegarde automatique** : Auto-save des modifications
- ✅ **Export des données** : CSV, Excel, JSON

## 🎨 Personnalisation

### Configuration du Thème

```typescript
const theme = {
  colors: {
    primary: '#841b60',
    background: '#ffffff',
    text: '#000000',
    button: '#841b60'
  },
  fonts: {
    question: 'Inter',
    answer: 'Inter'
  },
  animations: {
    transition: 'slide', // slide, fade, scale
    duration: 300
  }
};
```

### Écran de Bienvenue

```typescript
const welcome = {
  title: 'Bienvenue !',
  description: 'Prenez 2 minutes pour répondre',
  buttonText: 'Commencer',
  image: 'url-to-image'
};
```

### Écran de Fin

```typescript
const ending = {
  title: 'Merci !',
  description: 'Vos réponses ont été enregistrées',
  showResults: true,
  redirectUrl: 'https://example.com'
};
```

## 🔧 Logique Conditionnelle

### Exemple Simple

```typescript
{
  questionId: 'q1',
  text: 'Êtes-vous intéressé ?',
  type: 'choice',
  options: ['Oui', 'Non'],
  logic: {
    'Oui': 'q2',  // Si Oui → question 2
    'Non': 'end'  // Si Non → fin
  }
}
```

### Exemple Avancé

```typescript
{
  questionId: 'q2',
  text: 'Quel est votre budget ?',
  type: 'choice',
  options: ['< 1K€', '1-5K€', '> 5K€'],
  logic: {
    '< 1K€': 'q3a',   // Budget faible → questions basiques
    '1-5K€': 'q3b',   // Budget moyen → questions standard
    '> 5K€': 'q3c'    // Budget élevé → questions premium
  }
}
```

## 📊 Collecte de Données

Les réponses sont automatiquement :
- Sauvegardées en base de données
- Exportables en CSV/Excel
- Accessibles via API
- Intégrables avec CRM

## 📱 Responsive

- ✅ **Desktop** : Expérience complète
- ✅ **Tablette** : Interface adaptée
- ✅ **Mobile** : Navigation tactile optimisée

## 🎯 Exemples d'Utilisation

### Formulaire de Contact

```typescript
const questions = [
  { type: 'text', text: 'Quel est votre nom ?' },
  { type: 'email', text: 'Votre email ?' },
  { type: 'phone', text: 'Votre téléphone ?' },
  { type: 'long-text', text: 'Votre message ?' }
];
```

### Quiz de Qualification

```typescript
const questions = [
  { 
    type: 'choice', 
    text: 'Taille de votre entreprise ?',
    options: ['1-10', '11-50', '51-200', '200+']
  },
  { 
    type: 'choice', 
    text: 'Votre budget ?',
    options: ['< 1K€', '1-5K€', '> 5K€']
  }
];
```

### Enquête de Satisfaction

```typescript
const questions = [
  { 
    type: 'scale', 
    text: 'Évaluez notre service',
    min: 1,
    max: 5
  },
  { 
    type: 'long-text', 
    text: 'Que pouvons-nous améliorer ?'
  }
];
```

## 📝 Notes Techniques

- Basé sur ReferenceEditor
- Utilise React Hook Form pour validation
- Animations avec Framer Motion
- State management avec Zustand
- Sauvegarde automatique toutes les 30s

## 🚀 Roadmap

- [ ] Templates de formulaires prêts à l'emploi
- [ ] A/B testing intégré
- [ ] Analytics avancés
- [ ] Intégrations CRM (Salesforce, HubSpot)
- [ ] Mode collaboratif
- [ ] Traductions multilingues
- [ ] Webhooks personnalisés

## 📚 Ressources

- [Typeform.com](https://www.typeform.com)
- [Best Practices Formulaires](https://www.nngroup.com/articles/web-form-design/)
- [UX Conversationnelle](https://www.smashingmagazine.com/2018/01/conversational-design/)

---

**Créé le** : 21 novembre 2025  
**Basé sur** : ReferenceEditor  
**Objectif** : Formulaires de collecte de leads style Typeform
