import { compress, decompress } from 'lz-string';

/**
 * Wrapper pour localStorage avec compression LZ-string automatique
 * Réduit jusqu'à 90% la taille des données stockées
 */
class CompressedStorage {
  private compressionEnabled: boolean;

  constructor() {
    // Désactiver la compression en dev pour faciliter le debugging
    this.compressionEnabled = process.env.NODE_ENV === 'production';
  }

  /**
   * Stocke une valeur en la compressant automatiquement
   */
  setItem(key: string, value: string): void {
    try {
      const data = this.compressionEnabled ? compress(value) : value;
      localStorage.setItem(key, data);
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${key}`, error);
    }
  }

  /**
   * Récupère et décompresse une valeur
   */
  getItem(key: string): string | null {
    try {
      const data = localStorage.getItem(key);
      if (!data) return null;
      
      // Si la compression est activée, essayer de décompresser
      if (this.compressionEnabled) {
        try {
          return decompress(data) || data;
        } catch {
          // Si la décompression échoue, retourner la donnée brute (rétrocompatibilité)
          return data;
        }
      }
      
      return data;
    } catch (error) {
      console.warn(`Failed to read from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Stocke un objet JSON compressé
   */
  setJSON<T>(key: string, value: T): void {
    try {
      const json = JSON.stringify(value);
      this.setItem(key, json);
    } catch (error) {
      console.warn(`Failed to stringify and save: ${key}`, error);
    }
  }

  /**
   * Récupère et parse un objet JSON compressé
   */
  getJSON<T>(key: string): T | null {
    try {
      const data = this.getItem(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.warn(`Failed to parse JSON from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Supprime une clé
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage: ${key}`, error);
    }
  }

  /**
   * Vide tout le localStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear localStorage', error);
    }
  }

  /**
   * Retourne toutes les clés
   */
  keys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch {
      return [];
    }
  }

  /**
   * Retourne la taille totale utilisée (en MB)
   */
  getSize(): number {
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total / (1024 * 1024); // Convert to MB
    } catch {
      return 0;
    }
  }

  /**
   * Nettoie les anciennes entrées (utile pour éviter de saturer le localStorage)
   */
  cleanOldEntries(maxAge: number = 7 * 24 * 60 * 60 * 1000): void {
    try {
      const now = Date.now();
      const keys = this.keys();
      
      keys.forEach((key) => {
        // Vérifie si c'est un timestamp
        if (key.includes(':timestamp:')) {
          const timestamp = this.getJSON<number>(key);
          if (timestamp && now - timestamp > maxAge) {
            this.removeItem(key);
            // Supprime aussi la donnée associée
            const dataKey = key.replace(':timestamp:', ':data:');
            this.removeItem(dataKey);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clean old entries', error);
    }
  }
}

/**
 * Instance globale du storage compressé
 */
export const compressedStorage = new CompressedStorage();

/**
 * Hook-compatible wrapper pour React
 */
export const useCompressedStorage = () => compressedStorage;
