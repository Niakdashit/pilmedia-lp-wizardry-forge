import React, { forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Settings, Gamepad2, Palette, FormInput, Layers, Image, ChevronLeft, ChevronRight } from 'lucide-react';
import { OptimizedCampaign } from '../ModernEditor/types/CampaignTypes';
// Simple placeholder components for missing ModernEditor tabs
const ModernGeneralTab = ({ campaign, setCampaign }: any) => (
  <div className="p-4"><p>Général - Configuration générale</p></div>
);

const ModernDesignTab = ({ campaign, setCampaign }: any) => (
  <div className="p-4"><p>Design - Personnalisation visuelle</p></div>
);

const ModernGameTab = ({ campaign, setCampaign }: any) => (
  <div className="p-4"><p>Jeu - Configuration du jeu</p></div>
);

const ModernFormTab = ({ campaign, setCampaign }: any) => (
  <div className="p-4"><p>Formulaire - Collecte de données</p></div>
);
import BackgroundPanel from '../DesignEditor/panels/BackgroundPanel';
import AssetsPanel from '../DesignEditor/panels/AssetsPanel';
// Simplified QuizConfigPanel placeholder
const QuizConfigPanel = ({ onBack, ...props }: { 
  onBack: () => void; 
  campaign?: any; 
  setCampaign?: any;
  [key: string]: any; 
}) => (
  <div className="p-4">
    <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded">← Retour</button>
    <p>Configuration Quiz - Bientôt disponible</p>
  </div>
);
const LazyLayersPanel = React.lazy(() => import('../DesignEditor/panels/LayersPanel'));

interface HybridSidebarProps {
  // Core data
  campaign: OptimizedCampaign | null;
  setCampaign: (updater: OptimizedCampaign | null | ((prev: OptimizedCampaign | null) => OptimizedCampaign | null)) => void;
  
  // UI state
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  
  // Element management
  elements: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElements: string[];
  onSelectedElementsChange: (ids: string[]) => void;
  selectedElement?: any;
  onElementUpdate: (id: string, updates: any) => void;
  onAddElement: (element: any) => void;
  
  // Background handling
  onBackgroundChange?: (bg: any) => void;
  onExtractedColorsChange: (colors: string[]) => void;
  currentBackground?: any;
  extractedColors: string[];
  colorEditingContext: 'fill' | 'stroke' | 'border';
  
  // History
  onAddToHistory: (action: string) => void;
  
  // Campaign config (for ModelEditor compatibility)
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  
  // Quiz specific props
  quizQuestionCount?: number;
  quizTimeLimit?: number;
  quizDifficulty?: 'easy' | 'medium' | 'hard';
  quizBorderRadius?: number;
  selectedQuizTemplate?: string;
  quizWidth?: string;
  onQuizQuestionCountChange?: (count: number) => void;
  onQuizTimeLimitChange?: (time: number) => void;
  onQuizDifficultyChange?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onQuizBorderRadiusChange?: (radius: number) => void;
  onQuizTemplateChange?: (templateId: string) => void;
  showQuizPanel?: boolean;
  onQuizPanelChange?: (show: boolean) => void;
  // Additional panel visibility props
  showEffectsPanel?: boolean;
  onEffectsPanelChange?: (show: boolean) => void;
  showPositionPanel?: boolean;
  onPositionPanelChange?: (show: boolean) => void;
  showDesignPanel?: boolean;
  onDesignPanelChange?: (show: boolean) => void;
  showAnimationsPanel?: boolean;
  onAnimationsPanelChange?: (show: boolean) => void;
  
  // Canvas reference for ModelEditor compatibility
  canvasRef?: React.RefObject<any>;
  
  // Force elements tab function
  onForceElementsTab?: () => void;
  
  // Hidden tabs configuration
  hiddenTabs?: string[];
  
  // Quiz width handling
  onQuizWidthChange?: (width: string) => void;
  quizMobileWidth?: string;
  onQuizMobileWidthChange?: (width: string) => void;
  
  // Button color handlers for quiz styling
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonHoverBackgroundColor?: string;
  buttonActiveBackgroundColor?: string;
  onButtonBackgroundColorChange?: (color: string) => void;
  onButtonTextColorChange?: (color: string) => void;
  onButtonHoverBackgroundColorChange?: (color: string) => void;
  onButtonActiveBackgroundColorChange?: (color: string) => void;
}

export interface HybridSidebarRef {
  setActiveTab: (tab: string) => void;
}

