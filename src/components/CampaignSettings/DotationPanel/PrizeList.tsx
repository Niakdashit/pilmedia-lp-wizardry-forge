import React from 'react';
import { Plus, Gift } from 'lucide-react';
import { Prize } from '@/types/dotation';
import { PrizeCard } from './PrizeCard';

interface PrizeListProps {
  prizes: Prize[];
  onAdd: () => void;
  onEdit: (prize: Prize) => void;
  onDelete: (prizeId: string) => void;
}

export const PrizeList: React.FC<PrizeListProps> = ({ prizes, onAdd, onEdit, onDelete }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Lots disponibles ({prizes.length})</h4>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter un lot
        </button>
      </div>

      {prizes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Aucun lot configuré</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#841b60] text-white rounded-lg hover:bg-[#6d1550] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Créer le premier lot
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {prizes.map((prize) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
              onEdit={() => onEdit(prize)}
              onDelete={() => onDelete(prize.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
