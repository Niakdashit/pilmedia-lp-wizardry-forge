/**
 * Tracking des métriques de sauvegarde pour monitoring performance
 */

export interface SaveMetric {
  timestamp: number;
  duration: number; // ms
  payloadSize: number; // bytes
  success: boolean;
  retryCount: number;
  isOnline: boolean;
  compressionRatio?: number;
  isDiff?: boolean;
  error?: string;
}

const STORAGE_KEY = 'leadya_save_metrics';
const MAX_METRICS = 1000;
const MAX_AGE_DAYS = 7;

class SaveMetricsTracker {
  private metrics: SaveMetric[] = [];

  constructor() {
    this.loadMetrics();
    this.cleanOldMetrics();
  }

  /**
   * Enregistre une métrique de sauvegarde
   */
  track(metric: Omit<SaveMetric, 'timestamp'>): void {
    const fullMetric: SaveMetric = {
      ...metric,
      timestamp: Date.now(),
    };

    this.metrics.push(fullMetric);

    // Limite le nombre de métriques
    if (this.metrics.length > MAX_METRICS) {
      this.metrics = this.metrics.slice(-MAX_METRICS);
    }

    this.saveMetrics();
  }

  /**
   * Récupère toutes les métriques
   */
  getAll(): SaveMetric[] {
    return [...this.metrics];
  }

  /**
   * Récupère les métriques des N derniers jours
   */
  getRecent(days: number = 7): SaveMetric[] {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Calcule les statistiques globales
   */
  getStats(days: number = 7): {
    totalSaves: number;
    successRate: number;
    avgDuration: number;
    avgPayloadSize: number;
    avgCompressionRatio: number;
    totalRetries: number;
  } {
    const recent = this.getRecent(days);

    if (recent.length === 0) {
      return {
        totalSaves: 0,
        successRate: 0,
        avgDuration: 0,
        avgPayloadSize: 0,
        avgCompressionRatio: 1,
        totalRetries: 0,
      };
    }

    const successful = recent.filter(m => m.success);
    const withCompression = recent.filter(m => m.compressionRatio !== undefined);

    return {
      totalSaves: recent.length,
      successRate: (successful.length / recent.length) * 100,
      avgDuration: recent.reduce((sum, m) => sum + m.duration, 0) / recent.length,
      avgPayloadSize: recent.reduce((sum, m) => sum + m.payloadSize, 0) / recent.length,
      avgCompressionRatio: withCompression.length > 0
        ? withCompression.reduce((sum, m) => sum + (m.compressionRatio || 1), 0) / withCompression.length
        : 1,
      totalRetries: recent.reduce((sum, m) => sum + m.retryCount, 0),
    };
  }

  /**
   * Export pour debug
   */
  exportDiagnostics(): string {
    const stats = this.getStats();
    const recent = this.getRecent(1);

    return JSON.stringify(
      {
        stats,
        recentMetrics: recent,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
  }

  /**
   * Nettoie les anciennes métriques
   */
  private cleanOldMetrics(): void {
    const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
    this.saveMetrics();
  }

  /**
   * Charge depuis localStorage
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[SaveMetrics] Error loading metrics:', error);
      this.metrics = [];
    }
  }

  /**
   * Sauvegarde dans localStorage
   */
  private saveMetrics(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.metrics));
    } catch (error) {
      console.error('[SaveMetrics] Error saving metrics:', error);
    }
  }

  /**
   * Réinitialise toutes les métriques
   */
  clear(): void {
    this.metrics = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const saveMetrics = new SaveMetricsTracker();
