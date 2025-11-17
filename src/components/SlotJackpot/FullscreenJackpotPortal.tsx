import React from 'react';
import { createPortal } from 'react-dom';
import SlotJackpot from '../SlotJackpot';

interface FullscreenJackpotPortalProps {
  templateOverride?: string;
  symbols?: string[];
  onWin?: (finals: string[]) => void;
  onLose?: () => void;
  campaign?: any;
  participantEmail?: string;
  participantId?: string;
  useDotationSystem?: boolean;
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
  onLose,
  campaign,
  participantEmail,
  participantId,
  useDotationSystem = true
}) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Create container once
  React.useEffect(() => {
    containerRef.current = getOrCreateContainer();
    return () => {
      // Do not remove container here; it is a singleton kept alive until app unload
    };
  }, []);

  if (!containerRef.current) return null;

  // Always render SlotJackpot with latest props so dotation + config stay in sync
  return createPortal(
    <SlotJackpot
      key="slotjackpot-fullscreen-stable"
      templateOverride={templateOverride}
      symbols={symbols}
      onWin={onWin}
      onLose={onLose}
      disabled={false}
      campaign={campaign}
      participantEmail={participantEmail}
      participantId={participantId}
      useDotationSystem={useDotationSystem}
    />,
    containerRef.current
  );
};

export default FullscreenJackpotPortal;
