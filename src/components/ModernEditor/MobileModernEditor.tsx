import React, { useState } from 'react';
import { Square, Image, Type, ImageIcon, Crown, Download, Settings, Monitor, Tablet, Smartphone } from 'lucide-react';
import DeviceFrame from './components/DeviceFrame';
import { OptimizedCampaign } from './types/CampaignTypes';

interface MobileModernEditorProps {
  campaign: OptimizedCampaign;
  setCampaign: React.Dispatch<React.SetStateAction<OptimizedCampaign>>;
}

const MobileModernEditor: React.FC<MobileModernEditorProps> = ({
  campaign,
  setCampaign
}) => {
  const [activeTab, setActiveTab] = useState('design');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');

  const tabs = [
    { id: 'design', label: 'Design', icon: Square },
    { id: 'elements', label: 'Éléments', icon: Image },
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'brand', label: 'Marque', icon: Crown },
    { id: 'import', label: 'Importer', icon: Download },
    { id: 'tools', label: 'Outils', icon: Settings }
  ];

  const deviceButtons = [
    { id: 'desktop', icon: Monitor, label: 'Desktop' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'mobile', icon: Smartphone, label: 'Mobile' }
  ];

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

        {/* Device selector */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex bg-black/20 rounded-lg p-1 backdrop-blur-sm">
            {deviceButtons.map((device) => {
              const Icon = device.icon;
              return (
                <button
                  key={device.id}
                  onClick={() => setPreviewDevice(device.id as any)}
                  className={`p-2 rounded-md transition-colors ${
                    previewDevice === device.id
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main preview area with device-specific layouts */}
      <div className="flex-1 flex items-center justify-center bg-black relative overflow-hidden">
        {previewDevice === 'desktop' ? (
          <div 
            className="bg-white rounded-lg shadow-lg flex items-center justify-center"
            style={{
              width: '90%',
              maxWidth: '1400px',
              height: '80%',
              maxHeight: '900px'
            }}
          >
            <div className="w-full h-full bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Aperçu Desktop : {campaign.name}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <DeviceFrame device={previewDevice}>
              <div className="w-full h-full bg-white relative overflow-hidden">
                {/* Content preview */}
                <div className="w-full h-full flex items-center justify-center bg-gray-50">
                  <p className="text-gray-500 text-center">
                    {campaign.name}<br/>
                    <span className="text-sm">Aperçu {previewDevice}</span>
                  </p>
                </div>
              </div>
            </DeviceFrame>
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

export default MobileModernEditor;