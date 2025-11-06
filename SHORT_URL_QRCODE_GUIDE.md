# 📱 Guide Short URL & QR Code

## Vue d'ensemble

Ce guide documente les nouvelles fonctionnalités de **Short URL** et de **génération de QR Code** pour les campagnes Prosplay.

## 🎯 Fonctionnalités

### 1. Short URL

Transformez vos URLs longues en URLs courtes et mémorables.

**Avantages:**
- ✅ URLs plus courtes et faciles à partager
- ✅ Tracking des clics intégré
- ✅ Codes personnalisables
- ✅ QR Codes plus simples
- ✅ Meilleure présentation sur réseaux sociaux

**Exemple:**
```
Avant: https://prosplay.com/campaign/abc123-def456-ghi789
Après:  https://prosplay.com/s/promo2024
```

### 2. QR Code

Générez des QR Codes personnalisables pour vos campagnes.

**Avantages:**
- ✅ Génération instantanée
- ✅ Personnalisation des couleurs
- ✅ Plusieurs formats de téléchargement
- ✅ Correction d'erreur ajustable
- ✅ QR Code optimisé pour Short URL

## 📂 Architecture

### Fichiers créés

```
src/
├── utils/
│   ├── shortUrl.ts          # Service de gestion des Short URLs
│   └── qrCode.ts             # Service de génération de QR Codes
├── components/
│   ├── ShortUrlGenerator.tsx # Composant de génération Short URL
│   ├── QRCodeGenerator.tsx   # Composant de génération QR Code
│   └── ShortUrlQRCode.tsx    # Composant combiné
└── pages/
    └── ShortUrlRedirect.tsx  # Page de redirection /s/:code
```

### Routes ajoutées

- `/s/:code` - Redirection Short URL

## 🚀 Utilisation

### Dans l'interface

1. **Accéder aux paramètres de campagne**
   - Aller dans `/campaign/:id/settings`
   - Onglet "Canaux"

2. **Section "Partage & Promotion"**
   - Trois onglets disponibles:
     - **Tout**: Short URL + QR Codes
     - **Short URL**: Uniquement la génération de Short URL
     - **QR Code**: Uniquement les QR Codes

### Générer une Short URL

#### Automatique
```typescript
// Génération automatique d'un code aléatoire
const shortUrl = createShortUrl(longUrl);
// Résultat: https://prosplay.com/s/aB3xYz
```

#### Personnalisée
```typescript
// Avec un code personnalisé
const shortUrl = createShortUrl(longUrl, 'promo2024');
// Résultat: https://prosplay.com/s/promo2024
```

#### Validation
```typescript
const validation = validateCustomCode('mon-code');
if (!validation.valid) {
  console.error(validation.error);
}
```

**Règles pour les codes personnalisés:**
- Minimum 3 caractères
- Maximum 20 caractères
- Lettres, chiffres, tirets et underscores uniquement
- Pas de mots réservés (admin, api, auth, etc.)

### Générer un QR Code

#### Basique
```typescript
import { generateQRCodeUrl } from '@/utils/qrCode';

const qrUrl = generateQRCodeUrl('https://prosplay.com/campaign/123');
```

#### Personnalisé
```typescript
const qrUrl = generateQRCodeUrl('https://prosplay.com/campaign/123', {
  size: 600,
  color: '2563EB',        // Bleu
  bgColor: 'ffffff',      // Blanc
  errorCorrection: 'H',   // Haute correction
  margin: 2
});
```

#### Avec couleurs de marque
```typescript
import { generateBrandedQRCode } from '@/utils/qrCode';

const qrUrl = generateBrandedQRCode(
  'https://prosplay.com/campaign/123',
  '0F172A' // Couleur Prosplay
);
```

#### Téléchargement
```typescript
import { downloadQRCode } from '@/utils/qrCode';

await downloadQRCode(qrUrl, 'mon-qrcode');
```

