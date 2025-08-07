import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, ChevronDown } from 'lucide-react';

interface MobileSidebarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  className?: string;
}

const MobileSidebarDrawer: React.FC<MobileSidebarDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title,
  className = ''
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Fermer automatiquement en mode paysage sur très petit écran
  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.innerHeight < 500 && isOpen) {
        setIsMinimized(true);
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ 
              y: isMinimized ? 'calc(100% - 60px)' : '40%' 
            }}
            exit={{ y: '100%' }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden ${className}`}
            style={{ 
              maxHeight: isMinimized ? '60px' : '60vh',
              minHeight: '60px'
            }}
          >
            {/* Handle bar + Header */}
            <div 
              className="sticky top-0 bg-white rounded-t-3xl border-b border-gray-100 z-10"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full" />
              </div>
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pb-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  {title}
                  {isMinimized ? (
                    <ChevronUp className="w-4 h-4 ml-2 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2 text-gray-400" />
                  )}
                </h3>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {children}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Empêcher le scroll du body quand le drawer est ouvert */
        ${isOpen && !isMinimized ? 'body { overflow: hidden; }' : ''}
        
        /* Optimisation pour les très petits écrans */
        @media (max-height: 600px) {
          .mobile-sidebar-drawer {
            max-height: 70vh !important;
          }
        }
        
        @media (max-height: 500px) {
          .mobile-sidebar-drawer {
            max-height: 80vh !important;
          }
        }
      `}</style>
    </>
  );
};

export default MobileSidebarDrawer;