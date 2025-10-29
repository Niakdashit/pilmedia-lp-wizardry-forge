import { useState, useEffect, useRef, useMemo } from 'react';

interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

/**
 * Hook pour virtualiser de longues listes et améliorer les performances
 * Ne rend que les éléments visibles + un buffer
 */
export const useVirtualList = <T,>(
  items: T[],
  { itemHeight, containerHeight, overscan = 3 }: UseVirtualListOptions
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const virtualItems = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(items.length, visibleEnd + overscan);

    return {
      items: items.slice(start, end),
      startIndex: start,
      endIndex: end,
      offsetY: start * itemHeight,
      totalHeight: items.length * itemHeight,
    };
  }, [items, scrollTop, itemHeight, containerHeight, overscan]);

  return {
    containerRef,
    virtualItems,
  };
};

/**
 * Hook pour virtualiser une grille (2D)
 */
export const useVirtualGrid = <T,>(
  items: T[],
  {
    itemWidth,
    itemHeight,
    containerWidth,
    containerHeight,
    columns,
    gap = 0,
    overscan = 3,
  }: {
    itemWidth: number;
    itemHeight: number;
    containerWidth: number;
    containerHeight: number;
    columns: number;
    gap?: number;
    overscan?: number;
  }
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const virtualGrid = useMemo(() => {
    const totalRows = Math.ceil(items.length / columns);
    const rowHeight = itemHeight + gap;

    const visibleStartRow = Math.floor(scrollTop / rowHeight);
    const visibleEndRow = Math.ceil((scrollTop + containerHeight) / rowHeight);

    const startRow = Math.max(0, visibleStartRow - overscan);
    const endRow = Math.min(totalRows, visibleEndRow + overscan);

    const startIndex = startRow * columns;
    const endIndex = Math.min(items.length, endRow * columns);

    return {
      items: items.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      startRow,
      endRow,
      offsetY: startRow * rowHeight,
      totalHeight: totalRows * rowHeight,
      columns,
    };
  }, [items, scrollTop, itemHeight, itemWidth, containerHeight, columns, gap, overscan]);

  return {
    containerRef,
    virtualGrid,
  };
};
