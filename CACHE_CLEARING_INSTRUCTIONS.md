# 🔄 Instructions pour Vider le Cache et Voir les Changements

## Problème
Les changements de style (arrondis, couleurs, etc.) ne sont pas visibles car le navigateur utilise les anciens fichiers JS/CSS en cache.

## Solutions (par ordre d'efficacité)

### 1. Hard Refresh (Recommandé)
**Mac**: `Cmd + Shift + R`  
**Windows**: `Ctrl + Shift + R`

### 2. Vider le Cache Chrome Complet
1. Ouvrir DevTools: `Cmd + Option + I` (Mac) ou `F12` (Windows)
2. Clic droit sur le bouton de rechargement
3. Sélectionner **"Vider le cache et effectuer une actualisation forcée"**

### 3. Navigation Privée
Ouvrir un nouvel onglet en navigation privée:
- **Mac**: `Cmd + Shift + N`
- **Windows**: `Ctrl + Shift + N`

### 4. Redémarrer le Serveur Vite
```bash
# Arrêter le serveur (Ctrl+C)
# Puis relancer
npm run dev
```

### 5. Vider le Cache Vite
```bash
# Supprimer le cache Vite
rm -rf node_modules/.vite

# Relancer
npm run dev
```

## Vérification des Changements Appliqués

### Mode Édition (Images que vous voyez)
**Arrondis visibles**:
- DesignEditor: `rounded-[28px]` (tous les coins)
- QuizEditor: `rounded-tl-[28px] rounded-tr-[28px]` (coins supérieurs)
- ScratchCardEditor: `rounded-tl-[28px] rounded-tr-[28px]` (coins supérieurs)
- JackpotEditor: `rounded-tl-[28px] rounded-tr-[28px]` (coins supérieurs)
- ModelEditor: `rounded-tl-[28px] rounded-tr-[28px] rounded-br-[28px]` (3 coins)

### Mode Preview Mobile (Cliquer sur "Aperçu" + sélectionner "Mobile")
**Cadre avec fond sombre**:
- Fond: `bg-[#2c2c35]` (gris foncé)
- Cadre: `430px × 932px`
- Arrondis: `rounded-[32px]`
- Ombre: `shadow-2xl`
- Centré verticalement et horizontalement

## Checklist de Vérification

- [ ] Hard refresh effectué (`Cmd + Shift + R`)
- [ ] DevTools ouvert pour vérifier le cache
- [ ] Mode édition: arrondis visibles en haut du canvas
- [ ] Mode preview: fond sombre #2c2c35 visible
- [ ] Mode preview mobile: cadre 430x932px avec arrondis
- [ ] Tous les éditeurs testés (design, quiz, scratch, jackpot, model)

## Si Rien ne Fonctionne

1. Fermer complètement Chrome
2. Supprimer le cache Vite: `rm -rf node_modules/.vite`
3. Redémarrer le serveur: `npm run dev`
4. Rouvrir Chrome en navigation privée
5. Tester chaque éditeur

## Confirmation Visuelle

### Mode Édition
Vous devriez voir les **coins arrondis** en haut du canvas mobile (comme dans l'image de référence design-editor).

### Mode Preview
Vous devriez voir un **fond gris foncé** (#2c2c35) avec le canvas mobile dans un **cadre arrondi** au centre de l'écran.

---

**Note**: Tous les changements sont déjà dans le code. Le problème est uniquement le cache du navigateur qui sert les anciens fichiers.
