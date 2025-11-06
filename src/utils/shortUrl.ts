/**
 * Service de génération et gestion des Short URLs
 */

// Génère un code court unique (6 caractères alphanumériques)
export function generateShortCode(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Génère une short URL à partir d'une URL longue
export function createShortUrl(longUrl: string, customCode?: string): string {
  const code = customCode || generateShortCode();
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}/s/${code}`;
}

// Extrait le code d'une short URL
export function extractShortCode(shortUrl: string): string | null {
  const match = shortUrl.match(/\/s\/([a-zA-Z0-9]+)/);
  return match ? match[1] : null;
}

// Valide un code personnalisé
export function validateCustomCode(code: string): { valid: boolean; error?: string } {
  if (!code) {
    return { valid: false, error: 'Le code ne peut pas être vide' };
  }
  
  if (code.length < 3) {
    return { valid: false, error: 'Le code doit contenir au moins 3 caractères' };
  }
  
  if (code.length > 20) {
    return { valid: false, error: 'Le code ne peut pas dépasser 20 caractères' };
  }
  
  if (!/^[a-zA-Z0-9-_]+$/.test(code)) {
    return { valid: false, error: 'Le code ne peut contenir que des lettres, chiffres, tirets et underscores' };
  }
  
  // Mots réservés
  const reserved = ['admin', 'api', 'auth', 'dashboard', 'settings', 'campaign', 'oembed', 'integrations-test'];
  if (reserved.includes(code.toLowerCase())) {
    return { valid: false, error: 'Ce code est réservé' };
  }
  
  return { valid: true };
}

// Interface pour stocker les mappings Short URL
export interface ShortUrlMapping {
  code: string;
  longUrl: string;
  campaignId: string;
  createdAt: string;
  clicks?: number;
  lastClickedAt?: string;
}

// Stockage local des mappings (en production, utiliser une DB)
const STORAGE_KEY = 'prosplay_short_urls';

export function saveShortUrlMapping(mapping: ShortUrlMapping): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const mappings: ShortUrlMapping[] = stored ? JSON.parse(stored) : [];
    
    // Vérifier si le code existe déjà
    const existingIndex = mappings.findIndex(m => m.code === mapping.code);
    if (existingIndex >= 0) {
      mappings[existingIndex] = mapping;
    } else {
      mappings.push(mapping);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
  } catch (error) {
    console.error('Error saving short URL mapping:', error);
  }
}

export function getShortUrlMapping(code: string): ShortUrlMapping | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const mappings: ShortUrlMapping[] = JSON.parse(stored);
    return mappings.find(m => m.code === code) || null;
  } catch (error) {
    console.error('Error getting short URL mapping:', error);
    return null;
  }
}

export function getAllShortUrlMappings(): ShortUrlMapping[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting all short URL mappings:', error);
    return [];
  }
}

export function deleteShortUrlMapping(code: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const mappings: ShortUrlMapping[] = JSON.parse(stored);
    const filtered = mappings.filter(m => m.code !== code);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting short URL mapping:', error);
  }
}

export function incrementShortUrlClicks(code: string): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const mappings: ShortUrlMapping[] = JSON.parse(stored);
    const mapping = mappings.find(m => m.code === code);
    
    if (mapping) {
      mapping.clicks = (mapping.clicks || 0) + 1;
      mapping.lastClickedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings));
    }
  } catch (error) {
    console.error('Error incrementing clicks:', error);
  }
}
