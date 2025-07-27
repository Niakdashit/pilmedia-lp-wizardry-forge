import { extractColorsFromLogo } from '../utils/BrandStyleAnalyzer';

export interface EnhancedBrandData {
  websiteUrl: string;
  logoColors: string[];
  backgroundColors: string[];
  websiteAnalysis: {
    title: string;
    description: string;
    keywords: string[];
    industry: string;
    tone: string;
  };
}

export class EnhancedBrandAnalyzer {
  
  /**
   * Analyze a brand from website URL and assets
   */
  static async analyzeBrandComplete(
    websiteUrl: string,
    logoFile?: File,
    backgroundFile?: File
  ): Promise<EnhancedBrandData> {
    
    const results: EnhancedBrandData = {
      websiteUrl,
      logoColors: [],
      backgroundColors: [],
      websiteAnalysis: {
        title: '',
        description: '',
        keywords: [],
        industry: 'general',
        tone: 'professional'
      }
    };

    // 1. Extract colors from logo if provided
    if (logoFile) {
      try {
        const logoUrl = URL.createObjectURL(logoFile);
        results.logoColors = await extractColorsFromLogo(logoUrl);
        URL.revokeObjectURL(logoUrl);
      } catch (error) {
        console.warn('Error extracting logo colors:', error);
      }
    }

    // 2. Extract colors from background image if provided
    if (backgroundFile) {
      try {
        const backgroundUrl = URL.createObjectURL(backgroundFile);
        results.backgroundColors = await extractColorsFromLogo(backgroundUrl);
        URL.revokeObjectURL(backgroundUrl);
      } catch (error) {
        console.warn('Error extracting background colors:', error);
      }
    }

    // 3. Analyze website content
    try {
      results.websiteAnalysis = await this.analyzeWebsiteContent(websiteUrl);
    } catch (error) {
      console.warn('Error analyzing website:', error);
    }

    return results;
  }

  /**
   * Analyze website content to extract brand information
   */
  private static async analyzeWebsiteContent(url: string): Promise<{
    title: string;
    description: string;
    keywords: string[];
    industry: string;
    tone: string;
  }> {
    
    const cleanUrl = url.startsWith('http') ? url : `https://${url}`;
    
    try {
      // Fetch website content (Note: This will be limited by CORS in browser)
      const response = await fetch(cleanUrl, {
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch website');
      }
      
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract title
      const title = doc.querySelector('title')?.textContent || 
                   doc.querySelector('h1')?.textContent || 
                   'Website';
      
      // Extract description
      const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                         doc.querySelector('meta[property="og:description"]')?.getAttribute('content') ||
                         doc.querySelector('p')?.textContent?.substring(0, 200) || 
                         '';
      
      // Extract keywords
      const keywordsContent = doc.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
      const keywords = keywordsContent.split(',').map(k => k.trim()).filter(Boolean);
      
      // Simple industry detection based on content
      const industry = this.detectIndustry(html.toLowerCase());
      
      // Simple tone detection
      const tone = this.detectTone(html.toLowerCase());
      
      return {
        title: title.trim(),
        description: description.trim(),
        keywords,
        industry,
        tone
      };
      
    } catch (error) {
      // Fallback for CORS or network issues
      console.warn('Website analysis failed, using URL-based fallback:', error);
      
      return {
        title: this.extractDomainName(cleanUrl),
        description: `Site web: ${cleanUrl}`,
        keywords: [],
        industry: this.detectIndustryFromUrl(cleanUrl),
        tone: 'professional'
      };
    }
  }

  /**
   * Simple industry detection based on content keywords
   */
  private static detectIndustry(content: string): string {
    const industries = {
      'ecommerce': ['shop', 'store', 'buy', 'cart', 'product', 'sale', 'price'],
      'restaurant': ['restaurant', 'menu', 'food', 'cuisine', 'chef', 'dining'],
      'fitness': ['fitness', 'gym', 'workout', 'training', 'sport', 'health'],
      'beauty': ['beauty', 'cosmetic', 'skincare', 'makeup', 'spa', 'salon'],
      'tech': ['technology', 'software', 'app', 'digital', 'innovation', 'code'],
      'education': ['education', 'school', 'learning', 'course', 'student', 'teach'],
      'real-estate': ['real estate', 'property', 'house', 'apartment', 'rent', 'buy'],
      'travel': ['travel', 'trip', 'vacation', 'hotel', 'booking', 'destination'],
      'finance': ['finance', 'bank', 'investment', 'loan', 'insurance', 'money']
    };

    for (const [industry, keywords] of Object.entries(industries)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return industry;
      }
    }

    return 'general';
  }

  /**
   * Detect industry from URL domain
   */
  private static detectIndustryFromUrl(url: string): string {
    const domain = url.toLowerCase();
    
    if (domain.includes('shop') || domain.includes('store')) return 'ecommerce';
    if (domain.includes('restaurant') || domain.includes('food')) return 'restaurant';
    if (domain.includes('fitness') || domain.includes('gym')) return 'fitness';
    if (domain.includes('beauty') || domain.includes('spa')) return 'beauty';
    if (domain.includes('tech') || domain.includes('digital')) return 'tech';
    if (domain.includes('school') || domain.includes('edu')) return 'education';
    if (domain.includes('travel') || domain.includes('hotel')) return 'travel';
    if (domain.includes('bank') || domain.includes('finance')) return 'finance';
    
    return 'general';
  }

  /**
   * Simple tone detection based on content style
   */
  private static detectTone(content: string): string {
    const patterns = {
      'playful': ['fun', 'exciting', 'amazing', 'awesome', 'cool', '!', 'emoji'],
      'luxury': ['premium', 'exclusive', 'luxury', 'elegant', 'sophisticated'],
      'modern': ['modern', 'innovative', 'cutting-edge', 'advanced', 'contemporary'],
      'friendly': ['welcome', 'friendly', 'community', 'together', 'family'],
      'professional': ['professional', 'expertise', 'quality', 'service', 'trusted']
    };

    for (const [tone, keywords] of Object.entries(patterns)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return tone;
      }
    }

    return 'professional';
  }

  /**
   * Extract clean domain name for fallback title
   */
  private static extractDomainName(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '').split('.')[0];
    } catch {
      return 'Website';
    }
  }

  /**
   * Merge colors from different sources with priority
   */
  static mergeColorPalettes(logoColors: string[], backgroundColors: string[], websiteColors: string[] = []): string[] {
    const allColors = [...logoColors, ...backgroundColors, ...websiteColors];
    
    // Remove duplicates and filter invalid colors
    const uniqueColors = Array.from(new Set(allColors))
      .filter(color => color && color.startsWith('#') && color.length === 7);
    
    // Return top 5 colors
    return uniqueColors.slice(0, 5);
  }
}

export default EnhancedBrandAnalyzer;