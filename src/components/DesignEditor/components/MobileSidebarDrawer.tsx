import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Palette,
  Layers,
  Settings,
  Gamepad2,
  Share
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
    { id: 'assets', label: 'Éléments', icon: Plus, color: '#3B82F6' },
    { id: 'background', label: 'Design', icon: Palette, color: '#EC4899' },
    { id: 'layers', label: 'Calques', icon: Layers, color: '#10B981' },
    { id: 'campaign', label: 'Réglages', icon: Settings, color: '#F59E0B' },
    { id: 'gamelogic', label: 'Jeu', icon: Gamepad2, color: '#8B5CF6' },
    { id: 'export', label: 'Export', icon: Share, color: '#06B6D4' }
  ];

  // Auto-ouverture si un élément est sélectionné
  useEffect(() => {
    if (selectedElement) {
      setActiveTab('assets');
      setIsMinimized(false);
    }
  }, [selectedElement]);

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
          y: isMinimized ? '100%' : '20%'
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200"
        style={{
          height: '85vh',
          // Leave space for the persistent tab bar AND device safe area
          bottom: 'calc(80px + env(safe-area-inset-bottom))',
          transform: 'translateZ(0)',
          willChange: 'transform'
        }}
      >
        <div 
          className="flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
          onTouchEnd={() => setIsMinimized(!isMinimized)}
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
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
                height: 'calc(85vh - 100px)',
                overscrollBehavior: 'contain'
              }}
            >
              {renderPanel(activeTab)}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Persistent Bottom Tab Bar (mobile only) */}
      <div
        className="fixed left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200"
        style={{
          // Position above the iOS/Android gesture area
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: 9999,
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)',
          // Ensure it stays on top of other content
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
          // Force hardware acceleration
          transform: 'translateZ(0)',
          willChange: 'transform',
          // Prevent any parent from hiding this element
          visibility: 'visible !important',
          opacity: '1 !important',
          display: 'block !important'
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={`bottom-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMinimized(false);
                }}
                onTouchEnd={() => {
                  setActiveTab(tab.id);
                  setIsMinimized(false);
                }}
                className={`flex flex-col items-center justify-center px-2 py-1 rounded-md transition-colors ${
                  isActive ? 'text-gray-900' : 'text-gray-600'
                }`}
                style={isActive ? { color: tab.color } : undefined}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileSidebarDrawer;