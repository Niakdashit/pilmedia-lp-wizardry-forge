import React, { useState, useEffect } from 'react';
import { 
  Palette, Grid3X3, Type, Image, Crown, Upload, Settings, X, 
  Smartphone, Tablet, Monitor 
} from 'lucide-react';

// Interface mobile style Canva simplifiée pour test
const MobileCanvaDesignEditor: React.FC = () => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [panelHeight, setPanelHeight] = useState(0);

  const bottomTabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'elements', label: 'Éléments', icon: Grid3X3 },
    { id: 'texte', label: 'Texte', icon: Type },
    { id: 'galerie', label: 'Galerie', icon: Image },
    { id: 'marque', label: 'Marque', icon: Crown },
    { id: 'importer', label: 'Importer', icon: Upload },
    { id: 'outils', label: 'Outils', icon: Settings }
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
    }
  };

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'design':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Design</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur de fond
                </label>
                <div className="flex space-x-2">
                  <button className="w-8 h-8 rounded bg-blue-500 border-2 border-gray-300"></button>
                  <button className="w-8 h-8 rounded bg-red-500 border-2 border-gray-300"></button>
                  <button className="w-8 h-8 rounded bg-green-500 border-2 border-gray-300"></button>
                  <button className="w-8 h-8 rounded bg-purple-500 border-2 border-gray-300"></button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'elements':
        return (
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Éléments</h3>
            <div className="grid grid-cols-3 gap-3">
              <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
                <div className="text-2xl mb-2">📝</div>
                <span className="text-xs">Texte</span>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
                <div className="text-2xl mb-2">🖼️</div>
                <span className="text-xs">Image</span>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg text-center hover:bg-gray-50">
                <div className="text-2xl mb-2">⭕</div>
                <span className="text-xs">Forme</span>
              </button>
            </div>
          </div>
        );
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
            <h1 className="text-lg font-bold">Prosplay Design Editor</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
              Sauvegarder
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
                onClick={() => setPreviewDevice(device.id as any)}
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
            className={`relative border-4 border-gray-300 rounded-2xl shadow-xl bg-white overflow-hidden transition-all duration-300 ${
              previewDevice === 'mobile' ? 'w-80 h-[640px]' :
              previewDevice === 'tablet' ? 'w-[640px] h-80' :
              'w-[900px] h-[600px]'
            }`}
          >
            {/* Preview Content - Demo */}
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Tentez votre chance !
                </h2>
                <p className="text-gray-600 mb-6">
                  Tournez la roue et gagnez des prix
                </p>
                <button className="px-8 py-3 bg-gradient-to-br from-[#841b60] to-[#b41b60] text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  Jouer maintenant
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Style Canva */}
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

      <style>{`
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

export default MobileCanvaDesignEditor;