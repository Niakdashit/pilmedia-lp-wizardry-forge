
import React, { useState } from 'react';
import { WizardData } from '../ModernWizard';
import { Image, Smartphone, Monitor } from 'lucide-react';
import ImageUploadCard from './components/ImageUploadCard';
import WebsiteUrlInput from './components/WebsiteUrlInput';
import ProductNameInput from './components/ProductNameInput';
import { useBrandThemeExtraction } from '../hooks/useBrandThemeExtraction';

interface BrandAssetsStepProps {
  wizardData: WizardData;
  updateWizardData: (data: Partial<WizardData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const BrandAssetsStep: React.FC<BrandAssetsStepProps> = ({
  wizardData,
  updateWizardData,
  nextStep,
  prevStep
}) => {
  // Extraction du thème de marque : couleur, logo (optionnel, pas automatique sur le texte)
  const { brandTheme, loading: extractingTheme } = useBrandThemeExtraction(wizardData.websiteUrl);

  // Champ de contenu saisi manuellement (optionnel, le prompt OpenAI peut aussi partir de rien)
  const [manualContent, setManualContent] = useState(wizardData['manualContent'] || '');

  // Injection du résultat d'extraction de thème si changé
  React.useEffect(() => {
    if (
      brandTheme && 
      JSON.stringify(wizardData.extractedBrandTheme || {}) !== JSON.stringify(brandTheme)
    ) {
      updateWizardData({ extractedBrandTheme: brandTheme });
    }
    if (!brandTheme && wizardData.extractedBrandTheme) {
      updateWizardData({ extractedBrandTheme: undefined });
    }
  }, [brandTheme]);

  // Mémorise le contenu éventuel à chaque changement
  React.useEffect(() => {
    if (manualContent !== wizardData['manualContent']) {
      updateWizardData({ manualContent });
    }
    // eslint-disable-next-line
  }, [manualContent]);

  const handleFileUpload = (type: 'logo' | 'desktopVisual' | 'mobileVisual', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateWizardData({ [type]: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (type: 'logo' | 'desktopVisual' | 'mobileVisual') => {
    updateWizardData({ [type]: undefined });
  };

  return (
    <div className="space-y-8">
      {/* Main Content Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100/50">
        {/* Section Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#141e29] mb-3">
            Ajoutez vos éléments de marque
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-2xl">
            Personnalisez votre campagne avec vos visuels de marque pour une expérience cohérente.
          </p>
        </div>
        {/* Infos extraction */}
        {extractingTheme && (
          <div className="mb-3 flex items-center gap-3 text-[#5a5a63]">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ae8ac3" strokeWidth="4" />
              <path className="opacity-75" fill="#ae8ac3" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Extraction du thème de marque en cours...
          </div>
        )}

        {/* Upload Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <ImageUploadCard
            title="Logo"
            icon={Image}
            value={wizardData.logo}
            onUpload={(file) => handleFileUpload('logo', file)}
            onRemove={() => handleRemoveImage('logo')}
            placeholder="Glissez votre logo ici"
            inputId="logo-upload"
          />

          <ImageUploadCard
            title="Visuel desktop"
            icon={Monitor}
            value={wizardData.desktopVisual}
            onUpload={(file) => handleFileUpload('desktopVisual', file)}
            onRemove={() => handleRemoveImage('desktopVisual')}
            placeholder="Visuel pour ordinateur"
            inputId="desktop-upload"
          />

          <ImageUploadCard
            title="Visuel mobile"
            icon={Smartphone}
            value={wizardData.mobileVisual}
            onUpload={(file) => handleFileUpload('mobileVisual', file)}
            onRemove={() => handleRemoveImage('mobileVisual')}
            placeholder="Visuel pour mobile"
            inputId="mobile-upload"
          />
        </div>

        {/* Website URL */}
        <WebsiteUrlInput
          value={wizardData.websiteUrl || ''}
          onChange={(value) => updateWizardData({ websiteUrl: value })}
        />

        {/* Product Name */}
        <ProductNameInput
          value={wizardData.productName || ''}
          onChange={(value) => updateWizardData({ productName: value })}
        />

        {/* Ajout d'un champ pour un résumé/manuel facultatif */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            (Optionnel) Collez ici un texte/résumé clé de votre site (utile pour booster la pertinence du quiz si vous le souhaitez)
          </label>
          <textarea
            value={manualContent}
            onChange={e => setManualContent(e.target.value)}
            className="w-full border border-gray-200 rounded-lg p-3 text-gray-900 focus:ring-[#951b6d] focus:border-[#951b6d] min-h-[64px]"
            placeholder="Résumé, présentation, valeurs, infos..."
            rows={3}
            spellCheck={true}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-[#44444d] hover:text-white transition-colors"
          >
            Retour
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-[#5a5a63] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandAssetsStep;
