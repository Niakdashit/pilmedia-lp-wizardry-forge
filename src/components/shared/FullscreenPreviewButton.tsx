import React from 'react';
import { Maximize2 } from 'lucide-react';

interface FullscreenPreviewButtonProps {
  campaignId: string | null | undefined;
  variant?: 'icon' | 'full' | 'minimal';
  className?: string;
}

/**
 * FullscreenPreviewButton - Bouton pour ouvrir l'aperçu plein écran
 * 
 * Ouvre la campagne dans un nouvel onglet en mode plein écran
 * avec sélecteur de device intégré
 */
const FullscreenPreviewButton: React.FC<FullscreenPreviewButtonProps> = ({
  campaignId,
  variant = 'icon',
  className = ''
}) => {
  const handleClick = () => {
    if (!campaignId) {
      console.warn('⚠️ Aucun ID de campagne fourni pour l\'aperçu plein écran');
      return;
    }

    const url = `/fullscreen-preview/${campaignId}`;
    window.open(url, '_blank');
  };

  const isDisabled = !campaignId;

  if (variant === 'full') {
    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Ouvrir l'aperçu plein écran"
      >
        <Maximize2 className="w-4 h-4" />
        <span className="text-sm font-medium">Aperçu plein écran</span>
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        title="Ouvrir l'aperçu plein écran"
      >
        Aperçu plein écran
      </button>
    );
  }

  // variant === 'icon' (default)
  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`text-white/90 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Aperçu plein écran (nouvel onglet)"
    >
      <Maximize2 className="w-4 h-4" />
    </button>
  );
};

export default FullscreenPreviewButton;