## 🎨 Personnalisation

### Options QR Code

| Option | Type | Défaut | Description |
|--------|------|--------|-------------|
| `size` | number | 300 | Taille en pixels |
| `format` | string | 'png' | Format (png, svg, eps, pdf) |
| `errorCorrection` | string | 'M' | Niveau de correction (L, M, Q, H) |
| `margin` | number | 1 | Marge autour du QR code |
| `color` | string | '000000' | Couleur du QR code (hex sans #) |
| `bgColor` | string | 'ffffff' | Couleur de fond (hex sans #) |

### Niveaux de correction d'erreur

| Niveau | Capacité | Usage recommandé |
|--------|----------|------------------|
| L (Low) | 7% | QR codes simples, environnement propre |
| M (Medium) | 15% | Usage général |
| Q (Quartile) | 25% | Environnement avec risque de dommage |
| H (High) | 30% | QR codes avec logo, impression |

## 💾 Stockage

### Structure des données

```typescript
interface ShortUrlMapping {
  code: string;           // Code court (ex: "aB3xYz")
  longUrl: string;        // URL complète
  campaignId: string;     // ID de la campagne
  createdAt: string;      // Date de création (ISO)
  clicks?: number;        // Nombre de clics
  lastClickedAt?: string; // Dernier clic (ISO)
}
```

### LocalStorage

Les mappings sont stockés dans `localStorage` sous la clé `prosplay_short_urls`.

**En production**, il est recommandé d'utiliser une base de données pour:
- Persistance garantie
- Partage entre devices
- Analytics avancés
- Gestion centralisée

### API de stockage

```typescript
// Sauvegarder un mapping
saveShortUrlMapping({
  code: 'promo2024',
  longUrl: 'https://prosplay.com/campaign/123',
  campaignId: '123',
  createdAt: new Date().toISOString(),
  clicks: 0
});

// Récupérer un mapping
const mapping = getShortUrlMapping('promo2024');

// Récupérer tous les mappings
const all = getAllShortUrlMappings();

// Supprimer un mapping
deleteShortUrlMapping('promo2024');

// Incrémenter les clics
incrementShortUrlClicks('promo2024');
```

## 📊 Tracking

### Compteur de clics

Chaque fois qu'une Short URL est utilisée, le compteur de clics est automatiquement incrémenté.

```typescript
// Dans ShortUrlRedirect.tsx
incrementShortUrlClicks(code);
```

### Visualisation

Les statistiques sont affichées dans le composant `ShortUrlGenerator`:
- Nombre total de clics
- Date du dernier clic

## 🔗 Intégration avec les autres fonctionnalités

### Avec les Intégrations

Les Short URLs peuvent être utilisées dans toutes les intégrations:
- JavaScript
- HTML
- Webview
- oEmbed
- Smart URL

### Avec les QR Codes

**Recommandation:** Utilisez toujours une Short URL dans vos QR Codes pour:
- QR Code plus simple (moins de pixels)
- Meilleure lisibilité
- Tracking des scans
- Possibilité de changer la destination

## 🎯 Cas d'usage

### 1. Campagne Print
```typescript
// Générer Short URL
const shortUrl = createShortUrl(campaignUrl, 'print2024');

// Générer QR Code haute qualité pour impression
const qrUrl = generateQRCodeUrl(shortUrl, {
  size: 2000,
  errorCorrection: 'H'
});

// Télécharger
await downloadQRCode(qrUrl, 'campagne-print-2024');
```

### 2. Réseaux Sociaux
```typescript
// Short URL pour Twitter/X (limite de caractères)
const shortUrl = createShortUrl(campaignUrl, 'social');

// Partager
if (navigator.share) {
  await navigator.share({
    title: 'Ma Campagne',
    url: shortUrl
  });
}
```

### 3. Affichage Public
```typescript
// QR Code avec couleurs de marque
const qrUrl = generateBrandedQRCode(shortUrl, brandColor, {
  size: 1000,
  errorCorrection: 'H'
});
```

### 4. Email Marketing
```typescript
// Short URL trackable
const shortUrl = createShortUrl(campaignUrl, 'email-nov2024');

// Utiliser dans le template email
const emailHtml = `
  <a href="${shortUrl}">Découvrir l'offre</a>
`;
```

## 🧪 Tests

### Tester une Short URL

1. Créer une Short URL dans l'interface
2. Copier l'URL générée
3. Ouvrir dans un nouvel onglet
4. Vérifier la redirection
5. Vérifier l'incrémentation du compteur

### Tester un QR Code

1. Générer un QR Code
2. Scanner avec un smartphone
3. Vérifier que l'URL s'ouvre correctement
4. Tester différentes tailles et couleurs

### Tests automatisés

```typescript
// Test de validation
const result = validateCustomCode('test-123');
expect(result.valid).toBe(true);

// Test de génération
const shortUrl = createShortUrl('https://example.com', 'test');
expect(shortUrl).toContain('/s/test');

// Test de QR Code
const qrUrl = generateQRCodeUrl('https://example.com');
expect(qrUrl).toContain('api.qrserver.com');
```

## 🔒 Sécurité

### Validation des codes

- Caractères autorisés: `a-zA-Z0-9-_`
- Longueur: 3-20 caractères
- Mots réservés bloqués

### Protection contre les collisions

Le système vérifie qu'un code personnalisé n'est pas déjà utilisé par une autre campagne.

### Sanitization

Les URLs sont encodées avant d'être utilisées dans les QR Codes.

## 🚀 Améliorations futures

### Court terme
- [ ] Analytics détaillés (géolocalisation, device, etc.)
- [ ] Export des statistiques
- [ ] Bulk generation de Short URLs
- [ ] API REST pour Short URLs

### Moyen terme
- [ ] Base de données pour persistance
- [ ] Expiration des Short URLs
- [ ] A/B testing avec Short URLs
- [ ] Intégration avec Google Analytics

### Long terme
- [ ] Custom domains (ex: go.votredomaine.com)
- [ ] QR Codes dynamiques (changement de destination)
- [ ] QR Codes avec logo
- [ ] Deep linking pour apps mobiles

## 📚 Ressources

### API QR Code

Utilise l'API gratuite [QR Server](https://goqr.me/api/):
- Pas de limite de requêtes
- Plusieurs formats supportés
- Personnalisation complète

### Documentation

- [Guide des Intégrations](./src/docs/IntegrationsGuide.md)
- [Validation Checklist](./VALIDATION_CHECKLIST.md)

## 🆘 Support

### Problèmes courants

**Short URL ne redirige pas:**
- Vérifier que le mapping existe dans localStorage
- Vérifier la route `/s/:code` dans App.tsx
- Vérifier la console pour les erreurs

**QR Code ne se génère pas:**
- Vérifier la connexion internet
- Vérifier que l'URL est valide
- Vérifier la longueur des données (max 2953 caractères)

**Code personnalisé refusé:**
- Vérifier les caractères (a-z, A-Z, 0-9, -, _)
- Vérifier la longueur (3-20)
- Vérifier que ce n'est pas un mot réservé

## 📝 Changelog

### Version 1.0.0 (2024-11-06)

**Ajouté:**
- ✨ Génération de Short URLs
- ✨ Codes personnalisés
- ✨ Génération de QR Codes
- ✨ Personnalisation des QR Codes (couleurs, taille, correction)
- ✨ Tracking des clics
- ✨ Composant combiné Short URL + QR Code
- ✨ Téléchargement multi-formats
- ✨ Partage natif (Web Share API)
- ✨ Redirection automatique
- ✨ Stockage localStorage
- ✨ Documentation complète

---

**Développé avec ❤️ pour Prosplay**
