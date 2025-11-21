import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface MobilePreviewProps {
  children: React.ReactNode;
  onClose: () => void;
}

const MobilePreview: React.FC<MobilePreviewProps> = ({ children, onClose }) => {
  const previewRef = useRef<HTMLDivElement>(null);

  // Empêcher le défilement de la page lorsque le modal est ouvert
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="relative w-full max-w-[390px] h-[calc(100vh-2rem)] max-h-[844px] bg-white rounded-[40px] overflow-hidden shadow-2xl border-[12px] border-gray-800">
        {/* Encoche du haut */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-800 rounded-b-2xl z-10"></div>
        
        {/* Bouton de fermeture */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-gray-100 rounded-full shadow-md hover:bg-gray-200 transition-colors"
          aria-label="Fermer la prévisualisation"
        >
          <X className="w-5 h-5 text-gray-800" />
        </button>
        
        {/* Contenu de la prévisualisation */}
        <div 
          ref={previewRef}
          className="w-full h-full overflow-auto bg-white"
          style={{
            // Masquer la barre de défilement pour un look plus natif
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <style>{`
            /* Masquer la barre de défilement sur tous les navigateurs */
            .mobile-preview-container::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          <div className="mobile-preview-container w-full min-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobilePreview;
