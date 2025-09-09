import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Save, Eye, X, Settings, FileText, Palette, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

import { useEditorStore } from '../../stores/editorStore';
import { useCampaigns } from '../../hooks/useCampaigns';
import { useUndoRedo, useUndoRedoShortcuts } from '../../hooks/useUndoRedo';

// Lazy imports pour optimiser les performances
const FormDesignCanvas = React.lazy(() => import('./components/FormDesignCanvas'));
const FormFieldsPanel = React.lazy(() => import('./panels/FormFieldsPanel'));
const FormDesignPanel = React.lazy(() => import('./panels/FormDesignPanel'));
const FormValidationPanel = React.lazy(() => import('./panels/FormValidationPanel'));
const FormPreviewModal = React.lazy(() => import('./components/FormPreviewModal'));

interface FormEditorLayoutProps {
  mode?: 'template' | 'campaign';
}

const FormEditorLayout: React.FC<FormEditorLayoutProps> = ({ mode = 'campaign' }) => {
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
  const [activeTab, setActiveTab] = useState('fields');
  const [showPreview, setShowPreview] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Configuration du formulaire
  const [formConfig, setFormConfig] = useState({
    type: 'form',
    name: 'Mon Formulaire',
    fields: [
      {
        id: 'email',
        type: 'email',
        label: 'Adresse email',
        placeholder: 'votre@email.com',
        required: true,
        validation: {
          pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          message: 'Veuillez saisir une adresse email valide'
        }
      },
      {
        id: 'firstName',
        type: 'text',
        label: 'Prénom',
        placeholder: 'Votre prénom',
        required: true,
        validation: {
          minLength: 2,
          message: 'Le prénom doit contenir au moins 2 caractères'
        }
      }
    ],
    design: {
      background: { type: 'color' as const, value: '#f8fafc' },
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      borderRadius: 8,
      spacing: 'normal',
      layout: 'vertical'
    },
    validation: {
      showErrorsOnSubmit: true,
      showSuccessMessage: true,
      successMessage: 'Merci ! Votre formulaire a été envoyé avec succès.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.'
    },
    buttonConfig: {
      text: 'Envoyer',
      color: '#3b82f6',
      textColor: '#ffffff',
      loadingText: 'Envoi en cours...'
    },
    settings: {
      collectAnalytics: true,
      enableSpamProtection: true,
      redirectAfterSubmit: '',
      emailNotifications: true
    }
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
        setFormConfig(restoredSnapshot);
      }
    },
    onRedo: (restoredSnapshot) => {
      if (restoredSnapshot) {
        setFormConfig(restoredSnapshot);
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
    
    if (template && template.type === 'form') {
      setFormConfig(prev => ({
        ...prev,
        ...template,
        type: 'form'
      }));
    }
  }, [location]);

  // Synchronisation avec le store
  useEffect(() => {
    setCampaign(formConfig);
    setPreviewDevice(selectedDevice);
  }, [formConfig, selectedDevice, setCampaign, setPreviewDevice]);

  // Gestionnaire de mise à jour de la configuration
  const handleConfigUpdate = useCallback((updates: any) => {
    setFormConfig(prev => {
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
      const saved = await saveCampaign(formConfig);
      if (saved?.id && !formConfig.id) {
        setFormConfig(prev => ({ ...prev, id: saved.id }));
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
    { id: 'fields', label: 'Champs', icon: FileText },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'validation', label: 'Validation', icon: CheckSquare },
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
              Éditeur Formulaire
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
                {activeTab === 'fields' && (
                  <FormFieldsPanel
                    config={formConfig}
                    onConfigUpdate={handleConfigUpdate}
                  />
                )}
                {activeTab === 'design' && (
                  <FormDesignPanel
                    config={formConfig}
                    onConfigUpdate={handleConfigUpdate}
                  />
                )}
                {activeTab === 'validation' && (
                  <FormValidationPanel
                    config={formConfig}
                    onConfigUpdate={handleConfigUpdate}
                  />
                )}
                {activeTab === 'settings' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Paramètres avancés</h3>
                    <p className="text-sm text-gray-600">
                      Configuration avancée du formulaire
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
              {formConfig.name}
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
            <FormDesignCanvas
              config={formConfig}
              selectedDevice={selectedDevice}
            />
          </React.Suspense>
        </div>
      </div>

      {/* Modal de prévisualisation */}
      {showPreview && (
        <React.Suspense fallback={null}>
          <FormPreviewModal
            isOpen={showPreview}
            config={formConfig}
            onClose={() => setShowPreview(false)}
          />
        </React.Suspense>
      )}
    </div>
  );
};

export default FormEditorLayout;
