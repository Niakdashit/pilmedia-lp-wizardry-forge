
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
  width?: string;
  backgroundColor?: string;
  borderRadius?: string | number;
  overlayBackground?: string; // Fond général (arrière-plan plein écran)
  // Dimensions explicites du contenu (carte)
  contentWidth?: string | number;
  contentHeight?: string | number;
  maxContentHeight?: string | number;
  maxContentWidth?: string | number;
}

const Modal: React.FC<ModalProps> = ({
  title,
  children,
  onClose,
  width = 'max-w-md',
  backgroundColor = '#ffffff',
  borderRadius = '12px',
  overlayBackground = 'rgba(0,0,0,0.4)',
  contentWidth,
  contentHeight,
  maxContentHeight,
  maxContentWidth
}) => {
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
      className="p-4"
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
        pointerEvents: 'auto',
        background: overlayBackground
      }}
    >
      <div
        className={`shadow-xl relative ${(!contentWidth && !maxContentWidth) ? `w-full ${width}` : 'w-auto'}`}
        style={{
          backgroundColor,
          borderRadius,
          // Dimensions contrôlables par props
          ...(contentWidth !== undefined ? { width: contentWidth } : {}),
          ...(contentHeight !== undefined ? { height: contentHeight } : {}),
          maxHeight: (maxContentHeight as any) || '90vh',
          ...(maxContentWidth !== undefined ? { maxWidth: maxContentWidth } : {}),
          display: 'flex',
          flexDirection: 'column'
        }}
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
          <div className="px-6 pt-6 pb-2 shrink-0">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        {/* Contenu */}
        <div
          className="px-6 pb-6 pt-2"
          style={{
            // Laisser la hauteur s'adapter au contenu, tout en prévenant le dépassement
            maxHeight: (maxContentHeight as any) || 'calc(90vh - 80px)',
            overflowY: 'auto'
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
