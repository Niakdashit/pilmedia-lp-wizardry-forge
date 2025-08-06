import React, { useState } from 'react';
import { Square, Image, Type, ImageIcon, Crown, Download, Settings } from 'lucide-react';

interface MobileDesignEditorProps {
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const MobileDesignEditor: React.FC<MobileDesignEditorProps> = ({ previewDevice }) => {
  const [activeTab, setActiveTab] = useState('design');

  const tabs = [
    { id: 'design', label: 'Design', icon: Square },
    { id: 'elements', label: 'Éléments', icon: Image },
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'brand', label: 'Marque', icon: Crown },
    { id: 'import', label: 'Importer', icon: Download },
    { id: 'tools', label: 'Outils', icon: Settings }
  ];

  const getDeviceConstraints = () => {
    switch (previewDevice) {
      case 'mobile':
        return { width: '375px', height: '812px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      default:
        return { width: '90%', maxWidth: '1400px', height: '80%', maxHeight: '900px' };
    }
  };

  const constraints = getDeviceConstraints();

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header with gradient */}
      <div 
        className="h-44 relative"
        style={{
          background: 'linear-gradient(135deg, #4ade80 0%, #3b82f6 50%, #8b5cf6 100%)'
        }}
      >
        {/* Status bar simulation */}
        <div className="flex justify-between items-center pt-3 px-4 text-white text-sm font-medium">
          <span>13:06</span>
          <div className="flex items-center space-x-1">
            <span className="text-xs">5G</span>
            <div className="w-6 h-3 bg-yellow-400 rounded-sm"></div>
          </div>
        </div>
        
        {/* Navigation icons */}
        <div className="flex justify-between items-center px-4 py-2">
          <div className="flex space-x-4">
            <button className="p-2 text-white">☰</button>
            <button className="p-2 text-white">←</button>
            <button className="p-2 text-white">→</button>
          </div>
          <div className="flex space-x-4">
            <button className="p-2 text-white">•••</button>
            <button className="p-2 text-white">□</button>
            <button className="p-2 text-white">💬</button>
            <button className="p-2 text-white">↗</button>
            <button className="p-2 text-white">⬆</button>
          </div>
        </div>
      </div>

      {/* Main preview area */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        {previewDevice === 'desktop' ? (
          <div 
            className="bg-white rounded-lg shadow-lg flex items-center justify-center"
            style={constraints}
          >
            <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Aperçu Desktop - Design Editor</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <div 
              className="bg-gray-900 rounded-3xl p-2 shadow-2xl"
              style={{
                width: previewDevice === 'mobile' ? '320px' : '400px',
                height: previewDevice === 'mobile' ? '640px' : '700px'
              }}
            >
              <div className="bg-white rounded-2xl w-full h-full relative overflow-hidden">
                {/* Phone UI elements for mobile */}
                {previewDevice === 'mobile' && (
                  <>
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-black rounded-b-lg z-10"></div>
                    <div className="absolute top-1 left-2 right-2 flex justify-between items-center text-xs font-medium z-10 text-black">
                      <span>9:41</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-4 h-2 border border-black rounded-sm">
                          <div className="w-3 h-1 bg-green-500 rounded-sm"></div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-400 rounded-full z-10"></div>
                  </>
                )}
                
                {/* Content area */}
                <div 
                  className="w-full h-full bg-gray-50 flex items-center justify-center"
                  style={{
                    paddingTop: previewDevice === 'mobile' ? '24px' : '8px',
                    paddingBottom: previewDevice === 'mobile' ? '24px' : '8px'
                  }}
                >
                  <p className="text-gray-500 text-center">Aperçu {previewDevice}<br/>Design Editor</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom tab bar */}
      <div className="bg-black border-t border-gray-800">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-1 min-w-0 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
        
        {/* Home indicator */}
        <div className="w-32 h-1 bg-white rounded-full mx-auto mb-2 opacity-60"></div>
      </div>
    </div>
  );
};

export default MobileDesignEditor;