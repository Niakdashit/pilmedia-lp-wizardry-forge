# 🔧 Migration : Ajout du Support du Mode Article

## ⚠️ Action Requise : Exécuter la Migration SQL

Pour que le mode article fonctionne correctement, vous devez ajouter deux colonnes à la table `campaigns` dans votre base de données Supabase.

### 📋 Étapes à Suivre

#### 1. Ouvrir le Dashboard Supabase
- Allez sur [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Sélectionnez votre projet

#### 2. Ouvrir l'Éditeur SQL
- Dans le menu de gauche, cliquez sur **"SQL Editor"**
- Cliquez sur **"New query"**

#### 3. Copier et Exécuter le Script
- Ouvrez le fichier `ADD_EDITOR_MODE_COLUMN.sql` (à la racine du projet)
- Copiez tout le contenu
- Collez-le dans l'éditeur SQL de Supabase
- Cliquez sur **"Run"** (ou appuyez sur Cmd+Enter)

#### 4. Vérifier le Succès
Vous devriez voir un message de succès avec :
```
✅ Migration completed successfully!
   - Added editor_mode column (default: fullscreen)
   - Added article_config column (JSONB)
   - Added check constraint for editor_mode
   - Added index on editor_mode
```

### 📊 Colonnes Ajoutées

| Colonne | Type | Défaut | Description |
|---------|------|--------|-------------|
| `editor_mode` | TEXT | 'fullscreen' | Mode d'édition : 'article' ou 'fullscreen' |
| `article_config` | JSONB | NULL | Configuration spécifique au mode article (banner, contenu, etc.) |

### ✅ Après la Migration

Une fois la migration exécutée :

1. **Rafraîchissez votre application** (Cmd+R dans le navigateur)
2. **Créez une nouvelle campagne en mode article**
3. **Enregistrez les paramètres**
4. **Fermez et rouvrez la campagne depuis /campaigns**

La campagne devrait maintenant s'ouvrir correctement en mode article ! 🎉

### 🐛 En Cas de Problème

Si vous voyez une erreur du type "column editor_mode does not exist" :
- Vérifiez que la migration a bien été exécutée
- Vérifiez qu'il n'y a pas d'erreur dans les logs SQL
- Contactez-moi pour assistance

### 📝 Modifications du Code

Les fichiers suivants ont été modifiés pour supporter le mode article :

1. **`src/hooks/useCampaigns.ts`** : Ajout de `editor_mode` lors de la création/mise à jour
2. **`src/hooks/useCampaignSettings.ts`** : Préservation du paramètre `mode` dans l'URL
3. **`src/components/DesignEditor/modals/CampaignSettingsModal.tsx`** : Détection et préservation du mode
4. **`src/utils/editorRouting.ts`** : Support du paramètre `editorMode`
5. **`src/pages/Campaigns.tsx`** : Restauration du mode depuis la base de données

### 🎯 Comportement Attendu

Après la migration :

- ✅ Les campagnes en mode article sont sauvegardées avec `editor_mode = 'article'`
- ✅ Les campagnes en mode fullscreen sont sauvegardées avec `editor_mode = 'fullscreen'`
- ✅ L'ouverture d'une campagne depuis `/campaigns` restaure automatiquement le bon mode
- ✅ Le paramètre `?mode=article` est préservé dans l'URL après sauvegarde
- ✅ La configuration article (`articleConfig`) est sauvegardée dans `article_config`
