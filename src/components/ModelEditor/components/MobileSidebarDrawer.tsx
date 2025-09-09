import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Palette,
  Layers,
  FormInput,
  Gamepad2,
  RotateCcw,
  RotateCw
} from 'lucide-react';
import AssetsPanel from '../panels/AssetsPanel';
import BackgroundPanel from '../panels/BackgroundPanel';
import ModernFormTab from '../ModernEditor/ModernFormTab';
import { useEditorStore } from '../../stores/editorStore';

// Lazy-loaded heavy panels
const loadLayersPanel = () => import('../panels/LayersPanel');

const LazyLayersPanel = React.lazy(loadLayersPanel);

interface MobileSidebarDrawerProps {
  onAddElement: (element: any) => void;
  onBackgroundChange?: (background: { type: 'color' | 'image'; value: string }) => void;
  onExtractedColorsChange?: (colors: string[]) => void;
  currentBackground?: { type: 'color' | 'image'; value: string };
  campaignConfig?: any;
  onCampaignConfigChange?: (config: any) => void;
  elements?: any[];
  onElementsChange?: (elements: any[]) => void;
  selectedElement?: any;
  onElementUpdate?: (updates: any) => void;
  // Undo/redo controls
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  onAddElement,
  onBackgroundChange,
  onExtractedColorsChange,
  currentBackground,
  elements = [],
  onElementsChange,
  selectedElement,
  onElementUpdate,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const campaign = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  const [activeTab, setActiveTab] = useState<string>('elements');
  const [isMinimized, setIsMinimized] = useState(true);

  const tabs = [
    { id: 'background', label: 'Design', icon: Palette, color: '#EC4899' },
    { id: 'elements', label: 'Éléments', icon: Plus, color: '#3B82F6' },
    { id: 'layers', label: 'Calques', icon: Layers, color: '#10B981' },
    { id: 'form', label: 'Formulaire', icon: FormInput, color: '#F59E0B' },
    { id: 'game', label: 'Jeu', icon: Gamepad2, color: '#8B5CF6' }
  ];

  // Device detection: show bottom bar only on real mobile devices
  const containerRef = useRef<HTMLDivElement>(null);
  const { isMobile, isTablet } = useMobileOptimization(containerRef, {
    preventScrollBounce: true,
    stabilizeViewport: true,
    optimizeTouchEvents: true,
    preventZoomGestures: false
  });

  // Disable auto-open on mobile for specific editor routes
  const location = useLocation();
  const disableAutoOpen = isMobile && (location.pathname === '/design-editor' || location.pathname === '/template-editor');

  // Auto-ouverture si un élément est sélectionné
  useEffect(() => {
    if (selectedElement && !disableAutoOpen) {
      setActiveTab('elements');
      setIsMinimized(false);
    }
  }, [selectedElement, disableAutoOpen]);

  // Prefetch on hover/touch to smooth first render of heavy tabs
  const prefetchTab = (tabId: string) => {
    if (tabId === 'layers') {
      loadLayersPanel();
    }
  };

  // Idle prefetch for heavy tabs to reduce first-open delay without blocking startup
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
      } catch (_) {
        // best-effort
      }
    });
    return () => cancel(id);
  }, [activeTab]);

  const renderPanel = (tabId: string) => {
    switch (tabId) {
      case 'elements':
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
            currentBackground={currentBackground}
          />
        );
      case 'layers':
        return (
          <React.Suspense fallback={<div className="p-4 text-sm text-gray-500">Chargement des calques…</div>}>
            <LazyLayersPanel 
              elements={elements} 
              onElementsChange={onElementsChange || (() => {})} 
            />
          </React.Suspense>
        );
      case 'form':
        return (
          <div className="p-4">
            <ModernFormTab campaign={campaign} setCampaign={setCampaign as any} />
          </div>
        );
      case 'game':
        return <div className="p-4" />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef}>
      {/* Overlay (mobile only) */}
      {(isMobile || isTablet) && (
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-30"
              data-canvas-ui="1"
              onClick={() => setIsMinimized(true)}
            />
          )}
        </AnimatePresence>
      )}

      {/* Bottom Drawer (mobile only) */}
      {(isMobile || isTablet) && (
        <motion.div
          initial={false}
          animate={{
            y: isMinimized ? '100%' : '20%'
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="mobile-sidebar-drawer fixed left-0 right-0 z-40 bg-white rounded-t-3xl shadow-2xl border-t border-gray-200"
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
            onClick={() => setIsMinimized(true)}
            onTouchEnd={() => setIsMinimized(true)}
          >
            <div 
              className="w-12 h-1.5 bg-gray-300 rounded-full"
              role="button"
              aria-label="Fermer le tiroir"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); setIsMinimized(true); }}
              onTouchEnd={(e) => { e.stopPropagation(); setIsMinimized(true); }}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsMinimized(true); } }}
              style={{ touchAction: 'manipulation' }}
            />
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
                className="flex-1 overflow-y-auto p-4 panel-content scrollable-area"
                style={{
                  height: 'calc(85vh - 100px)',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {renderPanel(activeTab)}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Persistent Bottom Tab Bar (mobile only) - real mobile devices only */}
      {(isMobile || isTablet) && (
        <div
          id="mobile-toolbar"
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
            visibility: 'visible' as const,
            opacity: 1,
            display: 'block'
          }}
          data-canvas-ui="1"
        >
          <div className="flex items-center justify-between px-2 py-2 gap-2">
            {/* Undo/Redo controls */}
            <div className="flex items-center gap-2">
              <button
                aria-label="Annuler"
                disabled={!canUndo}
                onClick={() => canUndo && onUndo && onUndo()}
                className={`p-2 rounded-md border ${canUndo ? 'text-gray-700 border-gray-300 active:scale-95' : 'text-gray-400 border-gray-200'} bg-white`}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                aria-label="Rétablir"
                disabled={!canRedo}
                onClick={() => canRedo && onRedo && onRedo()}
                className={`p-2 rounded-md border ${canRedo ? 'text-gray-700 border-gray-300 active:scale-95' : 'text-gray-400 border-gray-200'} bg-white`}
              >
                <RotateCw className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center justify-around flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setIsMinimized(false);
                    }}
                    onMouseEnter={() => prefetchTab(tab.id)}
                    onTouchStart={() => prefetchTab(tab.id)}
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
        </div>
      )}

      {/* CSS pour améliorer le scroll */}
      <style>{`
        .scrollable-content {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E0 transparent;
        }
        
        .scrollable-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollable-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollable-content::-webkit-scrollbar-thumb {
          background-color: #CBD5E0;
          border-radius: 3px;
        }
        
        .scrollable-content::-webkit-scrollbar-thumb:hover {
          background-color: #A0AEC0;
        }
      `}</style>
    </div>
  );
};

export default MobileSidebarDrawer;