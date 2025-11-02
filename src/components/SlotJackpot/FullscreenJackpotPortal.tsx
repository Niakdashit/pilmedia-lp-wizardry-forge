import React from 'react';
import { createPortal } from 'react-dom';
import SlotJackpot from '../SlotJackpot';

interface FullscreenJackpotPortalProps {
  templateOverride?: string;
  symbols?: string[];
  onWin?: (finals: string[]) => void;
  onLose?: () => void;
}

// Module-level singleton portal container
let portalContainer: HTMLDivElement | null = null;

function getOrCreateContainer() {
  if (!portalContainer) {
    portalContainer = document.createElement('div');
    portalContainer.setAttribute('data-jackpot-portal', 'true');
    Object.assign(portalContainer.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      pointerEvents: 'auto'
    } as CSSStyleDeclaration);
    document.body.appendChild(portalContainer);
  }
  return portalContainer;
}

const FullscreenJackpotPortal: React.FC<FullscreenJackpotPortalProps> = ({
  templateOverride,
  symbols,
  onWin,
  onLose
}) => {
  const elRef = React.useRef<JSX.Element | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Create container once
  React.useEffect(() => {
    containerRef.current = getOrCreateContainer();
    return () => {
      // Do not remove container here; it is a singleton kept alive until app unload
    };
  }, []);

  // Keep a stable SlotJackpot instance across all rerenders while fullscreen is active
  if (!elRef.current) {
    elRef.current = (
      <SlotJackpot
        key="slotjackpot-fullscreen-stable"
        templateOverride={templateOverride}
        symbols={symbols}
        onWin={onWin}
        onLose={onLose}
        disabled={false}
      />
    );
  }

  if (!containerRef.current) return null;
  return createPortal(elRef.current, containerRef.current);
};

export default FullscreenJackpotPortal;
