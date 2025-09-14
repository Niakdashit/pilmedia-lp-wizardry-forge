// @ts-nocheck
import React, { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScratchCard } from '../ScratchCard';

interface ScratchGridProps {
  fourCards: boolean;
  overlayColor: string;
  brushSize: number;
  revealThreshold: number;
  onReveal?: (cardIndex: number) => void;
  onComplete?: (cardIndex: number, isWin: boolean) => void;
  isLoading?: boolean;
}

const ScratchGrid: React.FC<ScratchGridProps> = ({
  fourCards,
  overlayColor,
  brushSize,
  revealThreshold,
  onReveal,
  onComplete,
  isLoading = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const setupCard = (el: HTMLElement) => {
    // Initial setup for card animations
    gsap.set(el, {
      scale: 0.9,
      opacity: 0,
      rotationY: -15
    });

    // Entrance animation
    gsap.to(el, {
      scale: 1,
      opacity: 1,
      rotationY: 0,
      duration: 0.6,
      ease: "back.out(1.7)",
      delay: Math.random() * 0.3
    });

    // Hover effects
    const handleMouseEnter = () => {
      gsap.to(el, {
        scale: 1.05,
        rotationY: 5,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(el, {
        scale: 1,
        rotationY: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const disposers: Array<(() => void) | null> = [];
    
    const cardsEls = Array.from(container.querySelectorAll('.scratch-card')) as HTMLElement[];
    cardsEls.forEach((el) => {
      const dispose = setupCard(el);
      disposers.push(dispose);
    });

    return () => {
      disposers.forEach((d) => d?.());
    };
  }, [fourCards, overlayColor, brushSize, revealThreshold]);

  const handleCardReveal = (cardIndex: number) => {
    onReveal?.(cardIndex);
  };

  const handleCardComplete = (cardIndex: number, isWin: boolean) => {
    onComplete?.(cardIndex, isWin);
  };

  return (
    <div
      ref={containerRef}
      className={`scratch-grid ${fourCards ? 'grid-cols-2' : 'grid-cols-1'} gap-4 grid`}
    >
      {Array.from({ length: fourCards ? 4 : 1 }).map((_, index) => (
        <div key={index} className="scratch-card">
          <ScratchCard
            width={280}
            height={160}
            scratchColor={overlayColor}
            brushSize={brushSize}
            threshold={revealThreshold}
            revealContent={
              <div className="flex items-center justify-center h-full text-white font-bold">
                {index % 2 === 0 ? 'Gagné !' : 'Perdu'}
              </div>
            }
            onComplete={(percentage) => handleCardComplete(index, index % 2 === 0)}
            disabled={isLoading}
          />
        </div>
      ))}
    </div>
  );
};

export default ScratchGrid;
