export interface BrandData {
  url: string;
  title: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  logos: {
    favicon?: string;
    logo?: string;
    heroImage?: string;
  };
  fonts: {
    primary: string;
    secondary?: string;
  };
  content: {
    headings: string[];
    descriptions: string[];
    ctaTexts: string[];
  };
  designTokens: {
    borderRadius: string;
    shadows: string[];
    spacing: string;
  };
}

export class ScrapingBeeService {
  private apiKey: string;
  private baseUrl = 'https://app.scrapingbee.com/api/v1/';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractBrandData(url: string): Promise<BrandData> {
    try {
      const response = await fetch(`${this.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          url: url,
          render_js: true,
          premium_proxy: true,
          country_code: 'US'
        })
      });

      if (!response.ok) {
        throw new Error(`ScrapingBee API error: ${response.status}`);
      }

      const html = await response.text();
      return this.parseBrandData(url, html);
    } catch (error) {
      console.error('ScrapingBee extraction failed:', error);
      throw error;
    }
  }

  private parseBrandData(url: string, html: string): BrandData {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    return {
      url,
      title: this.extractTitle(doc),
      description: this.extractDescription(doc),
      colors: this.extractColors(doc),
      logos: this.extractLogos(doc, url),
      fonts: this.extractFonts(doc),
      content: this.extractContent(doc),
      designTokens: this.extractDesignTokens(doc)
    };
  }

  private extractTitle(doc: Document): string {
    return doc.querySelector('title')?.textContent || 
           doc.querySelector('h1')?.textContent || 
           'Brand Campaign';
  }

  private extractDescription(doc: Document): string {
    return doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
           doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
           'Generated brand campaign';
  }

  private extractColors(doc: Document): BrandData['colors'] {
    const computedStyles = window.getComputedStyle(doc.body);
    
    // Extract colors from CSS variables and computed styles
    const primaryColor = this.findColorInStyles(['--primary', '--brand', '--main']) || '#841b60';
    const secondaryColor = this.findColorInStyles(['--secondary', '--accent']) || '#6d164f';
    
    return {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: this.findColorInStyles(['--accent', '--highlight']) || '#ffffff',
      background: computedStyles.backgroundColor || '#ffffff'
    };
  }

  private extractLogos(doc: Document, baseUrl: string): BrandData['logos'] {
    const favicon = doc.querySelector('link[rel="icon"], link[rel="shortcut icon"]')?.getAttribute('href');
    const logo = doc.querySelector('img[alt*="logo" i], .logo img, [class*="logo"] img')?.getAttribute('src');
    const heroImage = doc.querySelector('.hero img, .banner img, header img')?.getAttribute('src');

    return {
      favicon: favicon ? this.resolveUrl(favicon, baseUrl) : undefined,
      logo: logo ? this.resolveUrl(logo, baseUrl) : undefined,
      heroImage: heroImage ? this.resolveUrl(heroImage, baseUrl) : undefined
    };
  }

  private extractFonts(doc: Document): BrandData['fonts'] {
    const googleFonts = doc.querySelector('link[href*="fonts.googleapis.com"]')?.getAttribute('href');
    const bodyFont = window.getComputedStyle(doc.body).fontFamily;

    return {
      primary: this.parseFontFamily(bodyFont) || 'Inter',
      secondary: googleFonts ? this.extractGoogleFont(googleFonts) : undefined
    };
  }

  private extractContent(doc: Document): BrandData['content'] {
    const headings = Array.from(doc.querySelectorAll('h1, h2, h3')).map(el => el.textContent || '').filter(Boolean);
    const descriptions = Array.from(doc.querySelectorAll('p')).map(el => el.textContent || '').filter(Boolean).slice(0, 5);
    const ctaTexts = Array.from(doc.querySelectorAll('button, .btn, .cta, a[class*="button"]')).map(el => el.textContent || '').filter(Boolean);

    return {
      headings: headings.slice(0, 5),
      descriptions,
      ctaTexts: ctaTexts.slice(0, 5)
    };
  }

  private extractDesignTokens(doc: Document): BrandData['designTokens'] {
    const computedStyles = window.getComputedStyle(doc.body);
    
    return {
      borderRadius: computedStyles.borderRadius || '0.5rem',
      shadows: ['0 1px 3px rgba(0,0,0,0.1)', '0 4px 6px rgba(0,0,0,0.1)'],
      spacing: '1rem'
    };
  }

  private findColorInStyles(): string | null {
    // Simplified color extraction - in real implementation, would parse CSS
    return null;
  }

  private resolveUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http')) return url;
    if (url.startsWith('//')) return `https:${url}`;
    if (url.startsWith('/')) return new URL(baseUrl).origin + url;
    return new URL(url, baseUrl).href;
  }

  private parseFontFamily(fontFamily: string): string {
    return fontFamily.split(',')[0].replace(/['"]/g, '').trim();
  }

  private extractGoogleFont(url: string): string {
    const match = url.match(/family=([^&:]+)/);
    return match ? match[1].replace(/\+/g, ' ') : '';
  }
}
