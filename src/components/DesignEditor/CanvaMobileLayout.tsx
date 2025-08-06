import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, 
  Type, 
  Image, 
  Palette, 
  Upload, 
  Cloud,
  ChevronDown
} from 'lucide-react';

interface CanvaMobileLayoutProps {
  children: React.ReactNode;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

interface BottomTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const CanvaMobileLayout: React.FC<CanvaMobileLayoutProps> = ({
  children,
  previewDevice,
  onDeviceChange
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<string | null>(null);

  const bottomTabs: BottomTab[] = [
    {
      id: 'design',
      label: 'Design',
      icon: Layers,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Design Elements</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gray-100 rounded-lg text-center">
              <Palette className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">Colors</span>
            </button>
            <button className="p-4 bg-gray-100 rounded-lg text-center">
              <Type className="w-6 h-6 mx-auto mb-2" />
              <span className="text-sm">Fonts</span>
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'elements',
      label: 'Éléments',
      icon: Layers,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Éléments</h3>
          <div className="space-y-2">
            <button className="w-full p-3 bg-purple-600 text-white rounded-lg flex items-center justify-center">
              <Type className="w-5 h-5 mr-2" />
              Ajouter une zone de texte
            </button>
            <button className="w-full p-3 bg-gray-800 text-white rounded-lg flex items-center justify-center">
              <Type className="w-5 h-5 mr-2" />
              Écriture magique
            </button>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium">Styles de texte par défaut</h4>
            <button className="w-full p-3 bg-gray-100 rounded-lg text-left">
              <span className="text-2xl font-bold">Ajouter un titre</span>
            </button>
            <button className="w-full p-3 bg-gray-100 rounded-lg text-left">
              <span className="text-lg">Ajouter un sous-titre</span>
            </button>
            <button className="w-full p-3 bg-gray-100 rounded-lg text-left">
              <span className="text-base">Ajouter des lignes dans le corps du texte</span>
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'text',
      label: 'Texte',
      icon: Type,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Texte</h3>
          <div className="space-y-2">
            <button className="w-full p-3 bg-purple-600 text-white rounded-lg">
              Ajouter une zone de texte
            </button>
            <button className="w-full p-3 bg-gray-800 text-white rounded-lg">
              Écriture magique
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'gallery',
      label: 'Galerie',
      icon: Image,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Galerie</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="aspect-square bg-gray-100 rounded-lg p-4">
              <Image className="w-full h-full" />
            </button>
            <button className="aspect-square bg-gray-100 rounded-lg p-4">
              <Image className="w-full h-full" />
            </button>
          </div>
        </div>
      )
    },
    {
      id: 'brand',
      label: 'Marque',
      icon: Palette,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Identité visuelle</h3>
          <button className="w-full p-3 bg-gray-100 rounded-lg">
            Ajouter vos polices de marque
          </button>
        </div>
      )
    },
    {
      id: 'upload',
      label: 'Importer',
      icon: Upload,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Importer</h3>
          <button className="w-full p-3 bg-purple-600 text-white rounded-lg">
            Télécharger des fichiers
          </button>
        </div>
      )
    },
    {
      id: 'tools',
      label: 'Outils',
      icon: Cloud,
      content: (
        <div className="p-4 space-y-4">
          <h3 className="text-lg font-semibold">Outils</h3>
          <button className="w-full p-3 bg-gray-100 rounded-lg">
            Autres outils
          </button>
        </div>
      )
    }
  ];

  const isTabOpen = activeBottomTab !== null;
  const activeTab = bottomTabs.find(tab => tab.id === activeBottomTab);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Design Editor</h1>
          <div className="flex items-center gap-2">
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">
              📱 MOBILE OPTIMIZED
            </span>
            <button className="bg-white/20 p-2 rounded">
              👁️ Aperçu
            </button>
          </div>
        </div>

        {/* Device Selector */}
        <div className="flex items-center justify-center mt-4 bg-white/10 rounded-lg p-1">
          {[
            { device: 'desktop' as const, icon: '💻' },
            { device: 'tablet' as const, icon: '📱' },
            { device: 'mobile' as const, icon: '📱' }
          ].map(({ device, icon }) => (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`flex-1 p-2 rounded-md text-sm transition-colors ${
                previewDevice === device
                  ? 'bg-white text-purple-600'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {icon} {device.charAt(0).toUpperCase() + device.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="h-full flex items-center justify-center bg-gray-50 p-4">
          <div 
            className={`
              bg-white shadow-lg overflow-hidden
              ${previewDevice === 'mobile' ? 'w-full max-w-sm h-full max-h-[600px] rounded-none' : ''}
              ${previewDevice === 'tablet' ? 'w-full max-w-lg h-full max-h-[700px] rounded-lg' : ''}
              ${previewDevice === 'desktop' ? 'w-full max-w-4xl aspect-video rounded-lg' : ''}
            `}
          >
            {children}
          </div>
        </div>
      </div>

      {/* Bottom Sheet Panel */}
      <AnimatePresence>
        {isTabOpen && activeTab && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-0 bottom-0 bg-white border-t shadow-xl z-50"
            style={{ height: '60vh' }}
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-lg">{activeTab.label}</h3>
              <button
                onClick={() => setActiveBottomTab(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab.content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Tab Bar */}
      <div className="bg-white border-t">
        <div className="flex items-center justify-around py-2">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeBottomTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveBottomTab(isActive ? null : tab.id)}
                className={`flex flex-col items-center p-2 min-w-0 flex-1 ${
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

export default CanvaMobileLayout;