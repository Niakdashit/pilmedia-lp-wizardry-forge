import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Tablet, Smartphone } from 'lucide-react';

interface JackpotPreviewModalProps {
  config: any;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onClose: () => void;
}

const JackpotPreviewModal: React.FC<JackpotPreviewModalProps> = ({
  config,
  selectedDevice,
  onClose
}) => {
  const jackpotConfig = config.gameConfig?.jackpot || {};
  const design = config.design || {};

  const getDeviceIcon = () => {
    switch (selectedDevice) {
      case 'tablet': return <Tablet className="w-5 h-5" />;
      case 'mobile': return <Smartphone className="w-5 h-5" />;
      default: return <Monitor className="w-5 h-5" />;
    }
  };

  const getDeviceDimensions = () => {
    switch (selectedDevice) {
      case 'mobile':
        return { width: 375, height: 667, scale: 1 };
      case 'tablet':
        return { width: 768, height: 1024, scale: 0.8 };
      default:
        return { width: 1200, height: 800, scale: 0.9 };
    }
  };

  const { width, height, scale } = getDeviceDimensions();

  const backgroundStyle = design.background?.type === 'image' 
    ? {
        backgroundImage: `url(${design.background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {
        backgroundColor: design.background?.value || '#f8fafc'
      };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getDeviceIcon()}
              <h2 className="text-xl font-semibold text-gray-900">
                Aperçu - {selectedDevice === 'desktop' ? 'Bureau' : 
                          selectedDevice === 'tablet' ? 'Tablette' : 'Mobile'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-8 flex items-center justify-center bg-gray-100">
            <motion.div
              className="relative rounded-2xl shadow-2xl overflow-hidden"
              style={{
                width: width * scale,
                height: height * scale,
                ...backgroundStyle
              }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Overlay pour l'arrière-plan image */}
              {design.background?.type === 'image' && (
                <div className="absolute inset-0 bg-black/20" />
              )}

              {/* Contenu principal */}
              <div className="relative h-full flex flex-col items-center justify-center p-8">
                {/* Titre */}
                <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">
                  🎰 JACKPOT 🎰
                </h1>

                {/* Conteneur du jackpot */}
                <div
                  className="rounded-2xl p-8 shadow-2xl"
                  style={{
                    backgroundColor: jackpotConfig.containerBackgroundColor || '#1f2937',
                    border: `${jackpotConfig.borderWidth || 3}px solid ${jackpotConfig.borderColor || '#8b5cf6'}`
                  }}
                >
                  {/* Zone de jeu */}
                  <div
                    className="rounded-xl p-6 mb-6"
                    style={{
                      backgroundColor: jackpotConfig.backgroundColor || '#c4b5fd30'
                    }}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-white text-lg font-semibold">
                        Tentez votre chance !
                      </div>
                      
                      {/* Slots simulés */}
                      <div className="flex space-x-2">
                        {[1, 2, 3].map((slotIndex) => (
                          <div
                            key={slotIndex}
                            className="flex flex-col items-center justify-center rounded-lg shadow-lg"
                            style={{
                              width: '80px',
                              height: '100px',
                              backgroundColor: jackpotConfig.slotBackgroundColor || '#ffffff',
                              border: `${jackpotConfig.slotBorderWidth || 2}px solid ${jackpotConfig.slotBorderColor || '#a78bfa'}`
                            }}
                          >
                            <div className="text-3xl mb-1">
                              {['🍒', '🍋', '💎'][slotIndex - 1]}
                            </div>
                            <div className="text-xs text-gray-600">
                              SLOT {slotIndex}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-white/80 text-sm text-center">
                        Alignez 3 symboles identiques pour gagner
                      </div>
                    </div>
                  </div>

                  {/* Bouton de jeu */}
                  <button
                    className="w-full py-4 px-6 rounded-xl font-bold text-lg shadow-lg"
                    style={{
                      backgroundColor: config.buttonConfig?.color || jackpotConfig.buttonColor || '#ec4899',
                      color: config.buttonConfig?.textColor || '#ffffff'
                    }}
                  >
                    {config.buttonConfig?.text || jackpotConfig.buttonLabel || 'Lancer le Jackpot'}
                  </button>

                  {/* Indicateurs */}
                  <div className="mt-4 text-center">
                    <div className="text-white/60 text-xs">
                      Probabilité de gain: {jackpotConfig.instantWin?.winProbability || 30}%
                    </div>
                    <div className="text-white/40 text-xs">
                      {jackpotConfig.instantWin?.winnersCount || 0} / {jackpotConfig.instantWin?.maxWinners || 100} gagnants
                    </div>
                  </div>
                </div>

                {/* Lots disponibles */}
                {config.prizes && config.prizes.length > 0 && (
                  <div className="mt-6 text-center">
                    <div className="text-white/80 text-sm mb-2">
                      🏆 {config.prizes.filter((p: any) => p.isActive).length} lots à gagner
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {config.prizes.slice(0, 3).map((prize: any) => (
                        <div
                          key={prize.id}
                          className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs"
                        >
                          {prize.name}
                        </div>
                      ))}
                      {config.prizes.length > 3 && (
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-xs">
                          +{config.prizes.length - 3} autres
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Footer avec informations */}
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Résolution: {width}×{height}</span>
                <span>Lots: {config.prizes?.length || 0}</span>
                <span>Taux de gain: {jackpotConfig.instantWin?.winProbability || 30}%</span>
              </div>
              <div className="text-xs text-gray-500">
                Aperçu en temps réel
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default JackpotPreviewModal;
