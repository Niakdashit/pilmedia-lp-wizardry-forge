import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Palette, Settings, Code, Eye, ImageIcon, RotateCcw } from 'lucide-react';

export type DeviceType = 'desktop' | 'tablet' | 'mobile';

export interface EditorConfig {
  // Existing properties
  participateButtonText?: string;
  participateButtonColor?: string;
  participateButtonTextColor?: string;
  wheelButtonPosition?: 'external' | 'center';
  
  // Device configurations
  deviceConfig?: {
    desktop?: {
      gamePosition?: { x: number; y: number; scale: number };
    };
    tablet?: {
      gamePosition?: { x: number; y: number; scale: number };
    };
    mobile?: {
      gamePosition?: { x: number; y: number; scale: number };
    };
  };
  
  // Brand assets
  brandAssets?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  
  // Form fields for mode 2
  formFields?: Array<{
    id: string;
    type: 'text' | 'email' | 'tel' | 'select' | 'textarea' | 'checkbox';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  
  // Wheel configuration
  segments?: Array<{
    id: string;
    label: string;
    color: string;
    textColor?: string;
  }>;
  
  borderStyle?: string;
}

const QualifioEditorLayout: React.FC = () => {
  const [activeDevice, setActiveDevice] = useState<DeviceType>('desktop');
  const [activeTab, setActiveTab] = useState('design');
  const [config, setConfig] = useState<EditorConfig>({});
  const [isMode1, setIsMode1] = useState(false);

  const handleConfigUpdate = (updates: Partial<EditorConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const devices = [
    { id: 'desktop' as DeviceType, icon: Monitor, label: 'Desktop' },
    { id: 'tablet' as DeviceType, icon: Tablet, label: 'Tablet' },
    { id: 'mobile' as DeviceType, icon: Smartphone, label: 'Mobile' }
  ];

  const tabs = [
    { id: 'design', icon: Palette, label: 'Design' },
    { id: 'buttons', icon: Settings, label: 'Boutons' },
    { id: 'code', icon: Code, label: 'Code' },
    { id: 'preview', icon: Eye, label: 'Aperçu' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Éditeur Qualifio</h1>
            <p className="text-sm text-gray-600 mt-1">Configurez votre jeu interactif</p>
          </div>

          {/* Mode Toggle */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setIsMode1(false)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  !isMode1 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mode 2
              </button>
              <button
                onClick={() => setIsMode1(true)}
                className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                  isMode1 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Mode 1
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'design' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Configuration du design</h3>
                  <p className="text-sm text-gray-600">Personnalisez l'apparence de votre jeu</p>
                </div>
              )}
              
              {activeTab === 'buttons' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Configuration des boutons</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texte du bouton
                      </label>
                      <input
                        type="text"
                        value={config.participateButtonText || 'PARTICIPER !'}
                        onChange={(e) => handleConfigUpdate({ participateButtonText: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="PARTICIPER !"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Position du bouton de la roue
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleConfigUpdate({ wheelButtonPosition: 'external' })}
                          className={`p-3 text-sm rounded-lg border transition-colors ${
                            (config.wheelButtonPosition || 'external') === 'external'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          Bouton extérieur
                        </button>
                        <button
                          onClick={() => handleConfigUpdate({ wheelButtonPosition: 'center' })}
                          className={`p-3 text-sm rounded-lg border transition-colors ${
                            config.wheelButtonPosition === 'center'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                        >
                          Centre de la roue
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs mt-2">
                        {config.wheelButtonPosition === 'center' 
                          ? 'Le bouton sera affiché au centre de la roue de fortune'
                          : 'Le bouton sera affiché en dehors de la roue de fortune'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'code' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Code d'intégration</h3>
                  <p className="text-sm text-gray-600">Copiez ce code pour intégrer votre jeu</p>
                </div>
              )}
              
              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Aperçu</h3>
                  <p className="text-sm text-gray-600">Prévisualisez votre jeu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Device Selector */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {devices.map((device) => (
                  <button
                    key={device.id}
                    onClick={() => setActiveDevice(device.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      activeDevice === device.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <device.icon className="w-4 h-4" />
                    {device.label}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {isMode1 ? 'Mode 1' : 'Mode 2'}
                </span>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 bg-gray-100 p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                activeDevice === 'mobile' ? 'max-w-sm mx-auto' :
                activeDevice === 'tablet' ? 'max-w-2xl mx-auto' :
                'w-full'
              }`}>
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aperçu du jeu
                    </h3>
                    <p className="text-gray-600">
                      {isMode1 ? 'Mode 1 - Jeu direct' : 'Mode 2 - Avec formulaire'}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Position du bouton: {config.wheelButtonPosition === 'center' ? 'Centre de la roue' : 'Extérieur'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualifioEditorLayout;
