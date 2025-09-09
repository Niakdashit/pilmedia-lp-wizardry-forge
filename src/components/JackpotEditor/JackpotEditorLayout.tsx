import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Eye, X, Settings, Palette, Trophy, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

import { useEditorStore } from '../../stores/editorStore';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';

// Lazy imports pour optimiser les performances
const JackpotDesignCanvas = React.lazy(() => import('./components/JackpotDesignCanvas'));
const JackpotGamePanel = React.lazy(() => import('./panels/JackpotGamePanel'));
const JackpotDesignPanel = React.lazy(() => import('./panels/JackpotDesignPanel'));
const JackpotPrizesPanel = React.lazy(() => import('./panels/JackpotPrizesPanel'));
const JackpotPreviewModal = React.lazy(() => import('./components/JackpotPreviewModal'));

interface JackpotEditorLayoutProps {
  mode?: 'template' | 'campaign';
}

const JackpotEditorLayout: React.FC<JackpotEditorLayoutProps> = ({ mode = 'campaign' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Store centralisé
  const { 
    setCampaign,
    setPreviewDevice,
    setIsLoading,
    setIsModified
  } = useEditorStore();
  
  const campaignState = useEditorStore((s) => s.campaign);
  const { saveCampaign } = useCampaigns();
  
  // États locaux
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState('game');
  const [showPreview, setShowPreview] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Configuration de la campagne Jackpot
  const [jackpotConfig, setJackpotConfig] = useState({
    type: 'jackpot',
    name: 'Mon Jackpot',
    gameConfig: {
      jackpot: {
        buttonLabel: 'Lancer le Jackpot',
        buttonColor: '#ec4899',
        containerBackgroundColor: '#1f2937',
        backgroundColor: '#c4b5fd30',
        borderColor: '#8b5cf6',
        borderWidth: 3,
        slotBorderColor: '#a78bfa',
        slotBorderWidth: 2,
        slotBackgroundColor: '#ffffff',
        instantWin: {
          mode: 'instant_winner' as const,
          winProbability: 30,
          maxWinners: 100,
          winnersCount: 0
        }
      }
    },
    buttonConfig: {
      text: 'Lancer le Jackpot',
      color: '#ec4899',
      textColor: '#ffffff'
    },
    design: {
      background: { type: 'color' as const, value: '#f8fafc' },
      extractedColors: ['#ec4899', '#8b5cf6', '#a78bfa']
    },
    prizes: []
  });

  // Système d'historique pour undo/redo
  const {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo
  } = useUndoRedo({
    maxHistorySize: 50,
    onUndo: (restoredSnapshot) => {
      if (restoredSnapshot) {
        setJackpotConfig(restoredSnapshot);
      }
    },
    onRedo: (restoredSnapshot) => {
      if (restoredSnapshot) {
        setJackpotConfig(restoredSnapshot);
      }
    },
    onStateChange: () => {
      setIsModified(true);
    }
  });

  // Raccourcis clavier pour undo/redo
  useUndoRedoShortcuts(undo, redo, {
    enabled: true,
    preventDefault: true
  });

  // Chargement d'un template depuis la navigation
  useEffect(() => {
    const state = location.state as any;
    const template = state?.templateCampaign;
    
    if (template && template.type === 'jackpot') {
      setJackpotConfig(prev => ({
        ...prev,
        ...template,
        type: 'jackpot'
      }));
    }
  }, [location]);

  // Synchronisation avec le store
  useEffect(() => {
    setCampaign(jackpotConfig);
    setPreviewDevice(selectedDevice);
  }, [jackpotConfig, selectedDevice, setCampaign, setPreviewDevice]);

  // Gestionnaire de mise à jour de la configuration
  const handleConfigUpdate = useCallback((updates: any) => {
    setJackpotConfig(prev => {
      const newConfig = { ...prev, ...updates };
      
      // Ajouter à l'historique
      setTimeout(() => {
        addToHistory(newConfig, 'config_update');
      }, 0);
      
      return newConfig;
    });
  }, [addToHistory]);

  // Gestionnaire de sauvegarde
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const saved = await saveCampaign(jackpotConfig);
      if (saved?.id && !jackpotConfig.id) {
        setJackpotConfig(prev => ({ ...prev, id: saved.id }));
      }
      setIsModified(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestionnaire de prévisualisation
  const handlePreview = () => {
    setShowPreview(true);
  };

  // Gestionnaire de changement d'appareil
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    setSelectedDevice(device);
  };

  // Onglets de la sidebar
  const tabs = [
    { id: 'game', label: 'Jeu', icon: Trophy },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'prizes', label: 'Lots', icon: Trophy },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <motion.div 
        className="bg-white border-r border-gray-200 shadow-sm flex flex-col"
        initial={false}
        animate={{ width: isCollapsed ? 60 : 320 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header de la sidebar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-lg font-semibold text-gray-900">
              Éditeur Jackpot
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation des onglets */}
        <div className="flex-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="p-2">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contenu des panneaux */}
          {!isCollapsed && (
            <div className="p-4">
              <React.Suspense fallback={<div className="animate-pulse">Chargement...</div>}>
                {activeTab === 'game' && (
                  <JackpotGamePanel
                    config={jackpotConfig}
                    onConfigUpdate={handleConfigUpdate}
                  />
                )}
                {activeTab === 'design' && (
                  <JackpotDesignPanel
                    config={jackpotConfig}
                    onConfigUpdate={handleConfigUpdate}
                  />
                )}
                {activeTab === 'prizes' && (
                  <JackpotPrizesPanel
                    config={jackpotConfig}
                    onConfigUpdate={handleConfigUpdate}
                  />
                )}
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Paramètres</h3>
                    <p className="text-sm text-gray-600">
                      Configuration avancée du jackpot
                    </p>
                  </div>
                )}
              </React.Suspense>
            </div>
          )}
        </div>
      </motion.div>

      {/* Zone principale */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {jackpotConfig.name}
            </h2>
            
            {/* Sélecteur d'appareil */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
                <button
                  key={device}
                  onClick={() => handleDeviceChange(device)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedDevice === device
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {device === 'desktop' ? 'Bureau' : device === 'tablet' ? 'Tablette' : 'Mobile'}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Annuler (Ctrl+Z)"
            >
              ↶
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refaire (Ctrl+Y)"
            >
              ↷
            </button>
            
            <div className="w-px h-6 bg-gray-300" />
            
            <button
              onClick={handlePreview}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Aperçu
            </button>
            
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>

        {/* Canvas de design */}
        <div className="flex-1 overflow-hidden">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full">Chargement...</div>}>
            <JackpotDesignCanvas
              config={jackpotConfig}
              selectedDevice={selectedDevice}
              onConfigUpdate={handleConfigUpdate}
            />
          </React.Suspense>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <React.Suspense fallback={null}>
          <JackpotPreviewModal
            config={jackpotConfig}
            selectedDevice={selectedDevice}
            onClose={() => setShowPreview(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default JackpotEditorLayout;
