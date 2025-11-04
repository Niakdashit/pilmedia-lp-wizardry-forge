import React from 'react';
import { X } from 'lucide-react';
import { CSSProperties } from 'react';

interface SimpleTextEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEffect: (effect: any) => void;
  selectedElement?: any;
}

const SimpleTextEffectsModal: React.FC<SimpleTextEffectsModalProps> = ({
  isOpen,
  onClose,
  onSelectEffect,
  selectedElement
}) => {
  if (!isOpen) return null;

  // Liste des effets de texte (similaire à celle dans TextEffectsPanel)
  const textEffects: Array<{
    id: string;
    name: string;
    css: CSSProperties;
  }> = [
    {
      id: 'none',
      name: 'Aucun effet',
      css: {}
    },
    {
      id: 'background',
      name: 'Fond',
      css: {
        backgroundColor: 'rgba(251,255,0,1)',
        color: '#000000',
        padding: '8px 16px',
        borderRadius: '4px'
      } as CSSProperties
    },
    {
      id: 'yellow-button',
      name: 'Bouton Jaune',
      css: {
        backgroundColor: '#FFD700',
        color: '#000000',
        fontWeight: 'bold',
        padding: '10px 24px',
        borderRadius: '24px',
        textAlign: 'center' as const,
        display: 'inline-block',
        minWidth: '120px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      } as CSSProperties
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col shadow-xl">
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-medium">Effets de texte</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Liste des effets */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {textEffects.map((effect) => (
            <button
              key={effect.id}
              onClick={() => {
                onSelectEffect(effect);
                onClose();
              }}
              className="w-full p-3 text-left rounded-md hover:bg-gray-100 transition-colors border"
              style={effect.css}
            >
              {effect.name}
            </button>
          ))}
        </div>
        
        {/* Pied de page */}
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTextEffectsModal;
