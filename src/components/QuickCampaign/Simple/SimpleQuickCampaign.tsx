
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AssetUploadStep from './AssetUploadStep';
import BrandedPreviewStep from './BrandedPreviewStep';
import { useBrandExtraction } from './hooks/useBrandExtraction';

interface SimpleQuickCampaignProps {
  onComplete?: (campaignData: any) => void;
}

type Step = 'upload' | 'preview';

const SimpleQuickCampaign: React.FC<SimpleQuickCampaignProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [backgroundUrl, setBackgroundUrl] = useState<string>('');
  
  const {
    extractedColors,
    extractedFont,
    isExtracting,
    extractBrandFromLogo
  } = useBrandExtraction();

  const handleAssetsUploaded = async (logo: File | null, background: File | null) => {
    if (logo) {
      const logoURL = URL.createObjectURL(logo);
      setLogoUrl(logoURL);
      await extractBrandFromLogo(logo);
    }
    
    if (background) {
      setBackgroundUrl(URL.createObjectURL(background));
    }
    
    setCurrentStep('preview');
  };

  const handleBack = () => {
    setCurrentStep('upload');
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <AnimatePresence mode="wait">
        {currentStep === 'upload' && (
          <motion.div
            key="upload"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <AssetUploadStep onNext={handleAssetsUploaded} />
          </motion.div>
        )}
        
        {currentStep === 'preview' && (
          <motion.div
            key="preview"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <BrandedPreviewStep
              logoUrl={logoUrl}
              backgroundUrl={backgroundUrl}
              extractedColors={extractedColors}
              extractedFont={extractedFont}
              isExtracting={isExtracting}
              onBack={handleBack}
              onComplete={onComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleQuickCampaign;
