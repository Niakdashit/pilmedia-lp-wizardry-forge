import { useCallback, useRef, useState, useEffect } from 'react';
import { compress, decompress } from 'lz-string';

interface CacheEntry<T> {
  data: T;
  compressed: string;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number;
  priority: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  compressionRatio: number;
  totalSize: number;
  entryCount: number;
}

interface AdvancedCacheOptions {
  maxSize?: number; // Taille max en bytes
  maxEntries?: number;
  ttl?: number; // Time to live en ms
  compressionThreshold?: number; // Taille min pour compression
  enableCompression?: boolean;
  enablePersistence?: boolean;
  storageKey?: string;
}

export const useAdvancedCache = <T = any>({
  maxSize = 50 * 1024 * 1024, // 50MB par défaut
  maxEntries = 1000,
  ttl = 30 * 60 * 1000, // 30 minutes
  compressionThreshold = 1024, // 1KB
  enableCompression = true,
  enablePersistence = true,
  storageKey = 'editor-cache'
}: AdvancedCacheOptions = {}) => {
  
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());
  const statsRef = useRef<CacheStats>({
    hits: 0,
    misses: 0,
    evictions: 0,
    compressionRatio: 0,
    totalSize: 0,
    entryCount: 0
  });

  const [cacheSize, setCacheSize] = useState(0);
  const cleanupIntervalRef = useRef<NodeJS.Timeout>();

  // Calculer la priorité d'un élément (pour l'éviction LRU améliorée)
  const calculatePriority = useCallback((entry: CacheEntry<T>): number => {
    const now = Date.now();
    const age = now - entry.timestamp;
    const timeSinceAccess = now - entry.lastAccess;
    
    // Facteurs de priorité :
    // - Fréquence d'accès (plus élevée = priorité plus haute)
    // - Récence d'accès (plus récent = priorité plus haute)
    // - Âge de l'entrée (plus récent = priorité plus haute)
    const frequencyScore = Math.log(entry.accessCount + 1);
    const recencyScore = Math.max(0, 1 - timeSinceAccess / ttl);
    const ageScore = Math.max(0, 1 - age / ttl);
    
    return frequencyScore * 0.4 + recencyScore * 0.4 + ageScore * 0.2;
  }, [ttl]);

  // Compresser les données si nécessaire
  const compressData = useCallback((data: T): { compressed: string; originalSize: number; compressedSize: number } => {
    const jsonStr = JSON.stringify(data);
    const originalSize = new Blob([jsonStr]).size;
    
    if (!enableCompression || originalSize < compressionThreshold) {
      return {
        compressed: jsonStr,
        originalSize,
        compressedSize: originalSize
      };
    }
    
    const compressed = compress(jsonStr);
    const compressedSize = new Blob([compressed]).size;
    
    return {
      compressed,
      originalSize,
      compressedSize
    };
  }, [enableCompression, compressionThreshold]);

  // Décompresser les données
  const decompressData = useCallback((compressed: string, wasCompressed: boolean): T => {
    if (!wasCompressed) {
      return JSON.parse(compressed);
    }
    
    const decompressed = decompress(compressed);
    return JSON.parse(decompressed || '{}');
  }, []);

  // Éviction intelligente LRU avec priorités
  const evictEntries = useCallback(() => {
    const cache = cacheRef.current;
    const stats = statsRef.current;
    
    if (cache.size === 0) return;

    // Calculer les priorités pour toutes les entrées
    const entriesWithPriority = Array.from(cache.entries()).map(([key, entry]) => ({
      key,
      entry,
      priority: calculatePriority(entry)
    }));

    // Trier par priorité (plus faible = éviction en premier)
    entriesWithPriority.sort((a, b) => a.priority - b.priority);

    // Éviction jusqu'à respecter les limites
    let currentSize = stats.totalSize;
    let evicted = 0;

    for (const { key, entry } of entriesWithPriority) {
      if (cache.size <= maxEntries * 0.8 && currentSize <= maxSize * 0.8) {
        break; // Garder 20% de marge
      }

      cache.delete(key);
      currentSize -= entry.size;
      evicted++;
    }

    // Mettre à jour les stats
    stats.evictions += evicted;
    stats.totalSize = currentSize;
    stats.entryCount = cache.size;
    
    setCacheSize(currentSize);
  }, [maxEntries, maxSize, calculatePriority]);

  // Nettoyer les entrées expirées
  const cleanupExpired = useCallback(() => {
    const cache = cacheRef.current;
    const stats = statsRef.current;
    const now = Date.now();
    let cleanedSize = 0;
    let cleanedCount = 0;

    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > ttl) {
        cleanedSize += entry.size;
        cleanedCount++;
        cache.delete(key);
      }
    }

    if (cleanedCount > 0) {
      stats.totalSize -= cleanedSize;
      stats.entryCount = cache.size;
      setCacheSize(stats.totalSize);
    }
  }, [ttl]);

  // Sauvegarder le cache dans localStorage
  const persistCache = useCallback(() => {
    if (!enablePersistence) return;

    try {
      const cache = cacheRef.current;
      const serializable = Array.from(cache.entries()).slice(0, 100); // Limiter la persistance
      localStorage.setItem(storageKey, JSON.stringify(serializable));
    } catch (error) {
      console.warn('Failed to persist cache:', error);
    }
  }, [enablePersistence, storageKey]);

  // Charger le cache depuis localStorage
  const loadPersistedCache = useCallback(() => {
    if (!enablePersistence) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const entries: [string, CacheEntry<T>][] = JSON.parse(stored);
        const cache = cacheRef.current;
        const stats = statsRef.current;
        
        let totalSize = 0;
        for (const [key, entry] of entries) {
          // Vérifier que l'entrée n'est pas expirée
          if (Date.now() - entry.timestamp <= ttl) {
            cache.set(key, entry);
            totalSize += entry.size;
          }
        }
        
        stats.totalSize = totalSize;
        stats.entryCount = cache.size;
        setCacheSize(totalSize);
      }
    } catch (error) {
      console.warn('Failed to load persisted cache:', error);
    }
  }, [enablePersistence, storageKey, ttl]);

  // Obtenir une entrée du cache
  const get = useCallback((key: string): T | null => {
    const cache = cacheRef.current;
    const stats = statsRef.current;
    const entry = cache.get(key);

    if (!entry) {
      stats.misses++;
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > ttl) {
      cache.delete(key);
      stats.misses++;
      stats.totalSize -= entry.size;
      stats.entryCount = cache.size;
      setCacheSize(stats.totalSize);
      return null;
    }

    // Mettre à jour les stats d'accès
    entry.accessCount++;
    entry.lastAccess = Date.now();
    entry.priority = calculatePriority(entry);
    
    stats.hits++;

    // Décompresser et retourner
    const wasCompressed = entry.compressed !== JSON.stringify(entry.data);
    return decompressData(entry.compressed, wasCompressed);
  }, [ttl, calculatePriority, decompressData]);

  // Ajouter une entrée au cache
  const set = useCallback((key: string, data: T): void => {
    const cache = cacheRef.current;
    const stats = statsRef.current;
    const now = Date.now();

    // Compresser les données
    const { compressed, originalSize, compressedSize } = compressData(data);
    
    // Créer l'entrée
    const entry: CacheEntry<T> = {
      data,
      compressed,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
      size: compressedSize,
      priority: 1
    };

    // Supprimer l'ancienne entrée si elle existe
    const oldEntry = cache.get(key);
    if (oldEntry) {
      stats.totalSize -= oldEntry.size;
    }

    // Ajouter la nouvelle entrée
    cache.set(key, entry);
    stats.totalSize += compressedSize;
    stats.entryCount = cache.size;

    // Mettre à jour le ratio de compression
    if (originalSize > 0) {
      stats.compressionRatio = (stats.compressionRatio + compressedSize / originalSize) / 2;
    }

    setCacheSize(stats.totalSize);

    // Éviction si nécessaire
    if (cache.size > maxEntries || stats.totalSize > maxSize) {
      evictEntries();
    }
  }, [compressData, maxEntries, maxSize, evictEntries]);

  // Supprimer une entrée
  const remove = useCallback((key: string): boolean => {
    const cache = cacheRef.current;
    const stats = statsRef.current;
    const entry = cache.get(key);

    if (entry) {
      cache.delete(key);
      stats.totalSize -= entry.size;
      stats.entryCount = cache.size;
      setCacheSize(stats.totalSize);
      return true;
    }

    return false;
  }, []);

  // Vider le cache
  const clear = useCallback(() => {
    const cache = cacheRef.current;
    const stats = statsRef.current;
    
    cache.clear();
    stats.totalSize = 0;
    stats.entryCount = 0;
    setCacheSize(0);

    if (enablePersistence) {
      localStorage.removeItem(storageKey);
    }
  }, [enablePersistence, storageKey]);

  // Obtenir les statistiques
  const getStats = useCallback((): CacheStats & { hitRate: number } => {
    const stats = statsRef.current;
    const totalRequests = stats.hits + stats.misses;
    const hitRate = totalRequests > 0 ? stats.hits / totalRequests : 0;

    return {
      ...stats,
      hitRate
    };
  }, []);

  // Précharger des données (utile pour les prédictions)
  const preload = useCallback((key: string, dataPromise: Promise<T>) => {
    dataPromise.then(data => {
      if (!cacheRef.current.has(key)) {
        set(key, data);
      }
    }).catch(() => {
      // Ignorer les erreurs de préchargement
    });
  }, [set]);

  // Configuration du nettoyage automatique
  useEffect(() => {
    // Charger le cache persisté au démarrage
    loadPersistedCache();

    // Nettoyer périodiquement
    cleanupIntervalRef.current = setInterval(() => {
      cleanupExpired();
      persistCache();
    }, 60000); // Toutes les minutes

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      persistCache(); // Sauvegarder avant de quitter
    };
  }, [cleanupExpired, persistCache, loadPersistedCache]);

  return {
    // Méthodes principales
    get,
    set,
    remove,
    clear,
    preload,
    
    // Utilitaires
    has: (key: string) => cacheRef.current.has(key),
    size: () => cacheRef.current.size,
    keys: () => Array.from(cacheRef.current.keys()),
    
    // Stats et monitoring
    getStats,
    cacheSize,
    
    // Maintenance
    cleanup: cleanupExpired,
    evict: evictEntries,
    persist: persistCache
  };
};
