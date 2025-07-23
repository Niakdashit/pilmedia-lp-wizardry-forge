import React, { useState } from 'react';
import { Palette, Image, Upload, Trash2, Globe, Wand2, Loader2 } from 'lucide-react';
import BorderStyleSelector from '../../SmartWheel/components/BorderStyleSelector';
import type { EditorConfig } from '../GameEditorLayout';

interface DesignTabProps {
  config: EditorConfig;
  onConfigUpdate: (updates: Partial<EditorConfig>) => void;
}

const DesignTab: React.FC<DesignTabProps> = ({
  config,
  onConfigUpdate
}) => {
  // États pour le branding
  const [brandingData, setBrandingData] = useState({
    websiteUrl: config.brandingData?.websiteUrl || '',
    logoUrl: config.brandingData?.logoUrl || config.centerLogo || '',
    backgroundImageUrl: config.brandingData?.backgroundImageUrl || config.deviceConfig?.desktop?.backgroundImage || '',
    targetAudience: config.brandingData?.targetAudience || 'clients potentiels',
    objective: config.brandingData?.objective || 'engagement et conversion'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleBrandingInputChange = (field: string, value: string) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    onConfigUpdate({
      brandingData: {
        ...config.brandingData,
        [field]: value
      }
    });
  };

  const handleBrandingFileUpload = async (file: File, type: 'logo' | 'background') => {
    setErrorMessage('');
    setSuccessMessage('');

    if (type === 'logo') {
      setUploadingLogo(true);
    } else {
      setUploadingBackground(true);
    }

    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Type de fichier non autorisé. Seules les images sont acceptées.');
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Fichier trop volumineux. Taille maximale : 10MB.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('https://vmkwascgjntopgkbmctv.supabase.co/functions/v1/upload-asset', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const { url, success } = await response.json();
      
      if (!success || !url) {
        throw new Error('Réponse invalide du serveur');
      }
      
      const field = type === 'logo' ? 'logoUrl' : 'backgroundImageUrl';
      handleBrandingInputChange(field, url);
      
      // Mettre à jour également la config principale
      if (type === 'logo') {
        onConfigUpdate({ centerLogo: url });
      } else {
        const deviceConfig = config.deviceConfig || {
          mobile: { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
          tablet: { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
          desktop: { fontSize: 18, gamePosition: { x: 0, y: 0, scale: 1.0 } }
        };
        onConfigUpdate({
          deviceConfig: {
            ...deviceConfig,
            desktop: { 
              ...deviceConfig.desktop, 
              backgroundImage: url,
              fontSize: deviceConfig.desktop.fontSize || 18
            }
          }
        });
      }

      setSuccessMessage(`${type === 'logo' ? 'Logo' : 'Image de fond'} uploadé avec succès !`);
      
    } catch (error) {
      console.error('Erreur upload:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de l\'upload du fichier');
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBackground(false);
      }
    }
  };

  const handleGenerateBranding = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!brandingData.websiteUrl.trim()) {
      setErrorMessage('Veuillez saisir l\'URL du site web');
      return;
    }

    // Validate URL format
    try {
      const url = brandingData.websiteUrl.startsWith('http') 
        ? brandingData.websiteUrl 
        : `https://${brandingData.websiteUrl}`;
      new URL(url);
    } catch {
      setErrorMessage('URL invalide. Veuillez saisir une URL valide (ex: https://example.com)');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('https://vmkwascgjntopgkbmctv.supabase.co/functions/v1/studio-campaign-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: brandingData.websiteUrl,
          logoUrl: brandingData.logoUrl,
          backgroundImageUrl: brandingData.backgroundImageUrl,
          campaignType: config.gameType || 'wheel',
          targetAudience: brandingData.targetAudience,
          objective: brandingData.objective
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Branding result:', result);

      if (!result || !result.design) {
        throw new Error('Réponse invalide du serveur');
      }

      // Mettre à jour la configuration avec les données de branding
      onConfigUpdate({
        // Couleurs
        backgroundColor: result.design?.primaryColor || config.backgroundColor,
        outlineColor: result.design?.accentColor || config.outlineColor,
        participateButtonColor: result.design?.primaryColor || config.participateButtonColor,
        participateButtonTextColor: result.design?.accentColor || config.participateButtonTextColor,
        
        // Logo et image de fond
        centerLogo: result.assets?.logoUrl || brandingData.logoUrl || config.centerLogo,
        deviceConfig: {
          mobile: config.deviceConfig?.mobile || { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
          tablet: config.deviceConfig?.tablet || { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
          desktop: {
            fontSize: config.deviceConfig?.desktop?.fontSize || 18,
            gamePosition: config.deviceConfig?.desktop?.gamePosition || { x: 0, y: 0, scale: 1.0 },
            backgroundImage: result.assets?.backgroundImageUrl || brandingData.backgroundImageUrl || config.deviceConfig?.desktop?.backgroundImage
          }
        },
        
        // Textes
        storyText: result.content?.title || config.storyText,
        prizeText: result.content?.subtitle || config.prizeText,
        participateButtonText: result.content?.callToAction || config.participateButtonText,
        
        // Textes personnalisés
        customTexts: result.content?.editableTexts || config.customTexts || [],
        
        // Marquer comme brandé
        isBranded: true,
        lastBrandingUpdate: Date.now(),
        brandingData: brandingData,
        brandAnalysis: result.brandAnalysis
      });

      setSuccessMessage('Campagne mise à jour avec le branding IA !');
      
    } catch (error) {
      console.error('❌ Erreur génération branding:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la génération du branding');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'background') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        if (type === 'banner') {
          onConfigUpdate({ bannerImage: imageUrl });
        } else {
          // Handle background image for device config
          const deviceConfig = config.deviceConfig || {
            mobile: { fontSize: 14, gamePosition: { x: 0, y: 0, scale: 1.0 } },
            tablet: { fontSize: 16, gamePosition: { x: 0, y: 0, scale: 1.0 } },
            desktop: { fontSize: 18, gamePosition: { x: 0, y: 0, scale: 1.0 } }
          };
          onConfigUpdate({
            deviceConfig: {
              mobile: deviceConfig.mobile,
              tablet: deviceConfig.tablet,
              desktop: { 
                fontSize: deviceConfig.desktop?.fontSize || 18,
                gamePosition: deviceConfig.desktop?.gamePosition || { x: 0, y: 0, scale: 1.0 },
                backgroundImage: imageUrl 
              }
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 py-0 my-[30px]">
      <h3 className="section-title text-center">Design & Contenu</h3>

      {/* Messages d'erreur et de succès */}
      {errorMessage && (
        <div className="mx-[30px] p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {errorMessage}
        </div>
      )}
      
      {successMessage && (
        <div className="mx-[30px] p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ {successMessage}
        </div>
      )}

      {/* Section Branding IA */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-purple-600" />
          Branding IA
        </h4>
        <p className="text-xs text-sidebar-text-muted mb-4">
          Générez automatiquement le design et contenu basé sur votre marque
        </p>
        
        <div className="space-y-4">
          {/* URL du site web */}
          <div className="form-group-premium">
            <label className="flex items-center gap-2 text-xs font-medium mb-2">
              <Globe className="w-3 h-3" />
              URL du site web de la marque *
            </label>
            <input
              type="url"
              placeholder="https://www.exemple.com"
              value={brandingData.websiteUrl}
              onChange={(e) => handleBrandingInputChange('websiteUrl', e.target.value)}
              className="form-input-premium"
              required
            />
          </div>

          {/* Logo */}
          <div className="form-group-premium">
            <label className="flex items-center gap-2 text-xs font-medium mb-2">
              <Upload className="w-3 h-3" />
              Logo de la marque
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="URL du logo"
                value={brandingData.logoUrl}
                onChange={(e) => handleBrandingInputChange('logoUrl', e.target.value)}
                className="form-input-premium flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,.svg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBrandingFileUpload(file, 'logo');
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingLogo}
                />
                <button className="form-input-premium px-2 py-1 min-w-[40px] flex items-center justify-center" disabled={uploadingLogo}>
                  {uploadingLogo ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
            {brandingData.logoUrl && (
              <div className="mt-2">
                <img 
                  src={brandingData.logoUrl} 
                  alt="Logo preview" 
                  className="h-8 object-contain border rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Image de fond */}
          <div className="form-group-premium">
            <label className="flex items-center gap-2 text-xs font-medium mb-2">
              <Upload className="w-3 h-3" />
              Image de fond
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="URL de l'image"
                value={brandingData.backgroundImageUrl}
                onChange={(e) => handleBrandingInputChange('backgroundImageUrl', e.target.value)}
                className="form-input-premium flex-1"
              />
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBrandingFileUpload(file, 'background');
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadingBackground}
                />
                <button className="form-input-premium px-2 py-1 min-w-[40px] flex items-center justify-center" disabled={uploadingBackground}>
                  {uploadingBackground ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Upload className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
            {brandingData.backgroundImageUrl && (
              <div className="mt-2">
                <img 
                  src={brandingData.backgroundImageUrl} 
                  alt="Background preview" 
                  className="h-12 w-20 object-cover border rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Options avancées */}
          <div className="grid grid-cols-2 gap-2">
            <div className="form-group-premium">
              <label className="text-xs font-medium mb-1 block">Audience cible</label>
              <input
                placeholder="clients potentiels"
                value={brandingData.targetAudience}
                onChange={(e) => handleBrandingInputChange('targetAudience', e.target.value)}
                className="form-input-premium text-xs"
              />
            </div>
            <div className="form-group-premium">
              <label className="text-xs font-medium mb-1 block">Objectif</label>
              <input
                placeholder="engagement et conversion"
                value={brandingData.objective}
                onChange={(e) => handleBrandingInputChange('objective', e.target.value)}
                className="form-input-premium text-xs"
              />
            </div>
          </div>

          {/* Bouton de génération */}
          <button 
            onClick={handleGenerateBranding}
            disabled={isGenerating || !brandingData.websiteUrl.trim()}
            className={`w-full px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              isGenerating || !brandingData.websiteUrl.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Générer le branding IA
              </>
            )}
          </button>

          {config.isBranded && (
            <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
              ✅ Campagne mise à jour avec le branding IA
              {config.lastBrandingUpdate && (
                <div className="text-xs text-green-600 mt-1">
                  Dernière mise à jour : {new Date(config.lastBrandingUpdate).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Couleurs principales */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Couleurs principales
        </h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Couleur de fond</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.backgroundColor || '#ffffff'}
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })}
              />
              <input
                type="text"
                value={config.backgroundColor || '#ffffff'}
                onChange={e => onConfigUpdate({ backgroundColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>

          <div className="form-group-premium">
            <label>Couleur de contour</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.outlineColor || '#ffffff'}
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })}
              />
              <input
                type="text"
                value={config.outlineColor || '#ffffff'}
                onChange={e => onConfigUpdate({ outlineColor: e.target.value })}
                placeholder="#ffffff"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base flex items-center gap-2">
          <Image className="w-4 h-4" />
          Images
        </h4>
        
        <div className="space-y-4">
          {/* Image de bannière */}
          <div className="form-group-premium">
            <label>Image de bannière</label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer transition-colors text-sm">
                  <Upload className="w-4 h-4" />
                  Choisir une image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, 'banner')}
                    className="hidden"
                  />
                </label>
                {config.bannerImage && (
                  <button
                    onClick={() => onConfigUpdate({ bannerImage: undefined })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer l'image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              {config.bannerImage && (
                <div className="w-full h-32 border border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={config.bannerImage}
                    alt="Aperçu bannière"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description de bannière */}
          <div className="form-group-premium">
            <label>Description de bannière</label>
            <textarea
              value={config.bannerDescription || ''}
              onChange={e => onConfigUpdate({ bannerDescription: e.target.value })}
              placeholder="Description courte pour accompagner la bannière..."
              rows={3}
            />
          </div>

          {/* Lien de bannière */}
          <div className="form-group-premium">
            <label>Lien de bannière</label>
            <input
              type="url"
              value={config.bannerLink || ''}
              onChange={e => onConfigUpdate({ bannerLink: e.target.value })}
              placeholder="https://exemple.com"
            />
          </div>
        </div>
      </div>

      {/* Style de bordure */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Style de bordure</h4>
        
        <BorderStyleSelector
          currentStyle={config.borderStyle || 'classic'}
          onStyleChange={(style) => onConfigUpdate({ borderStyle: style })}
        />
      </div>

      {/* Bouton de participation */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Bouton de participation</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du bouton</label>
            <input
              type="text"
              value={config.participateButtonText || 'PARTICIPER !'}
              onChange={e => onConfigUpdate({ participateButtonText: e.target.value })}
              placeholder="PARTICIPER !"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-group-premium">
              <label>Couleur du bouton</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={config.participateButtonColor || '#ff6b35'}
                  onChange={e => onConfigUpdate({ participateButtonColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.participateButtonColor || '#ff6b35'}
                  onChange={e => onConfigUpdate({ participateButtonColor: e.target.value })}
                  placeholder="#ff6b35"
                />
              </div>
            </div>

            <div className="form-group-premium">
              <label>Couleur du texte</label>
              <div className="color-input-group">
                <input
                  type="color"
                  value={config.participateButtonTextColor || '#ffffff'}
                  onChange={e => onConfigUpdate({ participateButtonTextColor: e.target.value })}
                />
                <input
                  type="text"
                  value={config.participateButtonTextColor || '#ffffff'}
                  onChange={e => onConfigUpdate({ participateButtonTextColor: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="premium-card mx-[30px]">
        <h4 className="text-sidebar-text-primary font-medium mb-4 text-base">Pied de page</h4>
        
        <div className="space-y-4">
          <div className="form-group-premium">
            <label>Texte du pied de page</label>
            <textarea
              value={config.footerText || ''}
              onChange={e => onConfigUpdate({ footerText: e.target.value })}
              placeholder="Mentions légales, conditions..."
              rows={3}
            />
          </div>

          <div className="form-group-premium">
            <label>Couleur de fond du pied de page</label>
            <div className="color-input-group">
              <input
                type="color"
                value={config.footerColor || '#f8f9fa'}
                onChange={e => onConfigUpdate({ footerColor: e.target.value })}
              />
              <input
                type="text"
                value={config.footerColor || '#f8f9fa'}
                onChange={e => onConfigUpdate({ footerColor: e.target.value })}
                placeholder="#f8f9fa"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignTab;
