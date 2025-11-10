# 🎁 Guide d'utilisation - Système de Dotation

## Introduction

Le système de dotation vous permet de programmer des lots gagnants à des dates et heures précises pour vos campagnes de jeux (Roue, Jackpot, Carte à gratter).

## Principe

### Par défaut : Mécanique perdante
- Tous les participants perdent à 100%
- Aucun lot n'est distribué

### Attribution programmée : Mécanique gagnante
- Vous programmez un lot à une date et heure précise
- **Seul le premier participant** qui joue à ce moment exact gagne
- Après attribution, la mécanique perdante reprend

## Comment configurer un lot programmé ?

### Étape 1 : Accéder aux paramètres

1. Ouvrez votre campagne dans l'éditeur
2. Cliquez sur le bouton **"Paramètres de la campagne"**
3. Allez dans l'onglet **"Dotation"**

### Étape 2 : Ajouter un lot

1. Cliquez sur **"Ajouter un lot"**
2. Remplissez les informations :

   **Nom du lot** (obligatoire)
   - Exemple : "iPhone 15 Pro"
   - Ce nom sera affiché au gagnant

   **Description** (optionnel)
   - Exemple : "Dernier modèle Apple 256GB"
   - Informations complémentaires sur le lot

   **Date d'attribution** (obligatoire)
   - Format : JJ/MM/AAAA
   - Exemple : 13/11/2025
   - Date exacte où le lot sera attribué

   **Heure d'attribution** (obligatoire)
   - Format : HH:mm
   - Exemple : 13:54
   - Heure exacte où le lot sera attribué

3. Cochez **"Actif"** pour activer le lot
4. Cliquez sur **"Enregistrer"**

### Étape 3 : Vérifier la configuration

Une fois configuré, vous verrez un récapitulatif :
```
Attribution prévue : Le mercredi 13 novembre 2025 à 13:54
```

## Exemple concret

### Configuration
- **Lot** : iPhone 15 Pro
- **Date** : 13 novembre 2025
- **Heure** : 13:54

### Résultats attendus

| Participant | Heure de jeu | Résultat | Raison |
|-------------|--------------|----------|--------|
| Alice | 13:53 | ❌ Perdu | Trop tôt |
| Bob | 13:54 | ✅ Gagné | Premier à l'heure exacte |
| Charlie | 13:54 | ❌ Perdu | Lot déjà réclamé |
| David | 13:55 | ❌ Perdu | Trop tard |

## Points importants

### ⏰ Précision temporelle
- L'attribution se fait à la **minute exacte**
- Exemple : 13:54 signifie entre 13:54:00 et 13:54:59

### 🎯 Un seul gagnant
- Seul le **premier participant** à jouer à l'heure exacte gagne
- Les suivants retombent sur la mécanique perdante

### 📅 Plusieurs lots
- Vous pouvez programmer plusieurs lots
- Chaque lot a sa propre date et heure
- Les lots sont indépendants les uns des autres

### 🔄 Réutilisation
- Une fois un lot attribué, il ne peut plus être gagné
- Pour le réattribuer, créez un nouveau lot avec une nouvelle date/heure

## Gestion des lots

### Activer/Désactiver un lot
- Cochez/décochez la case **"Actif"**
- Un lot désactivé ne sera jamais attribué

### Modifier un lot
- Cliquez sur le lot dans la liste
- Modifiez les informations
- Enregistrez les modifications

### Supprimer un lot
- Cliquez sur l'icône **poubelle** (🗑️)
- Confirmez la suppression

## Conseils d'utilisation

### 🎯 Planification stratégique
- Programmez des lots aux heures de forte affluence
- Variez les horaires pour toucher différents publics
- Exemple : 12:30 (pause déjeuner), 18:00 (fin de journée)

### 📊 Suivi des attributions
- Notez les lots attribués
- Analysez les heures les plus actives
- Ajustez votre stratégie en conséquence

### 🎁 Valeur des lots
- Adaptez la valeur du lot à l'heure
- Lots premium aux heures stratégiques
- Lots secondaires en heures creuses

## Exemples de stratégies

### Stratégie 1 : Événement ponctuel
```
Lancement produit le 15/12/2025
- 10:00 → Lot 1 : Produit offert
- 14:00 → Lot 2 : Bon d'achat 50€
- 18:00 → Lot 3 : Produit offert
```

### Stratégie 2 : Semaine promotionnelle
```
Du 20 au 26/11/2025
- Lundi 12:00 → iPhone
- Mardi 14:30 → iPad
- Mercredi 16:00 → AirPods
- Jeudi 11:30 → Apple Watch
- Vendredi 17:00 → MacBook
```

### Stratégie 3 : Quotidien
```
Tous les jours à 13:00
- 13/11 13:00 → Lot A
- 14/11 13:00 → Lot B
- 15/11 13:00 → Lot C
...
```

## Dépannage

### Le lot n'a pas été attribué
- ✅ Vérifiez que le lot est **actif**
- ✅ Vérifiez la **date et l'heure** configurées
- ✅ Vérifiez qu'un participant a joué à l'heure exacte

### Plusieurs participants ont gagné
- ⚠️ Cela ne devrait pas arriver
- Vérifiez les logs de la console
- Contactez le support technique

### Le lot a été attribué trop tôt/tard
- Vérifiez le fuseau horaire du serveur
- Vérifiez l'heure système de votre ordinateur

## Support

Pour toute question :
1. Consultez la documentation technique (`DOUBLE_MECHANIC_SYSTEM.md`)
2. Vérifiez les logs de la console (F12 → Console)
3. Contactez le support technique

---

**Bon jeu et bonne chance à vos participants ! 🎉**
