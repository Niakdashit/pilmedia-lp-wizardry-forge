
import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, width = 'max-w-md' }) => {
  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className={`bg-white rounded-xl shadow-xl w-full ${width} relative max-h-[90vh] overflow-hidden`}
        style={{ margin: 'auto' }}
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
        <div className="px-6 pb-6 pt-2 max-h-96 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  // Utiliser createPortal pour rendre le modal directement dans le body
  return createPortal(modalContent, document.body);
};

export default Modal;
