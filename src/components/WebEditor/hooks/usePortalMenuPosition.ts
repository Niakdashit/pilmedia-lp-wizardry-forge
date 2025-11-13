import { useEffect, useRef } from 'react';

export interface MenuPosition {
  x: number;
  y: number;
}

/**
 * Keeps a fixed-position context menu within the viewport and updates position
 * on open, resize and scroll. Returns a ref to attach to the menu element.
 *
 * Non-breaking: consumers decide how to render (e.g., via portal) and what classes to use.
 */
export function usePortalMenuPosition(
  isOpen: boolean,
  position: MenuPosition,
  setPosition: (p: MenuPosition) => void,
  padding: number = 8
) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const clamp = () => {
      const el = menuRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width - padding;
      const maxY = window.innerHeight - rect.height - padding;
      const clampedX = Math.max(padding, Math.min(position.x, maxX));
      const clampedY = Math.max(padding, Math.min(position.y, maxY));
      if (clampedX !== position.x || clampedY !== position.y) {
        setPosition({ x: clampedX, y: clampedY });
      }
    };

    const raf = requestAnimationFrame(clamp);
    const handleReflow = () => clamp();
    window.addEventListener('resize', handleReflow);
    window.addEventListener('scroll', handleReflow, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', handleReflow);
      window.removeEventListener('scroll', handleReflow, true);
    };
  }, [isOpen, position.x, position.y, padding, setPosition]);

  return { menuRef } as const;
}
