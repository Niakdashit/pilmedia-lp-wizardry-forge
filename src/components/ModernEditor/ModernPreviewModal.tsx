
import React, { useState } from 'react';
import { X, Monitor, Smartphone, Tablet } from 'lucide-react';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import FunnelStandard from '../funnels/FunnelStandard';

interface ModernPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: any;
}

const ModernPreviewModal: React.FC<ModernPreviewModalProps> = ({
  isOpen,
  onClose,
  campaign
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '1200px', height: '800px' };
    }
  };

  const getContainerStyle = () => {
    const baseStyle = {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: campaign.design?.background || '#f9fafb',
      position: 'relative' as const,
      overflow: 'auto' as const,
      padding: campaign.type === 'quiz' ? '40px 20px' : '20px'
    } as React.CSSProperties;

    if (campaign.design?.backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `url(${campaign.design.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }
    return baseStyle;
  };

  const enhancedCampaign = {
    ...campaign,
    design: {
      ...campaign.design,
      buttonColor:
        campaign.buttonConfig?.color || campaign.design?.buttonColor || '#841b60',
      titleColor: campaign.design?.titleColor || '#000000',
      background: campaign.design?.background || '#f8fafc',
      blockColor: campaign.design?.blockColor || '#ffffff',
      borderColor: campaign.design?.borderColor || '#e5e7eb',
      borderRadius: campaign.design?.borderRadius || '8px',
      buttonTextColor: campaign.design?.buttonTextColor || '#ffffff',
      // Synchroniser exactement les mêmes styles que dans l'éditeur canvas
      progressBackgroundColor: campaign.design?.progressBackgroundColor || '#f3f4f6',
      primaryColor: campaign.design?.primaryColor || campaign.design?.buttonColor || '#841b60',
      textColor: campaign.design?.textColor || campaign.design?.titleColor || '#374151',
      questionFontSize: campaign.design?.questionFontSize || '1.5rem',
      questionFontWeight: campaign.design?.questionFontWeight || '600',
      fontFamily: campaign.design?.fontFamily || 'Inter, sans-serif'
    },
    gameConfig: {
      ...campaign.gameConfig,
      [campaign.type]: {
        ...campaign.gameConfig?.[campaign.type],
        buttonLabel:
          campaign.buttonConfig?.text ||
          campaign.gameConfig?.[campaign.type]?.buttonLabel ||
          'Jouer',
        buttonColor:
          campaign.buttonConfig?.color ||
          campaign.gameConfig?.[campaign.type]?.buttonColor ||
          '#841b60',
        containerBackgroundColor: campaign.design?.blockColor || campaign.gameConfig?.[campaign.type]?.containerBackgroundColor || '#ffffff',
        backgroundColor: campaign.design?.blockColor || campaign.gameConfig?.[campaign.type]?.backgroundColor || '#ffffff',
        borderColor: campaign.design?.borderColor || campaign.gameConfig?.[campaign.type]?.borderColor || '#e5e7eb',
        borderRadius: campaign.design?.borderRadius || campaign.gameConfig?.[campaign.type]?.borderRadius || '8px',
        textColor: campaign.design?.titleColor || '#000000',
        questionBackgroundColor: campaign.design?.blockColor || '#ffffff',
        optionBackgroundColor: campaign.design?.blockColor || '#ffffff',
        optionBorderColor: campaign.design?.borderColor || '#e5e7eb',
        correctOptionColor: campaign.design?.buttonColor || '#841b60',
        incorrectOptionColor: '#ef4444'
      }
    }
  };

  const getFunnelComponent = () => {
    const unlockedTypes = ['wheel', 'scratch', 'jackpot', 'dice'];
    const funnel =
      enhancedCampaign.funnel ||
      (unlockedTypes.includes(enhancedCampaign.type) ? 'unlocked_game' : 'standard');
    
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
            campaign={enhancedCampaign}
            previewMode={device === 'desktop' ? 'desktop' : device}
            modalContained={false}
          />
        </div>
      );
    }
    return (
      <div style={componentStyle}>
        <FunnelStandard campaign={enhancedCampaign} />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full h-full flex flex-col relative overflow-hidden rounded-3xl shadow-2xl max-w-7xl max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold">Aperçu - {campaign.name}</h2>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  device === 'desktop' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded-md transition-colors ${
                  device === 'tablet' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  device === 'mobile' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center p-8">
            <div 
              className="shadow-2xl rounded-2xl overflow-hidden border border-gray-200"
              style={getDeviceStyles()}
            >
              <div style={getContainerStyle()}>
                {campaign.design?.backgroundImage && (
                  <div className="absolute inset-0 bg-black opacity-20" style={{ zIndex: 1 }} />
                )}
                <div
                  className="relative z-10 w-full h-full"
                  style={{ 
                    minHeight: device === 'desktop' ? '600px' : '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getFunnelComponent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernPreviewModal;