const HybridSidebar = forwardRef<HybridSidebarRef, HybridSidebarProps>(({
  campaign,
  setCampaign,
  selectedDevice,
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  elements,
  onElementsChange,
  selectedElements,
  onSelectedElementsChange,
  selectedElement,
  onElementUpdate,
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  currentBackground,
  extractedColors,
  colorEditingContext,
  onAddToHistory,
  quizQuestionCount,
  quizTimeLimit,
  quizDifficulty,
  quizBorderRadius,
  selectedQuizTemplate,
  onQuizQuestionCountChange,
  onQuizTimeLimitChange,
  onQuizDifficultyChange,
  onQuizBorderRadiusChange,
  onQuizTemplateChange,
  onQuizPanelChange,
}, ref) => {

  useImperativeHandle(ref, () => ({
    setActiveTab
  }));

  const tabs = useMemo(() => [
    { id: 'general', label: 'Général', icon: Settings, description: 'Informations de base' },
    { id: 'design', label: 'Design', icon: Palette, description: 'Couleurs et style' },
    { id: 'game', label: 'Jeu', icon: Gamepad2, description: 'Configuration du jeu' },
    { id: 'background', label: 'Arrière-plan', icon: Image, description: 'Images et couleurs' },
    { id: 'elements', label: 'Éléments', icon: FormInput, description: 'Composants' },
    { id: 'form', label: 'Formulaire', icon: FormInput, description: 'Champs de saisie' },
    { id: 'layers', label: 'Calques', icon: Layers, description: 'Organisation' },
  ], []);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'general':
        return (
          <ModernGeneralTab 
            campaign={campaign} 
            setCampaign={setCampaign} 
          />
        );
      case 'design':
        return (
          <ModernDesignTab 
            campaign={campaign} 
            setCampaign={setCampaign} 
          />
        );
      case 'game':
        return (
          <ModernGameTab 
            campaign={campaign} 
            setCampaign={setCampaign} 
          />
        );
      case 'quiz':
        return (
          <QuizConfigPanel
            onBack={() => {
              onQuizPanelChange?.(false);
              setActiveTab('elements');
            }}
            campaign={campaign}
            setCampaign={setCampaign}
            quizQuestionCount={quizQuestionCount || 5}
            quizTimeLimit={quizTimeLimit || 30}
            quizDifficulty={quizDifficulty || 'medium'}
            quizBorderRadius={quizBorderRadius}
            selectedTemplate={selectedQuizTemplate}
            onQuestionCountChange={(c: number) => onQuizQuestionCountChange?.(c)}
            onTimeLimitChange={(t: number) => onQuizTimeLimitChange?.(t)}
            onDifficultyChange={(d: 'easy' | 'medium' | 'hard') => onQuizDifficultyChange?.(d)}
            onBorderRadiusChange={(r: number) => onQuizBorderRadiusChange?.(r)}
            onTemplateChange={(template: any) => onQuizTemplateChange?.(template.id)}
            selectedDevice={selectedDevice}
          />
        );
      case 'background':
        return (
          <div className="h-full overflow-y-auto">
            <BackgroundPanel 
              onBackgroundChange={onBackgroundChange || (() => {})} 
              onExtractedColorsChange={onExtractedColorsChange}
              currentBackground={currentBackground}
              extractedColors={extractedColors}
              selectedElement={selectedElement}
              onElementUpdate={(updates: any) => onElementUpdate('', updates)}
              colorEditingContext={colorEditingContext === 'stroke' ? 'fill' : colorEditingContext}
            />
          </div>
        );
      case 'elements':
        return <AssetsPanel 
          onAddElement={onAddElement} 
          selectedElement={selectedElement} 
          onElementUpdate={(updates: any) => onElementUpdate('', updates)} 
          selectedDevice={selectedDevice} 
        />;
      case 'form':
        return (
          <div className="p-4">
            <ModernFormTab 
              campaign={campaign}
              setCampaign={setCampaign as any}
            />
          </div>
        );
      case 'layers':
        return (
          <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement des calques…</div>}>
            <LazyLayersPanel 
              elements={elements} 
              onElementsChange={onElementsChange || (() => {})} 
              selectedElements={selectedElements}
              onSelectedElementsChange={onSelectedElementsChange}
              onAddToHistory={onAddToHistory}
            />
          </React.Suspense>
        );
      default:
        return null;
    }
  }, [
    activeTab, campaign, setCampaign, selectedDevice, quizQuestionCount, 
    quizTimeLimit, quizDifficulty, quizBorderRadius, selectedQuizTemplate,
    onQuizQuestionCountChange, onQuizTimeLimitChange, onQuizDifficultyChange,
    onQuizBorderRadiusChange, onQuizTemplateChange, onQuizPanelChange,
    onBackgroundChange, onExtractedColorsChange, currentBackground, 
    extractedColors, selectedElement, onElementUpdate, colorEditingContext,
    onAddElement, elements, onElementsChange, selectedElements, 
    onSelectedElementsChange, onAddToHistory
  ]);

  if (isCollapsed) {
    return (
      <div className="w-16 h-full bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col border-r border-gray-700">
        {/* Expand Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
          title="Développer la barre latérale"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        
        {/* Collapsed Tab Icons */}
        <div className="flex-1 space-y-1 px-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <div key={tab.id} className="relative group">
                <button
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsCollapsed(false);
                  }}
                  className={`
                    relative w-full p-3 rounded-xl transition-all duration-300 group
                    ${isActive 
                      ? 'bg-gradient-to-br from-[#841b60] to-[#6d164f] text-white shadow-lg' 
                      : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 mx-auto transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="collapsedActiveIndicator"
                      className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-r-full"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </button>
                
                {/* Tooltip */}
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-xl">
                  <div className="font-medium">{tab.label}</div>
                  {tab.description && (
                    <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                  )}
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-900/95"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col border-r border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Paramètres
        </h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200"
          title="Réduire la barre latérale"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex-1 space-y-2 px-2 py-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <div key={tab.id} className="relative group">
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`relative w-full flex flex-col items-center p-3 rounded-2xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-gradient-to-br from-[#841b60] to-[#6d164f] text-white shadow-lg transform scale-105' 
                    : 'text-gray-400 hover:bg-gray-700/50 hover:text-white hover:shadow-md'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="text-xs font-medium text-center leading-tight">{tab.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              
              {/* Enhanced tooltip */}
              <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-4 py-3 bg-gray-900/95 backdrop-blur-sm text-white text-sm rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-10 shadow-xl">
                <div className="font-semibold">{tab.label}</div>
                {tab.description && (
                  <div className="text-xs text-gray-300 mt-1">{tab.description}</div>
                )}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-transparent border-r-gray-900/95"></div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Bottom gradient */}
      <div className="px-3 pb-2">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[#841b60]/30 to-transparent"></div>
      </div>

      {/* Content Panel */}
      {activeTab && (
        <div className="absolute left-full top-0 w-80 h-full bg-white shadow-xl border-l border-gray-200 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      )}
    </div>
  );
});

HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;