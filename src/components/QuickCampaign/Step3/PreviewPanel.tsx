
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
    <div className="col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-4 py-3 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Aperçu en temps réel</h2>
              <p className="text-xs text-gray-600">Visualisez votre campagne</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Device Selector */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              {devices.map((device) => {
                const Icon = device.icon;
                return (
                  <button
                    key={device.id}
                    onClick={() => setSelectedDevice(device.id)}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-200 ${
                      selectedDevice === device.id
                        ? 'bg-white shadow-sm text-blue-600 font-medium'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span className="hidden sm:inline text-xs">{device.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Reset Button */}
            <button
              onClick={reset}
              className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Réinitialiser"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline text-xs">Reset</span>
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
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
                <Eye className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Aucun jeu sélectionné</p>
                <p className="text-sm text-gray-600">Veuillez d'abord choisir un type de jeu</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewPanel;
