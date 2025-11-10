import React, { useState } from 'react';
import {
  Prize,
  AttributionMethod,
  CalendarAttribution,
  ProbabilityAttribution,
  QuotaAttribution,
  RankAttribution,
  InstantWinAttribution
} from '@/types/dotation';

interface AttributionMethodEditorProps {
  prize: Prize;
  onChange: (prize: Prize) => void;
}

export const AttributionMethodEditor: React.FC<AttributionMethodEditorProps> = ({ prize, onChange }) => {
  const [method, setMethod] = useState<AttributionMethod>(prize.attribution.method);

  const updateMethod = (newMethod: AttributionMethod) => {
    setMethod(newMethod);
    
    // Créer une config par défaut selon la méthode
    let newAttribution: any;
    
    switch (newMethod) {
      case 'calendar':
        newAttribution = {
          method: 'calendar',
          scheduledDate: new Date().toISOString().split('T')[0],
          scheduledTime: '12:00',
          timeWindow: 0
        } as CalendarAttribution;
        break;
      
      case 'probability':
        newAttribution = {
          method: 'probability',
          winProbability: 10,
          distribution: 'uniform'
        } as ProbabilityAttribution;
        break;
      
      case 'quota':
        newAttribution = {
          method: 'quota',
          winnersCount: 1,
          totalParticipants: 100,
          selectionStrategy: 'random'
        } as QuotaAttribution;
        break;
      
      case 'rank':
        newAttribution = {
          method: 'rank',
          winningRanks: [100],
          tolerance: 0
        } as RankAttribution;
        break;
      
      case 'instant_win':
        newAttribution = {
          method: 'instant_win',
          guaranteed: true
        } as InstantWinAttribution;
        break;
    }
    
    onChange({ ...prize, attribution: newAttribution });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Méthode d'attribution *
        </label>
        <select
          value={method}
          onChange={(e) => updateMethod(e.target.value as AttributionMethod)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        >
          <option value="calendar">📅 Calendrier (date/heure précise)</option>
          <option value="probability">🎲 Probabilité (% de chance)</option>
          <option value="quota">👥 Quota (X gagnants sur Y participants)</option>
          <option value="rank">🏆 Rang (Nième participant)</option>
          <option value="instant_win">🎁 Gain instantané (garanti)</option>
        </select>
      </div>

      {/* Configuration spécifique selon la méthode */}
      {method === 'calendar' && (
        <CalendarEditor
          config={prize.attribution as CalendarAttribution}
          onChange={(config) => onChange({ ...prize, attribution: config })}
        />
      )}

      {method === 'probability' && (
        <ProbabilityEditor
          config={prize.attribution as ProbabilityAttribution}
          onChange={(config) => onChange({ ...prize, attribution: config })}
        />
      )}

      {method === 'quota' && (
        <QuotaEditor
          config={prize.attribution as QuotaAttribution}
          onChange={(config) => onChange({ ...prize, attribution: config })}
        />
      )}

      {method === 'rank' && (
        <RankEditor
          config={prize.attribution as RankAttribution}
          onChange={(config) => onChange({ ...prize, attribution: config })}
        />
      )}

      {method === 'instant_win' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800">
            ✅ Tous les participants gagneront ce lot (dans la limite du stock disponible)
          </p>
        </div>
      )}
    </div>
  );
};

// Éditeur Calendrier
const CalendarEditor: React.FC<{
  config: CalendarAttribution;
  onChange: (config: CalendarAttribution) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-800 mb-4">
      Le lot sera attribué au participant qui joue exactement à la date et l'heure programmées.
    </p>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date *
        </label>
        <input
          type="date"
          value={config.scheduledDate}
          onChange={(e) => onChange({ ...config, scheduledDate: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Heure *
        </label>
        <input
          type="time"
          value={config.scheduledTime}
          onChange={(e) => onChange({ ...config, scheduledTime: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fenêtre de temps (minutes)
      </label>
      <input
        type="number"
        min="0"
        value={config.timeWindow || 0}
        onChange={(e) => onChange({ ...config, timeWindow: parseInt(e.target.value) || 0 })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1">
        0 = instant précis, 5 = ±5 minutes autour de l'heure programmée
      </p>
    </div>
  </div>
);

// Éditeur Probabilité
const ProbabilityEditor: React.FC<{
  config: ProbabilityAttribution;
  onChange: (config: ProbabilityAttribution) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
    <p className="text-sm text-purple-800 mb-4">
      Chaque participant a X% de chance de gagner ce lot.
    </p>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Probabilité de gain (%) *
      </label>
      <input
        type="number"
        min="0"
        max="100"
        step="0.1"
        value={config.winProbability}
        onChange={(e) => onChange({ ...config, winProbability: parseFloat(e.target.value) || 0 })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1">
        Ex: 10 = 10% de chance de gagner
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Nombre maximum de gagnants (optionnel)
      </label>
      <input
        type="number"
        min="0"
        value={config.maxWinners || ''}
        onChange={(e) => onChange({ ...config, maxWinners: e.target.value ? parseInt(e.target.value) : undefined })}
        placeholder="Illimité"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1">
        Laissez vide pour illimité (limité par le stock)
      </p>
    </div>
  </div>
);

// Éditeur Quota
const QuotaEditor: React.FC<{
  config: QuotaAttribution;
  onChange: (config: QuotaAttribution) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4 bg-orange-50 border border-orange-200 rounded-lg p-4">
    <p className="text-sm text-orange-800 mb-4">
      X gagnants sur Y participants. La probabilité s'ajuste automatiquement.
    </p>
    
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre de gagnants *
        </label>
        <input
          type="number"
          min="1"
          value={config.winnersCount}
          onChange={(e) => onChange({ ...config, winnersCount: parseInt(e.target.value) || 1 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Total participants attendus *
        </label>
        <input
          type="number"
          min="1"
          value={config.totalParticipants}
          onChange={(e) => onChange({ ...config, totalParticipants: parseInt(e.target.value) || 100 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Stratégie de sélection *
      </label>
      <select
        value={config.selectionStrategy}
        onChange={(e) => onChange({ ...config, selectionStrategy: e.target.value as any })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
      >
        <option value="random">Aléatoire (probabilité dynamique)</option>
        <option value="first">Les X premiers</option>
        <option value="last">Les X derniers</option>
        <option value="distributed">Distribué uniformément</option>
      </select>
    </div>
  </div>
);

// Éditeur Rang
const RankEditor: React.FC<{
  config: RankAttribution;
  onChange: (config: RankAttribution) => void;
}> = ({ config, onChange }) => (
  <div className="space-y-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
    <p className="text-sm text-yellow-800 mb-4">
      Le Nième participant gagne. Parfait pour les milestones (100ème, 1000ème, etc.)
    </p>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Rangs gagnants * (séparés par des virgules)
      </label>
      <input
        type="text"
        value={config.winningRanks.join(', ')}
        onChange={(e) => {
          const ranks = e.target.value.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
          onChange({ ...config, winningRanks: ranks.length > 0 ? ranks : [100] });
        }}
        placeholder="Ex: 10, 100, 1000"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1">
        Ex: 10, 100, 1000 = le 10ème, 100ème et 1000ème participant gagnent
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tolérance (±N participants)
      </label>
      <input
        type="number"
        min="0"
        value={config.tolerance || 0}
        onChange={(e) => onChange({ ...config, tolerance: parseInt(e.target.value) || 0 })}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#841b60] focus:border-transparent"
      />
      <p className="text-xs text-gray-500 mt-1">
        0 = rang exact, 2 = ±2 participants (98-102 pour rang 100)
      </p>
    </div>
  </div>
);
