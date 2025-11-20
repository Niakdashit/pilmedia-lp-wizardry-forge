import React, { useEffect, useState } from 'react';
import { X, Monitor, Smartphone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPreviewUrl, copyPreviewUrl } from '../../utils/previewUrl';

interface FullScreenPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  device?: 'desktop' | 'mobile';
  onDeviceChange?: (device: 'desktop' | 'mobile') => void;
  campaignId?: string;
}

const FullScreenPreviewModal: React.FC<FullScreenPreviewModalProps> = ({
  isOpen,
  onClose,
  children,
  device = 'desktop',
  onDeviceChange,
  campaignId
}) => {
  const [isCopied, setIsCopied] = useState(false);
  
  const previewUrl = campaignId ? getPreviewUrl(campaignId) : null;

  const handleCopyUrl = async () => {
    if (!campaignId) return;
    
    try {
      await copyPreviewUrl(campaignId);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };
  // Empêcher le scroll du body quand la modale est ouverte
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Header avec contrôles */}
          <div className="absolute top-0 left-0 right-0 z-[10000] bg-gradient-to-b from-black/80 to-transparent p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              {/* Titre et URL */}
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="text-white font-semibold text-lg">
                    Prévisualisation en grand écran
                  </h2>
                </div>
                {previewUrl && (
                  <div className="flex items-center gap-2 ml-5">
                    <a 
                      href={previewUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-white/80 hover:text-white hover:underline"
                    >
                      {previewUrl}
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl();
                      }}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                      title="Copier l'URL"
                    >
                      {isCopied ? (
                        <Check className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-white/80" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Sélecteur d'appareil */}
              {onDeviceChange && (
                <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20 backdrop-blur-md">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeviceChange('desktop');
                    }}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      device === 'desktop'
                        ? 'bg-white/20 shadow-sm text-white ring-1 ring-white/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="Desktop"
                  >
                    <Monitor className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeviceChange('mobile');
                    }}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      device === 'mobile'
                        ? 'bg-white/20 shadow-sm text-white ring-1 ring-white/30'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                    title="Mobile"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bouton fermer */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md border border-white/20"
                title="Fermer (Échap)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Contenu de la prévisualisation */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="absolute inset-0 pt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full">
              {children}
            </div>
          </motion.div>

          {/* Indicateur d'aide en bas */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[10000]">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2">
              <p className="text-white/80 text-sm">
                Appuyez sur <kbd className="px-2 py-0.5 bg-white/20 rounded text-xs font-mono">Échap</kbd> pour fermer
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenPreviewModal;
