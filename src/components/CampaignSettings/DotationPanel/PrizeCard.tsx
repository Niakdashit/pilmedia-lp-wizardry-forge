import React from 'react';
import { Calendar, Percent, Users, Hash, Gift, Eye, Trash2 } from 'lucide-react';
import { Prize, AttributionMethod } from '@/types/dotation';

interface PrizeCardProps {
  prize: Prize;
  onEdit: () => void;
  onDelete: () => void;
}

export const PrizeCard: React.FC<PrizeCardProps> = ({ prize, onEdit, onDelete }) => {
  const getMethodIcon = (method: AttributionMethod) => {
    switch (method) {
      case 'calendar': return <Calendar className="w-4 h-4" />;
      case 'probability': return <Percent className="w-4 h-4" />;
      case 'quota': return <Users className="w-4 h-4" />;
      case 'rank': return <Hash className="w-4 h-4" />;
      case 'instant_win': return <Gift className="w-4 h-4" />;
    }
  };

  const getMethodLabel = (method: AttributionMethod) => {
    switch (method) {
      case 'calendar': return 'Calendrier';
      case 'probability': return 'Probabilité';
      case 'quota': return 'Quota';
      case 'rank': return 'Rang';
      case 'instant_win': return 'Gain instantané';
    }
  };

  const remainingQuantity = prize.totalQuantity - prize.awardedQuantity;
  const progressPercent = (prize.awardedQuantity / prize.totalQuantity) * 100;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h5 className="font-medium text-gray-900">{prize.name}</h5>
          {prize.description && (
            <p className="text-sm text-gray-600 mt-1">{prize.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-600 hover:text-[#841b60] hover:bg-gray-100 rounded transition-colors"
            title="Modifier"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {/* Méthode d'attribution */}
        <div className="flex items-center gap-2 text-sm">
          {getMethodIcon(prize.attribution.method)}
          <span className="text-gray-700">{getMethodLabel(prize.attribution.method)}</span>
        </div>

        {/* Progression */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Progression</span>
            <span className="font-medium text-gray-900">
              {prize.awardedQuantity} / {prize.totalQuantity}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#841b60] h-2 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {remainingQuantity} lot{remainingQuantity > 1 ? 's' : ''} restant{remainingQuantity > 1 ? 's' : ''}
          </p>
        </div>

        {/* Statut */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            prize.status === 'active' ? 'bg-green-100 text-green-800' :
            prize.status === 'exhausted' ? 'bg-red-100 text-red-800' :
            prize.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            prize.status === 'expired' ? 'bg-gray-100 text-gray-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {prize.status === 'active' ? 'Actif' :
             prize.status === 'exhausted' ? 'Épuisé' :
             prize.status === 'scheduled' ? 'Programmé' :
             prize.status === 'expired' ? 'Expiré' :
             'En pause'}
          </span>
        </div>
      </div>
    </div>
  );
};
