import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Eye, Save } from 'lucide-react';
import HybridSidebar from './HybridSidebar';
import DesignCanvas from './DesignCanvas';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';

interface MobileDesignEditorProps {
  canvasElements: any[];
  setCanvasElements: React.Dispatch<React.SetStateAction<any[]>>;
  canvasBackground: { type: 'color' | 'image'; value: string };
  setCanvasBackground: (bg: { type: 'color' | 'image'; value: string }) => void;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  campaignConfig: any;
  setCampaignConfig: (config: any) => void;
  canvasZoom: number;
  selectedElement: any;
  setSelectedElement: (element: any) => void;
  handleElementUpdate: (updates: any) => void;
  showEffectsInSidebar: boolean;
  setShowEffectsInSidebar: (show: boolean) => void;
  showAnimationsInSidebar: boolean;
  setShowAnimationsInSidebar: (show: boolean) => void;
  handleExtractedColorsChange: (colors: string[]) => void;
  campaignData: any;
  handleSave: () => void;
  showFunnel: boolean;
  setShowFunnel: (show: boolean) => void;
}

const MobileDesignEditor: React.FC<MobileDesignEditorProps> = ({
  canvasElements,
  setCanvasElements,
  canvasBackground,
  setCanvasBackground,
  selectedDevice,
  campaignConfig,
  setCampaignConfig,
  canvasZoom,
  selectedElement,
  setSelectedElement,
  handleElementUpdate,
  showEffectsInSidebar,
  setShowEffectsInSidebar,
  showAnimationsInSidebar,
  setShowAnimationsInSidebar,
  handleExtractedColorsChange,
  campaignData,
  handleSave,
  showFunnel,
  setShowFunnel
}) => {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      {/* Top Bar Mobile */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-20">
        <button
          onClick={() => setShowSidebar(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <h1 className="text-lg font-semibold text-gray-900">Design Editor</h1>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFunnel(!showFunnel)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={handleSave}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content - Canvas fixe et toujours visible */}
      <div className="flex-1 relative overflow-hidden">
        {showFunnel ? (
          /* Mode Preview - Plein écran */
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
            <button
              onClick={() => setShowFunnel(false)}
              className="absolute top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <FunnelUnlockedGame
              campaign={campaignData}
              previewMode={selectedDevice}
            />
          </div>
        ) : (
          /* Canvas fixe - toujours visible entièrement */
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full h-full max-w-sm max-h-full flex items-center justify-center">
              <DesignCanvas 
                selectedDevice={selectedDevice}
                elements={canvasElements}
                onElementsChange={setCanvasElements}
                background={canvasBackground}
                campaign={campaignConfig}
                onCampaignChange={setCampaignConfig}
                zoom={canvasZoom}
                selectedElement={selectedElement}
                onSelectedElementChange={setSelectedElement}
                onElementUpdate={handleElementUpdate}
                onShowEffectsPanel={() => {
                  setShowEffectsInSidebar(true);
                  setShowAnimationsInSidebar(false);
                  setShowSidebar(true);
                }}
                onShowAnimationsPanel={() => {
                  setShowAnimationsInSidebar(true);
                  setShowEffectsInSidebar(false);
                  setShowSidebar(true);
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar Mobile - Slide depuis la gauche */}
      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white shadow-xl z-50 overflow-y-auto"
            >
              {/* Header Sidebar */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Outils</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenu Sidebar */}
              <div className="p-4">
                <HybridSidebar 
                  onAddElement={(element) => setCanvasElements((prev: any[]) => [...prev, element])}
                  onBackgroundChange={setCanvasBackground}
                  onExtractedColorsChange={handleExtractedColorsChange}
                  campaignConfig={campaignConfig}
                  onCampaignConfigChange={setCampaignConfig}
                  elements={canvasElements}
                  onElementsChange={setCanvasElements}
                  selectedElement={selectedElement}
                  onElementUpdate={handleElementUpdate}
                  showEffectsPanel={showEffectsInSidebar}
                  onEffectsPanelChange={setShowEffectsInSidebar}
                  showAnimationsPanel={showAnimationsInSidebar}
                  onAnimationsPanelChange={setShowAnimationsInSidebar}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Barre d'outils en bas */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-center space-x-4 z-20">
        <button
          onClick={() => setShowSidebar(true)}
          className="flex flex-col items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900"
        >
          <Menu className="w-5 h-5 mb-1" />
          <span>Outils</span>
        </button>
        
        <button
          onClick={() => setShowFunnel(!showFunnel)}
          className="flex flex-col items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900"
        >
          <Eye className="w-5 h-5 mb-1" />
          <span>Aperçu</span>
        </button>
        
        <button
          onClick={handleSave}
          className="flex flex-col items-center px-3 py-2 text-xs text-gray-600 hover:text-gray-900"
        >
          <Save className="w-5 h-5 mb-1" />
          <span>Sauver</span>
        </button>
      </div>
    </div>
  );
};

export default MobileDesignEditor;