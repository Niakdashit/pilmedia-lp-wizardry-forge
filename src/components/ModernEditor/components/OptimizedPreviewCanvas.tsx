
import React, { useMemo } from 'react';
import { Eye } from 'lucide-react';
import WheelPreview from '../../GameTypes/WheelPreview';

interface OptimizedPreviewCanvasProps {
  campaign: any;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  className?: string;
}

const OptimizedPreviewCanvas: React.FC<OptimizedPreviewCanvasProps> = ({
  campaign,
  selectedDevice,
  className = ''
}) => {
  // Configuration de la preview basée sur le type de jeu
  const previewConfig = useMemo(() => {
    if (!campaign?.type) return null;

    const baseConfig = {
      mode: 'instant_winner' as const,
      winProbability: campaign.gameConfig?.wheel?.winProbability || 0.1,
      maxWinners: 1000,
      winnersCount: 0
    };

    return baseConfig;
  }, [campaign.gameConfig?.wheel?.winProbability, campaign._lastUpdate]);

  // Styles responsive pour les différents devices
  const getDeviceStyles = () => {
    switch (selectedDevice) {
      case 'mobile':
        return {
          container: 'max-w-sm mx-auto',
          padding: 'p-4',
          size: 'small' as const
        };
      case 'tablet':
        return {
          container: 'max-w-2xl mx-auto',
          padding: 'p-6',
          size: 'medium' as const
        };
      default:
        return {
          container: 'max-w-4xl mx-auto',
          padding: 'p-8',
          size: 'large' as const
        };
    }
  };

  const deviceStyles = getDeviceStyles();

  // Callback pour les événements du jeu
  const handleGameFinish = (result: 'win' | 'lose') => {
    console.log('Jeu terminé:', result);
  };

  const handleGameStart = () => {
    console.log('Jeu démarré');
  };

  if (!campaign) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#841b60] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'aperçu...</p>
        </div>
      </div>
    );
  }

  if (!campaign.type) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-[#841b60] to-[#6d164f] rounded-full mx-auto mb-4 flex items-center justify-center">
            <Eye className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aperçu de votre campagne
          </h3>
          <p className="text-gray-600 mb-4">
            Les modifications apparaîtront ici en temps réel
          </p>
          <div className="text-sm text-gray-500">
            Device: {selectedDevice} • État: {campaign?.status || 'Configuration'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full bg-gradient-to-br from-gray-50 to-white ${className}`}>
      <div className={`h-full flex items-center justify-center ${deviceStyles.padding}`}>
        <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden ${deviceStyles.container}`}>
          <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
            {campaign.type === 'wheel' && previewConfig && (
              <WheelPreview
                campaign={campaign}
                config={previewConfig}
                onFinish={handleGameFinish}
                onStart={handleGameStart}
                gameSize={deviceStyles.size}
                previewDevice={selectedDevice}
                disabled={false}
                disableForm={true}
              />
            )}
            
            {/* Overlay pour indiquer que c'est une preview */}
            <div className="absolute top-4 right-4">
              <div className="bg-black/10 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Aperçu {selectedDevice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicateur de synchronisation */}
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Synchronisé</span>
        </div>
      </div>
    </div>
  );
};

export default OptimizedPreviewCanvas;
