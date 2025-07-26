import React from 'react';
import { Monitor, Tablet, Smartphone, Download, Eye, Share2, Undo, Redo, ExternalLink } from 'lucide-react';

interface DesignToolbarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
  campaign?: any; // Ajouter la campaign pour l'aperçu final
}

const DesignToolbar: React.FC<DesignToolbarProps> = ({
  selectedDevice,
  onDeviceChange,
  onPreviewToggle,
  isPreviewMode = false,
  campaign
}) => {
  const handleFinalPreview = () => {
    if (!campaign) return;
    
    // Convertir la campagne du Design Editor au format attendu par FinalPreview
    const config = {
      ...campaign,
      displayMode: 'mode2-background', // Le Design Editor utilise le mode 2 (background)
      gameType: campaign.type || 'wheel',
      campaignName: campaign.id || 'Design Editor Campaign',
      customTexts: [], // Pas de textes customisés dans le Design Editor pour l'instant
      design: {
        customImages: [],
        backgroundImage: campaign.canvasConfig?.background?.type === 'image' ? campaign.canvasConfig.background.value : undefined,
        ...campaign.design
      }
    };
    
    const encoded = encodeURIComponent(JSON.stringify(config));
    window.open(`${window.location.origin}/final-preview?config=${encoded}`, '_blank');
  };
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* Left Section - Logo/Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-bold text-gray-800">Design Editor</h1>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Undo className="w-4 h-4" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Device Selector */}
      <div className="flex items-center bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onDeviceChange('desktop')}
          className={`p-2 rounded-md transition-colors ${
            selectedDevice === 'desktop' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeviceChange('tablet')}
          className={`p-2 rounded-md transition-colors ${
            selectedDevice === 'tablet' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Tablet"
        >
          <Tablet className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDeviceChange('mobile')}
          className={`p-2 rounded-md transition-colors ${
            selectedDevice === 'mobile' 
              ? 'bg-white shadow-sm text-blue-600' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
          title="Mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={onPreviewToggle}
          className={`flex items-center px-3 py-2 text-sm border rounded-lg transition-colors ${
            isPreviewMode 
              ? 'bg-[#841b60] text-white border-[#841b60]' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-4 h-4 mr-2" />
          {isPreviewMode ? 'Mode Édition' : 'Aperçu'}
        </button>
        <button 
          onClick={handleFinalPreview}
          className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Aperçu final
        </button>
        <button className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </button>
        <button className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Télécharger
        </button>
      </div>
    </div>
  );
};

export default DesignToolbar;