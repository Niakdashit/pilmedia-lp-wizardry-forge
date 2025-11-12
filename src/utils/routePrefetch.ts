/**
 * Système de prefetching intelligent des routes
 * Précharge les routes avant que l'utilisateur ne navigue
 */

interface PrefetchConfig {
  priority: 'high' | 'medium' | 'low';
  delay?: number;
}

class RoutePrefetcher {
  private prefetchedRoutes = new Set<string>();
  private prefetchQueue: Map<string, () => Promise<any>> = new Map();
  private isIdle = false;

  constructor() {
    this.setupIdleDetection();
  }

  /**
   * Détecte quand le navigateur est idle pour précharger
   */
  private setupIdleDetection() {
    if (typeof window === 'undefined') return;

    const win: any = window;
    
    if (typeof win.requestIdleCallback === 'function') {
      win.requestIdleCallback(
        () => {
          this.isIdle = true;
          this.processPrefetchQueue();
        },
        { timeout: 2000 }
      );
    } else {
      // Fallback pour les navigateurs sans requestIdleCallback
      setTimeout(() => {
        this.isIdle = true;
        this.processPrefetchQueue();
      }, 2000);
    }
  }

  /**
   * Enregistre une route à précharger
   */
  register(route: string, loader: () => Promise<any>, config: PrefetchConfig = { priority: 'low' }) {
    if (this.prefetchedRoutes.has(route)) return;

    this.prefetchQueue.set(route, loader);

    // Si priorité haute, précharger immédiatement
    if (config.priority === 'high') {
      this.prefetch(route);
    } else if (config.priority === 'medium' && this.isIdle) {
      setTimeout(() => this.prefetch(route), config.delay || 500);
    }
    // Les routes low priority seront préchargées lors du idle
  }

  /**
   * Précharge une route spécifique
   */
  async prefetch(route: string): Promise<void> {
    if (this.prefetchedRoutes.has(route)) return;

    const loader = this.prefetchQueue.get(route);
    if (!loader) return;

    try {
      await loader();
      this.prefetchedRoutes.add(route);
      this.prefetchQueue.delete(route);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`✅ Route préchargée: ${route}`);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️ Échec du préchargement de ${route}:`, error);
      }
    }
  }

  /**
   * Précharge toutes les routes en attente (pendant idle time)
   */
  private async processPrefetchQueue() {
    const routes = Array.from(this.prefetchQueue.keys());
    
    for (const route of routes) {
      if (!this.isIdle) break;
      await this.prefetch(route);
      // Petit délai entre chaque préchargement pour ne pas bloquer
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  /**
   * Précharge les routes basées sur le hover (intention de navigation)
   */
  prefetchOnHover(route: string, loader: () => Promise<any>) {
    // Attendre un court délai pour éviter les hovers accidentels
    const timeoutId = setTimeout(() => {
      this.prefetch(route);
    }, 50);

    return () => clearTimeout(timeoutId);
  }

  /**
   * Précharge les routes voisines de la route actuelle
   */
  prefetchNeighbors(currentRoute: string, neighbors: string[]) {
    neighbors.forEach((route) => {
      const loader = this.prefetchQueue.get(route);
      if (loader) {
        this.register(route, loader, { priority: 'medium', delay: 1000 });
      }
    });
  }

  /**
   * Réinitialise le cache (utile pour les tests)
   */
  reset() {
    this.prefetchedRoutes.clear();
    this.prefetchQueue.clear();
  }
}

/**
 * Instance globale du prefetcher
 */
export const routePrefetcher = new RoutePrefetcher();

/**
 * Hook pour précharger une route au hover
 */
export function usePrefetchOnHover(route: string, loader: () => Promise<any>) {
  return {
    onMouseEnter: () => routePrefetcher.prefetchOnHover(route, loader),
    onTouchStart: () => routePrefetcher.prefetchOnHover(route, loader),
  };
}

/**
 * Routes de l'application avec leurs loaders
 */
export const ROUTE_LOADERS = {
  '/dashboard': () => import('../pages/Dashboard'),
  '/campaigns': () => import('../pages/Campaigns'),
  '/statistics': () => import('../pages/Statistics'),
  '/design-editor': () => import('../pages/DesignEditor'),
  '/quiz-editor': () => import('../pages/QuizEditor'),
  '/jackpot-editor': () => import('../pages/JackpotEditor'),
  '/form-editor': () => import('../pages/FormEditor'),
  '/scratch-editor': () => import('../pages/ScratchCardEditor'),
  '/template-editor': () => import('../pages/TemplateEditor'),
  '/templates-editor': () => import('../pages/TemplatesEditor'),
  '/modeles': () => import('../pages/Templates'),
  '/partnerships': () => import('../pages/Partnerships'),
  '/profile': () => import('../pages/Profile'),
  '/admin': () => import('../pages/Admin'),
  '/media': () => import('../pages/MediaPortal'),
};

/**
 * Relations de navigation (routes souvent visitées ensemble)
 */
export const ROUTE_NEIGHBORS: Record<string, string[]> = {
  '/dashboard': ['/campaigns', '/statistics'],
  '/campaigns': ['/dashboard', '/design-editor', '/statistics'],
  '/design-editor': ['/campaigns', '/template-editor'],
  '/template-editor': ['/design-editor', '/campaigns'],
  '/statistics': ['/campaigns', '/dashboard'],
};
