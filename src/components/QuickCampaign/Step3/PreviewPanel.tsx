
import React, { useState } from 'react';
import { Eye, Monitor, Smartphone, Tablet, RotateCcw } from 'lucide-react';
import PreviewContent from '../Preview/PreviewContent';
import { useQuickCampaignStore } from '../../../stores/quickCampaignStore';

const PreviewPanel: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const { 
    selectedGameType, 
    customColors, 
    jackpotColors, 
    generatePreviewCampaign,
    reset 
  } = useQuickCampaignStore();

  const mockCampaign = generatePreviewCampaign();

  const devices = [
    { id: 'desktop' as const, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as const, icon: Tablet, label: 'Tablette' },
    { id: 'mobile' as const, icon: Smartphone, label: 'Mobile' }
  ];

  return (
    <div className="col-span-7 bg-card rounded-3xl shadow-xl border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-muted/50 to-muted px-6 py-4 border-b flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Aperçu en temps réel</h2>
              <p className="text-sm text-muted-foreground">Visualisez votre campagne brandée</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Device Selector */}
            <div className="flex items-center bg-muted rounded-xl p-1.5">
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      selectedDevice === device.id
                        ? 'bg-background shadow-sm text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">{device.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reset Button */}
            <button
              onClick={reset}
              className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        {selectedGameType ? (
          <PreviewContent
            selectedDevice={selectedDevice}
            mockCampaign={mockCampaign}
            selectedGameType={selectedGameType}
            customColors={customColors}
            jackpotColors={jackpotColors}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">Aucun jeu sélectionné</p>
                <p className="text-muted-foreground">Veuillez d'abord choisir un type de jeu</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
