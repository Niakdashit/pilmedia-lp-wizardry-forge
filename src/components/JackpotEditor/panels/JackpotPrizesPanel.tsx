import React, { useState } from 'react';
import { Trophy, Plus, Trash2, Edit3, Gift, DollarSign, Calendar } from 'lucide-react';

interface Prize {
  id: string;
  name: string;
  description: string;
  value: string;
  type: 'physical' | 'digital' | 'discount' | 'points';
  quantity: number;
  image?: string;
  isActive: boolean;
}

interface JackpotPrizesPanelProps {
  config: any;
  onConfigUpdate: (updates: any) => void;
}

const JackpotPrizesPanel: React.FC<JackpotPrizesPanelProps> = ({
  config,
  onConfigUpdate
}) => {
  const [editingPrize, setEditingPrize] = useState<Prize | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const prizes = config.prizes || [];

  const updatePrizes = (newPrizes: Prize[]) => {
    onConfigUpdate({
      prizes: newPrizes
    });
  };

  const addPrize = (prize: Omit<Prize, 'id'>) => {
    const newPrize: Prize = {
      ...prize,
      id: `prize-${Date.now()}`
    };
    updatePrizes([...prizes, newPrize]);
    setShowAddForm(false);
  };

  const updatePrize = (prizeId: string, updates: Partial<Prize>) => {
    const updatedPrizes = prizes.map((prize: Prize) =>
      prize.id === prizeId ? { ...prize, ...updates } : prize
    );
    updatePrizes(updatedPrizes);
    setEditingPrize(null);
  };

  const deletePrize = (prizeId: string) => {
    const updatedPrizes = prizes.filter((prize: Prize) => prize.id !== prizeId);
    updatePrizes(updatedPrizes);
  };

  const PrizeForm: React.FC<{
    prize?: Prize;
    onSave: (prize: Omit<Prize, 'id'> | Prize) => void;
    onCancel: () => void;
  }> = ({ prize, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Prize, 'id'>>({
      name: prize?.name || '',
      description: prize?.description || '',
      value: prize?.value || '',
      type: prize?.type || 'physical',
      quantity: prize?.quantity || 1,
      image: prize?.image || '',
      isActive: prize?.isActive !== false
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (prize) {
        onSave({ ...prize, ...formData });
      } else {
        onSave(formData);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg border">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom du lot
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="iPhone 15 Pro"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de lot
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Prize['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="physical">Physique</option>
              <option value="digital">Numérique</option>
              <option value="discount">Réduction</option>
              <option value="points">Points</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Description détaillée du lot..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valeur
            </label>
            <input
              type="text"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="1299€"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL de l'image (optionnel)
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
            Lot actif
          </label>
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {prize ? 'Modifier' : 'Ajouter'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </form>
    );
  };

  const getPrizeIcon = (type: Prize['type']) => {
    switch (type) {
      case 'physical': return <Gift className="w-4 h-4" />;
      case 'digital': return <Trophy className="w-4 h-4" />;
      case 'discount': return <DollarSign className="w-4 h-4" />;
      case 'points': return <Calendar className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getPrizeTypeLabel = (type: Prize['type']) => {
    switch (type) {
      case 'physical': return 'Physique';
      case 'digital': return 'Numérique';
      case 'discount': return 'Réduction';
      case 'points': return 'Points';
      default: return 'Physique';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Gestion des lots
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Ajouter un lot
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-blue-600">
            {prizes.length}
          </div>
          <div className="text-sm text-blue-700">Lots total</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {prizes.filter((p: Prize) => p.isActive).length}
          </div>
          <div className="text-sm text-green-700">Lots actifs</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-2xl font-bold text-yellow-600">
            {prizes.reduce((sum: number, p: Prize) => sum + p.quantity, 0)}
          </div>
          <div className="text-sm text-yellow-700">Quantité totale</div>
        </div>
      </div>

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <PrizeForm
          onSave={addPrize}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Formulaire d'édition */}
      {editingPrize && (
        <PrizeForm
          prize={editingPrize}
          onSave={(updatedPrize) => updatePrize(editingPrize.id, updatedPrize as Prize)}
          onCancel={() => setEditingPrize(null)}
        />
      )}

      {/* Liste des lots */}
      <div className="space-y-3">
        {prizes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun lot configuré</p>
            <p className="text-sm">Ajoutez votre premier lot pour commencer</p>
          </div>
        ) : (
          prizes.map((prize: Prize) => (
            <div
              key={prize.id}
              className={`border rounded-lg p-4 transition-all ${
                prize.isActive
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`p-1 rounded ${
                      prize.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getPrizeIcon(prize.type)}
                    </div>
                    <h4 className="font-medium text-gray-900">{prize.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      prize.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prize.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  {prize.description && (
                    <p className="text-sm text-gray-600 mb-2">{prize.description}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      {getPrizeIcon(prize.type)}
                      <span className="ml-1">{getPrizeTypeLabel(prize.type)}</span>
                    </span>
                    {prize.value && (
                      <span>Valeur: {prize.value}</span>
                    )}
                    <span>Quantité: {prize.quantity}</span>
                  </div>
                </div>

                {prize.image && (
                  <div className="ml-4">
                    <img
                      src={prize.image}
                      alt={prize.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  </div>
                )}

                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() => setEditingPrize(prize)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deletePrize(prize.id)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conseils */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Conseils pour vos lots</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Variez les types de lots pour attirer différents profils</li>
          <li>• Ajoutez des images pour rendre vos lots plus attractifs</li>
          <li>• Limitez les quantités pour créer un sentiment d'urgence</li>
          <li>• Désactivez temporairement les lots en rupture de stock</li>
        </ul>
      </div>
    </div>
  );
};

export default JackpotPrizesPanel;
