
import React from 'react';
import { X, Monitor } from 'lucide-react';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import FunnelStandard from '../funnels/FunnelStandard';
import { getCampaignBackgroundImage } from '../../utils/background';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ isOpen, onClose, campaign }) => {
  // Desktop-only: selectedDevice is always 'desktop'
  const selectedDevice: 'desktop' = 'desktop';

  if (!isOpen) return null;

  const getPreviewFunnel = () => {
    const funnel = campaign.funnel || (['wheel', 'scratch', 'jackpot', 'dice'].includes(campaign.type) ? 'unlocked_game' : 'standard');
    
    const componentStyle = campaign.type === 'quiz' ? {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    } : {};
    
    if (funnel === 'unlocked_game') {
      return (
        <div style={componentStyle}>
          <FunnelUnlockedGame
            campaign={campaign}
            previewMode={selectedDevice}
            key={`${selectedDevice}-${campaign.id}-${JSON.stringify({
              gameConfig: campaign.gameConfig,
              design: campaign.design,
              screens: campaign.screens
            })}`} // Force re-render with comprehensive dependencies
          />
        </div>
      );
    }
    return (
      <div style={componentStyle}>
        <FunnelStandard
          campaign={campaign}
          key={`${campaign.id}-${JSON.stringify({
            gameConfig: campaign.gameConfig,
            design: campaign.design,
            screens: campaign.screens,
          })}`}
        />
      </div>
    );
  };

  // Récupérer l'image de fond du jeu
  const gameBackgroundImage = getCampaignBackgroundImage(campaign, selectedDevice);

  const getBackgroundStyle = () => {
    const style: any = {
      position: 'relative',
      width: '100%',
      height: '100%',
      backgroundColor: campaign.design?.background || '#ebf4f7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: campaign.type === 'quiz' ? '40px 20px' : '20px'
    };

    if (gameBackgroundImage) {
      style.backgroundImage = `url(${gameBackgroundImage})`;
      style.backgroundSize = 'cover';
      style.backgroundPosition = 'center';
      style.backgroundRepeat = 'no-repeat';
    }

    return style;
  };

  const renderDesktopPreview = () => (
    <div style={getBackgroundStyle()}>
      {getPreviewFunnel()}
    </div>
  );

  // Mobile/tablet preview removed in desktop-only mode
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white w-full h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-800">Aperçu de la campagne</h2>
            
            {/* Desktop-only label */}
            <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
              <Monitor className="w-4 h-4 mr-2" />
              <span className="text-sm text-gray-600">Desktop uniquement</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 pt-20 overflow-auto">
          {renderDesktopPreview()}
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
