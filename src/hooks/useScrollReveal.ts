import { useState, useEffect, useRef } from 'react';

interface UseScrollRevealOptions {
  threshold?: number;
  startOffset?: number;
  endOffset?: number;
}

export const useScrollReveal = (options: UseScrollRevealOptions = {}) => {
  const { threshold = 0.1, startOffset = 0, endOffset = 100 } = options;
  const [scrollProgress, setScrollProgress] = useState(0);
  const elementRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      
      // Calculer la progression basée sur le scroll du conteneur
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const containerHeight = container.clientHeight;
      
      // Calculer le pourcentage de scroll
      const maxScroll = scrollHeight - containerHeight;
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollTop / maxScroll)) : 0;
      
      setScrollProgress(progress);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Calculer la position initiale
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [threshold, startOffset, endOffset]);

  return { scrollProgress, elementRef, containerRef };
};