import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Palette, 
  Layers, 
  Settings, 
  Gamepad2, 
  Share,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import AssetsPanel from '../panels/AssetsPanel';
import BackgroundPanel from '../panels/BackgroundPanel';
import LayersPanel from '../panels/LayersPanel';
import CampaignConfigPanel from '../panels/CampaignConfigPanel';
import GameLogicPanel from '../panels/GameLogicPanel';
import ExportPanel from '../panels/ExportPanel';

interface MobileSidebarDrawerProps {
  onAddElement: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
}

const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  campaignConfig,
  onCampaignConfigChange,
  elements = [],
  onElementsChange,
  selectedElement,
  onElementUpdate
}) => {
  const [activeTab, setActiveTab] = useState<string>('assets');
  const [isMinimized, setIsMinimized] = useState(true);

  const tabs = [
    { 
      id: 'assets', 
      label: 'Éléments', 
      icon: Plus,
      color: '#3B82F6'
    },
    { 
      id: 'background', 
      label: 'Design', 
      icon: Palette,
      color: '#EC4899'
    },
    { 
      id: 'layers', 
      label: 'Calques', 
      icon: Layers,
      color: '#10B981'
    },
    { 
      id: 'campaign', 
      label: 'Réglages', 
      icon: Settings,
      color: '#F59E0B'
    },
    { 
      id: 'gamelogic', 
      label: 'Jeu', 
      icon: Gamepad2,
      color: '#8B5CF6'
    },
    { 
      id: 'export', 
      label: 'Export', 
      icon: Share,
      color: '#06B6D4'
    }
  ];

  // Auto-ouverture si un élément est sélectionné
  useEffect(() => {
    if (selectedElement) {
      setActiveTab('assets');
      setIsMinimized(false);
    }
  }, [selectedElement]);

  const handleTabClick = (tabId: string) => {
    if (activeTab === tabId) {
      setIsMinimized(!isMinimized);
    } else {
      setActiveTab(tabId);
      setIsMinimized(false);
    }
  };

  const renderPanel = (tabId: string) => {
    switch (tabId) {
      case 'assets':
        return (
          <AssetsPanel 
            onAddElement={onAddElement} 
            selectedElement={selectedElement} 
            onElementUpdate={onElementUpdate} 
          />
        );
      case 'background':
        return (
          <BackgroundPanel 
            onBackgroundChange={onBackgroundChange || (() => {})} 
            onExtractedColorsChange={onExtractedColorsChange}
          />
        );
      case 'layers':
        return (
          <LayersPanel 
            elements={elements} 
            onElementsChange={onElementsChange || (() => {})} 
          />
        );
      case 'campaign':
        return (
          <CampaignConfigPanel 
            config={campaignConfig} 
            onConfigChange={onCampaignConfigChange || (() => {})} 
          />
        );
      case 'gamelogic':
        return <GameLogicPanel />;
      case 'export':
        return <ExportPanel />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setIsMinimized(true)}
          />
        )}
      </AnimatePresence>

      {/* Bottom Drawer */}
      <motion.div
        initial={false}
        animate={{
          y: isMinimized ? '80%' : '20%'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200"
        style={{
          height: '85vh',
          transform: 'translateZ(0)', // Force hardware acceleration
          willChange: 'transform'
        }}
      >
        {/* Handle */}
        <div 
          className="flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-white shadow-md' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  style={{
                    minWidth: '56px',
                    ...(isActive && {
                      borderLeft: `3px solid ${tab.color}`,
                      transform: 'scale(1.05)'
                    })
                  }}
                >
                  <Icon 
                    className={`w-5 h-5 ${
                      isActive ? 'text-gray-800' : 'text-gray-600'
                    }`}
                    style={{
                      color: isActive ? tab.color : undefined
                    }}
                  />
                  <span className={`text-xs mt-1 font-medium ${
                    isActive ? 'text-gray-800' : 'text-gray-600'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Minimize/Expand Button */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            {isMinimized ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Panel Content */}
        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 overflow-y-auto p-4"
              style={{
                height: 'calc(85vh - 140px)', // Ajuster selon la hauteur des onglets
                overscrollBehavior: 'contain'
              }}
            >
              {renderPanel(activeTab)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions When Minimized */}
        <AnimatePresence>
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-4"
            >
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Actions rapides</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setActiveTab('assets');
                      setIsMinimized(false);
                    }}
                    className="flex flex-col items-center p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-blue-600" />
                    <span className="text-xs mt-1 text-blue-600 font-medium">Ajouter</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('background');
                      setIsMinimized(false);
                    }}
                    className="flex flex-col items-center p-3 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
                  >
                    <Palette className="w-5 h-5 text-pink-600" />
                    <span className="text-xs mt-1 text-pink-600 font-medium">Couleurs</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('layers');
                      setIsMinimized(false);
                    }}
                    className="flex flex-col items-center p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors"
                  >
                    <Layers className="w-5 h-5 text-green-600" />
                    <span className="text-xs mt-1 text-green-600 font-medium">Calques</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default MobileSidebarDrawer;