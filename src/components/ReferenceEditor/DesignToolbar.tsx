'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Monitor, Smartphone, Save, Eye, X, Undo, Redo, Layers, Settings } from 'lucide-react';
import CampaignSettingsModal from '@/components/DesignEditor/modals/CampaignSettingsModal';
import CampaignValidationModal from '@/components/shared/CampaignValidationModal';
import { useCampaignValidation } from '@/hooks/useCampaignValidation';
import { useCampaigns } from '@/hooks/useCampaigns';
import { saveCampaignToDB } from '@/hooks/useModernCampaignEditor/saveHandler';
import { useEditorStore } from '@/stores/editorStore';

interface QuizToolbarProps {
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onDeviceChange: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onPreviewToggle?: () => void;
  isPreviewMode?: boolean;
  // Props pour undo/redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Contrôle de la position du bouton d'aperçu (gauche/droite)
  previewButtonSide?: 'left' | 'right';
  onPreviewButtonSideChange?: (side: 'left' | 'right') => void;
  // Mode de l'éditeur: influence le libellé du bouton d'enregistrement
  mode?: 'template' | 'campaign';
  // Action à exécuter lors du clic sur "Sauvegarder et quitter"
  onSave?: () => void;
  // Permet de masquer les boutons Fermer / Sauvegarder et quitter dans la barre du haut
  showSaveCloseButtons?: boolean;
  // Campaign ID for settings modal
  campaignId?: string;
}

