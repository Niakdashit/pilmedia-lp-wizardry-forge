import React, { Suspense, ComponentType } from 'react';
import { cn } from '@/lib/utils';

interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: string;
  className?: string;
}

/**
 * Composant de chargement par défaut
 */
const DefaultLoader: React.FC<{ minHeight?: string }> = ({ minHeight = '400px' }) => (
  <div 
    className={cn(
      "w-full flex items-center justify-center",
      "bg-background/50 backdrop-blur-sm"
    )}
    style={{ minHeight }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">Chargement...</p>
    </div>
  </div>
);

/**
 * Boundary Suspense réutilisable avec fallback personnalisable
 * Ajoute un léger délai pour éviter les clignotements lors de suspensions très courtes
 */
const DelayedFallback: React.FC<{ delayMs?: number; children: React.ReactNode }> = ({ delayMs = 200, children }) => {
  const [ready, setReady] = React.useState(delayMs === 0);
  React.useEffect(() => {
    if (delayMs === 0) return;
    const t = setTimeout(() => setReady(true), delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);
  if (!ready) return null;
  return <>{children}</>;
};

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  fallback,
  minHeight,
  className,
}) => {
  return (
    <Suspense
      fallback={
        <DelayedFallback>
          {fallback || (
            <div className={className}>
              <DefaultLoader minHeight={minHeight} />
            </div>
          )}
        </DelayedFallback>
      }
    >
      {children}
    </Suspense>
  );
};


/**
 * HOC pour wrapper automatiquement un composant lazy avec LoadingBoundary
 */
export function withLoadingBoundary<P extends object>(
  Component: ComponentType<P>,
  options?: {
    fallback?: React.ReactNode;
    minHeight?: string;
    className?: string;
  }
) {
  return (props: P) => (
    <LoadingBoundary {...options}>
      <Component {...props} />
    </LoadingBoundary>
  );
}

/**
 * Loader pour les éditeurs (fullscreen)
 */
export const EditorLoader: React.FC = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Chargement de l'éditeur
        </h3>
        <p className="text-sm text-muted-foreground">
          Veuillez patienter quelques instants...
        </p>
      </div>
    </div>
  </div>
);

// Variante avec délai anti-clignotement
export const EditorLoaderDelayed: React.FC<{ delayMs?: number }> = ({ delayMs = 200 }) => (
  <DelayedFallback delayMs={delayMs}>
    <EditorLoader />
  </DelayedFallback>
);


/**
 * Loader minimal pour les petits composants
 */
export const MinimalLoader: React.FC = () => (
  <div className="flex items-center justify-center p-4">
    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

/**
 * Loader pour les cartes/modules
 */
export const CardLoader: React.FC = () => (
  <div className="w-full h-32 bg-muted/50 rounded-lg animate-pulse flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

/**
 * Skeleton loader pour les listes
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg animate-pulse">
        <div className="w-12 h-12 bg-muted rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export default LoadingBoundary;
