
import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Tablet, Smartphone, Eye, RotateCcw, ExternalLink } from 'lucide-react';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';
import PreviewContent from '../Preview/PreviewContent';

interface StudioPreviewProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  themeColors: {
    primary: string;
    secondary: string;
    accent?: string;
  };
}

const StudioPreview: React.FC<StudioPreviewProps> = ({
  selectedDevice,
  onDeviceChange,
  themeColors
}) => {
  const {
    selectedGameType,
    customColors,
    jackpotColors,
    campaignName,
    generatePreviewCampaign,
    reset
  } = useQuickCampaignStore();

  const mockCampaign = generatePreviewCampaign();

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop', shortcut: '1' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablette', shortcut: '2' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile', shortcut: '3' }
  ];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onDeviceChange('desktop');
            break;
          case '2':
            e.preventDefault();
            onDeviceChange('tablet');
            break;
          case '3':
            e.preventDefault();
            onDeviceChange('mobile');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onDeviceChange]);

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Preview Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Aperçu en temps réel</h2>
              <p className="text-sm text-muted-foreground">
                {campaignName || 'Ma Nouvelle Campagne'} • {selectedGameType || 'Aucun jeu sélectionné'}
              </p>
            </div>
          </div>
          
          {/* Live Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-green-700">Live</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Device Selector */}
          <div className="flex items-center bg-muted rounded-xl p-1">
            {devices.map((device) => {
              const Icon = device.icon;
              return (
                <button
                  key={device.id}
                  onClick={() => onDeviceChange(device.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    selectedDevice === device.id
                      ? 'bg-background shadow-sm text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }`}
                  title={`${device.label} (Ctrl+${device.shortcut})`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{device.label}</span>
                  {selectedDevice === device.id && (
                    <motion.div
                      layoutId="deviceIndicator"
                      className="absolute inset-0 bg-primary/10 rounded-lg"
                      initial={false}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={reset}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                // Open preview in new tab
                const previewData = encodeURIComponent(JSON.stringify(mockCampaign));
                window.open(`/preview?data=${previewData}`, '_blank');
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              title="Ouvrir dans un nouvel onglet"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative overflow-hidden">
        {selectedGameType ? (
          <motion.div
            key={selectedDevice}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex items-center justify-center p-6"
          >
            <PreviewContent
              selectedDevice={selectedDevice}
              mockCampaign={mockCampaign}
              selectedGameType={selectedGameType}
              customColors={{ ...customColors, ...themeColors }}
              jackpotColors={jackpotColors}
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 bg-muted rounded-2xl flex items-center justify-center mx-auto">
                <Eye className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Choisissez un type de jeu
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Sélectionnez le type d'expérience que vous souhaitez créer pour voir l'aperçu en temps réel.
                </p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Preview Overlay Info */}
        {selectedGameType && (
          <div className="absolute bottom-6 left-6 right-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background/95 backdrop-blur-sm rounded-xl p-4 border border-border shadow-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: themeColors.primary }}
                  />
                  <span className="text-sm font-medium text-foreground">
                    Thème adapté à votre marque
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedDevice} • {mockCampaign.config?.roulette?.segments?.length || 0} éléments
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudioPreview;
