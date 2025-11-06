import { lazy } from 'react';

// Lazy load des composants lourds pour améliorer les performances
export const LazyDesignCanvas = lazy(() => import('@/components/DesignEditor/DesignCanvas'));
export const LazyStandardizedWheel = lazy(() => import('@/components/shared/StandardizedWheel'));
export const LazyArticleCanvas = lazy(() => import('@/components/ArticleEditor/ArticleCanvas'));
export const LazyModularCanvas = lazy(() => import('@/components/QuizEditor/modules/ModularCanvas'));
export const LazyPerformanceMonitor = lazy(() => import('@/components/ModernEditor/components/PerformanceMonitor'));
