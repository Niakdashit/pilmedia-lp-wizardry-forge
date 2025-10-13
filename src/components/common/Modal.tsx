
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
  maxHeight?: string; // Nouvelle prop pour contrôler la hauteur max
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, width = 'max-w-md', maxHeight }) => {
  useEffect(() => {
    // Aide au debug en cas de soucis d'affichage
    // eslint-disable-next-line no-console
    console.log('[Modal] mount');
    return () => {
      // eslint-disable-next-line no-console
      console.log('[Modal] unmount');
    };
  }, []);

  const modalContent = (
    <div 
      className="bg-black/40 p-4"
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        zIndex: 2147483647, // super élevé pour passer devant tout
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto'
      }}
    >
      <div 
        className={`bg-white rounded-[2px] shadow-xl w-full ${width} relative max-h-[90vh] overflow-hidden`}
      >
        {/* Bouton de fermeture */}
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Fermer"
          type="button"
        >
          ×
        </button>
        {/* Titre */}
        {title && (
          <div className="px-6 pt-6 pb-2">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        {/* Contenu */}
        <div 
          className="px-6 pb-6 pt-2 overflow-y-auto"
          style={{
            maxHeight: maxHeight || '70vh' // Hauteur adaptative (70% de la hauteur de l'écran par défaut)
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Utiliser createPortal pour rendre le modal directement dans le body
  return createPortal(modalContent, document.body);
};

export default Modal;
