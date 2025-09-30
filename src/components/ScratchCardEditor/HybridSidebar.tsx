import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Layers,
  FormInput,
  Gamepad2,
  Palette
} from 'lucide-react';
import BackgroundPanel from '../DesignEditor/panels/BackgroundPanel';
import AssetsPanel from '../DesignEditor/panels/AssetsPanel';
import TextEffectsPanel from '../DesignEditor/panels/TextEffectsPanel';
import TextAnimationsPanel from '../DesignEditor/panels/TextAnimationsPanel';
import ScratchCardPanel from './panels/ScratchCardPanel';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import { useEditorStore } from '../../stores/editorStore';
import { getEditorDeviceOverride } from '@/utils/deviceOverrides';

// Lazy-loaded heavy panels
const loadPositionPanel = () => import('../DesignEditor/panels/PositionPanel');
const loadLayersPanel = () => import('../DesignEditor/panels/LayersPanel');

const LazyPositionPanel = React.lazy(loadPositionPanel);
const LazyLayersPanel = React.lazy(loadLayersPanel);

export interface HybridSidebarRef {
  setActiveTab: (tab: string) => void;
}

interface HybridSidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onAddElement: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  extractedColors?: string[]; 
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  showEffectsPanel?: boolean;
  onEffectsPanelChange?: (show: boolean) => void;
  showAnimationsPanel?: boolean;
  onAnimationsPanelChange?: (show: boolean) => void;
  showPositionPanel?: boolean;
  onPositionPanelChange?: (show: boolean) => void;
  showScratchPanel?: boolean;
  onScratchPanelChange?: (show: boolean) => void;
  showDesignPanel?: boolean;
  onDesignPanelChange?: (show: boolean) => void;
  canvasRef?: React.RefObject<HTMLDivElement>;
  selectedElements?: any[];
  onSelectedElementsChange?: (elements: any[]) => void;
  onAddToHistory?: (snapshot: any) => void;
  scratchConfig?: any;
  onScratchConfigChange?: (config: any) => void;
  selectedDevice?: 'desktop' | 'tablet' | 'mobile';
  hiddenTabs?: string[];
  colorEditingContext?: 'fill' | 'border' | 'text';
}

