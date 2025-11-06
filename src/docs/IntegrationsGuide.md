# Guide des Intégrations Prosplay

Ce document décrit toutes les méthodes d'intégration disponibles pour les campagnes Prosplay.

## 1. JavaScript Integration ✅

**Usage:** Intégration dynamique via JavaScript  
**Avantages:** 
- Chargement asynchrone
- Pas de modification du HTML nécessaire
- Compatible avec tous les CMS

**Code:**
```html
<div id="prosplay_insert_place_{campaignId}" class="prosplay_iframe_wrapper"></div>
<script type="text/javascript">
(function(w,d,elId,u){
  var el=d.getElementById(elId);
  if(!el){ return; }
  var f=d.createElement('iframe');
  f.src=u; 
  f.width='100%'; 
  f.height='2000'; 
  f.setAttribute('scrolling','no'); 
  f.setAttribute('frameborder','0');
  f.style='overflow-x:hidden;max-width:800px';
  el.appendChild(f);
})(window,document,'prosplay_insert_place_{campaignId}','{url}');
</script>
```

## 2. HTML Integration ✅

**Usage:** Intégration directe via iframe  
**Avantages:**
- Simple et direct
- Pas de JavaScript requis
- Compatible SEO

**Code:**
```html
<iframe 
  src="{url}" 
  class="prosplay_iframe_tag" 
  width="100%" 
  height="2000" 
  scrolling="no" 
  frameborder="0" 
  style="overflow-x:hidden;max-width:800px">
</iframe>
```

## 3. Webview Integration ✅

**Usage:** Pour applications mobiles natives (iOS/Android)  
**Avantages:**
- Optimisé pour mobile
- Plein écran natif
- Performance maximale

**Code:**
```
{url}
```

**Implémentation iOS (Swift):**
```swift
import WebKit

let webView = WKWebView()
let url = URL(string: "{url}")!
let request = URLRequest(url: url)
webView.load(request)
```

**Implémentation Android (Kotlin):**
```kotlin
import android.webkit.WebView

val webView = WebView(context)
webView.loadUrl("{url}")
```

## 4. oEmbed Integration ✅

**Usage:** Standard oEmbed pour plateformes tierces  
**Avantages:**
- Standard universel
- Support WordPress, Medium, etc.
- Auto-découverte possible

**Endpoints:**

**JSON:**
```
{origin}/oembed?format=json&url={encodedUrl}&id={campaignId}
```

**XML:**
```
{origin}/oembed?format=xml&url={encodedUrl}&id={campaignId}
```

**Paramètres optionnels:**
- `maxwidth`: Largeur maximale (défaut: 800)
- `maxheight`: Hauteur maximale (défaut: 2000)

**Exemple de réponse JSON:**
```json
{
  "version": "1.0",
  "type": "rich",
  "provider_name": "Prosplay",
  "provider_url": "https://example.com",
  "title": "Prosplay Campaign {id}",
  "author_name": "Prosplay",
  "width": 800,
  "height": 2000,
  "html": "<iframe src=\"...\" ...></iframe>"
}
```

## 5. Smart URL Integration ✅

**Usage:** Détection automatique du device avec comportement adaptatif  
**Avantages:**
- Détection mobile/desktop automatique
- Redirection plein écran sur mobile
- Iframe responsive sur desktop
- UX optimale pour chaque device

**Code:**
```html
<!-- Smart URL avec détection automatique -->
<script type="text/javascript">
(function() {
  var campaignUrl = '{url}';
  var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  var isTablet = /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
  
  if (isMobile && !isTablet) {
    // Mobile: Redirection plein écran
    window.location.href = campaignUrl;
  } else {
    // Desktop/Tablet: Iframe responsive
    var container = document.currentScript.parentElement;
    var iframe = document.createElement('iframe');
    iframe.src = campaignUrl;
    iframe.style.cssText = 'width:100%;height:2000px;border:0;max-width:800px;margin:0 auto;display:block;';
    iframe.setAttribute('scrolling', 'no');
    container.appendChild(iframe);
  }
})();
</script>
```

## Recommandations par cas d'usage

| Cas d'usage | Intégration recommandée | Raison |
|-------------|------------------------|--------|
| Site WordPress | oEmbed ou JavaScript | Auto-découverte ou widget |
| Site custom | JavaScript ou HTML | Flexibilité maximale |
| App mobile | Webview | Performance native |
| Blog Medium | oEmbed | Standard supporté |
| Landing page | Smart URL | UX adaptative |
| Email | HTML (lien) | Compatibilité email |

## Tests et validation

Pour tester chaque intégration:

1. **JavaScript**: Vérifier que l'iframe se charge dans le conteneur
2. **HTML**: Vérifier le rendu direct de l'iframe
3. **Webview**: Tester sur device réel ou émulateur
4. **oEmbed**: Appeler l'endpoint et vérifier la réponse JSON/XML
5. **Smart URL**: Tester sur mobile et desktop

## Support et dépannage

### Problème: Iframe ne s'affiche pas
- Vérifier que l'URL est accessible
- Vérifier les headers CORS
- Vérifier X-Frame-Options

### Problème: oEmbed retourne une erreur
- Vérifier les paramètres `url` et `id`
- Vérifier l'encodage de l'URL

### Problème: Smart URL ne détecte pas le mobile
- Vérifier le User-Agent
- Tester avec différents devices
