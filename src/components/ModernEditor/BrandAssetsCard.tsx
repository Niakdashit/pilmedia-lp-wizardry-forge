
import React, { useState } from 'react';
import { Palette, Upload } from 'lucide-react';
import { generateBrandThemeFromFile } from '../../utils/BrandStyleAnalyzer';

interface BrandAssetsCardProps {
  campaign: any;
  setCampaign: (updater: (prev: any) => any) => void;
}

const BrandAssetsCard: React.FC<BrandAssetsCardProps> = ({ campaign, setCampaign }) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // Ensure brandAssets exists with default values
  const brandAssets = campaign.brandAssets || {
    primaryColor: '#E0004D',
    secondaryColor: '#ffffff'
  };

  const handleLogoUpload = async (file: File) => {
    setIsExtracting(true);
    
    try {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      
      // Extract brand theme from image
      const brandTheme = await generateBrandThemeFromFile(file);
      
      // Update campaign with extracted colors and logo
      setCampaign((prev: any) => ({
        ...prev,
        brandAssets: {
          ...prev.brandAssets,
          logo: previewUrl,
          primaryColor: brandTheme.customColors.primary,
          secondaryColor: brandTheme.customColors.secondary,
          accentColor: brandTheme.customColors.accent
        }
      }));
      
      console.log('✅ Couleurs extraites:', brandTheme.customColors);
    } catch (error) {
      console.error('❌ Erreur extraction couleurs:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleLogoUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-gradient-to-br from-[#E0004D]/5 to-[#4D2388]/5 rounded-xl p-6 border border-[#E0004D]/10">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Palette className="w-5 h-5 mr-2 text-[#E0004D]" />
        Identité de marque
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Logo {isExtracting && <span className="text-[#E0004D]">(Extraction en cours...)</span>}
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#E0004D] transition-colors cursor-pointer relative overflow-hidden"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => document.getElementById('logo-input')?.click()}
          >
            {logoPreview ? (
              <div className="relative">
                <img 
                  src={logoPreview} 
                  alt="Logo preview" 
                  className="max-h-20 mx-auto rounded-lg"
                />
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Glissez votre logo ici</p>
                <p className="text-xs text-gray-500 mt-1">Les couleurs seront automatiquement extraites</p>
              </>
            )}
          </div>
          <input
            id="logo-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur principale</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={brandAssets.primaryColor}
                onChange={(e) => setCampaign((prev: any) => ({
                  ...prev,
                  brandAssets: { 
                    ...prev.brandAssets, 
                    primaryColor: e.target.value 
                  }
                }))}
                className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={brandAssets.primaryColor}
                onChange={(e) => setCampaign((prev: any) => ({
                  ...prev,
                  brandAssets: { 
                    ...prev.brandAssets, 
                    primaryColor: e.target.value 
                  }
                }))}
                className="flex-1 px-3 py-2 bg-white/50 border-0 rounded-lg focus:ring-2 focus:ring-[#E0004D]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Couleur secondaire</label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={brandAssets.secondaryColor}
                onChange={(e) => setCampaign((prev: any) => ({
                  ...prev,
                  brandAssets: { 
                    ...prev.brandAssets, 
                    secondaryColor: e.target.value 
                  }
                }))}
                className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={brandAssets.secondaryColor}
                onChange={(e) => setCampaign((prev: any) => ({
                  ...prev,
                  brandAssets: { 
                    ...prev.brandAssets, 
                    secondaryColor: e.target.value 
                  }
                }))}
                className="flex-1 px-3 py-2 bg-white/50 border-0 rounded-lg focus:ring-2 focus:ring-[#E0004D]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandAssetsCard;
