import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Calendar, Upload } from 'lucide-react';
import { useQuickCampaignStore } from '../../stores/quickCampaignStore';
import LogoUploader from '../LogoUploader';

const Step2BasicSettings: React.FC = () => {
  const {
    campaignName,
    launchDate,
    backgroundImage,
    backgroundImageUrl,
    setCampaignName,
    setLaunchDate,
    setBackgroundImage,
    setBackgroundImageUrl,
    setCurrentStep
  } = useQuickCampaignStore();

  const fileInputRef = useRef<HTMLInputElement>(null);


  const handleFileUpload = (files: FileList | null) => {
    if (files && files[0]) {
      const file = files[0];
      setBackgroundImage(file);
      const url = URL.createObjectURL(file);
      setBackgroundImageUrl(url);
    }
  };

  // Les couleurs seront extraites automatiquement via le composant LogoUploader

  const canProceed = campaignName.trim() && launchDate;

  return (
    <div className="min-h-screen bg-[#ebf4f7] py-12 px-0">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl mb-4 text-[#841b60] font-semibold">
              Paramètres essentiels
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl font-light text-[#991c6e]/[0.78]">
              Configurons les bases de votre campagne
            </motion.p>
          </div>

          <div className="space-y-12">
            {/* Campaign Name */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">Nom de la campagne</label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                placeholder="Ex: Jeu concours été 2024"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#841b60] focus:outline-none transition-all text-lg bg-gray-50"
              />
            </motion.div>


            {/* Launch Date */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Date de lancement
              </label>
              <input
                type="date"
                value={launchDate}
                onChange={e => setLaunchDate(e.target.value)}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-[#841b60] focus:outline-none transition-all text-lg bg-gray-50"
              />
            </motion.div>


            {/* Logo Upload */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Logo <span className="text-gray-500 font-normal">(optionnel)</span>
              </label>
            <LogoUploader />
            </motion.div>

            {/* Background Upload */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <label className="block text-lg font-medium text-gray-900 mb-4">
                Image de fond <span className="text-gray-500 font-normal">(optionnel)</span>
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                {backgroundImageUrl ? (
                  <img
                    src={backgroundImageUrl}
                    alt="Aperçu de l'image de fond"
                    className="mx-auto mb-4 h-48 w-full object-cover rounded-xl"
                  />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                )}
                {backgroundImage ? (
                  <div>
                    <p className="text-gray-900 font-medium mb-2">{backgroundImage.name}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (backgroundImageUrl) {
                          URL.revokeObjectURL(backgroundImageUrl);
                        }
                        setBackgroundImage(null);
                        setBackgroundImageUrl(null);
                      }}
                      className="text-red-500 hover:text-red-600 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">
                      <span className="text-[#841b60] font-medium">Téléchargez une image de fond</span>
                    </p>
                    <p className="text-gray-400 text-sm">PNG, JPG jusqu'à 10MB</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-16">
            <button onClick={() => setCurrentStep(1)} className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors font-medium">
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!canProceed}
              className={`
                flex items-center space-x-2 px-8 py-4 rounded-2xl font-medium transition-all
                ${canProceed ? 'bg-[#841b60] text-white hover:bg-[#841b60]/90 shadow-lg' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
              `}
            >
              <span>Continuer</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Progress Indicator */}
          <div className="text-center mt-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-1 bg-[#841b60] rounded-full"></div>
              <div className="w-8 h-1 bg-[#841b60] rounded-full"></div>
              <div className="w-8 h-1 bg-gray-200 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-light">Étape 2 sur 3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2BasicSettings;
