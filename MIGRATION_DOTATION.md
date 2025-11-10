# 🔧 Migration Base de Données - Système de Dotation

## Objectif

Ajouter la colonne `dotation` à la table `campaign_settings` pour supporter le système de double mécanique avec lots programmés.

## Informations Supabase

**Projet** : jonanzau9@gmail.com's Project
- **ID** : vmkwascgjntopgkbmctv
- **Token d'accès** : sbp_92c72c3b8e516901a7b3ada7f4d3967777c9b492

## Méthode 1 : Via Supabase Dashboard (Recommandé)

### Étape 1 : Accéder au SQL Editor

1. Connectez-vous à [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet : **jonanzau9@gmail.com's Project** (ID: vmkwascgjntopgkbmctv)
3. Dans le menu latéral, cliquez sur **SQL Editor**
4. Cliquez sur **New Query**

### Étape 2 : Exécuter la migration

1. Copiez le contenu du fichier :
   ```
   supabase/migrations/20251109000000_add_dotation_to_campaign_settings.sql
   ```

2. Collez-le dans l'éditeur SQL

3. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)

### Étape 3 : Vérifier le résultat

Vous devriez voir :
```
NOTICE: Colonne dotation ajoutée avec succès à campaign_settings
NOTICE: Contrainte de validation ajoutée pour dotation
```

Si la colonne existe déjà :
```
NOTICE: Colonne dotation existe déjà dans campaign_settings
NOTICE: Contrainte de validation existe déjà pour dotation
```

## Méthode 2 : Via Supabase CLI

### Prérequis

1. Installer Supabase CLI :
   ```bash
   npm install -g supabase
   ```

2. Se connecter :
   ```bash
   supabase login
   ```

### Exécution

1. Lier le projet :
   ```bash
   supabase link --project-ref vmkwascgjntopgkbmctv
   ```

2. Appliquer la migration :
   ```bash
   supabase db push
   ```

## Vérification de la migration

### Via SQL Editor

Exécutez cette requête pour vérifier que la colonne existe :

```sql
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'campaign_settings'
  AND column_name = 'dotation';
```

Résultat attendu :
```
column_name | data_type | is_nullable | column_default
------------|-----------|-------------|---------------
dotation    | jsonb     | YES         | NULL
```

### Via Table Editor

1. Allez dans **Table Editor**
2. Sélectionnez la table **campaign_settings**
3. Vérifiez que la colonne **dotation** (type JSONB) est présente

## Structure de la colonne

### Type
- **JSONB** : Format JSON binaire optimisé pour PostgreSQL

### Structure attendue
```json
{
  "timed_prizes": [
    {
      "id": "prize-1699876543210",
      "name": "iPhone 15 Pro",
      "description": "Dernier modèle Apple 256GB",
      "date": "2025-11-13",
      "time": "13:54",
      "enabled": true
    }
  ]
}
```

### Contraintes
- La colonne peut être NULL
- Si définie, doit être un objet JSON
- Si `timed_prizes` existe, doit être un tableau

### Index
- Index GIN créé pour optimiser les requêtes sur le champ JSONB

## Test de la migration

### Insérer des données de test

```sql
-- Mettre à jour une campagne existante avec des lots programmés
UPDATE public.campaign_settings
SET dotation = '{
  "timed_prizes": [
    {
      "id": "prize-test-001",
      "name": "Lot de test",
      "description": "Ceci est un test",
      "date": "2025-11-13",
      "time": "14:00",
      "enabled": true
    }
  ]
}'::jsonb
WHERE campaign_id = 'YOUR_CAMPAIGN_ID';
```

### Lire les données

```sql
-- Récupérer la configuration de dotation
SELECT 
    campaign_id,
    dotation
FROM public.campaign_settings
WHERE dotation IS NOT NULL;
```

### Requête sur les lots programmés

```sql
-- Récupérer tous les lots actifs
SELECT 
    campaign_id,
    jsonb_array_elements(dotation->'timed_prizes') as prize
FROM public.campaign_settings
WHERE dotation->'timed_prizes' IS NOT NULL
  AND jsonb_array_length(dotation->'timed_prizes') > 0;
```

## Rollback (en cas de problème)

Si vous devez annuler la migration :

```sql
-- Supprimer la colonne dotation
ALTER TABLE public.campaign_settings 
DROP COLUMN IF EXISTS dotation;

-- Supprimer l'index
DROP INDEX IF EXISTS idx_campaign_settings_dotation;

-- Supprimer la contrainte
ALTER TABLE public.campaign_settings
DROP CONSTRAINT IF EXISTS campaign_settings_dotation_check;
```

## Dépannage

### Erreur : "permission denied"
- Vérifiez que vous êtes connecté avec le bon compte
- Vérifiez que vous avez les droits d'administration sur le projet

### Erreur : "column already exists"
- La colonne existe déjà, pas besoin de la recréer
- La migration est idempotente (peut être exécutée plusieurs fois)

### Erreur : "relation does not exist"
- Vérifiez que la table `campaign_settings` existe
- Vérifiez que vous êtes sur le bon projet Supabase

## Support

Pour toute question :
1. Vérifiez les logs dans le SQL Editor
2. Consultez la documentation Supabase : https://supabase.com/docs
3. Contactez le support technique

---

**Migration créée le 9 novembre 2025**
