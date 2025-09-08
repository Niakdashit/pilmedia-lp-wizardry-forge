
import React from 'react';
import { Plus, Trash2, Palette } from 'lucide-react';
import ImageUpload from '../../../common/ImageUpload';
import type { ScratchCard } from '../../../../types/ScratchCard';

interface ScratchCardsManagerProps {
  cards: ScratchCard[];
  onAddCard: () => void;
  onRemoveCard: (index: number) => void;
  onUpdateCard: (index: number, field: string, value: string) => void;
  onColorChange: (cardId: string, color: string) => void;
  onCoverSelected: (cardId: string, file: File) => void;
  onCoverRemoved: (cardId: string) => void;
  maxCards: number;
}

const ScratchCardsManager: React.FC<ScratchCardsManagerProps> = ({
  cards,
  onAddCard,
  onRemoveCard,
  onUpdateCard,
  onColorChange,
  onCoverSelected,
  onCoverRemoved,
  maxCards
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Cartes à gratter ({cards.length})
        </label>
        {cards.length < maxCards && (
          <button
            type="button"
            onClick={onAddCard}
            className="text-sm text-[#841b60] hover:text-[#6d164f] flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Ajouter une carte
          </button>
        )}
      </div>

      {cards.map((card: ScratchCard, index: number) => (
        <div key={card.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-gray-700">Carte {index + 1}</h4>
            {cards.length > 1 && (
              <button 
                onClick={() => onRemoveCard(index)} 
                className="p-1 text-red-500 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type de contenu */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Type de contenu</label>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`content-type-${card.id}`}
                  checked={!card.cover}
                  onChange={() => {
                    if (card.cover) {
                      onCoverRemoved(card.id);
                    }
                  }}
                  className="mr-2"
                />
                <Palette className="w-4 h-4 mr-1" />
                Couleur
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`content-type-${card.id}`}
                  checked={!!card.cover}
                  readOnly
                  className="mr-2"
                />
                Image
              </label>
            </div>
          </div>

          {/* Couleur de carte (seulement si pas d'image) */}
          {!card.cover && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Couleur de carte</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={card.color || '#E3C0B7'}
                  onChange={(e) => onColorChange(card.id, e.target.value)}
                  className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={card.color || '#E3C0B7'}
                  onChange={(e) => onColorChange(card.id, e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm font-mono"
                  placeholder="#E3C0B7"
                />
              </div>
            </div>
          )}

          {/* Upload d'image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {card.cover ? 'Image de couverture' : 'Choisir une image'}
            </label>
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onCoverSelected(card.id, file);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#841b60] file:text-white hover:file:bg-[#6d164f]"
              />
              {card.cover && (
                <button
                  onClick={() => onCoverRemoved(card.id)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer l'image
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message spécifique</label>
            <input
              type="text"
              value={card.revealMessage || ''}
              onChange={(e) => onUpdateCard(index, 'revealMessage', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60]"
              placeholder="Laisser vide pour utiliser le message par défaut"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Image spécifique</label>
            <ImageUpload
              value={card.revealImage || ''}
              onChange={(value) => onUpdateCard(index, 'revealImage', value)}
              label=""
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ScratchCardsManager;
