import React, { forwardRef, useImperativeHandle, useState, useCallback, useMemo } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { OptimizedCampaign } from '../ModernEditor/types/CampaignTypes';
import ModernGeneralTab from '../ModernEditor/tabs/ModernGeneralTab';
import ModernDesignTab from '../ModernEditor/tabs/ModernDesignTab';
import ModernGameTab from '../ModernEditor/tabs/ModernGameTab';
import ModernFormTab from '../ModernEditor/tabs/ModernFormTab';
import BackgroundPanel from '../DesignEditor/panels/BackgroundPanel';
import AssetsPanel from '../DesignEditor/panels/AssetsPanel';
// import QuizConfigPanel from '../QuizEditor/components/QuizConfigPanel';
const QuizConfigPanel = ({ onBack }: { onBack: () => void }) => (
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
  
  // Quiz specific props
  quizQuestionCount?: number;
  quizTimeLimit?: number;
  quizDifficulty?: 'easy' | 'medium' | 'hard';
  quizBorderRadius?: number;
  selectedQuizTemplate?: string;
  onQuizQuestionCountChange?: (count: number) => void;
  onQuizTimeLimitChange?: (time: number) => void;
  onQuizDifficultyChange?: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onQuizBorderRadiusChange?: (radius: number) => void;
  onQuizTemplateChange?: (templateId: string) => void;
  onQuizPanelChange?: (show: boolean) => void;
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
  const [showPreview, setShowPreview] = useState(false);

  useImperativeHandle(ref, () => ({
    setActiveTab
  }));

  const themeVars = useMemo(() => ({
    '--sidebar-bg': 'var(--background)',
    '--sidebar-border': 'var(--border)',
    '--sidebar-text': 'var(--foreground)',
    '--sidebar-text-muted': 'var(--muted-foreground)',
    '--sidebar-hover': 'var(--accent)',
  } as React.CSSProperties), []);

  const tabs = useMemo(() => [
    { id: 'general', label: 'Général', icon: '⚙️' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'game', label: 'Jeu', icon: '🎮' },
    { id: 'quiz', label: 'Quiz', icon: '❓' },
    { id: 'background', label: 'Arrière-plan', icon: '🖼️' },
    { id: 'elements', label: 'Éléments', icon: '🧩' },
    { id: 'form', label: 'Formulaire', icon: '📝' },
    { id: 'layers', label: 'Calques', icon: '📚' },
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
            onQuestionCountChange={(c) => onQuizQuestionCountChange?.(c)}
            onTimeLimitChange={(t) => onQuizTimeLimitChange?.(t)}
            onDifficultyChange={(d) => onQuizDifficultyChange?.(d)}
            onBorderRadiusChange={(r) => onQuizBorderRadiusChange?.(r)}
            onTemplateChange={(template) => onQuizTemplateChange?.(template.id)}
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
              onElementUpdate={onElementUpdate}
              colorEditingContext={colorEditingContext === 'stroke' ? 'fill' : colorEditingContext}
            />
          </div>
        );
      case 'elements':
        return <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />;
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
      <div className="w-16 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col" style={themeVars}>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-3 border-b border-[hsl(var(--sidebar-border))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
          title="Développer"
        >
          <span className="text-lg">▶️</span>
        </button>
        
        {/* Collapsed Tab Icons */}
        <div className="flex-1 flex flex-col">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsCollapsed(false);
              }}
              className={`
                w-full p-3 text-center transition-colors border-b border-[hsl(var(--sidebar-border))]
                ${activeTab === tab.id 
                  ? 'bg-[hsl(var(--sidebar-hover))] border-l-2 border-l-primary' 
                  : 'hover:bg-[hsl(var(--sidebar-hover))]'
                }
              `}
              title={tab.label}
            >
              <span className="text-lg">{tab.icon}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col" style={themeVars}>
      {/* Header */}
      <div className="p-4 border-b border-[hsl(var(--sidebar-border))] flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[hsl(var(--sidebar-text))]">
          Paramètres
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded transition-colors"
            title={showPreview ? "Masquer l'aperçu" : "Afficher l'aperçu"}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded transition-colors"
            title="Réduire"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[hsl(var(--sidebar-border))]">
        <div className="grid grid-cols-2 gap-1 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-3 py-2 text-sm rounded transition-colors flex items-center gap-2
                ${activeTab === tab.id 
                  ? 'bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-text))] font-medium' 
                  : 'text-[hsl(var(--sidebar-text-muted))] hover:bg-[hsl(var(--sidebar-hover))]'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span className="truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>

      {/* Preview Toggle for Mobile */}
      {showPreview && (
        <div className="border-t border-[hsl(var(--sidebar-border))] p-4">
          <div className="text-sm text-[hsl(var(--sidebar-text-muted))]">
            Aperçu activé
          </div>
        </div>
      )}
    </div>
  );
});

HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;