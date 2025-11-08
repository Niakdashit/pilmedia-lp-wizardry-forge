
import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import ImageUpload from '../../../common/ImageUpload';

interface ScratchCardsManagerProps {
  cards: any[];
  onAddCard: () => void;
  onRemoveCard: (index: number) => void;
  onUpdateCard: (index: number, field: string, value: string) => void;
  maxCards: number;
}

const ScratchCardsManager: React.FC<ScratchCardsManagerProps> = ({
  cards,
  onAddCard,
  onRemoveCard,
  onUpdateCard,
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

      {cards.map((card: any, index: number) => (
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
