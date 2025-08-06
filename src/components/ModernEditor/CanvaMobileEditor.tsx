import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Type, 
  Image, 
  Palette, 
  Upload, 
  Gamepad2,
  X,
  ChevronDown,
  Monitor,
  Tablet,
  Smartphone,
  Eye
} from 'lucide-react';
import ModernEditorPanel from './ModernEditorPanel';
import { CampaignType } from '../../utils/campaignTypes';

interface CanvaMobileEditorProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  campaignType: CampaignType;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  children?: React.ReactNode;
}

interface BottomTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const CanvaMobileEditor: React.FC<CanvaMobileEditorProps> = ({
  campaign,
  setCampaign,
  campaignType,
  previewDevice,
  onDeviceChange,
  children
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<string | null>(null);

  const bottomTabs: BottomTab[] = [
    { id: 'general', label: 'Design', icon: Settings },
    { id: 'visuals', label: 'Éléments', icon: Palette },
    { id: 'texts', label: 'Texte', icon: Type },
    { id: 'gallery', label: 'Galerie', icon: Image },
    { id: 'brand', label: 'Marque', icon: Palette },
    { id: 'import', label: 'Importer', icon: Upload },
    { id: 'game', label: 'Jeu', icon: Gamepad2 }
  ];

  const isTabOpen = activeBottomTab !== null;

  const getPreviewConstraints = () => {
    switch (previewDevice) {
      case 'mobile':
        return 'w-full max-w-sm h-full max-h-[600px] rounded-none';
      case 'tablet':
        return 'w-full max-w-lg h-full max-h-[700px] rounded-lg';
      case 'desktop':
        return 'w-full max-w-4xl aspect-video rounded-lg';
      default:
        return 'w-full max-w-4xl aspect-video rounded-lg';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header with Prosplay branding */}
      <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Prosplay Editor</h1>
          <div className="flex items-center gap-2">
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              📱 MOBILE OPTIMIZED
            </span>
            <button className="bg-white/20 p-2 rounded flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Aperçu
            </button>
          </div>
        </div>

        {/* Device Selector */}
        <div className="flex items-center justify-center mt-4 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => onDeviceChange('desktop')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              previewDevice === 'desktop'
                ? 'bg-white text-purple-600'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => onDeviceChange('tablet')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              previewDevice === 'tablet'
                ? 'bg-white text-purple-600'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            Tablette
          </button>
          <button
            onClick={() => onDeviceChange('mobile')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
              previewDevice === 'mobile'
                ? 'bg-white text-purple-600'
                : 'text-white/80 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview Area with fixed constraints */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex items-center justify-center bg-gray-50 p-4">
          <div className={`bg-white shadow-lg overflow-hidden ${getPreviewConstraints()}`}>
            {children || (
              <div className="h-full bg-gray-100 flex items-center justify-center">
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold mb-4">Aperçu {previewDevice}</h2>
                  <p className="text-gray-600">Votre campagne apparaît ici</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sheet Panel - Style Canva */}
      <AnimatePresence>
        {isTabOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 bg-white border-t shadow-xl z-50"
            style={{ height: '65vh' }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b bg-white">
              <h3 className="font-semibold text-lg">
                {bottomTabs.find(tab => tab.id === activeBottomTab)?.label}
              </h3>
              <button
                onClick={() => setActiveBottomTab(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {activeBottomTab && (
                <ModernEditorPanel
                  activeStep={activeBottomTab}
                  campaign={campaign}
                  setCampaign={setCampaign}
                />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar - Style Canva */}
      <div className="bg-white border-t">
        <div className="flex items-center justify-around py-2">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(isActive ? null : tab.id)}
                className={`flex flex-col items-center p-2 min-w-0 flex-1 transition-colors ${
                  isActive ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CanvaMobileEditor;