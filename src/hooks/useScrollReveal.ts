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

  useEffect(() => {
    const handleScroll = () => {
      if (!elementRef.current) return;

      const element = elementRef.current;
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculer la progression du scroll
      const elementTop = rect.top;
      const elementHeight = rect.height;
      
      // Point de départ : quand l'élément commence à être visible
      const startPoint = windowHeight - startOffset;
      // Point de fin : quand l'élément est complètement visible
      const endPoint = windowHeight - elementHeight - endOffset;
      
      if (elementTop <= startPoint && elementTop >= endPoint) {
        // L'élément est dans la zone de révélation
        const progress = (startPoint - elementTop) / (startPoint - endPoint);
        setScrollProgress(Math.max(0, Math.min(1, progress)));
      } else if (elementTop > startPoint) {
        // L'élément n'est pas encore visible
        setScrollProgress(0);
      } else {
        // L'élément est complètement visible
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Calculer la position initiale

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold, startOffset, endOffset]);

  return { scrollProgress, elementRef };
};