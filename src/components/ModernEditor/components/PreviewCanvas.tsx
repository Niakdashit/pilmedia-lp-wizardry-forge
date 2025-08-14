
import React from 'react';
import { Eye } from 'lucide-react';
import GameCanvasPreview from '../../CampaignEditor/GameCanvasPreview';

interface PreviewCanvasProps {
  campaign: any;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
}

const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  campaign,
  selectedDevice
}) => {
  const getDeviceStyles = () => {
    switch (selectedDevice) {
      case 'mobile':
        return 'max-w-sm mx-auto';
      case 'tablet':
        return 'max-w-2xl mx-auto';
      default:
        return 'max-w-5xl mx-auto';
    }
  };

  const getContainerStyles = (): React.CSSProperties => {
    return {
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    };
  };

  return (
    <div style={getContainerStyles()}>
      <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${getDeviceStyles()}`} style={{ width: '100%', height: '100%', maxWidth: '100%', maxHeight: '100%' }}>
        <div style={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {campaign && campaign.type ? (
            <GameCanvasPreview
              campaign={campaign}
              gameSize={campaign.gameSize || 'medium'}
              previewDevice={selectedDevice}
              showBackgroundOverlay={false}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full max-w-lg">
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#841b60] to-[#6d164f] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {campaign?.name || 'Aperçu de la campagne'}
                </h3>
                <p className="text-gray-600 mb-4">
                  Type: {campaign?.type || 'Non défini'}
                </p>
                <div className="text-sm text-gray-500">
                  Aperçu {selectedDevice} • {campaign?.status || 'Brouillon'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewCanvas;
