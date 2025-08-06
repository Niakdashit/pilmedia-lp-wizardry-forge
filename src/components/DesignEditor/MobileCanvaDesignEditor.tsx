import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Type, Image, Settings, Gamepad2, Download, 
  Smartphone, Tablet, Monitor, Undo2, Redo2, Save,
  Play, Pause, ChevronUp, ChevronDown, Palette,
  Trash2, Eye, Bold, Italic
} from 'lucide-react';

import DesignCanvas from './DesignCanvas';
import FunnelUnlockedGame from '../funnels/FunnelUnlockedGame';
import { useEditorStore } from '../../stores/editorStore';
import { useUndoRedo } from '../../hooks/useUndoRedo';

interface MobileCanvaDesignEditorProps {
  className?: string;
}

const MobileCanvaDesignEditor: React.FC<MobileCanvaDesignEditorProps> = ({ className = '' }) => {
  // Store centralisé
  const { 
    setCampaign,
    setIsLoading,
    setIsModified
  } = useEditorStore();

  // Détection automatique du zoom optimal selon l'appareil
  const getOptimalZoom = useCallback((device: 'desktop' | 'tablet' | 'mobile'): number => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Canvas de référence : 800x600px
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // Marges pour l'interface mobile
    const marginTop = 160; // Header + device selection
    const marginBottom = 160; // Bottom tabs
    const marginSide = 20;
    
    const availableWidth = screenWidth - marginSide * 2;
    const availableHeight = screenHeight - marginTop - marginBottom;
    
    const zoomWidth = availableWidth / canvasWidth;
    const zoomHeight = availableHeight / canvasHeight;
    
    // Prendre le plus petit zoom pour que tout soit visible
    return Math.min(zoomWidth, zoomHeight, 1) * 0.9; // 0.9 pour laisser un peu de marge
  }, []);

  // États principaux avec zoom adaptatif
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('mobile');
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [canvasBackground, setCanvasBackground] = useState<{ type: 'color' | 'image'; value: string }>({
    type: 'color',
    value: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)'
  });
  const [canvasZoom, setCanvasZoom] = useState(() => getOptimalZoom('mobile'));
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [extractedColors] = useState<string[]>([]);
  const [showFunnel, setShowFunnel] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState<any>({
    design: { wheelConfig: { scale: 2 } }
  });

  // États pour l'interface mobile
  const [activeTab, setActiveTab] = useState<'elements' | 'design' | 'layers' | 'text' | 'images' | 'settings' | 'game' | 'export'>('elements');
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState(false);

  // Gestion du changement d'appareil avec recalcul du zoom
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
    setCanvasZoom(getOptimalZoom(device));
  };

  // Gestion des éléments avec historique
  const handleAddElement = useCallback((element: any) => {
    setCanvasElements(prev => [...prev, element]);
    setSelectedElement(element);
  }, []);

  const handleElementUpdate = useCallback((updates: any) => {
    if (selectedElement) {
      const updatedElement = { ...selectedElement, ...updates };
      setCanvasElements(prev => prev.map(el => el.id === selectedElement.id ? updatedElement : el));
      setSelectedElement(updatedElement);
    }
  }, [selectedElement]);

  const handleBackgroundChange = useCallback((bg: any) => {
    setCanvasBackground(bg);
  }, []);

  // Système d'historique
  const {
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (restoredSnapshot) => {
      if (restoredSnapshot) {
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onRedo: (restoredSnapshot) => {
      if (restoredSnapshot) {
        setCampaignConfig(restoredSnapshot.campaignConfig || {});
        setCanvasElements(restoredSnapshot.canvasElements || []);
        setCanvasBackground(restoredSnapshot.canvasBackground || { type: 'color', value: '#ffffff' });
        setSelectedElement(null);
      }
    },
    onStateChange: () => {
      setIsModified(true);
    }
  });

  // Configuration campagne complète
  const campaignData = useMemo(() => ({
    id: 'wheel-design-preview',
    name: 'Ma Campagne',
    type: 'wheel' as const,
    design: {
      background: canvasBackground.value || '#ffffff',
      customTexts: canvasElements.filter(el => el.type === 'text'),
      customImages: canvasElements.filter(el => el.type === 'image'),
      extractedColors: extractedColors,
      customColors: {
        primary: extractedColors[0] || '#841b60',
        secondary: extractedColors[1] || '#4ecdc4',
        accent: extractedColors[2] || '#45b7d1'
      }
    },
    gameConfig: {
      wheel: {
        segments: [
          { id: '1', label: 'Prix 1', color: extractedColors[0] || '#841b60', probability: 0.25, isWinning: true },
          { id: '2', label: 'Prix 2', color: extractedColors[1] || '#4ecdc4', probability: 0.25, isWinning: true }
        ],
        winProbability: 0.75,
        maxWinners: 100,
        buttonLabel: 'Faire tourner'
      }
    },
    buttonConfig: {
      text: 'Faire tourner',
      color: extractedColors[0] || '#841b60',
      textColor: '#ffffff',
      borderRadius: '8px'
    },
    canvasConfig: {
      elements: canvasElements,
      background: canvasBackground,
      device: selectedDevice
    }
  }), [canvasElements, canvasBackground, extractedColors, selectedDevice]);

  // Synchronisation avec le store
  useEffect(() => {
    if (campaignData) {
      setCampaign(campaignData);
    }
  }, [campaignData, setCampaign]);

  // Actions
  const handleSave = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsModified(false);
    setIsLoading(false);
  };

  const handlePreview = () => {
    setShowFunnel(!showFunnel);
  };

  // Configuration des onglets
  const tabs = [
    { id: 'elements', label: 'Éléments', icon: Layers },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'layers', label: 'Calques', icon: Layers },
    { id: 'text', label: 'Texte', icon: Type },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'settings', label: 'Réglages', icon: Settings },
    { id: 'game', label: 'Jeu', icon: Gamepad2 },
    { id: 'export', label: 'Export', icon: Download }
  ];

  const deviceButtons = [
    { id: 'mobile', icon: Smartphone, label: 'Mobile' },
    { id: 'tablet', icon: Tablet, label: 'Tablette' },
    { id: 'desktop', icon: Monitor, label: 'Desktop' }
  ];

  return (
    <div className={`h-screen bg-white flex flex-col overflow-hidden ${className}`}>
      {/* Header Prosplay */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Prosplay Design</h1>
              <p className="text-xs text-white/80">Studio de création mobile</p>
            </div>
          </div>
          
          {/* Actions header */}
          <div className="flex items-center space-x-2">
            {!showFunnel && (
              <>
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-2 bg-white/10 rounded-lg disabled:opacity-50"
                  title="Annuler"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-2 bg-white/10 rounded-lg disabled:opacity-50"
                  title="Rétablir"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleSave}
                  className="p-2 bg-white/10 rounded-lg"
                  title="Sauvegarder"
                >
                  <Save className="w-4 h-4" />
                </button>
              </>
            )}
            <button
              onClick={handlePreview}
              className="p-2 bg-white/20 rounded-lg"
              title={showFunnel ? "Mode édition" : "Prévisualiser"}
            >
              {showFunnel ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Sélection d'appareil */}
        {!showFunnel && (
          <div className="flex items-center justify-center mt-3 space-x-1 bg-white/10 rounded-xl p-1">
            {deviceButtons.map(device => (
              <button
                key={device.id}
                onClick={() => handleDeviceChange(device.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedDevice === device.id 
                    ? 'bg-white/20 text-white' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <device.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{device.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showFunnel ? (
          /* Mode prévisualisation */
          <div className="flex-1 flex items-center justify-center bg-gray-100">
            <div className="relative w-full h-full flex items-center justify-center">
              <FunnelUnlockedGame
                campaign={campaignData}
                previewMode={selectedDevice}
              />
            </div>
          </div>
        ) : (
          /* Mode édition */
          <>
            {/* Zone canvas principale */}
            <div className="flex-1 flex overflow-hidden bg-gray-50">
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full max-w-4xl mx-auto">
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
                    onShowEffectsPanel={() => {}}
                    onShowAnimationsPanel={() => {}}
                    onShowPositionPanel={() => {}}
                  />
                </div>
              </div>
            </div>

            {/* Barre d'onglets en bas */}
            <div className="bg-white border-t border-gray-200 flex-shrink-0">
              {/* Bouton pour agrandir/réduire le panneau */}
              <div className="flex items-center justify-center py-2 border-b border-gray-100">
                <button
                  onClick={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
                  className="flex items-center space-x-2 px-4 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  {isBottomPanelExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                  <span>{isBottomPanelExpanded ? 'Réduire' : 'Agrandir'}</span>
                </button>
              </div>

              {/* Onglets */}
              <div className="flex overflow-x-auto scrollbar-hide">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-shrink-0 flex flex-col items-center space-y-1 px-4 py-3 min-w-[80px] text-xs transition-all ${
                        activeTab === tab.id
                          ? 'text-purple-600 bg-purple-50 border-t-2 border-purple-600'
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Panneau coulissant avec toutes les fonctionnalités */}
              <AnimatePresence>
                {isBottomPanelExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="bg-white border-t border-gray-200 overflow-hidden"
                  >
                    <div className="max-h-80 overflow-y-auto">
                      <div className="p-4">
                        {/* Contenu complet selon l'onglet actif */}
                        {activeTab === 'elements' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Ajouter des éléments</h3>
                            <div className="grid grid-cols-2 gap-3">
                              <button
                                onClick={() => handleAddElement({
                                  id: `text-${Date.now()}`,
                                  type: 'text',
                                  content: 'Nouveau texte',
                                  style: { fontSize: '16px', color: '#000000' },
                                  position: { x: 100, y: 100 }
                                })}
                                className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Type className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Texte</span>
                              </button>
                              <button
                                onClick={() => handleAddElement({
                                  id: `image-${Date.now()}`,
                                  type: 'image',
                                  src: 'https://via.placeholder.com/150x150/cccccc/666666?text=Image',
                                  position: { x: 150, y: 150 },
                                  size: { width: 150, height: 150 }
                                })}
                                className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <Image className="w-5 h-5 text-gray-600" />
                                <span className="text-sm font-medium">Image</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {activeTab === 'layers' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Gestion des calques</h3>
                            <div className="space-y-2">
                              {canvasElements.map((element) => (
                                <div
                                  key={element.id}
                                  onClick={() => setSelectedElement(element)}
                                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                                    selectedElement?.id === element.id
                                      ? 'border-purple-300 bg-purple-50'
                                      : 'border-gray-200 hover:border-gray-300'
                                  }`}
                                >
                                  <div className="flex items-center space-x-3">
                                    {element.type === 'text' ? (
                                      <Type className="w-4 h-4 text-gray-500" />
                                    ) : (
                                      <Image className="w-4 h-4 text-gray-500" />
                                    )}
                                    <span className="text-sm font-medium">
                                      {element.type === 'text' ? element.content : 'Image'}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <button className="p-1 hover:bg-gray-100 rounded">
                                      <Eye className="w-3 h-3 text-gray-400" />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCanvasElements(prev => prev.filter(el => el.id !== element.id));
                                      }}
                                      className="p-1 hover:bg-gray-100 rounded"
                                    >
                                      <Trash2 className="w-3 h-3 text-gray-400" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {canvasElements.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                  Aucun élément sur le canvas
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {activeTab === 'design' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Design et couleurs</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Arrière-plan
                                </label>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleBackgroundChange({
                                      type: 'color',
                                      value: '#ffffff'
                                    })}
                                    className="w-8 h-8 bg-white border-2 border-gray-300 rounded"
                                  />
                                  <button
                                    onClick={() => handleBackgroundChange({
                                      type: 'color',
                                      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                    })}
                                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'text' && selectedElement?.type === 'text' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Propriétés du texte</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Contenu
                                </label>
                                <input
                                  type="text"
                                  value={selectedElement.content || ''}
                                  onChange={(e) => handleElementUpdate({ content: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleElementUpdate({
                                    style: {
                                      ...selectedElement.style,
                                      fontWeight: selectedElement.style?.fontWeight === 'bold' ? 'normal' : 'bold'
                                    }
                                  })}
                                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg border transition-colors ${
                                    selectedElement.style?.fontWeight === 'bold'
                                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <Bold className="w-4 h-4" />
                                  <span className="text-sm">Gras</span>
                                </button>
                                <button
                                  onClick={() => handleElementUpdate({
                                    style: {
                                      ...selectedElement.style,
                                      fontStyle: selectedElement.style?.fontStyle === 'italic' ? 'normal' : 'italic'
                                    }
                                  })}
                                  className={`flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg border transition-colors ${
                                    selectedElement.style?.fontStyle === 'italic'
                                      ? 'bg-purple-100 border-purple-300 text-purple-700'
                                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                                  }`}
                                >
                                  <Italic className="w-4 h-4" />
                                  <span className="text-sm">Italique</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'text' && (!selectedElement || selectedElement.type !== 'text') && (
                          <div className="text-center py-8">
                            <Type className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">Sélectionnez un élément texte pour modifier ses propriétés</p>
                          </div>
                        )}

                        {activeTab === 'export' && (
                          <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Exporter le projet</h3>
                            <div className="space-y-3">
                              <button
                                onClick={handleSave}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <Save className="w-5 h-5" />
                                <span>Sauvegarder</span>
                              </button>
                              <button 
                                onClick={handlePreview}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Play className="w-5 h-5" />
                                <span>Prévisualiser</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileCanvaDesignEditor;