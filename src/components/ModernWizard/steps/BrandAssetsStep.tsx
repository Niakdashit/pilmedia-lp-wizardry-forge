
import React from 'react';
import { WizardData } from '../ModernWizard';
import { Upload, Image, Smartphone, Monitor } from 'lucide-react';

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
  const handleFileUpload = (type: 'logo' | 'desktopVisual' | 'mobileVisual', file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateWizardData({ [type]: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
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

        {/* Upload Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Image className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Logo</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#951b6d]/50 transition-colors">
              {wizardData.logo ? (
                <img src={wizardData.logo} alt="Logo" className="max-h-20 mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Glissez votre logo ici</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('logo', e.target.files[0])}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="inline-block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  >
                    Sélectionner un fichier
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Desktop Visual */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Monitor className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Visuel desktop</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#951b6d]/50 transition-colors">
              {wizardData.desktopVisual ? (
                <img src={wizardData.desktopVisual} alt="Desktop visual" className="max-h-20 mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Visuel pour ordinateur</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('desktopVisual', e.target.files[0])}
                    className="hidden"
                    id="desktop-upload"
                  />
                  <label
                    htmlFor="desktop-upload"
                    className="inline-block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  >
                    Sélectionner un fichier
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Mobile Visual */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-[#951b6d]/10 rounded-lg flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-[#951b6d]" />
              </div>
              <h3 className="font-semibold text-[#141e29]">Visuel mobile</h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#951b6d]/50 transition-colors">
              {wizardData.mobileVisual ? (
                <img src={wizardData.mobileVisual} alt="Mobile visual" className="max-h-20 mx-auto" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">Visuel pour mobile</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload('mobileVisual', e.target.files[0])}
                    className="hidden"
                    id="mobile-upload"
                  />
                  <label
                    htmlFor="mobile-upload"
                    className="inline-block px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer text-sm font-medium"
                  >
                    Sélectionner un fichier
                  </label>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Name */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-8">
          <h3 className="font-semibold text-[#141e29] mb-4">Nom du produit</h3>
          <input
            type="text"
            value={wizardData.productName || ''}
            onChange={(e) => updateWizardData({ productName: e.target.value })}
            placeholder="Entrez le nom de votre produit ou campagne"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#951b6d]/20 focus:border-[#951b6d] transition-colors"
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Retour
          </button>
          <button
            onClick={nextStep}
            className="px-8 py-3 bg-[#951b6d] text-white font-semibold rounded-xl hover:bg-[#7d1659] transition-colors shadow-sm hover:shadow-md"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandAssetsStep;
