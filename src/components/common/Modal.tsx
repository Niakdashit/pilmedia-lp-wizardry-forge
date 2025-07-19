
import React from 'react';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose, width = 'max-w-md' }) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40`}>
      <div className={`bg-white rounded-xl shadow-xl w-full ${width} relative mx-4`}>
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
};

export default Modal;
