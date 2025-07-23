
import React, { useState } from 'react';
import GameRenderer from './GameRenderer';

interface CampaignPreviewProps {
  campaign: any;
  setCampaign?: React.Dispatch<React.SetStateAction<any>>;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ campaign, setCampaign, previewDevice: initialDevice = 'desktop' }) => {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet'>(initialDevice === 'mobile' ? 'tablet' : initialDevice);

  const handleTextUpdate = (textId: string, newText: string) => {
    if (!setCampaign) return;
    
    setCampaign((prevCampaign: any) => {
      const updatedCampaign = { ...prevCampaign };
      
      // Mettre à jour le texte dans customTexts
      if (updatedCampaign.gameConfig?.customTexts) {
        updatedCampaign.gameConfig.customTexts = updatedCampaign.gameConfig.customTexts.map((text: any) => 
          text.id === textId ? { ...text, text: newText } : text
        );
      }
      
      return updatedCampaign;
    });
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Aperçu en temps réel</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`px-3 py-1 text-sm rounded ${previewDevice === 'desktop' ? 'bg-[#841b60] text-white' : 'bg-white text-gray-600 border'}`}
            >
              Desktop
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`px-3 py-1 text-sm rounded ${previewDevice === 'tablet' ? 'bg-[#841b60] text-white' : 'bg-white text-gray-600 border'}`}
            >
              Tablet
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-full overflow-auto bg-gray-100">
        <div className="p-4">
          <div className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden ${
            previewDevice === 'tablet' ? 'max-w-md' : 'max-w-4xl'
          }`}>
            <GameRenderer
              campaign={campaign}
              gameSize={campaign.gameSize || 'large'}
              previewDevice={previewDevice}
              showBackgroundOverlay={false}
              onTextUpdate={handleTextUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;
