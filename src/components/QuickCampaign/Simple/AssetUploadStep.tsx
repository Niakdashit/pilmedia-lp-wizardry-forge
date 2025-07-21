
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, Sparkles, ArrowRight } from 'lucide-react';

interface AssetUploadStepProps {
  onNext: (logo: File | null, background: File | null) => void;
}

const AssetUploadStep: React.FC<AssetUploadStepProps> = ({ onNext }) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState<'logo' | 'background' | null>(null);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent, type: 'logo' | 'background') => {
    e.preventDefault();
    setDragOver(type);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, type: 'logo' | 'background') => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      if (type === 'logo') {
        setLogoFile(imageFile);
      } else {
        setBackgroundFile(imageFile);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'logo') {
        setLogoFile(file);
      } else {
        setBackgroundFile(file);
      }
    }
  };

  const canProceed = logoFile !== null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6"
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Créez votre campagne premium
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Téléchargez vos assets et obtenez instantanément un aperçu professionnel 
            adapté à votre marque sur tous les appareils
          </motion.p>
        </div>

        {/* Upload Areas */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                1
              </div>
              Logo de marque
              <span className="text-red-500 ml-1">*</span>
            </h3>
            
            <div
              onDragOver={(e) => handleDragOver(e, 'logo')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'logo')}
              onClick={() => logoInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragOver === 'logo'
                  ? 'border-blue-500 bg-blue-50 scale-105'
                  : logoFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              {logoFile ? (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-white rounded-xl shadow-sm flex items-center justify-center overflow-hidden">
                    <img
                      src={URL.createObjectURL(logoFile)}
                      alt="Logo preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">{logoFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(logoFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center justify-center text-green-600">
                    <Sparkles className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">
                      Extraction automatique des couleurs activée
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">
                      Glissez votre logo ici
                    </p>
                    <p className="text-gray-500 text-sm">
                      PNG, SVG, JPG jusqu'à 5MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'logo')}
                className="hidden"
              />
            </div>
          </motion.div>

          {/* Background Upload */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                2
              </div>
              Image de fond
              <span className="text-gray-400 ml-2 text-sm">(optionnel)</span>
            </h3>
            
            <div
              onDragOver={(e) => handleDragOver(e, 'background')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'background')}
              onClick={() => backgroundInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragOver === 'background'
                  ? 'border-purple-500 bg-purple-50 scale-105'
                  : backgroundFile
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
              }`}
            >
              {backgroundFile ? (
                <div className="space-y-4">
                  <div className="w-full h-24 mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
                    <img
                      src={URL.createObjectURL(backgroundFile)}
                      alt="Background preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">{backgroundFile.name}</p>
                    <p className="text-sm text-green-600">
                      {(backgroundFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Image className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">
                      Ajoutez une image de fond
                    </p>
                    <p className="text-gray-500 text-sm">
                      PNG, JPG jusqu'à 10MB
                    </p>
                  </div>
                </div>
              )}
              
              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'background')}
                className="hidden"
              />
            </div>
          </motion.div>
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <button
            onClick={() => canProceed && onNext(logoFile, backgroundFile)}
            disabled={!canProceed}
            className={`inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
              canProceed
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-xl hover:scale-105'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Créer l'aperçu premium
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
          
          {!canProceed && (
            <p className="text-sm text-gray-500 mt-3">
              Veuillez télécharger au minimum un logo pour continuer
            </p>
          )}
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-white/70 backdrop-blur-sm rounded-2xl p-8"
        >
          <h4 className="text-lg font-semibold text-gray-800 mb-6 text-center">
            Ce qui vous attend ensuite
          </h4>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-700">Extraction automatique</p>
              <p className="text-sm text-gray-500">Couleurs et polices de votre marque</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Image className="w-6 h-6 text-purple-600" />
              </div>
              <p className="font-medium text-gray-700">Preview multi-device</p>
              <p className="text-sm text-gray-500">Desktop, tablette et mobile</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ArrowRight className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-700">Suggestions IA</p>
              <p className="text-sm text-gray-500">Textes adaptés à votre marque</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AssetUploadStep;
