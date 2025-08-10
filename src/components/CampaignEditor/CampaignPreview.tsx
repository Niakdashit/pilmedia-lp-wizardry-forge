
import React from 'react';
import GameRenderer from './GameRenderer';

interface CampaignPreviewProps {
  campaign: any;
  setCampaign?: React.Dispatch<React.SetStateAction<any>>;
  previewDevice?: 'desktop' | 'tablet' | 'mobile';
}

const CampaignPreview: React.FC<CampaignPreviewProps> = ({ campaign }) => {
  // Desktop-only: always use 'desktop'
  const previewDevice: 'desktop' = 'desktop';

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 overflow-hidden">
      {/* Preview Header */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Aperçu en temps réel</h3>
          <span className="text-sm text-gray-600">Desktop uniquement</span>
        </div>
      </div>

      {/* Preview Content */}
      <div className="h-full overflow-auto bg-gray-100">
        <div className="p-4">
          <div className={`mx-auto bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl`}>
            <GameRenderer
              campaign={campaign}
              gameSize={campaign.gameSize || 'large'}
              previewDevice={previewDevice}
              showBackgroundOverlay={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignPreview;