const QuizToolbar: React.FC<QuizToolbarProps> = React.memo(({
  selectedDevice,
  onDeviceChange,
  onPreviewToggle,
  isPreviewMode = false,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  previewButtonSide = 'right',
  onPreviewButtonSideChange,
  mode = 'campaign',
  onSave,
  showSaveCloseButtons = true,
  campaignId
}) => {
  const navigate = useNavigate();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const { validateCampaign } = useCampaignValidation();
  const { saveCampaign } = useCampaigns();
  const campaignState = useEditorStore((s) => s.campaign);
  const setCampaign = useEditorStore((s) => s.setCampaign);
  
  const saveDesktopLabel = mode === 'template' ? 'Enregistrer template' : 'Sauvegarder et quitter';
  const saveMobileLabel = mode === 'template' ? 'Enregistrer' : 'Sauvegarder';

  // Ouvre la modale Paramètres si un autre composant émet l'événement global
  useEffect(() => {
    const handler = () => setIsSettingsModalOpen(true);
    window.addEventListener('openCampaignSettingsModal', handler as any);
    
    // Auto-open settings modal if URL contains openSettings=true
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('openSettings') === 'true') {
      setIsSettingsModalOpen(true);
      // Clean up URL parameter
      urlParams.delete('openSettings');
      const newUrl = urlParams.toString() 
        ? `${window.location.pathname}?${urlParams.toString()}`
        : window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    
    return () => window.removeEventListener('openCampaignSettingsModal', handler as any);
  }, []);

  // Ensure a campaign exists before opening settings
  const handleOpenSettings = useCallback(async () => {
    try {
      if (campaignId) {
        setIsSettingsModalOpen(true);
        return;
      }

      const payload: any = {
        ...(campaignState || {}),
        name: (campaignState as any)?.name || 'Nouvelle campagne quiz',
        type: 'quiz',
        status: (campaignState as any)?.status || 'draft',
        design: (campaignState as any)?.design || {},
        config: (campaignState as any)?.config || {},
        game_config: (campaignState as any)?.game_config || (campaignState as any)?.gameConfig || {},
        form_fields: (campaignState as any)?.form_fields || (campaignState as any)?.formFields || [],
      };

      const saved = await saveCampaignToDB(payload, saveCampaign);
      if (saved?.id) {
        setCampaign((prev: any) => ({ ...prev, id: saved.id }));
        setIsSettingsModalOpen(true);
      } else {
        alert("Impossible de créer la campagne. Veuillez réessayer.");
      }
    } catch (e) {
      console.error('[QuizToolbar] Failed to ensure campaign before opening settings', e);
      alert('Erreur lors de la création de la campagne');
    }
  }, [campaignId, campaignState, saveCampaign, setCampaign]);
  
  // Handler pour "Sauvegarder et quitter" -> Valide, sauvegarde puis redirige vers dashboard
  const handleSaveAndQuit = async () => {
    // Valider les paramètres obligatoires
    const validation = validateCampaign();
    
    if (!validation.isValid) {
      // Afficher la modale d'erreur
      setIsValidationModalOpen(true);
      return;
    }
    
    // Sauvegarder
    if (onSave) {
      await onSave();
    }
    
    // Rediriger vers la liste des campagnes
    navigate('/campaigns');
  };
  
  // Récupérer les erreurs de validation pour la modale
  const validation = validateCampaign();
  
  return (
    <>
      <CampaignSettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        campaignId={(campaignState as any)?.id || campaignId}
      />
      <CampaignValidationModal
        isOpen={isValidationModalOpen}
        onClose={() => setIsValidationModalOpen(false)}
        errors={validation.errors}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm rounded-tl-[18px] rounded-tr-[18px]">
      {/* Left Section - Logo/Title */}
      <div className="flex items-center space-x-3">
        <h1 className="text-lg font-bold text-gray-900 font-inter hidden">Design Editor</h1>
        <div className="flex items-center space-x-1">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canUndo 
                ? 'hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={`Annuler (${navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Z)`}
          >
            <Undo className="w-4 h-4" />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              canRedo 
                ? 'hover:bg-[hsl(var(--sidebar-hover))] text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))]' 
                : 'text-gray-400 cursor-not-allowed'
            }`}
            title={`Rétablir (${navigator.platform.includes('Mac') ? 'Cmd+Shift' : 'Ctrl+Y'}+Z)`}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Section - Device Selector */}
      <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-1 border border-[hsl(var(--sidebar-border))]">
        <button
          onClick={() => onDeviceChange('desktop')}
          className={`p-2 rounded-md transition-all duration-200 ${
            selectedDevice === 'desktop' 
              ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
          title="Desktop"
        >
          <Monitor className="w-4 h-4" />
        </button>
        {/* Tablet button removed */}
        <button
          onClick={() => onDeviceChange('mobile')}
          className={`p-2 rounded-md transition-all duration-200 ${
            selectedDevice === 'mobile' 
              ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]' 
              : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
          }`}
          title="Mobile"
        >
          <Smartphone className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center space-x-1">
        <button 
          onClick={() => navigate('/templates-editor')}
          className="hidden flex items-center px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Parcourir les modèles"
          aria-hidden="true"
        >
          <Layers className="w-4 h-4 mr-1" />
          Modèles
        </button>
        {/* Position du bouton d'aperçu */}
        <div className="flex items-center bg-[hsl(var(--sidebar-surface))] rounded-lg p-0.5 border border-[hsl(var(--sidebar-border))] mr-2">
          <button
            onClick={() => onPreviewButtonSideChange && onPreviewButtonSideChange('left')}
            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
              previewButtonSide === 'left'
                ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]'
                : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
            }`}
            title="Bouton Aperçu à gauche"
          >
            Gauche
          </button>
          <button
            onClick={() => onPreviewButtonSideChange && onPreviewButtonSideChange('right')}
            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
              previewButtonSide === 'right'
                ? 'bg-white shadow-sm text-[hsl(var(--sidebar-icon-active))] ring-1 ring-[hsl(var(--sidebar-glow))]'
                : 'text-[hsl(var(--sidebar-icon))] hover:text-[hsl(var(--sidebar-icon-active))] hover:bg-[hsl(var(--sidebar-hover))]'
            }`}
            title="Bouton Aperçu à droite"
          >
            Droite
          </button>
        </div>
        <button 
          onClick={() => {
            if (campaignId) {
              navigate(`/preview/${campaignId}`);
            } else {
              onPreviewToggle?.();
            }
          }}
          className="flex items-center px-2.5 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors border-gray-300 hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-1" />
          Aperçu
        </button>
        <button
          onClick={handleOpenSettings}
          className={`flex items-center px-2.5 py-1.5 text-xs sm:text-sm border rounded-lg transition-colors border-gray-300 hover:bg-gray-50`}
          title={campaignId ? "Paramètres de la campagne" : "Créer et ouvrir les paramètres"}
        >
          <Settings className="w-4 h-4 mr-1" />
          Paramètres
        </button>
        {showSaveCloseButtons && (
          <>
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-2.5 py-1.5 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Fermer
            </button>
            <button 
              onClick={handleSaveAndQuit}
              disabled={!campaignId}
              className={`flex items-center px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                campaignId
                  ? 'bg-[#44444d] text-white hover:opacity-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title={campaignId ? saveDesktopLabel : "Veuillez d'abord créer la campagne"}
            >
              <Save className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{saveDesktopLabel}</span>
              <span className="sm:hidden">{saveMobileLabel}</span>
            </button>
          </>
        )}
      </div>
    </div>
    </>
  );
});

QuizToolbar.displayName = 'QuizToolbar';

export default QuizToolbar;
