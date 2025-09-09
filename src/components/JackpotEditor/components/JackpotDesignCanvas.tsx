import React from 'react';
import { motion } from 'framer-motion';
import { getDeviceDimensions } from '../../../utils/deviceDimensions';

interface JackpotDesignCanvasProps {
  config: any;
  selectedDevice: 'desktop' | 'tablet' | 'mobile';
  onConfigUpdate: (updates: any) => void;
  zoom?: number;
}

const JackpotDesignCanvas: React.FC<JackpotDesignCanvasProps> = ({
  config,
  selectedDevice,
  onConfigUpdate,
  zoom = 0.7
}) => {
  const jackpotConfig = config.gameConfig?.jackpot || {};
  const design = config.design || {};

  // Dimensions selon l'appareil - utilise les dimensions standardisées
  const dimensions = getDeviceDimensions(selectedDevice);
  const { width, height } = dimensions;
  
  // Utiliser le zoom passé en props ou valeur par défaut
  const scale = zoom || (() => {
    switch (selectedDevice) {
      case 'desktop': return 0.7;
      case 'tablet': return 0.55;
      case 'mobile': return 0.45;
      default: return 0.7;
    }
  })();

  // Simulation du jackpot avec slots
  const renderJackpotSlots = () => {
    const symbols = ['🍒', '🍋', '🍊', '⭐', '💎', '🎰'];

    return (
      <div className="flex" style={{ gap: `${8 * scale}px` }}>
        {[1, 2, 3].map((slotIndex) => (
          <motion.div
            key={slotIndex}
            className="flex flex-col items-center justify-center rounded-lg shadow-lg"
            style={{
              width: `${80 * scale}px`,
              height: `${100 * scale}px`,
              backgroundColor: jackpotConfig.slotBackgroundColor || '#ffffff',
              border: `${(jackpotConfig.slotBorderWidth || 2) * scale}px solid ${jackpotConfig.slotBorderColor || '#a78bfa'}`
            }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ fontSize: `${30 * scale}px`, marginBottom: `${4 * scale}px` }}>
              {symbols[Math.floor(Math.random() * symbols.length)]}
            </div>
            <div style={{ fontSize: `${12 * scale}px`, color: '#6b7280' }}>
              SLOT {slotIndex}
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

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
    <div className="design-canvas-container flex-1 flex flex-col items-center justify-center p-4 bg-gray-100 relative">
      <div className="flex items-center justify-center w-full h-full">
        <motion.div
          className="relative bg-white rounded-lg shadow-lg overflow-hidden"
          style={{
            width: width * scale,
            height: height * scale,
            ...backgroundStyle
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Overlay pour l'arrière-plan image */}
          {design.background?.type === 'image' && (
            <div className="absolute inset-0 bg-black/20" />
          )}

          {/* Contenu principal */}
          <div className="relative h-full flex flex-col items-center justify-center" style={{ padding: `${32 * scale}px` }}>
          {/* Titre */}
          <motion.h1
            style={{
              fontSize: `${36 * scale}px`,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: `${32 * scale}px`,
              color: 'white',
              textShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            🎰 JACKPOT 🎰
          </motion.h1>

          {/* Conteneur du jackpot */}
          <motion.div
            className="rounded-2xl shadow-2xl"
            style={{
              padding: `${32 * scale}px`,
              backgroundColor: jackpotConfig.containerBackgroundColor || '#1f2937',
              border: `${(jackpotConfig.borderWidth || 3) * scale}px solid ${jackpotConfig.borderColor || '#8b5cf6'}`
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Zone de jeu */}
            <div
              className="rounded-xl mb-6"
              style={{
                padding: `${24 * scale}px`,
                backgroundColor: jackpotConfig.backgroundColor || '#c4b5fd30'
              }}
            >
              {/* Slots du jackpot */}
              <div className="flex flex-col items-center" style={{ gap: `${16 * scale}px` }}>
                <div style={{
                  color: 'white',
                  fontSize: `${18 * scale}px`,
                  fontWeight: '600'
                }}>
                  Tentez votre chance !
                </div>

                {renderJackpotSlots()}

                <div style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: `${14 * scale}px`,
                  textAlign: 'center'
                }}>
                  Alignez 3 symboles identiques pour gagner
                </div>
              </div>
            </div>

            {/* Bouton de jeu */}
            <motion.button
              className="w-full rounded-xl shadow-lg transition-all duration-200"
              style={{
                padding: `${16 * scale}px ${24 * scale}px`,
                fontSize: `${18 * scale}px`,
                fontWeight: 'bold',
                backgroundColor: config.buttonConfig?.color || jackpotConfig.buttonColor || '#ec4899',
                color: config.buttonConfig?.textColor || '#ffffff'
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 ${10 * scale}px ${25 * scale}px rgba(0,0,0,0.2)` }}
              whileTap={{ scale: 0.98 }}
            >
              {config.buttonConfig?.text || jackpotConfig.buttonLabel || 'Lancer le Jackpot'}
            </motion.button>

            {/* Indicateur de probabilité */}
            <div className="mt-4 text-center" style={{ marginTop: `${16 * scale}px` }}>
              <div style={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: `${12 * scale}px`
              }}>
                Probabilité de gain: {jackpotConfig.instantWin?.winProbability || 30}%
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.4)',
                fontSize: `${12 * scale}px`
              }}>
                {jackpotConfig.instantWin?.winnersCount || 0} / {jackpotConfig.instantWin?.maxWinners || 100} gagnants
              </div>
            </div>
          </motion.div>

          {/* Informations sur les lots */}
          {config.prizes && config.prizes.length > 0 && (
            <motion.div
              className="text-center"
              style={{ marginTop: `${24 * scale}px` }}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: `${14 * scale}px`,
                marginBottom: `${8 * scale}px`
              }}>
                🏆 {config.prizes.filter((p: any) => p.isActive).length} lots à gagner
              </div>
              <div className="flex flex-wrap justify-center" style={{ gap: `${8 * scale}px` }}>
                {config.prizes.slice(0, 3).map((prize: any, index: number) => (
                  <div
                    key={prize.id}
                    className="bg-white/20 backdrop-blur-sm rounded-lg text-white"
                    style={{
                      padding: `${6 * scale}px ${12 * scale}px`,
                      fontSize: `${12 * scale}px`
                    }}
                  >
                    {prize.name}
                  </div>
                ))}
                {config.prizes.length > 3 && (
                  <div
                    className="bg-white/20 backdrop-blur-sm rounded-lg text-white"
                    style={{
                      padding: `${6 * scale}px ${12 * scale}px`,
                      fontSize: `${12 * scale}px`
                    }}
                  >
                    +{config.prizes.length - 3} autres
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Indicateur d'appareil */}
        <div
          className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg text-white"
          style={{
            padding: `${6 * scale}px ${12 * scale}px`,
            fontSize: `${12 * scale}px`,
            fontWeight: '600'
          }}
        >
          {selectedDevice === 'desktop' ? '🖥️ Bureau' :
           selectedDevice === 'tablet' ? '📱 Tablette' :
           '📱 Mobile'}
        </div>

        {/* Effets visuels */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
          {/* Particules flottantes */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.6, 1, 0.6],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>
      </div>

      {/* Informations de debug */}
      <div
        className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded-lg text-white"
        style={{
          padding: `${12 * scale}px`,
          fontSize: `${12 * scale}px`
        }}
      >
        <div>Appareil: {selectedDevice}</div>
        <div>Canvas: {width}×{height}px</div>
        <div>Affichage: {Math.round(width * scale)}×{Math.round(height * scale)}px</div>
        <div>Échelle: {Math.round(scale * 100)}%</div>
        <div>Lots: {config.prizes?.length || 0}</div>
      </div>
    </div>
  );
};

export default JackpotDesignCanvas;
