# Alignement de l'aperçu mobile de l'éditeur avec le rendu public

## Objectif
Faire en sorte que le mode mobile de l'éditeur donne un aperçu **réaliste** de ce que voient les participants sur leur téléphone, en alignant les dimensions, ratios et safe zones entre l'éditeur et le rendu public.

## Problème identifié
- **Avant** : L'aperçu mobile de l'éditeur utilisait des dimensions d'iPhone ancien (375×667 ou 375×812)
- **Conséquence** : Le ratio, le cadrage de l'image de fond, et la position des éléments différaient entre l'éditeur et le rendu réel sur mobile
- **Impact** : Les créateurs de campagnes ne pouvaient pas prévisualiser fidèlement le résultat final

## Solution appliquée (Option A - Mode réaliste)

### 1. Mise à jour des dimensions mobiles
Toutes les frames mobiles ont été mises à jour pour correspondre aux **iPhone 13/14/15** (les plus courants) :
- **Anciennes dimensions** : 375×667 ou 375×812
- **Nouvelles dimensions** : 390×844
- **Ratio** : 9:19.5 (plus proche des téléphones modernes)

### 2. Fichiers modifiés

#### A. Composants MobilePreview.tsx (cadres de téléphone dans les éditeurs)
Tous mis à jour de `max-w-[375px] max-h-[812px]` vers `max-w-[390px] max-h-[844px]` :

1. `/src/components/DesignEditor/components/MobilePreview.tsx`
2. `/src/components/FormEditor/components/MobilePreview.tsx`
3. `/src/components/JackpotEditor/components/MobilePreview.tsx`
4. `/src/components/ScratchCardEditor/components/MobilePreview.tsx`
5. `/src/components/SwiperEditor/components/MobilePreview.tsx`
6. `/src/components/SwiperEditor/ReferenceEditor/components/MobilePreview.tsx`
7. `/src/components/PollEditor/components/MobilePreview.tsx`
8. `/src/components/ReferenceEditor/components/MobilePreview.tsx`
9. `/src/components/ProEditor/components/MobilePreview.tsx`
10. `/src/components/QuizEditor/components/MobilePreview.tsx`
11. `/src/components/WebEditor/components/MobilePreview.tsx`

#### B. DeviceFrame du ModernEditor
`/src/components/ModernEditor/components/DeviceFrame.tsx`
```typescript
const DEVICE_CONSTRAINTS = {
  mobile: { width: 390, height: 844 }, // iPhone 13/14/15 dimensions
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 }
};
```

#### C. Autres composants de preview
1. `/src/components/QuickCampaign/Preview/utils/previewConstraints.ts`
   - `mobile: { width: 390, height: 844, maxWidth: 390, maxHeight: 844, aspectRatio: 9/19.5 }`

2. `/src/components/QuickCampaign/Studio/StudioPreview.tsx`
   - `case 'mobile': return { width: '390px', height: '844px' };`

3. `/src/components/ModernEditor/ModernPreviewModal.tsx`
   - `case 'mobile': return { width: '390px', height: '844px' };`

#### D. Safe zone padding (déjà fait précédemment)
`/src/components/preview/PreviewRenderer.tsx`
```typescript
const safeZonePadding = previewMode === 'mobile' ? 18 : previewMode === 'tablet' ? 40 : 56;
```
- Réduit de 28px à 18px pour mobile afin de coller au rendu réel

### 3. Résultat attendu

#### Avant
- Quiz/Swiper/Jackpot apparaissaient différemment dans l'éditeur vs le public
- Image de fond cadrée différemment
- Marges et espaces incohérents
- Ratio d'écran obsolète (iPhone 6/7/8)

#### Après
- **Cohérence visuelle** : Ce que tu vois dans l'éditeur mobile = ce que voient les participants
- **Ratio moderne** : iPhone 13/14/15 (390×844) représente la majorité des utilisateurs actuels
- **Safe zones alignées** : Même padding (18px) dans l'éditeur et le public
- **Cadrage d'image identique** : Le `backgroundSize` et `backgroundPosition` donnent le même résultat

### 4. Points techniques importants

#### Pourquoi 390×844 ?
- **iPhone 13/14/15** : Les modèles les plus répandus en 2024-2025
- **Ratio 9:19.5** : Plus proche des téléphones modernes que l'ancien 9:16
- **Safe zones** : Prend en compte la notch et le home indicator

#### Synchronisation éditeur ↔ public
Les deux utilisent maintenant :
- Même `previewMode="mobile"` dans `PreviewRenderer`
- Même `safeZonePadding` (18px)
- Même logique de `backgroundSize: 'cover'` et `backgroundPosition: 'center'`
- Même dimensions de viewport (390×844)

#### Composants full-width déjà alignés
Ces composants utilisent déjà `width: '100%'` sur mobile (pas de changement nécessaire) :
- `TemplatedQuiz` (modifié précédemment)
- `TemplatedSwiper` (modifié précédemment)
- `SlotMachine` (modifié précédemment)
- `ScratchPreview` (déjà full-width)
- `DynamicContactForm` (déjà full-width)

### 5. Tests recommandés

1. **Ouvrir un éditeur** (Design, Quiz, Jackpot, etc.)
2. **Cliquer sur le bouton mobile** (icône smartphone)
3. **Comparer avec le rendu public** :
   - Ouvrir `/campaign/:id` dans un nouvel onglet
   - Utiliser DevTools en mode mobile (390×844 ou iPhone 13)
   - Vérifier que le cadrage, les marges, et la position des éléments sont identiques

4. **Points de vérification** :
   - ✅ Image de fond cadrée de la même façon
   - ✅ Quiz/Swiper/Jackpot à la même position
   - ✅ Marges identiques autour des éléments
   - ✅ Textes et boutons à la même taille

### 6. Limitations connues

#### Barres système
- **Éditeur** : Simule une notch et un home indicator
- **Public réel** : Barres d'adresse du navigateur, barre de statut système
- **Impact** : Légère différence de hauteur disponible (quelques pixels)

#### Viewport réel vs simulé
- **Éditeur** : Cadre fixe 390×844
- **Public** : Viewport dynamique qui peut varier selon le navigateur et l'orientation
- **Solution** : Les dimensions 390×844 représentent le cas le plus courant

### 7. Prochaines étapes (si nécessaire)

Si tu veux aller encore plus loin :
1. **Ajouter un bouton "Aperçu réel"** dans l'éditeur qui ouvre `/campaign/:id` dans un nouvel onglet
2. **Créer des presets de devices** (iPhone SE, iPhone 15 Pro Max, Samsung Galaxy, etc.)
3. **Simuler les barres de navigateur** dans l'éditeur pour un aperçu encore plus fidèle

## Conclusion

L'aperçu mobile de l'éditeur est maintenant **aligné avec le rendu public** :
- ✅ Mêmes dimensions (390×844)
- ✅ Même ratio (9:19.5)
- ✅ Même safe zone (18px)
- ✅ Même logique de rendu (`PreviewRenderer` avec `previewMode="mobile"`)

**Résultat** : Ce que tu vois dans l'éditeur mobile est maintenant une **représentation fidèle** de ce que verront les participants sur leur téléphone.
