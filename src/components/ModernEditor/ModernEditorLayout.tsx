import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ModernEditorSidebar from './ModernEditorSidebar';
import ModernEditorPanel from './ModernEditorPanel';
import AIAssistantSidebar from './AIAssistantSidebar';
import EditorHeader from './components/EditorHeader';
import GameCanvasPreview from './components/GameCanvasPreview';
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
}
const ModernEditorLayout: React.FC<ModernEditorLayoutProps> = ({
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
  campaignType
}) => {
  const [showAIAssistant] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Enhanced setCampaign to show loading feedback
  const enhancedSetCampaign = (updater: any) => {
    setIsGenerating(true);
    setCampaign(updater);
    // Clear loading after a short delay to show feedback
    setTimeout(() => setIsGenerating(false), 300);
  };
  
  // Optimize preview key to reduce unnecessary re-renders
  const previewKey = useMemo(() => 
    `preview-${activeTab}-${campaign._lastUpdate || 0}-${previewDevice}`,
    [activeTab, campaign._lastUpdate, previewDevice]
  );
  const handleAIGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
  };
  return <div className="flex flex-col h-screen overflow-hidden">
      {/* Header - hauteur fixe */}
      <div className="flex-shrink-0">
        <EditorHeader campaign={campaign} onSave={onSave} onPreview={onPreview} isLoading={isLoading} isNewCampaign={isNewCampaign} selectedDevice={previewDevice} onDeviceChange={onDeviceChange} />
      </div>

      {/* Main Content - prend le reste de l'écran */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor Sidebar - largeur fixe avec scroll interne */}
        <div className="w-[320px] lg:w-[390px] bg-white/95 backdrop-blur-sm border-r border-gray-200/50 shadow-sm flex-shrink-0">
          <div className="flex h-full">
            {/* Navigation tabs - alignés à gauche */}
            <div className="w-16 border-r border-gray-200/50 flex-shrink-0">
              <ModernEditorSidebar activeTab={activeTab} onTabChange={onTabChange} campaignType={campaignType as any} />
            </div>

            {/* Panel content - scroll interne uniquement */}
            <div className="flex-1 overflow-y-auto px-2">
              <ModernEditorPanel activeStep={activeTab} campaign={campaign} setCampaign={enhancedSetCampaign} />
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

          {/* Zone de prévisualisation - dimensions optimisées */}
          <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
            <div className="relative w-full h-full max-w-4xl max-h-full flex items-center justify-center">
              {isGenerating && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-primary"></div>
                    <span className="text-sm text-gray-600">Mise à jour...</span>
                  </div>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 w-full h-full max-w-3xl max-h-full flex items-center justify-center">
                <GameCanvasPreview campaign={campaign} previewDevice={previewDevice} key={previewKey} />
              </div>
            </div>
          </div>

          {/* AI Assistant Sidebar - positionné absolument */}
          <AnimatePresence>
            {showAIAssistant && <motion.div initial={{
            opacity: 0,
            x: 300
          }} animate={{
            opacity: 1,
            x: 0
          }} exit={{
            opacity: 0,
            x: 300
          }} transition={{
            duration: 0.3
          }} className="absolute top-4 right-4 w-80 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6 z-10">
                <AIAssistantSidebar campaign={campaign} setCampaign={setCampaign} isGenerating={isGenerating} onGenerate={handleAIGenerate} />
              </motion.div>}
          </AnimatePresence>
        </div>
      </div>
    </div>;
};
export default ModernEditorLayout;