import React, { useState, useEffect } from 'react';
import { 
  Palette, Grid3X3, Type, Image, Crown, Upload, Settings, X, 
  Smartphone, Tablet, Monitor 
} from 'lucide-react';
import type { OptimizedCampaign } from './types/CampaignTypes';
import ModernDesignTab from './ModernDesignTab';
import ModernMobileTab from './ModernMobileTab';
import ModernPreview from './ModernPreview';

interface MobileCanvaEditorProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onPreview: () => void;
  isLoading: boolean;
  previewKey: number;
}

const MobileCanvaEditor: React.FC<MobileCanvaEditorProps> = ({
  campaign,
  setCampaign,
  activeTab,
  onTabChange,
  previewDevice,
  onDeviceChange,
  onSave,
  onPreview,
  isLoading,
  previewKey
}) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [panelHeight, setPanelHeight] = useState(0);

  const bottomTabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'elements', label: 'Éléments', icon: Grid3X3 },
    { id: 'texte', label: 'Texte', icon: Type },
    { id: 'galerie', label: 'Galerie', icon: Image },
    { id: 'marque', label: 'Marque', icon: Crown },
    { id: 'importer', label: 'Importer', icon: Upload },
    { id: 'mobile', label: 'Mobile', icon: Smartphone }
  ];

  const deviceButtons = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'desktop', icon: Monitor, label: 'Desktop' }
  ];

  useEffect(() => {
    const updatePanelHeight = () => {
      if (activePanel) {
        const maxHeight = window.innerHeight * 0.6; // 60% de la hauteur d'écran
        setPanelHeight(maxHeight);
      }
    };

    updatePanelHeight();
    window.addEventListener('resize', updatePanelHeight);
    return () => window.removeEventListener('resize', updatePanelHeight);
  }, [activePanel]);

  const handleTabClick = (tabId: string) => {
    if (activePanel === tabId) {
      setActivePanel(null);
    } else {
      setActivePanel(tabId);
      onTabChange(tabId);
    }
  };

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'design':
        return <ModernDesignTab campaign={campaign} setCampaign={setCampaign} />;
      case 'mobile':
        return <ModernMobileTab campaign={campaign} setCampaign={setCampaign} />;
      default:
        return (
          <div className="p-6 text-center text-gray-500">
            <p>Contenu de l'onglet "{activePanel}" à implémenter</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Top Header - Prosplay Style */}
      <div className="flex-shrink-0 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded"></div>
            </div>
            <h1 className="text-lg font-bold">Prosplay Editor</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onSave}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
            >
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {/* Device Selection Bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-center space-x-1">
          {deviceButtons.map((device) => {
            const Icon = device.icon;
            return (
              <button
                key={device.id}
                onClick={() => onDeviceChange(device.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  previewDevice === device.id
                    ? 'bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{device.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center">
          {/* Device Frame */}
          <div 
            className={`relative border-4 border-gray-300 rounded-2xl shadow-xl bg-white overflow-hidden ${
              previewDevice === 'mobile' ? 'w-80 h-[640px]' :
              previewDevice === 'tablet' ? 'w-[640px] h-80' :
              'w-[900px] h-[600px]'
            }`}
          >
            {/* Preview Content */}
            <div className="w-full h-full overflow-hidden">
              <ModernPreview 
                campaign={campaign}
                device={previewDevice}
                key={previewKey}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel */}
      {activePanel && (
        <div 
          className="fixed bottom-20 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-40 animate-slide-up"
          style={{ 
            height: `${panelHeight}px`,
            maxHeight: '60vh'
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900 capitalize">
              {bottomTabs.find(tab => tab.id === activePanel)?.label}
            </h3>
            <button
              onClick={() => setActivePanel(null)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Panel Content */}
          <div className="h-full overflow-y-auto pb-4">
            {renderPanelContent()}
          </div>
        </div>
      )}

      {/* Bottom Tab Bar - Canva Style */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
        <div className="flex items-center justify-around">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePanel === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors min-w-0 ${
                  isActive
                    ? 'text-[#841b60] bg-[#f9f0f5]'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                <span className="text-xs font-medium truncate max-w-16">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MobileCanvaEditor;