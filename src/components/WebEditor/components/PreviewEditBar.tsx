import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Layers, 
  Palette, 
  Settings, 
  Type, 
  Image as ImageIcon,
  Square,
  Circle,
  Triangle,
  Minus
} from 'lucide-react';

interface PreviewEditBarProps {
  onAddElement: (elementType: string) => void;
  onOpenPanel: (panelType: 'layers' | 'styles' | 'settings') => void;
  className?: string;
}

const PreviewEditBar: React.FC<PreviewEditBarProps> = ({
  onAddElement,
  onOpenPanel,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>('add');
  const [isExpanded, setIsExpanded] = useState(false);

  const tabs = [
    {
      id: 'add',
      label: 'Ajouter',
      icon: Plus,
      content: [
        { type: 'text', label: 'Texte', icon: Type },
        { type: 'image', label: 'Image', icon: ImageIcon },
        { type: 'rectangle', label: 'Rectangle', icon: Square },
        { type: 'circle', label: 'Cercle', icon: Circle },
        { type: 'triangle', label: 'Triangle', icon: Triangle }
      ]
    },
    {
      id: 'layers',
      label: 'Calques',
      icon: Layers,
      action: () => onOpenPanel('layers')
    },
    {
      id: 'styles',
      label: 'Styles',
      icon: Palette,
      action: () => onOpenPanel('styles')
    },
    {
      id: 'settings',
      label: 'Réglages',
      icon: Settings,
      action: () => onOpenPanel('settings')
    }
  ];

  const handleTabClick = (tab: any) => {
    if (tab.action) {
      tab.action();
    } else {
      setActiveTab(tab.id);
      setIsExpanded(tab.id === activeTab ? !isExpanded : true);
    }
  };

  const handleElementAdd = (elementType: string) => {
    onAddElement(elementType);
    setIsExpanded(false);
  };

  return (
    <div className={`preview-edit-bar ${className}`}>
      {/* Panneau étendu */}
      <AnimatePresence>
        {isExpanded && activeTab === 'add' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute bottom-full left-0 right-0 mb-2"
          >
            <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-xl p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
                {tabs.find(t => t.id === activeTab)?.content?.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleElementAdd(item.type)}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors group"
                    >
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 group-hover:text-primary mb-1" />
                      <span className="text-[10px] sm:text-xs text-gray-600 group-hover:text-primary text-center">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barre d'onglets */}
      <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg overflow-hidden">
        <div className="flex items-center justify-between px-2 py-2 bg-white/50 backdrop-blur">
          {/* Bouton de réduction */}
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Onglets */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 flex-1 justify-center overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id && isExpanded;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all min-w-0 flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-[9px] sm:text-[10px] mt-0.5 font-medium truncate">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Espace pour équilibrer la mise en page */}
          <div className="w-8 sm:w-10 flex-shrink-0" />
        </div>
      </div>

      <style>{`
        .preview-edit-bar {
          position: relative;
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }
        
        @media (max-width: 640px) {
          .preview-edit-bar {
            max-width: 100%;
            padding: 0 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewEditBar;