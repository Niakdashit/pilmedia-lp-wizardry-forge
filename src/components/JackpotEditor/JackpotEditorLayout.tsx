import React, { useState, useMemo, useEffect, useRef, useCallback, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Save, X } from 'lucide-react';
import GradientBand from '../shared/GradientBand';
import ZoomSlider from '../ModelEditor/components/ZoomSlider';
import JackpotCanvas from './JackpotCanvas';
import JackpotConfigPanel from './JackpotConfigPanel';
import { useEditorStore } from '../../stores/editorStore';
import { useKeyboardShortcuts } from '../ModernEditor/hooks/useKeyboardShortcuts';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';
import { getDeviceDimensions } from '../../utils/deviceDimensions';
import { useCampaigns } from '@/hooks/useCampaigns';
import { createSaveAndContinueHandler, saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';

const KeyboardShortcutsHelp = lazy(() => import('../shared/KeyboardShortcutsHelp'));
const MobileStableEditor = lazy(() => import('../ModelEditor/components/MobileStableEditor'));

interface JackpotEditorLayoutProps {
  mode?: 'template' | 'campaign';
  hiddenTabs?: string[];
}

const JackpotEditorLayout: React.FC<JackpotEditorLayoutProps> = ({ mode = 'campaign', hiddenTabs }) => {
  const navigate = useNavigate();
  
  // Détection automatique de l'appareil
  const detectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  };

  const [actualDevice, setActualDevice] = useState<'desktop' | 'tablet' | 'mobile'>(detectDevice());

  // Zoom par défaut selon l'appareil
  const getDefaultZoom = (device: 'desktop' | 'tablet' | 'mobile'): number => {
    try {
      const saved = localStorage.getItem(`jackpot-editor-zoom-${device}`);
      if (saved) {
        const v = parseFloat(saved);
        if (!Number.isNaN(v) && v >= 0.1 && v <= 1) return v;
      }
    } catch (e) {
      console.warn('Failed to load saved zoom:', e);
    }
    
    switch (device) {
      case 'mobile': return 0.4;
      case 'tablet': return 0.6;
      default: return 0.8;
    }
  };

  // États principaux
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [zoom, setZoom] = useState(() => getDefaultZoom(actualDevice));
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('config');
  
  // Configuration du jackpot
  const [jackpotConfig, setJackpotConfig] = useState({
    containerColor: '#1f2937',
    slotBackgroundColor: '#ffffff',
    slotBorderColor: '#e5e7eb',
    buttonColor: '#ec4899',
    borderStyle: 'classic' as const,
    borderWidth: 3,
    symbols: ['🍒', '🍋', '🍊', '🍇', '🔔', '💎', '⭐', '🎰'],
    winProbability: 0.3,
    backgroundImage: ''
  });

  // Background du canvas
  const [canvasBackground, setCanvasBackground] = useState({
    type: 'color' as const,
    value: '#f3f4f6'
  });

  // Gestion du zoom
  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
    try {
      localStorage.setItem(`jackpot-editor-zoom-${actualDevice}`, newZoom.toString());
    } catch (e) {
      console.warn('Failed to save zoom:', e);
    }
  }, [actualDevice]);

  // Gestion de la configuration
  const handleConfigChange = useCallback((updates: any) => {
    setJackpotConfig(prev => ({ ...prev, ...updates }));
  }, []);

  // Raccourcis clavier
  useKeyboardShortcuts({
    onSave: () => console.log('Save shortcut'),
    onUndo: () => console.log('Undo shortcut'),
    onRedo: () => console.log('Redo shortcut'),
    onDelete: () => console.log('Delete shortcut'),
    onDuplicate: () => console.log('Duplicate shortcut'),
    onSelectAll: () => console.log('Select all shortcut'),
    onZoomIn: () => handleZoomChange(Math.min(zoom + 0.1, 1)),
    onZoomOut: () => handleZoomChange(Math.max(zoom - 0.1, 0.1)),
    onZoomReset: () => handleZoomChange(getDefaultZoom(actualDevice)),
    onToggleGrid: () => console.log('Toggle grid'),
    onToggleGuides: () => console.log('Toggle guides'),
    onHelp: () => setShowKeyboardShortcuts(true)
  });

  // Dimensions du canvas
  const canvasDimensions = useMemo(() => {
    return getDeviceDimensions(selectedDevice);
  }, [selectedDevice]);

  // Mobile layout
  if (actualDevice === 'mobile') {
    return (
      <MobileStableEditor
        selectedDevice={selectedDevice}
        onDeviceChange={setSelectedDevice}
        zoom={zoom}
        onZoomChange={handleZoomChange}
        onBack={() => navigate('/')}
        onSave={() => console.log('Mobile save')}
        canSave={true}
      >
        <JackpotCanvas
          selectedDevice={selectedDevice}
          jackpotConfig={jackpotConfig}
          onConfigChange={handleConfigChange}
          background={canvasBackground}
          zoom={zoom}
          isPreview={true}
        />
      </MobileStableEditor>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      {/* Header avec gradient band */}
      <div className="relative z-20 bg-white">
        <GradientBand />
        
        <div className="relative z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
                <span className="font-medium">Jackpot Editor</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Device selector */}
              <div className="flex items-center space-x-2">
                {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                  <button
                    key={device}
                    onClick={() => setSelectedDevice(device)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedDevice === device
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {device === 'desktop' ? '🖥️' : device === 'tablet' ? '📱' : '📱'}
                    {device.charAt(0).toUpperCase() + device.slice(1)}
                  </button>
                ))}
              </div>

              <button
                onClick={() => console.log('Save')}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Sauvegarder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('config')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'config'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎰 Configuration
            </button>
            <button
              onClick={() => setSidebarTab('background')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                sidebarTab === 'background'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🎨 Arrière-plan
            </button>
          </div>

          {/* Sidebar content */}
          <div className="flex-1 overflow-y-auto">
            {sidebarTab === 'config' && (
              <JackpotConfigPanel
                config={jackpotConfig}
                onConfigChange={handleConfigChange}
              />
            )}
            
            {sidebarTab === 'background' && (
              <div className="p-4 space-y-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Arrière-plan du canvas</h3>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="backgroundType"
                        checked={canvasBackground.type === 'color'}
                        onChange={() => setCanvasBackground(prev => ({ ...prev, type: 'color' }))}
                      />
                      <span className="text-sm">Couleur unie</span>
                    </label>
                    
                    {canvasBackground.type === 'color' && (
                      <div className="flex items-center gap-2 ml-6">
                        <input
                          type="color"
                          value={canvasBackground.value}
                          onChange={(e) => setCanvasBackground(prev => ({ ...prev, value: e.target.value }))}
                          className="w-8 h-8 rounded border border-gray-300"
                        />
                        <input
                          type="text"
                          value={canvasBackground.value}
                          onChange={(e) => setCanvasBackground(prev => ({ ...prev, value: e.target.value }))}
                          className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="backgroundType"
                        checked={canvasBackground.type === 'image'}
                        onChange={() => setCanvasBackground(prev => ({ ...prev, type: 'image' }))}
                      />
                      <span className="text-sm">Image</span>
                    </label>
                    
                    {canvasBackground.type === 'image' && (
                      <div className="ml-6">
                        <input
                          type="url"
                          placeholder="URL de l'image"
                          value={canvasBackground.value}
                          onChange={(e) => setCanvasBackground(prev => ({ ...prev, value: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas toolbar */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {canvasDimensions.width} × {canvasDimensions.height}px
              </span>
            </div>
            
            <ZoomSlider
              zoom={zoom}
              onZoomChange={handleZoomChange}
              min={0.1}
              max={1}
              step={0.05}
            />
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            <JackpotCanvas
              selectedDevice={selectedDevice}
              jackpotConfig={jackpotConfig}
              onConfigChange={handleConfigChange}
              background={canvasBackground}
              zoom={zoom}
              isPreview={true}
            />
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts modal */}
      {showKeyboardShortcuts && (
        <KeyboardShortcutsHelp onClose={() => setShowKeyboardShortcuts(false)} />
      )}
    </div>
  );
};

export default JackpotEditorLayout;
