import React, { useState } from 'react';
import { Square, Image, Type, ImageIcon, Crown, Download, Settings } from 'lucide-react';
import DeviceFrame from './components/DeviceFrame';
import { OptimizedCampaign } from './types/CampaignTypes';

interface MobileEditorLayoutProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
}

const MobileEditorLayout: React.FC<MobileEditorLayoutProps> = ({
  campaign,
  setCampaign,
  previewDevice
}) => {
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
        return { width: '100%', height: '100%' };
    }
  };

  const constraints = getDeviceConstraints();

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header with gradient like the image */}
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
            className="bg-white rounded-lg shadow-lg"
            style={{
              width: '90%',
              maxWidth: '1400px',
              height: '80%',
              maxHeight: '900px'
            }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-gray-500">Aperçu Desktop : {campaign.name}</p>
            </div>
          </div>
        ) : (
          <DeviceFrame device={previewDevice}>
            <div 
              className="w-full h-full bg-white relative overflow-hidden"
              style={{
                width: constraints.width,
                height: constraints.height
              }}
            >
              {/* Content preview */}
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-gray-500">Aperçu {previewDevice} : {campaign.name}</p>
              </div>
            </div>
          </DeviceFrame>
        )}
      </div>

      {/* Bottom tab bar like in the images */}
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

export default MobileEditorLayout;