const HybridSidebar = forwardRef<HybridSidebarRef, HybridSidebarProps>(({
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  currentBackground,
  extractedColors = [],
  elements = [],
  onElementsChange,
  selectedElement,
  onElementUpdate,
  showEffectsPanel = false,
  onEffectsPanelChange,
  showAnimationsPanel = false,
  onAnimationsPanelChange,
  showPositionPanel = false,
  onPositionPanelChange,
  showScratchPanel = false,
  onScratchPanelChange,
  showDesignPanel = false,
  onDesignPanelChange,
  canvasRef,
  selectedElements = [],
  onSelectedElementsChange,
  onAddToHistory,
  scratchConfig,
  onScratchConfigChange,
  selectedDevice = 'desktop',
  hiddenTabs = [],
  colorEditingContext
}: HybridSidebarProps, ref) => {
  const [isCollapsed, setIsCollapsed] = useState(selectedDevice === 'mobile');
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  
  React.useEffect(() => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';

    const deviceOverride = getEditorDeviceOverride();
    if (deviceOverride === 'desktop') {
      setIsCollapsed(false);
      return;
    }

    if (/Mobi|Android/i.test(ua)) {
      setIsCollapsed(true);
    }
  }, []);

  // Default to 'Design' tab on entry
  const [activeTab, _setActiveTab] = useState<string | null>('background');
  
  useImperativeHandle(ref, () => ({
    setActiveTab: (tab: string) => {
      _setActiveTab(tab);
      if (tab === 'background') {
        onDesignPanelChange?.(true);
      } else if (tab === 'effects') {
        onEffectsPanelChange?.(true);
      } else if (tab === 'animations') {
        onAnimationsPanelChange?.(true);
      } else if (tab === 'position') {
        onPositionPanelChange?.(true);
      } else if (tab === 'scratch') {
        onScratchPanelChange?.(true);
      }
    }
  }), [onDesignPanelChange, onEffectsPanelChange, onAnimationsPanelChange, onPositionPanelChange, onScratchPanelChange]);
  
  const setActiveTab = (tab: string | null) => {
    _setActiveTab(tab);
  };
  
  const prevStatesRef = useRef({
    showEffectsPanel,
    showAnimationsPanel,
    showPositionPanel,
    showScratchPanel,
    showDesignPanel,
    activeTab
  });

  React.useEffect(() => {
    const prev = prevStatesRef.current;
    let newActiveTab = activeTab;
    let shouldUpdate = false;

    // Priority order: effects > animations > position > scratch > background
    if (showEffectsPanel && !prev.showEffectsPanel) {
      newActiveTab = 'effects';
      shouldUpdate = true;
    } else if (showAnimationsPanel && !prev.showAnimationsPanel) {
      newActiveTab = 'animations';
      shouldUpdate = true;
    } else if (showPositionPanel && !prev.showPositionPanel) {
      newActiveTab = 'position';
      shouldUpdate = true;
    } else if (showScratchPanel && !prev.showScratchPanel) {
      newActiveTab = 'scratch';
      shouldUpdate = true;
    } else if (showDesignPanel && !prev.showDesignPanel) {
      newActiveTab = 'background';
      shouldUpdate = true;
    } else if (activeTab === 'effects' && !showEffectsPanel && prev.showEffectsPanel) {
      newActiveTab = 'elements';
      shouldUpdate = true;
    } else if (activeTab === 'animations' && !showAnimationsPanel && prev.showAnimationsPanel) {
      newActiveTab = 'elements';
      shouldUpdate = true;
    } else if (activeTab === 'position' && !showPositionPanel && prev.showPositionPanel) {
      newActiveTab = 'elements';
      shouldUpdate = true;
    } else if (activeTab === 'scratch' && !showScratchPanel && prev.showScratchPanel) {
      newActiveTab = 'elements';
      shouldUpdate = true;
    }

    if (shouldUpdate && newActiveTab !== activeTab) {
      setActiveTab(newActiveTab);
    }

    prevStatesRef.current = {
      showEffectsPanel,
      showAnimationsPanel,
      showPositionPanel,
      showScratchPanel,
      showDesignPanel,
      activeTab: newActiveTab
    };

    if (onDesignPanelChange) {
      const isDesignActive = newActiveTab === 'background' || showDesignPanel;
      if (isDesignActive !== prev.showDesignPanel) {
        onDesignPanelChange(isDesignActive);
      }
    }
  }, [
    showEffectsPanel, 
    showAnimationsPanel, 
    showPositionPanel, 
    showScratchPanel,
    showDesignPanel,
    activeTab,
    onDesignPanelChange
  ]);

  React.useEffect(() => {
    if (activeTab === 'effects' && (!selectedElement || selectedElement.type !== 'text')) {
      onEffectsPanelChange?.(false);
      setActiveTab('elements');
    }
  }, [selectedElement, activeTab, onEffectsPanelChange]);

  React.useEffect(() => {
    const win: any = typeof window !== 'undefined' ? window : undefined;
    const schedule = (cb: () => void) =>
      win && typeof win.requestIdleCallback === 'function'
        ? win.requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 1200);
    const cancel = (id: any) =>
      win && typeof win.cancelIdleCallback === 'function' ? win.cancelIdleCallback(id) : clearTimeout(id);

    const id = schedule(() => {
      try {
        if (activeTab !== 'layers') {
          loadLayersPanel();
        }
        loadPositionPanel();
      } catch (e) {
        // no-op: prefetch is best-effort
      }
    });
    return () => cancel(id);
  }, [activeTab]);

  const allTabs = [
    { 
      id: 'background', 
      label: 'Design', 
      icon: Palette
    },
    { 
      id: 'elements', 
      label: 'Éléments', 
      icon: Plus
    },
    { 
      id: 'layers', 
      label: 'Calques', 
      icon: Layers
    },
    { 
      id: 'form', 
      label: 'Formulaire', 
      icon: FormInput
    },
    { 
      id: 'game', 
      label: 'Grattage', 
      icon: Gamepad2
    }
  ];

  const safeHiddenTabs = Array.isArray(hiddenTabs) ? hiddenTabs : [];
  const tabs = allTabs.filter(tab => !safeHiddenTabs.includes(tab.id));
  
  // Ensure a valid default active tab on mount and when visible tabs change
  React.useEffect(() => {
    const backgroundVisible = tabs.some(t => t.id === 'background');
    const activeIsVisible = activeTab ? tabs.some(t => t.id === activeTab) : false;
    if (!activeIsVisible) {
      _setActiveTab(backgroundVisible ? 'background' : (tabs[0]?.id ?? null));
    }
  }, [tabs]);

  const prefetchTab = (tabId: string) => {
    if (tabId === 'position') {
      loadPositionPanel();
    } else if (tabId === 'layers') {
      loadLayersPanel();
    }
  };

  const themeVars: React.CSSProperties = {
    ['--sidebar-bg' as any]: '240 8% 19%',
    ['--sidebar-surface' as any]: '240 8% 16%',
    ['--sidebar-border' as any]: '220 10% 34%',
    ['--sidebar-hover' as any]: '240 5% 26%',
    ['--sidebar-icon' as any]: '220 9% 72%',
    ['--sidebar-icon-active' as any]: '0 0% 100%',
    ['--sidebar-text-primary' as any]: '0 0% 100%',
    ['--sidebar-active-bg' as any]: '326 70% 37%',
    ['--sidebar-active' as any]: '336 75% 41%'
  } as React.CSSProperties;

  const handleTabClick = (tabId: string) => {
    if (showEffectsPanel && tabId !== 'effects') {
      onEffectsPanelChange?.(false);
    }
    if (showAnimationsPanel && tabId !== 'animations') {
      onAnimationsPanelChange?.(false);
    }
    if (showPositionPanel && tabId !== 'position') {
      onPositionPanelChange?.(false);
    }
    if (showScratchPanel && tabId !== 'scratch') {
      onScratchPanelChange?.(false);
    }
    
    if (activeTab === tabId) {
      setActiveTab(null);
    } else {
      setActiveTab(tabId);
    }
  };

  const renderPanel = (tabId: string) => {
    switch (tabId) {
      case 'effects':
        return (
          <TextEffectsPanel 
            onBack={() => {
              onEffectsPanelChange?.(false);
              setActiveTab('elements');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      case 'animations':
        return (
          <TextAnimationsPanel 
            onBack={() => {
              onAnimationsPanelChange?.(false);
              setActiveTab('elements');
            }}
            selectedElement={selectedElement}
            onElementUpdate={onElementUpdate}
          />
        );
      case 'position':
        return (
          <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement du panneau de position…</div>}>
            <LazyPositionPanel 
              onBack={() => {
                onPositionPanelChange?.(false);
                setActiveTab('elements');
              }}
              selectedElement={selectedElement}
              onElementUpdate={onElementUpdate}
              canvasRef={canvasRef}
            />
          </React.Suspense>
        );
      case 'scratch':
        return (
          <ScratchCardPanel />
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
              colorEditingContext={colorEditingContext}
            />
          </div>
        );
      case 'elements':
        return <AssetsPanel onAddElement={onAddElement} selectedElement={selectedElement} onElementUpdate={onElementUpdate} selectedDevice={selectedDevice} />;
      case 'game':
        return (
          <div className="h-full overflow-y-auto">
            <ScratchCardPanel />
          </div>
        );
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
  };

  if (isCollapsed) {
    return (
      <div className="w-16 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col" style={themeVars}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-4 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))]"
          title="Développer la sidebar"
        >
          <ChevronRight className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>
        
        <div className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsCollapsed(false);
                  setActiveTab(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onTouchStart={() => prefetchTab(tab.id)}
                className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))]'
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
                }`}
                title={tab.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0">
      <div className="w-20 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col shadow-sm min-h-0" style={themeVars}>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-3 hover:bg-[hsl(var(--sidebar-hover))] border-b border-[hsl(var(--sidebar-border))] transition-all duration-200"
          title="Réduire la sidebar"
        >
          <ChevronLeft className="w-5 h-5 text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]" />
        </button>
        
        <div className="flex flex-col flex-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabClick(tab.id);
                }}
                onMouseEnter={() => prefetchTab(tab.id)}
                onTouchStart={() => prefetchTab(tab.id)}
                className={`p-4 flex flex-col items-center justify-center border-b border-[hsl(var(--sidebar-border))] transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-[hsl(var(--sidebar-active-bg))] text-[hsl(var(--sidebar-icon-active))] border-r-2 border-r-[hsl(var(--sidebar-active))] shadow-sm' 
                    : 'text-[hsl(var(--sidebar-icon))] hover:bg-[hsl(var(--sidebar-hover))] hover:text-[hsl(var(--sidebar-icon-active))]'
                }`}
                title={tab.label}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeTab && (
        <div className="w-80 bg-[hsl(var(--sidebar-bg))] border-r border-[hsl(var(--sidebar-border))] flex flex-col h-full min-h-0 shadow-sm">
          <div className="p-6 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
            <h2 className="font-semibold text-[hsl(var(--sidebar-text-primary))] font-inter">
              {activeTab === 'effects' ? 'Effets de texte' : 
               activeTab === 'animations' ? 'Animations de texte' : 
               activeTab === 'position' ? 'Position' : 
               activeTab === 'scratch' ? 'Configuration Grattage' : 
               tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
            {renderPanel(activeTab)}
          </div>
        </div>
      )}
    </div>
  );
});

HybridSidebar.displayName = 'HybridSidebar';

export default HybridSidebar;
