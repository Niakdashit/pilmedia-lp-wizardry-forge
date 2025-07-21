
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Sparkles } from 'lucide-react';
import { useQuickCampaignStore } from '../../../../stores/quickCampaignStore';

const BrandAssetsPanel: React.FC = () => {
  const {
    logoUrl,
    logoFile,
    backgroundImageUrl,
    backgroundImage,
    setLogo,
    setBackgroundImage,
    setBackgroundImageUrl
  } = useQuickCampaignStore();

  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setLogo(file, URL.createObjectURL(file));
    }
  };

  const handleBackgroundUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      if (backgroundImageUrl) {
        URL.revokeObjectURL(backgroundImageUrl);
      }
      const url = URL.createObjectURL(file);
      setBackgroundImage(file);
      setBackgroundImageUrl(url);
    }
  };

  const removeLogo = () => {
    if (logoUrl) {
      URL.revokeObjectURL(logoUrl);
    }
    setLogo(null, null);
  };

  const removeBackground = () => {
    if (backgroundImageUrl) {
      URL.revokeObjectURL(backgroundImageUrl);
    }
    setBackgroundImage(null);
    setBackgroundImageUrl(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Assets de marque
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Téléchargez votre logo et image de fond pour personnaliser votre campagne.
        </p>
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Logo de marque
        </label>
        
        {logoUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">
                  {logoFile?.name || 'Logo téléchargé'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {logoFile?.size ? `${(logoFile.size / 1024).toFixed(1)} KB` : 'Image'}
                </p>
              </div>
              <button
                onClick={removeLogo}
                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center space-x-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-medium">
                  Couleurs extraites automatiquement pour votre thème
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            onClick={() => logoInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
            <p className="text-sm text-foreground font-medium mb-1">
              Télécharger votre logo
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, SVG, JPG jusqu'à 5MB
            </p>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoUpload(e.target.files)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Background Image Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">
          Image de fond <span className="text-muted-foreground font-normal">(optionnel)</span>
        </label>
        
        {backgroundImageUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group bg-card border border-border rounded-xl overflow-hidden"
          >
            <div className="aspect-video bg-muted">
              <img
                src={backgroundImageUrl}
                alt="Image de fond"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">
                    {backgroundImage?.name || 'Image de fond'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {backgroundImage?.size ? `${(backgroundImage.size / 1024 / 1024).toFixed(1)} MB` : 'Image'}
                  </p>
                </div>
                <button
                  onClick={removeBackground}
                  className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div
            onClick={() => backgroundInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <Image className="w-8 h-8 text-muted-foreground mx-auto mb-4 group-hover:text-primary transition-colors" />
            <p className="text-sm text-foreground font-medium mb-1">
              Ajouter une image de fond
            </p>
            <p className="text-xs text-muted-foreground">
              PNG, JPG jusqu'à 10MB
            </p>
            <input
              ref={backgroundInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleBackgroundUpload(e.target.files)}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Conseils</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Utilisez un logo au format SVG pour une qualité optimale</li>
          <li>• L'image de fond sera automatiquement adaptée à tous les écrans</li>
          <li>• Les couleurs de votre logo définiront le thème de la campagne</li>
        </ul>
      </div>
    </div>
  );
};

export default BrandAssetsPanel;
