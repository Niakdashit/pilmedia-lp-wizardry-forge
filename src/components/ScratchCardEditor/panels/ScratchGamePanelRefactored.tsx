import React, { useState } from 'react';
import { Grid3x3, Paintbrush, Settings, ChevronDown, ChevronRight, Upload, X } from 'lucide-react';
import { useScratchCardStore } from '../state/scratchcard.store';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ScratchGamePanelProps {
  campaign?: any;
  setCampaign?: (campaign: any) => void;
}

/**
 * ScratchGamePanelRefactored - Onglet "Jeu" refactoré avec charte DesignEditor
 * Architecture: Sections pliables + labels cohérents + toggles
 */
const ScratchGamePanelRefactored: React.FC<ScratchGamePanelProps> = ({
  campaign,
  setCampaign
}) => {
  const scratchConfig = useScratchCardStore((state) => state.config);
  const updateStoreConfig = useScratchCardStore((state) => state.updateConfig);
  const updateStoreMaxCards = useScratchCardStore((state) => state.updateMaxCards);
  const updateStoreGrid = useScratchCardStore((state) => state.updateGrid);
  const updateStoreBrush = useScratchCardStore((state) => state.updateBrush);
  const updateStoreThreshold = useScratchCardStore((state) => state.updateThreshold);
  const updateStoreGlobalCover = useScratchCardStore((state) => state.updateGlobalCover);
  const updateStoreCardShape = useScratchCardStore((state) => state.updateCardShape);
  
  const [expandedSections, setExpandedSections] = useState({
    grid: true,
    scratch: true,
    cards: true,
    appearance: false
  });
  
  const [isUploading, setIsUploading] = useState(false);

  // Initialiser le store depuis campaign au montage
  const isInitialMount = React.useRef(true);
  
  React.useEffect(() => {
    if (isInitialMount.current && campaign?.scratchConfig) {
      updateStoreConfig(campaign.scratchConfig);
      isInitialMount.current = false;
    }
  }, [campaign?.scratchConfig, updateStoreConfig]);

  // Synchroniser store -> campaign
  const prevScratchConfig = React.useRef(scratchConfig);
  
  React.useEffect(() => {
    if (!setCampaign) return;
    
    const prevStr = JSON.stringify(prevScratchConfig.current);
    const nextStr = JSON.stringify(scratchConfig);
    if (prevStr === nextStr) return;
    
    prevScratchConfig.current = scratchConfig;
    
    setCampaign((prev: any) => ({
      ...prev,
      scratchConfig: { ...scratchConfig }
    }));
  }, [scratchConfig, setCampaign]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => {
      const isCurrentlyOpen = prev[section];
      // Fermer toutes les sections
      const allClosed = {
        grid: false,
        scratch: false,
        cards: false,
        appearance: false
      };
      // Si la section était fermée, l'ouvrir (sinon tout reste fermé)
      if (!isCurrentlyOpen) {
        allClosed[section] = true;
      }
      return allClosed;
    });
  };

  const gridOptions = [
    { value: 3, label: '3 cartes', layout: '(3×1)' },
    { value: 4, label: '4 cartes', layout: '(2×2)' },
    { value: 6, label: '6 cartes', layout: '(3×2)' }
  ];

  const shapeOptions = [
    { value: 'vertical-rectangle', label: 'Rectangle' },
    { value: 'square', label: 'Carré' }
  ];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `scratch-covers/${fileName}`;

      // Upload vers Supabase Storage
      const { error } = await supabase.storage
        .from('campaign-assets')
        .upload(filePath, file);

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('campaign-assets')
        .getPublicUrl(filePath);

      // Mettre à jour la configuration
      updateStoreGlobalCover({ type: 'image', url: publicUrl });
      toast.success('Image uploadée avec succès');
    } catch (error) {
      console.error('Erreur upload:', error);
      toast.error('Erreur lors de l\'upload de l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    updateStoreGlobalCover({ type: 'color', value: '#C0C0C0' });
    toast.success('Image supprimée');
  };


  return (
    <div className="flex h-full min-h-0 flex-col bg-[hsl(var(--sidebar-bg))]">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-surface))]">
        <h2 className="text-base font-semibold text-[hsl(var(--sidebar-text-primary))]">
          Configuration du jeu
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Section Grille */}
          <div className="border border-[hsl(var(--sidebar-border))] rounded-lg overflow-hidden bg-[hsl(var(--sidebar-surface))]">
            <button
              onClick={() => toggleSection('grid')}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
                <span className="text-sm font-medium text-[hsl(var(--sidebar-text-primary))]">
                  Configuration de la grille
                </span>
              </div>
              {expandedSections.grid ? (
                <ChevronDown className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
              )}
            </button>

            {expandedSections.grid && (
              <div className="px-4 py-4 space-y-4 border-t border-[hsl(var(--sidebar-border))]">
                {/* Nombre de cartes */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Nombre maximum de cartes
                  </label>
                  <p className="text-xs text-[hsl(var(--sidebar-text-secondary))] mb-3">
                    Le nombre de cartes visibles est limité globalement à 3, 4 ou 6 et s'applique sur desktop et mobile.
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {gridOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateStoreMaxCards(option.value as 3 | 4 | 6)}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${
                          scratchConfig.maxCards === option.value
                            ? 'border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]/10'
                            : 'border-[hsl(var(--sidebar-border))] hover:border-[hsl(var(--sidebar-active))]/50'
                        }`}
                      >
                        <span className="text-sm font-semibold text-[hsl(var(--sidebar-text-primary))]">
                          {option.label}
                        </span>
                        <span className="text-xs text-[hsl(var(--sidebar-text-secondary))] mt-0.5">
                          {option.layout}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Espacement */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Espacement entre les cartes (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={scratchConfig.grid?.gap || 20}
                    onChange={(e) => updateStoreGrid({ gap: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 text-sm border border-[hsl(var(--sidebar-border))] rounded-md bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text-primary))]"
                  />
                </div>

                {/* Rayon de bordure */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Rayon de bordure des cartes (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={scratchConfig.grid?.borderRadius || 24}
                    onChange={(e) => updateStoreGrid({ borderRadius: parseInt(e.target.value) || 24 })}
                    className="w-full px-3 py-2 text-sm border border-[hsl(var(--sidebar-border))] rounded-md bg-[hsl(var(--sidebar-bg))] text-[hsl(var(--sidebar-text-primary))]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Grattage */}
          <div className="border border-[hsl(var(--sidebar-border))] rounded-lg overflow-hidden bg-[hsl(var(--sidebar-surface))]">
            <button
              onClick={() => toggleSection('scratch')}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Paintbrush className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
                <span className="text-sm font-medium text-[hsl(var(--sidebar-text-primary))]">
                  Paramètres de grattage
                </span>
              </div>
              {expandedSections.scratch ? (
                <ChevronDown className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
              )}
            </button>

            {expandedSections.scratch && (
              <div className="px-4 py-4 space-y-4 border-t border-[hsl(var(--sidebar-border))]">
                {/* Taille du pinceau */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Taille du pinceau: {scratchConfig.brush?.radius || 25}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={scratchConfig.brush?.radius || 25}
                    onChange={(e) => updateStoreBrush({ radius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                {/* Seuil de révélation */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Seuil de révélation: {Math.round((scratchConfig.threshold || 0.7) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={Math.round((scratchConfig.threshold || 0.7) * 100)}
                    onChange={(e) => updateStoreThreshold(parseInt(e.target.value) / 100)}
                    className="w-full"
                  />
                </div>

                {/* Douceur */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Douceur: {Math.round((scratchConfig.brush?.softness || 0.5) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round((scratchConfig.brush?.softness || 0.5) * 100)}
                    onChange={(e) => updateStoreBrush({ softness: parseInt(e.target.value) / 100 })}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section Apparence */}
          <div className="border border-[hsl(var(--sidebar-border))] rounded-lg overflow-hidden bg-[hsl(var(--sidebar-surface))]">
            <button
              onClick={() => toggleSection('appearance')}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[hsl(var(--sidebar-hover))] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
                <span className="text-sm font-medium text-[hsl(var(--sidebar-text-primary))]">
                  Apparence
                </span>
              </div>
              {expandedSections.appearance ? (
                <ChevronDown className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[hsl(var(--sidebar-text-secondary))]" />
              )}
            </button>

            {expandedSections.appearance && (
              <div className="px-4 py-4 space-y-4 border-t border-[hsl(var(--sidebar-border))]">
                {/* Forme des cartes */}
                <div>
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))] mb-2">
                    Forme des cartes
                  </label>
                  <div className="flex justify-start gap-2">
                    {shapeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateStoreCardShape(option.value as any)}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          scratchConfig.grid?.cardShape === option.value
                            ? 'border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]/10 text-[hsl(var(--sidebar-text-primary))]'
                            : 'border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-text-secondary))] hover:border-[hsl(var(--sidebar-active))]/50'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Couverture globale */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))]">
                    Couverture
                  </label>
                  
                  {scratchConfig.globalCover?.type === 'image' ? (
                    <div className="space-y-2">
                      <div className="relative w-full h-32 rounded-lg overflow-hidden border border-[hsl(var(--sidebar-border))]">
                        <img 
                          src={scratchConfig.globalCover.url} 
                          alt="Couverture" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={scratchConfig.globalCover?.type === 'color' ? scratchConfig.globalCover.value : '#C0C0C0'}
                        onChange={(e) => updateStoreGlobalCover({ type: 'color', value: e.target.value })}
                        className="w-full h-10 rounded-md border border-[hsl(var(--sidebar-border))]"
                      />
                      <div className="text-xs text-[hsl(var(--sidebar-text-secondary))] text-center">ou</div>
                    </div>
                  )}
                  
                  {scratchConfig.globalCover?.type !== 'image' && (
                    <label className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(var(--sidebar-text-primary))] bg-[hsl(var(--sidebar-surface))] hover:bg-[hsl(var(--sidebar-hover))] border border-[hsl(var(--sidebar-border))] rounded-lg cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Upload en cours...' : 'Uploader une image'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Bordure des cartes */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[hsl(var(--sidebar-text-primary))]">
                    Bordure
                  </label>
                  
                  {/* Type de bordure */}
                  <div>
                    <div className="flex justify-start gap-2 mb-3">
                      <button
                        onClick={() => updateStoreGrid({ 
                          border: { 
                            type: 'internal',
                            color: scratchConfig.grid?.border?.color || '#000000',
                            width: scratchConfig.grid?.border?.width || 2
                          }
                        })}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          scratchConfig.grid?.border?.type === 'internal'
                            ? 'border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]/10 text-[hsl(var(--sidebar-text-primary))]'
                            : 'border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-text-secondary))] hover:border-[hsl(var(--sidebar-active))]/50'
                        }`}
                      >
                        Interne
                      </button>
                      <button
                        onClick={() => updateStoreGrid({ 
                          border: { 
                            type: 'external',
                            color: scratchConfig.grid?.border?.color || '#000000',
                            width: scratchConfig.grid?.border?.width || 2
                          }
                        })}
                        className={`px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                          scratchConfig.grid?.border?.type === 'external'
                            ? 'border-[hsl(var(--sidebar-active))] bg-[hsl(var(--sidebar-active))]/10 text-[hsl(var(--sidebar-text-primary))]'
                            : 'border-[hsl(var(--sidebar-border))] text-[hsl(var(--sidebar-text-secondary))] hover:border-[hsl(var(--sidebar-active))]/50'
                        }`}
                      >
                        Externe
                      </button>
                      {scratchConfig.grid?.border && (
                        <button
                          onClick={() => updateStoreGrid({ border: undefined })}
                          className="px-3 py-2 text-sm rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        >
                          Aucune
                        </button>
                      )}
                    </div>
                  </div>

                  {scratchConfig.grid?.border && (
                    <>
                      {/* Couleur de bordure */}
                      <div>
                        <label className="block text-xs text-[hsl(var(--sidebar-text-secondary))] mb-1">
                          Couleur
                        </label>
                        <input
                          type="color"
                          value={scratchConfig.grid.border.color}
                          onChange={(e) => updateStoreGrid({ 
                            border: { 
                              type: scratchConfig.grid.border!.type,
                              width: scratchConfig.grid.border!.width,
                              color: e.target.value 
                            }
                          })}
                          className="w-full h-10 rounded-md border border-[hsl(var(--sidebar-border))]"
                        />
                      </div>

                      {/* Épaisseur de bordure */}
                      <div>
                        <label className="block text-xs text-[hsl(var(--sidebar-text-secondary))] mb-1">
                          Épaisseur: {scratchConfig.grid.border.width}px
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={scratchConfig.grid.border.width}
                          onChange={(e) => updateStoreGrid({ 
                            border: { 
                              type: scratchConfig.grid.border!.type,
                              color: scratchConfig.grid.border!.color,
                              width: parseInt(e.target.value) 
                            }
                          })}
                          className="w-full"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchGamePanelRefactored;
