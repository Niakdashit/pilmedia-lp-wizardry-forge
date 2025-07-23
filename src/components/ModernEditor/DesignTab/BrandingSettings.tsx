import React, { useState } from 'react';
import { Globe, Upload, Wand2, Loader2 } from 'lucide-react';

interface BrandingSettingsProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({
  campaign,
  setCampaign
}) => {
  const [brandingData, setBrandingData] = useState({
    websiteUrl: campaign.brandingData?.websiteUrl || '',
    logoUrl: campaign.brandingData?.logoUrl || '',
    backgroundImageUrl: campaign.brandingData?.backgroundImageUrl || '',
    targetAudience: campaign.brandingData?.targetAudience || 'clients potentiels',
    objective: campaign.brandingData?.objective || 'engagement et conversion'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setBrandingData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setCampaign((prev: any) => ({
      ...prev,
      brandingData: {
        ...prev.brandingData,
        [field]: value
      }
    }));
  };

  const handleFileUpload = async (file: File, type: 'logo' | 'background') => {
    if (type === 'logo') {
      setUploadingLogo(true);
    } else {
      setUploadingBackground(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/functions/v1/upload-asset', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }

      const { url } = await response.json();
      
      const field = type === 'logo' ? 'logoUrl' : 'backgroundImageUrl';
      handleInputChange(field, url);
      
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload du fichier');
    } finally {
      if (type === 'logo') {
        setUploadingLogo(false);
      } else {
        setUploadingBackground(false);
      }
    }
  };

  const handleGenerateBranding = async () => {
    if (!brandingData.websiteUrl) {
      alert('Veuillez saisir l\'URL du site web');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/functions/v1/studio-campaign-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl: brandingData.websiteUrl,
          logoUrl: brandingData.logoUrl,
          backgroundImageUrl: brandingData.backgroundImageUrl,
          campaignType: campaign.type || 'wheel',
          targetAudience: brandingData.targetAudience,
          objective: brandingData.objective
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const result = await response.json();
      console.log('Branding result:', result);

      // Mettre à jour la campagne avec les données de branding
      setCampaign((prev: any) => ({
        ...prev,
        // Mettre à jour le design avec les nouvelles couleurs
        design: {
          ...prev.design,
          primaryColor: result.design?.primaryColor || prev.design?.primaryColor,
          secondaryColor: result.design?.secondaryColor || prev.design?.secondaryColor,
          titleColor: result.design?.accentColor || prev.design?.titleColor,
          backgroundImage: result.design?.backgroundImageUrl || prev.design?.backgroundImage,
          centerLogo: result.design?.logoUrl || prev.design?.centerLogo
        },
        // Mettre à jour les écrans avec le nouveau contenu
        screens: {
          ...prev.screens,
          1: {
            ...prev.screens?.[1],
            title: result.content?.title || prev.screens?.[1]?.title,
            description: result.content?.subtitle || prev.screens?.[1]?.description,
            buttonText: result.content?.callToAction || prev.screens?.[1]?.buttonText
          }
        },
        // Ajouter l'analyse de marque
        brandAnalysis: result.brandAnalysis,
        // Mettre à jour les textes personnalisés si l'API en fournit
        gameConfig: {
          ...prev.gameConfig,
          customTexts: result.content?.editableTexts || prev.gameConfig?.customTexts || []
        },
        // Sauvegarder les données de branding
        brandingData: brandingData,
        // Marquer comme brandé
        isBranded: true,
        lastBrandingUpdate: Date.now()
      }));

      alert('Campagne mise à jour avec le branding !');
      
    } catch (error) {
      console.error('Erreur génération branding:', error);
      alert('Erreur lors de la génération du branding');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-600" />
          Branding IA
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Générez automatiquement le design et contenu basé sur votre marque
        </p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* URL du site web */}
        <div className="space-y-2">
          <label htmlFor="websiteUrl" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Globe className="w-4 h-4" />
            URL du site web de la marque
          </label>
          <input
            id="websiteUrl"
            type="url"
            placeholder="https://www.exemple.com"
            value={brandingData.websiteUrl}
            onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Upload Logo */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Upload className="w-4 h-4" />
            Logo de la marque
          </label>
          <div className="flex items-center gap-4">
            <input
              type="url"
              placeholder="URL du logo ou uploadez un fichier"
              value={brandingData.logoUrl}
              onChange={(e) => handleInputChange('logoUrl', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'logo');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingLogo}
              />
              <button 
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={uploadingLogo}
              >
                {uploadingLogo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {brandingData.logoUrl && (
            <div className="mt-2">
              <img 
                src={brandingData.logoUrl} 
                alt="Logo preview" 
                className="h-12 object-contain border rounded"
              />
            </div>
          )}
        </div>

        {/* Upload Image de fond */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Upload className="w-4 h-4" />
            Image de fond
          </label>
          <div className="flex items-center gap-4">
            <input
              type="url"
              placeholder="URL de l'image ou uploadez un fichier"
              value={brandingData.backgroundImageUrl}
              onChange={(e) => handleInputChange('backgroundImageUrl', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'background');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploadingBackground}
              />
              <button 
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                disabled={uploadingBackground}
              >
                {uploadingBackground ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {brandingData.backgroundImageUrl && (
            <div className="mt-2">
              <img 
                src={brandingData.backgroundImageUrl} 
                alt="Background preview" 
                className="h-20 w-32 object-cover border rounded"
              />
            </div>
          )}
        </div>

        {/* Options avancées */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="targetAudience" className="text-sm font-medium text-gray-700">Audience cible</label>
            <input
              id="targetAudience"
              placeholder="clients potentiels"
              value={brandingData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="objective" className="text-sm font-medium text-gray-700">Objectif</label>
            <input
              id="objective"
              placeholder="engagement et conversion"
              value={brandingData.objective}
              onChange={(e) => handleInputChange('objective', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bouton de génération */}
        <button 
          onClick={handleGenerateBranding}
          disabled={isGenerating || !brandingData.websiteUrl}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
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

        {campaign.isBranded && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">
              ✅ Campagne mise à jour avec le branding IA
              {campaign.lastBrandingUpdate && (
                <span className="block text-xs text-green-600 mt-1">
                  Dernière mise à jour : {new Date(campaign.lastBrandingUpdate).toLocaleString()}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandingSettings;