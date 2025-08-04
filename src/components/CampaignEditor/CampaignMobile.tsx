
import React, { useState } from 'react';
import { Smartphone, Tablet } from 'lucide-react';
import MobileLayout from './Mobile/MobileLayout';
import MobileVisuals from './Mobile/MobileVisuals';
import MobileTexts from './Mobile/MobileTexts';
import MobileGamePlacement from './Mobile/MobileGamePlacement';
import MobileButtons from './Mobile/MobileButtons';
import MobilePreview from './Mobile/MobilePreview';

interface CampaignMobileProps {
  campaign: any;
  setCampaign: React.Dispatch<React.SetStateAction<any>>;
  hidePreview?: boolean;
}

const CampaignMobile: React.FC<CampaignMobileProps> = ({
  campaign,
  setCampaign,
  hidePreview = false
}) => {
  const [activeSubTab, setActiveSubTab] = useState('layout');
  const [previewMode, setPreviewMode] = useState<'mobile' | 'tablet'>('mobile');

  const subTabs = [{
    id: 'layout',
    label: 'Layout'
  }, {
    id: 'visuals',
    label: 'Visuels'
  }, {
    id: 'texts',
    label: 'Textes'
  }, {
    id: 'game',
    label: 'Jeu'
  }, {
    id: 'buttons',
    label: 'Boutons'
  }];

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case 'layout':
        return <MobileLayout campaign={campaign} setCampaign={setCampaign} />;
      case 'visuals':
        return <MobileVisuals campaign={campaign} setCampaign={setCampaign} />;
      case 'texts':
        return <MobileTexts campaign={campaign} setCampaign={setCampaign} />;
      case 'game':
        return <MobileGamePlacement campaign={campaign} setCampaign={setCampaign} />;
      case 'buttons':
        return <MobileButtons campaign={campaign} setCampaign={setCampaign} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full w-full max-w-full overflow-hidden">
      {/* Left Panel - Configuration */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full">
        {/* Sub-tabs */}
        <div className="border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <nav className="flex overflow-x-auto scrollbar-hide px-2 py-2">
            <div className="flex space-x-1 min-w-max">
              {subTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeSubTab === tab.id
                      ? 'bg-white text-[#841b60] shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 max-w-full">
          <div className="max-w-full">
            {renderSubTabContent()}
          </div>
        </div>
      </div>

      {/* Right Panel - Preview */}
      {!hidePreview && (
        <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50 flex flex-col">
          {/* Preview Mode Toggle */}
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-center space-x-2 bg-white rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                  previewMode === 'mobile'
                    ? 'bg-brand-gradient text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile</span>
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                  previewMode === 'tablet'
                    ? 'bg-brand-gradient text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Tablet className="w-4 h-4" />
                <span>Tablet</span>
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 p-4 flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
            <div className="flex justify-center items-center w-full h-full">
              <MobilePreview campaign={campaign} previewMode={previewMode} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignMobile;
