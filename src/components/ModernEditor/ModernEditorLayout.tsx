import React, { useState, memo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernEditorSidebar from './ModernEditorSidebar';
import ModernEditorPanel from './ModernEditorPanel';
import AIAssistantSidebar from './AIAssistantSidebar';
import EditorHeader from './components/EditorHeader';
import OptimizedGameCanvasPreview from './components/OptimizedGameCanvasPreview';
import MobileResponsiveLayout from '../DesignEditor/components/MobileResponsiveLayout';
// import MobileStableEditor from '../QuizEditor/components/MobileStableEditor';

import { useEditorStore } from '@/stores/editorStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useHistoryManager } from './hooks/useHistoryManager';
import KeyboardShortcutsHelp from '../shared/KeyboardShortcutsHelp';

interface ModernEditorLayoutProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  previewDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onSave: () => void;
  onPreview: () => void;
  isLoading: boolean;
  campaignType: string;
  isNewCampaign: boolean;
  gameTypeLabels: Record<string, string>;
  previewKey?: string;
  isPreviewLoading?: boolean;
}

const ModernEditorLayout: React.FC<ModernEditorLayoutProps> = memo(({
  campaign,
  setCampaign,
  activeTab,
  onTabChange,
  previewDevice,
  onDeviceChange,
  onSave,
  onPreview,
  isLoading,
  isNewCampaign,
  campaignType,
  previewKey,
  isPreviewLoading = false
}) => {
  const [showAIAssistant] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Initialize store with current data
  const { setCampaign: setStoreCampaign } = useEditorStore();
  
  useEffect(() => {
    if (campaign) {
      setStoreCampaign(campaign);
    }
  }, [campaign, setStoreCampaign]);
  
  // Enhanced setCampaign with performance optimizations
  const enhancedSetCampaign = useCallback((updater: any) => {
    setIsGenerating(true);
    setCampaign(updater);
    setStoreCampaign(updater);
    // Clear loading after optimized delay
    requestAnimationFrame(() => {
      setTimeout(() => setIsGenerating(false), 100);
    });
  }, [setCampaign, setStoreCampaign]);
  
  // History manager for undo/redo
  const { addToHistory, undo, redo } = useHistoryManager({
    maxHistorySize: 50,
    onUndo: (state) => {
      setCampaign(state);
      setStoreCampaign(state);
    },
    onRedo: (state) => {
      setCampaign(state);
      setStoreCampaign(state);
    }
  });

  // Track changes for history
  useEffect(() => {
    if (campaign) {
      addToHistory(campaign, 'update');
    }
  }, [campaign, addToHistory]);

  // Setup keyboard shortcuts with history support
  const { shortcuts } = useKeyboardShortcuts({
    onSave,
    onPreview,
    onUndo: undo,
    onRedo: redo
  });
  
  // Use provided preview key or fallback
  const optimizedPreviewKey = previewKey || `fallback-${Date.now()}`;
  
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };

  return (
    <MobileResponsiveLayout
      selectedDevice={previewDevice}
      canvasRef={canvasRef}
      zoom={1}
      className="modern-editor-responsive"
    >
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header - hauteur fixe */}
        <div className="flex-shrink-0">
          <EditorHeader 
            campaign={campaign} 
            onSave={onSave} 
            onPreview={onPreview} 
            isLoading={isLoading} 
            isNewCampaign={isNewCampaign} 
            selectedDevice={previewDevice} 
            onDeviceChange={onDeviceChange} 
          />
          
          {/* Bouton d'aide des raccourcis clavier */}
          <div className="absolute top-4 right-4 z-20">
            <KeyboardShortcutsHelp shortcuts={shortcuts} />
          </div>
        </div>

        {/* Main Content - prend le reste de l'écran */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor Sidebar - largeur fixe avec scroll interne */}
          <div className="w-[320px] lg:w-[390px] bg-white/95 backdrop-blur-sm border-r border-gray-200/50 shadow-sm flex-shrink-0 hybrid-sidebar">
            <div className="flex h-full">
              {/* Navigation tabs - alignés à gauche */}
              <div className="w-16 border-r border-gray-200/50 flex-shrink-0">
                <ModernEditorSidebar 
                  activeTab={activeTab} 
                  onTabChange={onTabChange} 
                  campaignType={campaignType as any} 
                />
              </div>

              {/* Panel content - scroll interne uniquement */}
              <div className="flex-1 overflow-y-auto px-2">
                <ModernEditorPanel 
                  activeStep={activeTab} 
                  campaign={campaign} 
                  setCampaign={enhancedSetCampaign} 
                />
              </div>
            </div>
          </div>

          {/* Zone centrale - aperçu centré et responsive */}
          <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50 overflow-hidden">
            {/* Barre d'outils centrée - hauteur fixe */}
            <div className="bg-white/50 border-b border-gray-200/50 px-4 py-3 flex-shrink-0">
              <div className="flex justify-center items-center">
                <h2 className="text-sm font-medium text-gray-600">
                  Aperçu en temps réel
                </h2>
              </div>
            </div>

            {/* Zone de prévisualisation - pleine largeur avec spacing propre */}
            <div 
              ref={canvasRef}
              className="flex-1 flex items-center justify-center overflow-hidden design-canvas-container"
            >
              <div className="relative w-full h-full flex items-center justify-center design-canvas-wrapper">
                {(isGenerating || isPreviewLoading) && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                      <span className="text-sm text-gray-600">
                        {isPreviewLoading ? 'Optimisation...' : 'Mise à jour...'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="w-full h-full flex items-center justify-center overflow-hidden">
                  <OptimizedGameCanvasPreview
                    campaign={campaign} 
                    previewDevice={previewDevice} 
                    key={optimizedPreviewKey}
                    isLoading={isPreviewLoading}
                    setCampaign={enhancedSetCampaign}
                    previewKey={optimizedPreviewKey}
                  />
                </div>
              </div>
            </div>

            {/* AI Assistant Sidebar - positionné absolument */}
            <AnimatePresence>
              {showAIAssistant && (
                <motion.div 
                  initial={{ opacity: 0, x: 300 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 300 }} 
                  transition={{ duration: 0.3 }} 
                  className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 z-10"
                >
                  <AIAssistantSidebar 
                    campaign={campaign} 
                    setCampaign={setCampaign} 
                    isGenerating={isGenerating} 
                    onGenerate={handleAIGenerate} 
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Performance Monitor */}

      </div>
    </MobileResponsiveLayout>
  );
});

ModernEditorLayout.displayName = 'ModernEditorLayout';

export default ModernEditorLayout;